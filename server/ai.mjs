import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const agyBinary = process.env.ANTIGRAVITY_CLI || resolve(homedir(), '.local/bin/agy')
const antigravityModel = process.env.ANTIGRAVITY_MODEL || 'gemini-3.7-flash-high'
const promptVersion = 'lnat-intelligence-v1'

const CHOICE_IDS = ['a', 'b', 'c', 'd', 'e']
const DIFFICULTIES = [1, 2, 3, 4, 5]

/** Mirrors `src/data/curriculum.ts`. Anything outside this map is rejected at the boundary. */
export const skillMap = {
  comprehension: ['literal-meaning', 'word-in-context', 'attribution'],
  interpretation: ['inference', 'fact-vs-opinion', 'application'],
  argument: ['main-conclusion', 'argument-structure', 'assumption', 'strengthen-weaken', 'reasoning-flaw'],
  rhetoric: ['authorial-attitude', 'rhetorical-purpose', 'emphasis-signals', 'passage-purpose'],
}
const allSkills = Object.values(skillMap).flat()
const domainForSkill = Object.fromEntries(
  Object.entries(skillMap).flatMap(([domain, skills]) => skills.map((skill) => [skill, domain])),
)

const THEMES = ['law-and-ethics', 'politics-and-society', 'science-and-technology', 'arts-and-culture', 'education', 'economics', 'history', 'philosophy', 'media', 'environment']
const REGISTERS = ['argumentative-essay', 'opinion-column', 'review', 'historical-source', 'multi-extract']

/**
 * Difficulty calibration expressed as construct, not as vocabulary level. The
 * LNAT never gets harder by using longer words; it gets harder by making the
 * distance between the right answer and the best wrong answer smaller.
 */
const difficultyBrief = {
  1: 'the decisive evidence sits in one sentence, and only one option is even close to it',
  2: 'the decisive evidence sits in one paragraph; the near-miss option overstates or understates a scope word',
  3: 'the candidate must combine two separated parts of the passage, and two options survive a first pass',
  4: 'the near-miss option is defensible until one precise feature of the passage rules it out; scope, attribution, or argumentative role decides it',
  5: 'three options survive a careful first pass, and the decision turns on a single qualification, a change of voice, or the exact role a sentence plays',
}

let serialWork = Promise.resolve()
let queuedWork = 0
let activeWork = 0
let lastCompletedAt
let lastError
let activeTask

const enqueue = (label, task) => {
  queuedWork += 1
  const run = async () => {
    queuedWork = Math.max(0, queuedWork - 1)
    activeWork += 1
    activeTask = label
    try {
      const result = await task()
      lastCompletedAt = new Date().toISOString()
      lastError = undefined
      return result
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
      throw error
    } finally {
      activeWork = Math.max(0, activeWork - 1)
      if (!activeWork) activeTask = undefined
    }
  }
  const next = serialWork.then(run, run)
  serialWork = next.catch((error) => console.warn(`LNATLAS intelligence: ${label} failed:`, error instanceof Error ? error.message : error))
  return next
}

export function getAiStatus() {
  const configured = process.env.AI_PROVIDER ?? 'none'
  const decorate = (base) => ({
    ...base,
    state: !base.available ? (lastError && configured !== 'none' ? 'error' : 'offline') : (activeWork || queuedWork ? 'working' : 'idle'),
    queued: activeWork + queuedWork,
    activeTask,
    lastCompletedAt,
    lastError: base.available ? lastError : base.lastError ?? lastError,
  })

  if (configured === 'antigravity') {
    if (existsSync(agyBinary)) {
      return decorate({ available: true, provider: 'antigravity', access: 'Google Antigravity via your local OAuth session', model: antigravityModel })
    }
    return decorate({ available: false, provider: 'none', access: 'Offline authored mode', model: null, lastError: `The Antigravity CLI was not found at ${agyBinary}.` })
  }
  if (configured === 'gemini' && process.env.GEMINI_API_KEY) {
    return decorate({ available: true, provider: 'gemini', access: 'Gemini API key', model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash' })
  }
  if (configured === 'claude' && process.env.ANTHROPIC_API_KEY) {
    return decorate({ available: true, provider: 'claude', access: 'Anthropic API key', model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5-20250929' })
  }
  return decorate({
    available: false,
    provider: 'none',
    access: 'Offline authored mode',
    model: null,
    lastError: configured === 'none' ? undefined : `Missing credentials for ${configured}.`,
  })
}

export function invalidateAiWork() {
  serialWork = Promise.resolve()
  queuedWork = 0
  activeWork = 0
  activeTask = undefined
}

const textFromParts = (value) => {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map((part) => part?.text ?? '').join('')
  return ''
}

const extractJson = (text) => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? text
  const start = fenced.indexOf('{')
  const end = fenced.lastIndexOf('}')
  if (start < 0 || end < start) throw new Error('The model did not return an object.')
  return JSON.parse(fenced.slice(start, end + 1))
}

async function callAntigravity(system, prompt, schema) {
  if (!existsSync(agyBinary)) throw new Error(`The Antigravity CLI was not found at ${agyBinary}.`)
  const { stdout } = await execFileAsync(agyBinary, [
    '--print', `${system}\n\n${prompt}`,
    '--output-format', 'json',
    '--json-schema', JSON.stringify(schema),
    '--model', antigravityModel,
    '--effort', 'high',
    '--mode', 'plan',
    '--sandbox',
    '--disable-slash-commands',
    '--print-timeout', '3m',
  ], { cwd: process.cwd(), timeout: 240_000, maxBuffer: 16 * 1024 * 1024, env: { ...process.env, NO_COLOR: '1' } })
  const envelope = JSON.parse(stdout.trim())
  if (envelope.status && String(envelope.status).toLowerCase() !== 'success') {
    throw new Error(envelope.error || `Antigravity returned ${envelope.status}.`)
  }
  const structured = envelope.structured_output ?? envelope.structuredOutput
  if (!structured) throw new Error('Antigravity returned no structured output.')
  return typeof structured === 'string' ? JSON.parse(structured) : structured
}

async function callModel(system, prompt, schema) {
  const status = getAiStatus()
  if (!status.available) throw new Error(status.lastError || 'No analyst is configured.')
  if (status.provider === 'antigravity') return callAntigravity(system, prompt, schema)
  if (status.provider === 'gemini') {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${status.model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.35 },
      }),
    })
    if (!response.ok) throw new Error(`The Gemini request failed (${response.status}).`)
    const body = await response.json()
    return extractJson(textFromParts(body.candidates?.[0]?.content?.parts))
  }
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: status.model, max_tokens: 8000, temperature: 0.35, system, messages: [{ role: 'user', content: prompt }] }),
  })
  if (!response.ok) throw new Error(`The Claude request failed (${response.status}).`)
  const body = await response.json()
  return extractJson(textFromParts(body.content))
}

// ------------------------------------------------------------------ helpers

const cleanText = (value, fallback = '') => String(value ?? fallback).replace(/\s+/g, ' ').trim().slice(0, 2000)
const cleanRichText = (value, fallback = '') => String(value ?? fallback)
  .replace(/\r\n?/g, '\n')
  .replace(/[^\S\n]+/g, ' ')
  .replace(/ *\n */g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim()
  .slice(0, 6000)

const words = (value) => String(value ?? '').trim().split(/\s+/).filter(Boolean)

const normalizeTokens = (value = '') => String(value).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((token) => token.length > 1)
const shingleOverlap = (left, right, size = 6) => {
  const shingles = (value) => {
    const tokens = normalizeTokens(value)
    return new Set(Array.from({ length: Math.max(0, tokens.length - size + 1) }, (_, index) => tokens.slice(index, index + size).join(' ')))
  }
  const a = shingles(left)
  const b = shingles(right)
  if (!a.size || !b.size) return 0
  let shared = 0
  for (const item of a) if (b.has(item)) shared += 1
  return shared / Math.min(a.size, b.size)
}

// -------------------------------------------------------------- generation

const questionSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['skillId', 'difficulty', 'prompt', 'choices', 'answer', 'explanation', 'concept', 'whyWrong'],
  properties: {
    skillId: { enum: allSkills },
    difficulty: { type: 'integer', minimum: 1, maximum: 5 },
    prompt: { type: 'string' },
    choices: {
      type: 'array', minItems: 5, maxItems: 5,
      items: {
        type: 'object', additionalProperties: false, required: ['id', 'text'],
        properties: { id: { enum: CHOICE_IDS }, text: { type: 'string' } },
      },
    },
    answer: { enum: CHOICE_IDS },
    explanation: { type: 'string' },
    concept: { type: 'string' },
    whyWrong: {
      type: 'array', minItems: 4, maxItems: 4,
      items: {
        type: 'object', additionalProperties: false, required: ['id', 'reason'],
        properties: { id: { enum: CHOICE_IDS }, reason: { type: 'string' } },
      },
    },
  },
}

const passageSetSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'theme', 'register', 'paragraphs', 'questions'],
  properties: {
    title: { type: 'string' },
    theme: { enum: THEMES },
    register: { enum: REGISTERS },
    paragraphs: { type: 'array', minItems: 4, maxItems: 8, items: { type: 'string' } },
    extracts: {
      type: 'array', minItems: 2, maxItems: 3,
      items: {
        type: 'object', additionalProperties: false, required: ['label', 'attribution', 'body'],
        properties: { label: { type: 'string' }, attribution: { type: 'string' }, body: { type: 'string' } },
      },
    },
    questions: { type: 'array', minItems: 3, maxItems: 4, items: questionSchema },
  },
}

const reviewerSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['reviews'],
  properties: {
    reviews: {
      type: 'array', minItems: 1, maxItems: 4,
      items: {
        type: 'object', additionalProperties: false,
        required: ['index', 'verdict', 'solvedAnswer', 'uniqueAnswer', 'answerableFromPassage', 'difficultyFit', 'distractorQuality', 'reason'],
        properties: {
          index: { type: 'integer', minimum: 0 },
          verdict: { enum: ['accept', 'reject'] },
          solvedAnswer: { enum: CHOICE_IDS },
          uniqueAnswer: { type: 'boolean' },
          answerableFromPassage: { type: 'boolean' },
          difficultyFit: { enum: ['underpowered', 'representative', 'overpowered'] },
          distractorQuality: { enum: ['weak', 'credible'] },
          reason: { type: 'string' },
        },
      },
    },
  },
}

const writerSystem = `You write original practice material for LNATLAS, an independent LNAT preparation tool. LNATLAS is not affiliated with LNAT Consortium Ltd, Pearson VUE, or any university.

Write a passage and its question set in the style and at the level of the LNAT's Section A, using only the publicly described format as a specification. Never reproduce, closely paraphrase, name, or imply any past or live LNAT passage, question, or answer key. Never state that anything is official.

THE PASSAGE
- 350 to 520 words, argumentative rather than expository. It should take a position and defend it, or set two positions against each other.
- Written for an intelligent general reader. No specialist knowledge may be required: everything needed to answer must be on the page.
- Adult, literate, slightly formal prose. Use concession ("Admittedly…", "The complaint is not frivolous"), qualification, and at least one moment of irony, comparison, or marked emphasis, because those generate the rhetoric questions.
- Where the register is multi-extract, write two or three short pieces by named, invented commentators who partly agree and partly disagree. Attribution must be recoverable.
- Invent all names, studies, statistics, and institutions. Do not use real people, real organisations, or real reported figures.

THE QUESTIONS
- Exactly five options each, labelled a to e in lower case, each option under about 30 words.
- Exactly one defensible answer, recoverable from the passage alone. A well-informed reader who has not read the passage must not be able to answer it.
- Distractors must be near misses that fail for a nameable reason: wrong scope, wrong voice, wrong argumentative role, a true statement the passage never made, or the right idea at the wrong strength. Never a filler option.
- Do not make the answer the only option that repeats a phrase from the passage. Vary which letter is correct across the set.
- The explanation must quote or point to the decisive part of the passage. The concept must state the transferable reading rule in one or two sentences.
- whyWrong must contain exactly one entry for each of the four wrong options, diagnosing why a sensible candidate would be tempted by it.

Return JSON only. Do not return tool actions, metadata, or any field beyond the requested data.`

const reviewerSystem = `You are an adversarial reviewer of LNAT-style practice items. Read the passage, then independently solve every candidate question without trusting its answer key.

Reject a candidate if: two options are defensible; no option is defensible; the answer requires knowledge from outside the passage; the answer is recoverable without reading the passage; a distractor is a duplicate or obviously absurd; the item does not test the skill it claims to test; the wording appears to echo a known assessment item; or the difficulty falls below the requested slot.

A representative LNAT item requires a real reading decision. It must not be answerable by matching a phrase. Be strict about scope words, attribution of views, and the difference between what a passage states and what it implies.

Return JSON only.`

const skillGuidance = {
  'literal-meaning': 'ask what the passage states; the near miss should be true of the world but not made by the passage',
  'word-in-context': 'ask what a marked or load-bearing word is doing in its sentence; distractors should be correct dictionary senses that do not fit',
  attribution: 'ask whose view a claim is; distractors should belong to a different voice in the passage',
  inference: 'ask what must be true given the passage; distractors should be plausible continuations that are not entailed',
  'fact-vs-opinion': 'ask which statement is factual, reported, or evaluative; distractors should be from the neighbouring category',
  application: 'ask the candidate to apply the passage\'s principle to a case the passage never mentions, in a different subject area',
  'main-conclusion': 'ask what the passage is for; distractors should be subsidiary conclusions, premises, or the topic',
  'argument-structure': 'quote one sentence and ask what job it does; distractors should be other genuine roles in the same passage',
  assumption: 'ask what the argument needs and never says; distractors should be helpful but unnecessary claims',
  'strengthen-weaken': 'ask what new fact would most strengthen or weaken; distractors should be relevant to the topic but not to the inferential step',
  'reasoning-flaw': 'ask where the inference fails; distractors should name real fallacies the passage did not commit',
  'authorial-attitude': 'ask about stance; the five options should be points on one scale so that calibration decides it',
  'rhetorical-purpose': 'ask why a comparison, example, or aside appears where it does; distractors should describe its content rather than its function',
  'emphasis-signals': 'ask why a word is italicised or in inverted commas; distractors should be the other genuine uses of such marks',
  'passage-purpose': 'ask what a paragraph or the whole passage is doing; distractors should be accurate summaries rather than functions',
}

function normalizeQuestion(raw, slot, passageId) {
  if (!raw) return null
  if (raw.skillId !== slot.skillId) return null
  if (!allSkills.includes(raw.skillId)) return null
  if (!DIFFICULTIES.includes(Number(raw.difficulty))) return null
  if (!Array.isArray(raw.choices) || raw.choices.length !== 5) return null

  const ids = raw.choices.map((choice) => choice?.id)
  if (new Set(ids).size !== 5 || !CHOICE_IDS.every((id) => ids.includes(id))) return null
  const texts = raw.choices.map((choice) => cleanText(choice?.text).toLowerCase())
  if (new Set(texts).size !== 5 || texts.some((text) => text.length < 2)) return null
  if (!CHOICE_IDS.includes(raw.answer)) return null
  if (words(raw.prompt).length < 4) return null
  if (words(raw.explanation).length < 15) return null
  if (words(raw.concept).length < 8) return null

  const whyWrong = {}
  for (const entry of raw.whyWrong ?? []) {
    if (CHOICE_IDS.includes(entry?.id) && entry.id !== raw.answer && cleanText(entry.reason).length > 12) {
      whyWrong[entry.id] = cleanText(entry.reason)
    }
  }
  if (Object.keys(whyWrong).length !== 4) return null

  return {
    id: `ai-q-${crypto.randomUUID()}`,
    passageId,
    section: 'section-a',
    domain: domainForSkill[raw.skillId],
    skillId: raw.skillId,
    difficulty: Number(raw.difficulty),
    prompt: cleanText(raw.prompt),
    choices: CHOICE_IDS.map((id) => ({ id, text: cleanText(raw.choices.find((choice) => choice.id === id)?.text) })),
    answer: raw.answer,
    explanation: cleanRichText(raw.explanation),
    concept: cleanRichText(raw.concept),
    whyWrong,
    estimatedSeconds: 80,
    source: 'ai-generated',
  }
}

/**
 * Generate one passage and its whole question set, then have a second pass
 * independently solve every item before anything is persisted. A passage whose
 * questions do not survive review is discarded entirely rather than padded, so
 * a candidate never sees a set with a broken item in it.
 */
export function generatePassageSet(blueprint, references = [], { purpose = 'practice' } = {}) {
  const slots = (blueprint.questions ?? [])
    .filter((slot) => allSkills.includes(slot?.skillId) && DIFFICULTIES.includes(Number(slot?.difficulty)))
    .slice(0, 4)
  if (slots.length < 3) return Promise.reject(new Error('A passage needs at least three valid question slots.'))

  return enqueue(`passage set of ${slots.length}`, async () => {
    const qualityBrief = purpose === 'mock'
      ? 'This passage will appear in a timed full mock. It must be genuinely discriminating: layered claims, at least one concession the candidate can mistake for the writer\'s own view, and distractors that survive a first pass. Do not create difficulty through obscure vocabulary or excessive length.'
      : 'These are deliberate-practice items. Match each requested difficulty honestly, and make each item require the named reading move rather than surface recognition.'

    const plan = slots.map((slot, index) => ({
      index,
      skillId: slot.skillId,
      difficulty: slot.difficulty,
      difficultyBrief: difficultyBrief[slot.difficulty],
      guidance: skillGuidance[slot.skillId],
    }))

    const generated = await callModel(writerSystem, `Write one passage and exactly ${slots.length} questions on it, in the order of this plan.

${qualityBrief}

REQUESTED SUBJECT AREA: ${blueprint.theme ?? 'any, but not one used in the recent passages listed below'}
REQUESTED REGISTER: ${blueprint.register ?? 'argumentative-essay'}

QUESTION PLAN
${JSON.stringify(plan, null, 2)}

RECENT LOCAL PASSAGES TO AVOID ECHOING (titles and opening lines only)
${JSON.stringify(references.slice(-8).map((passage) => ({ title: passage.title, theme: passage.theme, opening: String(passage.body || passage.extracts?.[0]?.body || '').slice(0, 140) })), null, 2)}`, passageSetSchema)

    const paragraphs = (generated.paragraphs ?? []).map((paragraph) => cleanRichText(paragraph)).filter(Boolean)
    const extracts = (generated.extracts ?? [])
      .map((extract) => ({ label: cleanText(extract?.label), attribution: cleanText(extract?.attribution), body: cleanRichText(extract?.body) }))
      .filter((extract) => extract.label && extract.attribution && words(extract.body).length > 60)

    const isMultiExtract = generated.register === 'multi-extract' && extracts.length >= 2
    const body = isMultiExtract ? '' : paragraphs.join('\n\n')
    const fullText = isMultiExtract ? extracts.map((extract) => extract.body).join('\n\n') : body
    const wordCount = words(fullText).length

    if (wordCount < 300 || wordCount > 620) throw new Error(`The generated passage was ${wordCount} words, outside the 300–620 band.`)
    if (!isMultiExtract && paragraphs.length < 4) throw new Error('The generated passage had too few paragraphs.')
    if (references.some((passage) => shingleOverlap(fullText, String(passage.body || (passage.extracts ?? []).map((e) => e.body).join(' '))) >= 0.35)) {
      throw new Error('The generated passage was too close to an existing local passage.')
    }
    if (/\b(?:lnat|pearson vue|lnat consortium|past paper|official paper)\b/i.test(fullText)) {
      throw new Error('The generated passage referred to restricted or official-source material.')
    }

    const passageId = `ai-p-${crypto.randomUUID()}`
    const passage = {
      id: passageId,
      title: cleanText(generated.title, 'Untitled passage'),
      theme: THEMES.includes(generated.theme) ? generated.theme : 'politics-and-society',
      register: isMultiExtract ? 'multi-extract' : (REGISTERS.includes(generated.register) ? generated.register : 'argumentative-essay'),
      body,
      ...(isMultiExtract ? { extracts } : {}),
      wordCount,
      readingSeconds: Math.max(90, Math.round((wordCount / 155) * 60)),
      source: 'ai-generated',
    }

    const candidates = []
    slots.forEach((slot, index) => {
      const question = normalizeQuestion(generated.questions?.[index], slot, passageId)
      if (question) candidates.push({ slot, question, index })
    })
    if (candidates.length !== slots.length) throw new Error('Some generated questions failed structural validation.')

    const reviewed = await reviewCandidates(passage, candidates)
    const accepted = reviewed.filter((item) =>
      item.review?.verdict === 'accept'
      && item.review?.uniqueAnswer === true
      && item.review?.answerableFromPassage === true
      && item.review?.solvedAnswer === item.question.answer
      && item.review?.difficultyFit === 'representative'
      && item.review?.distractorQuality === 'credible')

    if (accepted.length < 3) {
      throw new Error(`Only ${accepted.length} of ${candidates.length} questions survived an independent solve, which is fewer than a passage set needs.`)
    }

    const reviewedAt = new Date().toISOString()
    const model = getAiStatus().model ?? 'unknown'
    return {
      passage: { ...passage, createdAt: reviewedAt, validationStatus: 'accepted' },
      questions: accepted
        .sort((left, right) => left.index - right.index)
        .map((item) => ({
          ...item.question,
          createdAt: reviewedAt,
          validationStatus: 'accepted',
          generation: {
            model,
            promptVersion,
            blueprint: { domain: item.question.domain, skillId: item.question.skillId, difficulty: item.question.difficulty },
            reviewerModel: model,
            reviewerVerdict: cleanText(item.review?.reason, 'Accepted after an independent solve.'),
            reviewedAt,
          },
        })),
    }
  })
}

async function reviewCandidates(passage, candidates) {
  if (!candidates.length) return []
  const passageText = passage.extracts?.length
    ? passage.extracts.map((extract) => `${extract.label} (${extract.attribution}):\n${extract.body}`).join('\n\n')
    : passage.body
  const result = await callModel(reviewerSystem, `Solve every candidate below from the passage alone. The answer keys are hidden. Return one review per index.

PASSAGE: ${passage.title}
${passageText}

CANDIDATES
${JSON.stringify(candidates.map((item, index) => ({
    index,
    skillId: item.question.skillId,
    requestedDifficulty: item.slot.difficulty,
    prompt: item.question.prompt,
    choices: item.question.choices,
  })), null, 2)}`, reviewerSchema)
  return candidates.map((item, index) => ({ ...item, review: (result.reviews || []).find((review) => review.index === index) }))
}

// ----------------------------------------------------------- learner model

const claimSchema = {
  type: 'object', additionalProperties: false, required: ['claim', 'evidenceIds', 'confidence'],
  properties: {
    claim: { type: 'string' },
    evidenceIds: { type: 'array', items: { type: 'string' }, maxItems: 12 },
    confidence: { enum: ['tentative', 'moderate', 'strong'] },
  },
}

const directiveSchema = {
  type: 'object', additionalProperties: false, required: ['skillId', 'priority', 'targetDifficulty', 'reason', 'evidenceIds'],
  properties: {
    skillId: { enum: allSkills },
    priority: { type: 'number', minimum: 0, maximum: 10 },
    targetDifficulty: { type: 'integer', minimum: 1, maximum: 5 },
    reason: { type: 'string' },
    evidenceIds: { type: 'array', items: { type: 'string' }, maxItems: 12 },
  },
}

const learnerModelSchema = {
  type: 'object', additionalProperties: false,
  required: ['summary', 'strengths', 'hypotheses', 'priorities', 'skillDirectives', 'coachingStyle', 'nextSession'],
  properties: {
    summary: { type: 'string' },
    strengths: { type: 'array', items: claimSchema, maxItems: 6 },
    hypotheses: { type: 'array', items: claimSchema, maxItems: 6 },
    priorities: { type: 'array', items: claimSchema, maxItems: 6 },
    skillDirectives: { type: 'array', items: directiveSchema, maxItems: 10 },
    coachingStyle: { type: 'string' },
    nextSession: { type: 'string' },
  },
}

const reportSchema = {
  type: 'object', additionalProperties: false,
  required: ['title', 'executiveSummary', 'domainBreakdown', 'skillBreakdown', 'errorTaxonomy', 'studyPriorities', 'sevenDayPlan', 'recommendedMix', 'limitations', 'learnerModel'],
  properties: {
    title: { type: 'string' },
    executiveSummary: { type: 'string' },
    domainBreakdown: {
      type: 'array', maxItems: 4,
      items: {
        type: 'object', additionalProperties: false, required: ['domain', 'accuracySummary', 'pacingSummary', 'findings', 'recommendedFocus'],
        properties: {
          domain: { enum: Object.keys(skillMap) },
          accuracySummary: { type: 'string' },
          pacingSummary: { type: 'string' },
          findings: { type: 'array', items: claimSchema, maxItems: 4 },
          recommendedFocus: { type: 'string' },
        },
      },
    },
    skillBreakdown: {
      type: 'array', maxItems: 15,
      items: {
        type: 'object', additionalProperties: false, required: ['skillId', 'diagnosis', 'nextDifficulty', 'action', 'evidenceIds', 'confidence'],
        properties: {
          skillId: { enum: allSkills },
          diagnosis: { type: 'string' },
          nextDifficulty: { type: 'integer', minimum: 1, maximum: 5 },
          action: { type: 'string' },
          evidenceIds: { type: 'array', items: { type: 'string' } },
          confidence: { enum: ['tentative', 'moderate', 'strong'] },
        },
      },
    },
    errorTaxonomy: {
      type: 'array', maxItems: 6,
      items: {
        type: 'object', additionalProperties: false, required: ['label', 'count', 'mechanism', 'evidenceIds'],
        properties: { label: { type: 'string' }, count: { type: 'integer', minimum: 0 }, mechanism: { type: 'string' }, evidenceIds: { type: 'array', items: { type: 'string' } } },
      },
    },
    studyPriorities: {
      type: 'array', maxItems: 5,
      items: {
        type: 'object', additionalProperties: false, required: ['skillId', 'action', 'reason', 'evidenceIds'],
        properties: { skillId: { enum: allSkills }, action: { type: 'string' }, reason: { type: 'string' }, evidenceIds: { type: 'array', items: { type: 'string' } } },
      },
    },
    sevenDayPlan: {
      type: 'array', maxItems: 7,
      items: {
        type: 'object', additionalProperties: false, required: ['day', 'minutes', 'work', 'successCheck'],
        properties: { day: { type: 'string' }, minutes: { type: 'integer', minimum: 5, maximum: 240 }, work: { type: 'string' }, successCheck: { type: 'string' } },
      },
    },
    recommendedMix: { type: 'string' },
    limitations: { type: 'array', items: { type: 'string' }, maxItems: 6 },
    learnerModel: learnerModelSchema,
  },
}

const compactAttempt = (attempt) => ({
  id: attempt.id,
  skillId: attempt.skillId,
  domain: attempt.domain,
  difficulty: attempt.difficulty,
  correct: attempt.correct,
  confidence: attempt.confidence,
  elapsedSeconds: Math.round(Number(attempt.elapsedMs || 0) / 1000),
  targetSeconds: attempt.questionSnapshot?.estimatedSeconds,
  passage: attempt.passageSnapshot ? { title: attempt.passageSnapshot.title, register: attempt.passageSnapshot.register, words: attempt.passageSnapshot.wordCount } : undefined,
  question: attempt.questionSnapshot ? {
    prompt: attempt.questionSnapshot.prompt,
    choices: attempt.questionSnapshot.choices,
    answer: attempt.questionSnapshot.answer,
    chose: attempt.response,
  } : undefined,
})

function computeFacts(attempts) {
  const bySkill = new Map()
  const byDomain = new Map()
  for (const attempt of attempts) {
    const skill = bySkill.get(attempt.skillId) ?? { skillId: attempt.skillId, correct: 0, total: 0, elapsedMs: 0, evidenceIds: [] }
    skill.total += 1
    skill.correct += Number(attempt.correct)
    skill.elapsedMs += Number(attempt.elapsedMs || 0)
    skill.evidenceIds.push(attempt.id)
    bySkill.set(attempt.skillId, skill)
    const domain = byDomain.get(attempt.domain) ?? { correct: 0, total: 0, elapsedMs: 0 }
    domain.total += 1
    domain.correct += Number(attempt.correct)
    domain.elapsedMs += Number(attempt.elapsedMs || 0)
    byDomain.set(attempt.domain, domain)
  }
  return {
    total: attempts.length,
    correct: attempts.filter((item) => item.correct).length,
    bySkill: [...bySkill.values()].map((item) => ({ ...item, averageSeconds: Math.round(item.elapsedMs / Math.max(1, item.total) / 1000) })),
    byDomain: Object.fromEntries([...byDomain].map(([domain, value]) => [domain, { ...value, averageSeconds: Math.round(value.elapsedMs / Math.max(1, value.total) / 1000) }])),
  }
}

const cleanClaims = (claims, allowedIds) => (claims || [])
  .map((item) => ({
    claim: cleanText(item?.claim),
    evidenceIds: [...new Set(item?.evidenceIds || [])].filter((id) => allowedIds.has(id)),
    confidence: ['tentative', 'moderate', 'strong'].includes(item?.confidence) ? item.confidence : 'tentative',
  }))
  .filter((item) => item.claim && item.evidenceIds.length)

/** Some models return a 1, 2, 3 ranking even when asked for a 0–1 weight. Accept both. */
export function normalizeDirectivePriority(value) {
  const priority = Number(value)
  if (!Number.isFinite(priority) || priority <= 0) return 0
  if (priority <= 1) return priority
  return Math.max(0.1, Math.min(1, 1 - (priority - 1) / 10))
}

const normalizeLearnerModel = (raw, current, allowedIds) => ({
  updatedAt: new Date().toISOString(),
  summary: cleanText(raw?.summary, current?.summary ?? ''),
  strengths: cleanClaims(raw?.strengths, allowedIds),
  hypotheses: cleanClaims(raw?.hypotheses, allowedIds),
  priorities: cleanClaims(raw?.priorities, allowedIds),
  skillDirectives: (raw?.skillDirectives || [])
    .map((item) => ({
      skillId: cleanText(item?.skillId),
      priority: normalizeDirectivePriority(item?.priority),
      targetDifficulty: DIFFICULTIES.includes(Number(item?.targetDifficulty)) ? Number(item.targetDifficulty) : 3,
      reason: cleanText(item?.reason),
      evidenceIds: [...new Set(item?.evidenceIds || [])].filter((id) => allowedIds.has(id)),
    }))
    .filter((item) => allSkills.includes(item.skillId)),
  coachingStyle: cleanText(raw?.coachingStyle, current?.coachingStyle ?? ''),
  nextSession: cleanText(raw?.nextSession, current?.nextSession ?? ''),
})

const analystSystem = `You are LNATLAS's evidence-bound analyst. You turn a real answer record into a compact, practical learning report for one candidate preparing for the LNAT.

Rules you may not break:
- Every claim you make must cite the attempt IDs that support it. A claim with no evidence is not made.
- Distinguish a demonstrated result from a hypothesis. One correct answer is not a strength; three across different passages might be.
- Never claim an official LNAT score, a band, or an admissions outcome. Section A produces a raw mark out of 42; the essay is not scored at all.
- Explain mechanisms, not just accuracy: say what kind of reading error is occurring and why it recurs.
- Comment on pacing only where timing evidence supports it. The real constraint is twelve passages and forty-two questions in ninety-five minutes.
- Write directly to the candidate. Do not use raw identifiers, database wording, or timestamps in reader-facing text.

Return JSON only.`

export function generateSessionReport({ session, attempts, learnerModel, essays = [] }) {
  return enqueue(`report for ${session.id}`, async () => {
    const sessionAttempts = attempts.filter((attempt) => attempt.sessionId === session.id)
    if (!sessionAttempts.length) throw new Error('No saved answer evidence exists for this session.')
    const facts = computeFacts(sessionAttempts)
    const allowedIds = new Set([...sessionAttempts.map((item) => item.id), session.id])
    const model = getAiStatus().model ?? 'unknown'

    const result = await callModel(analystSystem, `Write a report for one completed ${session.type} session and update the learner model.

ANSWERS IN THIS SESSION
${JSON.stringify(sessionAttempts.map(compactAttempt), null, 2)}

COMPUTED FACTS (authoritative; never contradict or re-derive these)
${JSON.stringify(facts, null, 2)}

SESSION RECORD
${JSON.stringify({ ...session, answers: undefined }, null, 2)}

CURRENT LEARNER MODEL
${JSON.stringify(learnerModel, null, 2)}
${essays.length ? `\nESSAYS WRITTEN IN THIS PERIOD\n${JSON.stringify(essays.map((essay) => ({ prompt: essay.promptText, words: essay.wordCount, feedbackSummary: essay.feedback?.summary })), null, 2)}` : ''}

Requirements:
- skillBreakdown must only name skills that appear in the computed facts. Correct, total, and average seconds are supplied independently; do not invent them.
- errorTaxonomy should name recurring reading errors in plain language — for example treating a reported view as the writer's, or accepting a stronger claim than the passage made.
- sevenDayPlan should fit the candidate's stated daily minutes and alternate reading work with timed sets.
- limitations must state honestly what this amount of evidence cannot show, especially about retention and about full-length pacing.`, reportSchema)

    const skillFacts = new Map(facts.bySkill.map((item) => [item.skillId, item]))
    const skillBreakdown = (result.skillBreakdown || [])
      .map((item) => {
        const fact = skillFacts.get(item.skillId)
        if (!fact) return null
        return {
          skillId: fact.skillId,
          correct: fact.correct,
          total: fact.total,
          averageSeconds: fact.averageSeconds,
          diagnosis: cleanText(item.diagnosis, 'Collect more varied evidence before changing the method.'),
          nextDifficulty: DIFFICULTIES.includes(Number(item.nextDifficulty)) ? Number(item.nextDifficulty) : 3,
          action: cleanText(item.action, 'Reread the method, then test it on a fresh passage.'),
          evidenceIds: [...new Set(item.evidenceIds || [])].filter((id) => allowedIds.has(id)),
          confidence: ['tentative', 'moderate', 'strong'].includes(item.confidence) ? item.confidence : 'tentative',
        }
      })
      .filter(Boolean)

    const createdAt = new Date().toISOString()
    const report = {
      id: session.id,
      type: 'session',
      title: cleanText(result.title, `Set review: ${facts.correct} of ${facts.total} correct`),
      period: createdAt.slice(0, 10),
      createdAt,
      executiveSummary: cleanRichText(result.executiveSummary),
      model,
      answerCount: sessionAttempts.length,
      domainBreakdown: (result.domainBreakdown || [])
        .filter((item) => Object.keys(skillMap).includes(item.domain))
        .map((item) => ({
          domain: item.domain,
          accuracySummary: cleanText(item.accuracySummary),
          pacingSummary: cleanText(item.pacingSummary),
          findings: cleanClaims(item.findings, allowedIds),
          recommendedFocus: cleanText(item.recommendedFocus),
        })),
      skillBreakdown,
      errorTaxonomy: (result.errorTaxonomy || []).map((item) => ({
        label: cleanText(item.label),
        count: Math.max(0, Math.floor(Number(item.count) || 0)),
        mechanism: cleanText(item.mechanism),
        evidenceIds: [...new Set(item.evidenceIds || [])].filter((id) => allowedIds.has(id)),
      })).filter((item) => item.label),
      studyPriorities: (result.studyPriorities || [])
        .filter((item) => allSkills.includes(item.skillId))
        .map((item) => ({
          skillId: item.skillId,
          action: cleanText(item.action),
          reason: cleanText(item.reason),
          evidenceIds: [...new Set(item.evidenceIds || [])].filter((id) => allowedIds.has(id)),
        })),
      sevenDayPlan: (result.sevenDayPlan || []).map((item) => ({
        day: cleanText(item.day),
        minutes: Math.max(5, Math.min(240, Math.floor(Number(item.minutes) || 30))),
        work: cleanText(item.work),
        successCheck: cleanText(item.successCheck),
      })),
      recommendedMix: cleanText(result.recommendedMix),
      limitations: (result.limitations || []).map((item) => cleanText(item)).filter(Boolean),
    }
    return { report, learnerModel: normalizeLearnerModel(result.learnerModel, learnerModel, allowedIds) }
  })
}

export function generateComprehensiveReport({ attempts, sessions, essays, learnerModel, settings }) {
  return enqueue('complete learning report', async () => {
    const recent = attempts.slice(-260)
    if (recent.length < 8) throw new Error('A complete report needs at least eight answered questions.')
    const facts = computeFacts(recent)
    const allowedIds = new Set(recent.map((item) => item.id))
    const model = getAiStatus().model ?? 'unknown'

    const result = await callModel(analystSystem, `Write a complete learning report covering everything recorded so far, and update the learner model.

ALL RECENT ANSWERS
${JSON.stringify(recent.map(compactAttempt), null, 2)}

COMPUTED FACTS (authoritative)
${JSON.stringify(facts, null, 2)}

SESSIONS
${JSON.stringify(sessions.slice(-20).map((session) => ({ id: session.id, type: session.type, completedAt: session.completedAt, correct: session.correct, total: session.total, sectionAScore: session.sectionAScore })), null, 2)}

ESSAYS
${JSON.stringify((essays || []).slice(-8).map((essay) => ({ prompt: essay.promptText, words: essay.wordCount, criteria: essay.feedback?.criteria })), null, 2)}

CANDIDATE SETTINGS
${JSON.stringify({ targetScore: settings?.targetScore, targetUniversity: settings?.targetUniversity, testDate: settings?.testDate, dailyMinutes: settings?.dailyMinutes }, null, 2)}

CURRENT LEARNER MODEL
${JSON.stringify(learnerModel, null, 2)}

Requirements:
- Report on trajectory as well as level: what has changed since the earliest evidence, and what has not.
- Where a target raw mark is set, say plainly what the gap is and what would close it, without predicting an offer.
- If essay evidence exists, treat it as formative only; the LNAT essay carries no official mark.`, reportSchema)

    const skillFacts = new Map(facts.bySkill.map((item) => [item.skillId, item]))
    const createdAt = new Date().toISOString()
    const report = {
      id: `comprehensive-${createdAt}`,
      type: 'comprehensive',
      title: cleanText(result.title, 'Complete LNAT learning report'),
      period: `to ${createdAt.slice(0, 10)}`,
      createdAt,
      executiveSummary: cleanRichText(result.executiveSummary),
      model,
      answerCount: recent.length,
      domainBreakdown: (result.domainBreakdown || [])
        .filter((item) => Object.keys(skillMap).includes(item.domain))
        .map((item) => ({
          domain: item.domain,
          accuracySummary: cleanText(item.accuracySummary),
          pacingSummary: cleanText(item.pacingSummary),
          findings: cleanClaims(item.findings, allowedIds),
          recommendedFocus: cleanText(item.recommendedFocus),
        })),
      skillBreakdown: (result.skillBreakdown || []).map((item) => {
        const fact = skillFacts.get(item.skillId)
        if (!fact) return null
        return {
          skillId: fact.skillId,
          correct: fact.correct,
          total: fact.total,
          averageSeconds: fact.averageSeconds,
          diagnosis: cleanText(item.diagnosis),
          nextDifficulty: DIFFICULTIES.includes(Number(item.nextDifficulty)) ? Number(item.nextDifficulty) : 3,
          action: cleanText(item.action),
          evidenceIds: [...new Set(item.evidenceIds || [])].filter((id) => allowedIds.has(id)),
          confidence: ['tentative', 'moderate', 'strong'].includes(item.confidence) ? item.confidence : 'tentative',
        }
      }).filter(Boolean),
      errorTaxonomy: (result.errorTaxonomy || []).map((item) => ({
        label: cleanText(item.label),
        count: Math.max(0, Math.floor(Number(item.count) || 0)),
        mechanism: cleanText(item.mechanism),
        evidenceIds: [...new Set(item.evidenceIds || [])].filter((id) => allowedIds.has(id)),
      })).filter((item) => item.label),
      studyPriorities: (result.studyPriorities || [])
        .filter((item) => allSkills.includes(item.skillId))
        .map((item) => ({
          skillId: item.skillId,
          action: cleanText(item.action),
          reason: cleanText(item.reason),
          evidenceIds: [...new Set(item.evidenceIds || [])].filter((id) => allowedIds.has(id)),
        })),
      sevenDayPlan: (result.sevenDayPlan || []).map((item) => ({
        day: cleanText(item.day),
        minutes: Math.max(5, Math.min(240, Math.floor(Number(item.minutes) || 30))),
        work: cleanText(item.work),
        successCheck: cleanText(item.successCheck),
      })),
      recommendedMix: cleanText(result.recommendedMix),
      limitations: (result.limitations || []).map((item) => cleanText(item)).filter(Boolean),
    }
    return { report, learnerModel: normalizeLearnerModel(result.learnerModel, learnerModel, allowedIds) }
  })
}

// ------------------------------------------------------- attempt analysis

const analysisSchema = {
  type: 'object', additionalProperties: false,
  required: ['verdict', 'answerAssessment', 'justificationQuality', 'justificationAssessment', 'soundMoves', 'gaps', 'conceptLesson', 'betterApproach', 'transferCheck', 'nextMove', 'confidence'],
  properties: {
    verdict: { type: 'string' },
    answerAssessment: { type: 'string' },
    justificationQuality: { enum: ['thin', 'partial', 'sound', 'excellent'] },
    justificationAssessment: { type: 'string' },
    soundMoves: { type: 'array', items: { type: 'string' }, maxItems: 5 },
    gaps: { type: 'array', items: { type: 'string' }, maxItems: 5 },
    conceptLesson: { type: 'string' },
    betterApproach: { type: 'array', items: { type: 'string' }, maxItems: 6 },
    transferCheck: { type: 'string' },
    nextMove: { type: 'string' },
    confidence: { enum: ['tentative', 'moderate', 'strong'] },
  },
}

export function analyzeAttempt({ attempt, question, passage, justification }) {
  return enqueue(`reasoning review for ${attempt.id}`, async () => {
    const passageText = passage?.extracts?.length
      ? passage.extracts.map((extract) => `${extract.label} (${extract.attribution}):\n${extract.body}`).join('\n\n')
      : passage?.body ?? '(the passage text was not saved with this answer)'
    const model = getAiStatus().model ?? 'unknown'

    const result = await callModel(`You are LNATLAS's reasoning reviewer. A candidate has answered one Section A question and explained why they chose their answer.

Judge the reasoning separately from whether the answer was right. A correct answer reached by a bad method is a problem; a wrong answer reached by a nearly-right method is a different problem, and they need different corrections.

Be specific about the passage. Quote the decisive words. Never invent passage content. Do not moralise, do not pad, and do not repeat the explanation the candidate has already seen — add what they could not see for themselves. Return JSON only.`, `PASSAGE: ${passage?.title ?? 'Untitled'}
${passageText}

QUESTION (${question.skillId}, difficulty ${question.difficulty})
${question.prompt}
${question.choices.map((choice) => `(${choice.id}) ${choice.text}`).join('\n')}

CORRECT ANSWER: (${question.answer})
THE CANDIDATE CHOSE: (${attempt.response}) — ${attempt.correct ? 'correct' : 'incorrect'}
TIME TAKEN: ${Math.round(Number(attempt.elapsedMs || 0) / 1000)} seconds${attempt.confidence ? `\nSTATED CONFIDENCE: ${attempt.confidence}` : ''}

THE CANDIDATE'S JUSTIFICATION
${justification}

Requirements:
- verdict is one sentence naming what actually happened in their reasoning.
- soundMoves and gaps must both be about the justification, not about the answer.
- betterApproach is an ordered procedure they could run on the next item of this type.
- transferCheck describes a different item on which the same error would recur.`, analysisSchema)

    return {
      id: crypto.randomUUID(),
      attemptId: attempt.id,
      createdAt: new Date().toISOString(),
      model,
      promptVersion,
      learnerJustification: cleanRichText(justification),
      verdict: cleanText(result.verdict),
      answerAssessment: cleanRichText(result.answerAssessment),
      justificationQuality: ['thin', 'partial', 'sound', 'excellent'].includes(result.justificationQuality) ? result.justificationQuality : 'partial',
      justificationAssessment: cleanRichText(result.justificationAssessment),
      soundMoves: (result.soundMoves || []).map((item) => cleanText(item)).filter(Boolean),
      gaps: (result.gaps || []).map((item) => cleanText(item)).filter(Boolean),
      conceptLesson: cleanRichText(result.conceptLesson),
      betterApproach: (result.betterApproach || []).map((item) => cleanText(item)).filter(Boolean),
      transferCheck: cleanRichText(result.transferCheck),
      nextMove: cleanText(result.nextMove),
      evidenceIds: [attempt.id],
      confidence: ['tentative', 'moderate', 'strong'].includes(result.confidence) ? result.confidence : 'tentative',
    }
  })
}

// --------------------------------------------------------- mock assessment

const assessmentSchema = {
  type: 'object', additionalProperties: false,
  required: ['formDemand', 'expectedScore', 'confidence', 'rationale'],
  properties: {
    formDemand: { enum: ['accessible', 'balanced', 'demanding'] },
    expectedScore: { type: 'number', minimum: 0, maximum: 42 },
    confidence: { enum: ['tentative', 'moderate', 'strong'] },
    rationale: { type: 'string' },
  },
}

/** A pre-mock expectation, formed from evidence available *before* the sitting. */
export function assessMock({ session, attempts, sessions, learnerModel }) {
  return enqueue(`pre-mock expectation for ${session.id}`, async () => {
    const prior = attempts.filter((attempt) => attempt.sessionId !== session.id).slice(-180)
    const priorSessions = sessions.filter((item) => item.id !== session.id).slice(-12)
    const model = getAiStatus().model ?? 'unknown'

    const raw = await callModel(`You are LNATLAS's mock analyst. Section A is scored as a raw mark out of 42 and the LNAT publishes no conversion beyond that, so you are estimating a raw mark and nothing else. Never predict an admissions outcome. Return JSON only.`, `Estimate what this candidate would have been expected to score on Section A, using only evidence available BEFORE this mock, and judge how demanding the form itself was.

PRIOR ANSWER EVIDENCE
${JSON.stringify(prior.map(compactAttempt), null, 2)}

PRIOR SESSIONS
${JSON.stringify(priorSessions.map((item) => ({ type: item.type, correct: item.correct, total: item.total, sectionAScore: item.sectionAScore })), null, 2)}

CURRENT LEARNER MODEL
${JSON.stringify(learnerModel, null, 2)}

THIS MOCK'S COMPOSITION (use only to judge form demand, never to recover performance)
${JSON.stringify({ questions: session.questionIds.length, passages: session.passageIds.length, difficulties: session.questionDifficulties, sources: session.questionSources }, null, 2)}

Requirements:
- With little or no prior history, use tentative confidence and an expectation near the cohort mean of about 22.
- Do not use this mock's answers or its result. This is a counterfactual expectation, not a restatement.
- Form demand reflects the passage and item mix, not how many the candidate got right.
- The rationale must plainly state the main evidence pattern and the uncertainty, without raw identifiers.`, assessmentSchema)

    return {
      sessionId: session.id,
      formDemand: ['accessible', 'balanced', 'demanding'].includes(raw.formDemand) ? raw.formDemand : 'balanced',
      expectedScore: Math.max(0, Math.min(42, Math.round(Number(raw.expectedScore) || 22))),
      confidence: ['tentative', 'moderate', 'strong'].includes(raw.confidence) ? raw.confidence : 'tentative',
      rationale: cleanRichText(raw.rationale, 'There is not yet enough prior evidence for a narrow expectation.'),
      boundary: 'A practice expectation for the raw Section A mark only. It is not an official LNAT score and is not a prediction of any university decision.',
      model,
      createdAt: new Date().toISOString(),
    }
  })
}

// ---------------------------------------------------------- essay feedback

const essaySchema = {
  type: 'object', additionalProperties: false,
  required: ['summary', 'criteria', 'strength', 'nextMove', 'lineNotes'],
  properties: {
    summary: { type: 'string' },
    strength: { type: 'string' },
    nextMove: { type: 'string' },
    criteria: {
      type: 'array', minItems: 5, maxItems: 5,
      items: {
        type: 'object', additionalProperties: false, required: ['name', 'level', 'feedback'],
        properties: {
          name: { enum: ['Engagement with the question', 'Quality of argument', 'Counterargument and qualification', 'Structure and economy', 'Clarity and precision'] },
          level: { enum: ['developing', 'secure', 'strong'] },
          feedback: { type: 'string' },
        },
      },
    },
    lineNotes: {
      type: 'array', maxItems: 6,
      items: {
        type: 'object', additionalProperties: false, required: ['quote', 'note'],
        properties: { quote: { type: 'string' }, note: { type: 'string' } },
      },
    },
  },
}

const essaySystem = `You give formative feedback on an LNAT Section B essay.

The LNAT essay carries no official mark. It is sent to universities as written, and admissions readers use it as evidence of whether a candidate can hold an argument steady under time pressure. Never award a score, a grade, or a prediction about an offer.

Judge against five things and nothing else: engagement with the question actually asked; the quality of the argument, including whether reasons are warranted rather than merely listed; whether the strongest opposing case is stated fairly and answered; structure and economy against the official guidance of roughly 500 to 600 words in forty minutes; and clarity and precision, including whether hedges and modal verbs are doing real work.

Be specific and quote the candidate's own words. Identify precise improvements. Do not rewrite the essay for them, do not praise generically, and do not comment on the candidate's opinions — only on how well they are defended.

Return JSON only.`

export function gradeEssay({ promptText, pressurePoint, plan, essay }) {
  return enqueue('essay feedback', async () => {
    const count = words(essay).length
    if (count < 80) throw new Error('The essay is too short to review usefully. Write at least eighty words.')
    const model = getAiStatus().model ?? 'unknown'

    const result = await callModel(essaySystem, `PROMPT
${promptText}
${pressurePoint ? `\nWHAT A STRONG ANSWER HAS TO HANDLE (for your judgement; the candidate did not see this)\n${pressurePoint}` : ''}
${plan ? `\nTHE CANDIDATE'S PLAN\n${plan}` : ''}

THE ESSAY (${count} words, written under a forty-minute limit)
${essay}

Requirements:
- lineNotes must quote text that actually appears in the essay, verbatim, and say what to do about it.
- If the essay is well outside 500 to 600 words, say what would be cut or added and where.
- If the candidate has not taken a position, say so directly rather than softening it.`, essaySchema)

    if (!Array.isArray(result.criteria) || result.criteria.length !== 5) {
      throw new Error('The essay feedback failed structural validation.')
    }
    const essayText = String(essay)
    return {
      summary: cleanRichText(result.summary),
      criteria: result.criteria.map((item) => ({
        name: item.name,
        level: ['developing', 'secure', 'strong'].includes(item.level) ? item.level : 'developing',
        feedback: cleanRichText(item.feedback),
      })),
      strength: cleanRichText(result.strength),
      nextMove: cleanRichText(result.nextMove),
      // A quoted line the essay does not contain would be a fabrication, so drop it.
      lineNotes: (result.lineNotes || [])
        .map((item) => ({ quote: cleanText(item?.quote), note: cleanText(item?.note) }))
        .filter((item) => item.quote && item.note && essayText.includes(item.quote)),
      model,
      createdAt: new Date().toISOString(),
    }
  })
}

export function renderReportMarkdown(report) {
  const lines = [`# ${report.title}`, '', `_${report.period} · ${report.answerCount ?? 0} answered questions · ${report.model}_`, '', report.executiveSummary, '']
  if (report.domainBreakdown?.length) {
    lines.push('## By domain', '')
    for (const domain of report.domainBreakdown) {
      lines.push(`### ${domain.domain}`, '', domain.accuracySummary, '', domain.pacingSummary, '', `**Focus:** ${domain.recommendedFocus}`, '')
    }
  }
  if (report.skillBreakdown?.length) {
    lines.push('## By skill', '', '| Skill | Correct | Average | Diagnosis | Next |', '| --- | --- | --- | --- | --- |')
    for (const skill of report.skillBreakdown) {
      lines.push(`| ${skill.skillId} | ${skill.correct}/${skill.total} | ${skill.averageSeconds}s | ${skill.diagnosis} | ${skill.action} |`)
    }
    lines.push('')
  }
  if (report.errorTaxonomy?.length) {
    lines.push('## Recurring errors', '')
    for (const error of report.errorTaxonomy) lines.push(`- **${error.label}** (${error.count}) — ${error.mechanism}`)
    lines.push('')
  }
  if (report.studyPriorities?.length) {
    lines.push('## Priorities', '')
    for (const priority of report.studyPriorities) lines.push(`1. **${priority.skillId}** — ${priority.action} _(${priority.reason})_`)
    lines.push('')
  }
  if (report.sevenDayPlan?.length) {
    lines.push('## Seven days', '', '| Day | Minutes | Work | Check |', '| --- | --- | --- | --- |')
    for (const day of report.sevenDayPlan) lines.push(`| ${day.day} | ${day.minutes} | ${day.work} | ${day.successCheck} |`)
    lines.push('')
  }
  if (report.limitations?.length) {
    lines.push('## What this cannot show', '')
    for (const limitation of report.limitations) lines.push(`- ${limitation}`)
    lines.push('')
  }
  return lines.join('\n')
}
