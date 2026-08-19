import type { ChoiceId, Passage, Question } from '../types'

export const CHOICE_IDS: ChoiceId[] = ['a', 'b', 'c', 'd', 'e']

/**
 * Generated items occasionally inherit a sentence that explains the item's
 * teaching purpose rather than belonging to the passage. Strip it in the browser
 * as well as on the server, so an older saved item cannot leak commentary into
 * the reading pane while the data file is being refreshed.
 */
const metaLeak = /this passage (?:is designed|has been written) to|the question tests|candidates are expected to notice|the correct answer is|as this extract shows, the writer's technique|note for the reader:/i

export function cleanPassageText(value?: string) {
  if (!value) return value
  const index = value.search(metaLeak)
  return index < 0 ? value : value.slice(0, index).trim()
}

export function sanitizePassage(passage: Passage): Passage {
  const body = cleanPassageText(passage.body)
  const extracts = passage.extracts?.map((extract) => ({ ...extract, body: cleanPassageText(extract.body) ?? extract.body }))
  return { ...passage, ...(body !== undefined ? { body } : {}), ...(extracts ? { extracts } : {}) }
}

export function isCorrectResponse(question: Question, response: string) {
  return response.trim().toLowerCase() === question.answer
}

export function displayAnswer(question: Question) {
  const choice = question.choices.find((item) => item.id === question.answer)
  return choice ? `(${choice.id}) ${choice.text}` : question.answer
}

/**
 * Structural validation used for both authored and generated items. Anything
 * failing this never reaches a learner, because a five-option item with two
 * defensible answers teaches the wrong lesson twice.
 */
export function questionFault(question: Partial<Question>): string | null {
  if (!question?.prompt || question.prompt.trim().split(/\s+/).length < 4) return 'the prompt is too short to be answerable'
  if (!Array.isArray(question.choices) || question.choices.length !== 5) return 'there are not exactly five options'
  const ids = question.choices.map((choice) => choice?.id)
  if (new Set(ids).size !== 5 || !CHOICE_IDS.every((id) => ids.includes(id))) return 'the option labels are not exactly (a) to (e)'
  const texts = question.choices.map((choice) => (choice?.text ?? '').trim().toLowerCase())
  if (texts.some((text) => text.length < 2)) return 'an option is empty'
  if (new Set(texts).size !== 5) return 'two options say the same thing'
  if (!question.answer || !ids.includes(question.answer)) return 'the answer key is not one of the options'
  if (!question.explanation || question.explanation.trim().split(/\s+/).length < 12) return 'the explanation does not teach the decision'
  if (!question.passageId) return 'the item is not attached to a passage'
  return null
}

/** Section A awards a mark per correct answer and deducts nothing for a wrong one. */
export function rawScore(questions: Question[], answers: Record<string, string>) {
  const correct = questions.filter((question) => isCorrectResponse(question, answers[question.id] ?? '')).length
  return { correct, total: questions.length }
}

export const wordCount = (value: string) => value.trim().split(/\s+/).filter(Boolean).length
