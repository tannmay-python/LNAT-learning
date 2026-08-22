import { essayPrompts } from '../data/essayPrompts'
import { expansionPassages, expansionQuestions } from '../data/bankExpansion'
import { passages as authoredPassages } from '../data/passages'
import { questionBank } from '../data/questionBank'
import type { ActiveMockCheckpoint, EssayPrompt, Passage, Question } from '../types'

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
): { passages: Passage[]; questions: Question[] } {
  const byPassage = new Map<string, Question[]>()
  for (const question of questions) {
    if (!byPassage.has(question.passageId)) byPassage.set(question.passageId, [])
    byPassage.get(question.passageId)!.push(question)
  }
  const usable = pool.filter((passage) => (byPassage.get(passage.id)?.length ?? 0) >= 3)
  const ordered = mix(usable, seed)

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

export function createMock(seed = Date.now()): LnatMock {
  const { passages, questions } = buildForm(
    [...authoredPassages, ...expansionPassages],
    [...questionBank, ...expansionQuestions],
    seed,
  )
  return {
    id: crypto.randomUUID(),
    passages,
    questions,
    prompts: mix(essayPrompts, seed + 29).slice(0, LNAT_SPEC.sectionB.prompts),
  }
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
