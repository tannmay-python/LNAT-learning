import { essayPrompts } from '../data/essayPrompts'
import { expansionPassages, expansionQuestions } from '../data/bankExpansion'
import { passages as authoredPassages } from '../data/passages'
import { questionBank } from '../data/questionBank'
import { sectionASkillIds, skillById } from '../data/curriculum'
import type {
  ActiveMockCheckpoint, Difficulty, DomainId, EssayPrompt, Passage,
  PassageBlueprint, PassageRegister, PassageTheme, Question,
} from '../types'

const domainForSkill = (skillId: string): DomainId => skillById.get(skillId)?.domain ?? 'argument'

/**
 * The live LNAT: Section A is 42 multiple-choice questions on 12 passages in
 * 95 minutes, with free navigation and flagging across the whole section.
 * Section B is one essay chosen from three prompts in 40 minutes, with a
 * recommended length of 500–600 words and a hard ceiling of 750.
 */
export const LNAT_SPEC = {
  sectionA: { passages: 12, questions: 42, seconds: 95 * 60 },
  sectionB: { prompts: 3, seconds: 40 * 60, recommendedWords: [500, 600] as const, wordLimit: 750 },
  breakSeconds: 0,
} as const

export interface LnatMock {
  id: string
  passages: Passage[]
  questions: Question[]
  prompts: EssayPrompt[]
}

/** Deterministic shuffle so a seeded mock is reproducible for tests. */
const mix = <T,>(items: T[], seed: number) => {
  const values = [...items]
  let state = seed >>> 0
  for (let index = values.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0
    const swap = state % (index + 1)
    ;[values[index], values[swap]] = [values[swap], values[index]]
  }
  return values
}

/**
 * Assemble a form. Questions are ordered passage by passage, exactly as they
 * appear on the day: a candidate reads a passage once and answers its whole set
 * before moving on, even though they may navigate back at any time.
 */
export function buildForm(
  pool: Passage[],
  questions: Question[],
  seed = Date.now(),
  freshPassageIds: Set<string> = new Set(),
): { passages: Passage[]; questions: Question[] } {
  const byPassage = new Map<string, Question[]>()
  for (const question of questions) {
    if (!byPassage.has(question.passageId)) byPassage.set(question.passageId, [])
    byPassage.get(question.passageId)!.push(question)
  }
  const usable = pool.filter((passage) => (byPassage.get(passage.id)?.length ?? 0) >= 3)
  // Passages written for this sitting are offered to the exact-cover pass first,
  // so a repeat mock is genuinely new material rather than the bank reshuffled.
  // The seeded order is preserved within each group.
  const shuffled = mix(usable, seed)
  const ordered = [
    ...shuffled.filter((passage) => freshPassageIds.has(passage.id)),
    ...shuffled.filter((passage) => !freshPassageIds.has(passage.id)),
  ]

  const candidates = ordered.map((passage) => ({
    passage,
    questions: (byPassage.get(passage.id) ?? []).slice(0, 4),
  })).filter((entry) => entry.questions.length >= 3)

  // Passage sets are three or four items long, so a greedy pass can strand the
  // form at 40 or 41. Exact-cover selection keeps the published 42-question
  // blueprint while still honouring the seeded passage order where possible.
  type Selection = Array<typeof candidates[number]>
  const selections = new Map<number, Selection>()
  selections.set(0, [])
  for (const entry of candidates) {
    for (let count = LNAT_SPEC.sectionA.questions - entry.questions.length; count >= 0; count -= 1) {
      const previous = selections.get(count)
      if (!previous || previous.some((item) => item.passage.id === entry.passage.id)) continue
      if (selections.has(count + entry.questions.length)) continue
      selections.set(count + entry.questions.length, [...previous, entry])
    }
  }
  const selected = selections.get(LNAT_SPEC.sectionA.questions)
  if (!selected) throw new Error('The bank cannot assemble a complete 42-question Section A form.')
  return {
    passages: selected.map((entry) => entry.passage),
    questions: selected.flatMap((entry) => entry.questions),
  }
}

/** Everything the bank can offer, used as the fallback pool behind fresh material. */
export const bankPool = () => ({
  passages: [...authoredPassages, ...expansionPassages],
  questions: [...questionBank, ...expansionQuestions],
})

/**
 * Assemble a sitting. `fresh` holds passages written for this mock; they are
 * preferred over the bank for every slot they can fill, and the bank covers
 * whatever generation could not supply. A mock is never left short: if fresh
 * material cannot complete the 42-question blueprint, the bank finishes it.
 */
export function createMock(seed = Date.now(), fresh?: { passages: Passage[]; questions: Question[] }): LnatMock {
  const bank = bankPool()
  const freshPassageIds = new Set((fresh?.passages ?? []).map((passage) => passage.id))
  const { passages, questions } = buildForm(
    [...(fresh?.passages ?? []), ...bank.passages],
    [...(fresh?.questions ?? []), ...bank.questions],
    seed,
    freshPassageIds,
  )
  return {
    id: crypto.randomUUID(),
    passages,
    questions,
    prompts: mix(essayPrompts, seed + 29).slice(0, LNAT_SPEC.sectionB.prompts),
  }
}

/**
 * The slot plan the analyst writes against for a full sitting.
 *
 * A real form is not twelve variations on one theme: it moves across subject
 * areas, mixes single-author argument with composite extracts, and carries a
 * spread of difficulty. These slots encode that spread deterministically from
 * the seed, exactly as SATLAS plans its Math modules, so a generated mock is
 * varied in the same way a released form is.
 */
export function mockPassageBlueprints(seed: number, count = LNAT_SPEC.sectionA.passages): PassageBlueprint[] {
  const themes: PassageTheme[] = [
    'law-and-ethics', 'politics-and-society', 'science-and-technology', 'arts-and-culture',
    'education', 'economics', 'history', 'philosophy', 'media', 'environment',
  ]
  // Roughly one composite passage in four, which is what the published practice
  // material shows, and the only register that generates attribution questions.
  const registerAt = (index: number): PassageRegister =>
    index % 4 === 3 ? 'multi-extract' : index % 5 === 1 ? 'opinion-column' : 'argumentative-essay'

  const orderedThemes = mix(themes, seed + 7)
  const skillCycle = mix(sectionASkillIds, seed + 13)

  let cursor = 0
  return Array.from({ length: count }, (_, index) => {
    // Four-question sets on the first six passages and three on the rest gives
    // 6*4 + 6*3 = 42, the published blueprint.
    const questionCount = index < 6 ? 4 : 3
    const questions = Array.from({ length: questionCount }, (_, slot) => {
      const skillId = skillCycle[cursor % skillCycle.length]
      cursor += 1
      // Difficulty rises through each set: the first item on a passage is the
      // way in, the last is the discriminating one.
      const difficulty = Math.max(1, Math.min(5, 2 + slot + (index % 3 === 2 ? 1 : 0))) as Difficulty
      return { domain: domainForSkill(skillId), skillId, difficulty }
    })
    return {
      theme: orderedThemes[index % orderedThemes.length],
      register: registerAt(index),
      questions,
    }
  })
}

export function createCheckpoint(mock: LnatMock): ActiveMockCheckpoint {
  if (mock.questions.length !== LNAT_SPEC.sectionA.questions) {
    throw new Error(`Section A must contain exactly ${LNAT_SPEC.sectionA.questions} questions.`)
  }
  if (mock.passages.length !== LNAT_SPEC.sectionA.passages) {
    throw new Error(`Section A must contain exactly ${LNAT_SPEC.sectionA.passages} passages.`)
  }
  return {
    id: mock.id,
    passages: mock.passages,
    questions: mock.questions,
    prompts: mock.prompts,
    stage: 'intro',
    questionIndex: 0,
    answers: {},
    flags: [],
    eliminated: {},
    remaining: LNAT_SPEC.sectionA.seconds,
    timeExpired: false,
    essayPromptId: null,
    essayPlan: '',
    essay: '',
    startedAt: '',
    elapsedByQuestion: {},
    checkpointedAt: new Date().toISOString(),
  }
}

/** Where a question sits in the form: which passage, and which item of that passage's set. */
export function questionLocation(mock: Pick<ActiveMockCheckpoint, 'questions' | 'passages'>, index: number) {
  const question = mock.questions[index]
  if (!question) return null
  const passage = mock.passages.find((item) => item.id === question.passageId)
  const set = mock.questions.filter((item) => item.passageId === question.passageId)
  const passageNumber = mock.passages.findIndex((item) => item.id === question.passageId) + 1
  return {
    question,
    passage,
    passageNumber,
    positionInSet: set.findIndex((item) => item.id === question.id) + 1,
    setSize: set.length,
  }
}

/** The first question of each passage, so the navigator can group by passage. */
export function passageGroups(mock: Pick<ActiveMockCheckpoint, 'questions' | 'passages'>) {
  return mock.passages.map((passage, passageIndex) => ({
    passage,
    passageNumber: passageIndex + 1,
    indices: mock.questions.reduce<number[]>((result, question, index) => {
      if (question.passageId === passage.id) result.push(index)
      return result
    }, []),
  })).filter((group) => group.indices.length > 0)
}
