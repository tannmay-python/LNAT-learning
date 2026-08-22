import { isCorrectResponse, wordCount } from './questions'
import { skillById } from '../data/curriculum'
import type { Attempt, MockScoreReport, MockTrainingAction, Question } from '../types'

/**
 * Facts taken from the LNAT Consortium's published test-format, practice-test,
 * and hints pages in August 2026. The Consortium's current FAQ says the result
 * is a score out of 42; it does not publish a raw-mark conversion, percentile,
 * or admissions threshold.
 */
export const officialReference = {
  accessed: '2026-08-22',
  sectionA: {
    passages: 12,
    questions: 42,
    seconds: 95 * 60,
    passageSetSizes: [3, 4] as const,
    choicesPerQuestion: 5,
    negativeMarking: false,
  },
  sectionB: {
    prompts: 3,
    seconds: 40 * 60,
    recommendedWords: [500, 600] as const,
    maximumWords: 750,
    officialMark: false,
  },
  passageWords: {
    minimum: 300,
    /** Measured from the 24 published 2010 practice passages: 454–942 words, median 508. */
    targetMinimum: 380,
    targetMaximum: 680,
    maximum: 700,
    measuredMedian: 508,
    measuredMinimum: 454,
    measuredMaximum: 942,
  },
  questionSeconds: 80,
  poe: {
    officialGuidance:
      'The LNAT explicitly warns that near-miss options are part of the test and advises eliminating known-wrong options before guessing.',
    minimumOptionsBeforeGuess: 1,
  },
  scoreScale: {
    type: 'raw' as const,
    minimum: 0,
    maximum: 42,
    publishedConversion: false,
    publishedPercentile: false,
    publishedAdmissionsThreshold: false,
  },
} as const

export const scoreBands = [
  { from: 0, to: 14, label: 'Foundation', note: 'Build passage-first reading and stop outside knowledge from answering for you.' },
  { from: 15, to: 19, label: 'Developing', note: 'The next marks are usually in scope words, attribution, and finishing every blank.' },
  { from: 20, to: 22, label: 'Around cohort mean', note: 'You are reading competently; discrimination between near-miss options is now the work.' },
  { from: 23, to: 26, label: 'Competitive', note: 'Tighten argument-role and assumption work, then protect marks with full coverage.' },
  { from: 27, to: 30, label: 'Strong', note: 'Keep accuracy while increasing passage variety and full-form endurance.' },
  { from: 31, to: 34, label: 'Very strong', note: 'Audit the last few lost marks; avoid changing a method that is broadly working.' },
  { from: 35, to: 42, label: 'Exceptional', note: 'Maintain timing discipline and use hard multi-extract passages to avoid complacency.' },
] as const

export const bandForScore = (score: number) =>
  scoreBands.find((band) => score >= band.from && score <= band.to) ?? scoreBands[0]

export interface MockScoreInput {
  questions: Question[]
  answers: Record<string, string>
  flags?: string[]
  eliminated?: Record<string, string[]>
  elapsedByQuestion?: Record<string, number>
}

const seconds = (value: number | undefined) => Math.max(0, Math.round((value ?? 0) / 1000))

/**
 * A mock is not finished when it has a raw mark. This turns the sitting into
 * the next training sequence: what lost marks, what timing pattern, and what
 * the candidate's own elimination behaviour says about decision quality.
 */
export function buildMockScoreReport({
  questions,
  answers,
  flags = [],
  eliminated = {},
  elapsedByQuestion = {},
}: MockScoreInput): MockScoreReport {
  const answered = questions.filter((question) => Boolean(answers[question.id]))
  const correct = answered.filter((question) => isCorrectResponse(question, answers[question.id]))
  const unansweredQuestions = questions.filter((question) => !answers[question.id])
  const flaggedUnanswered = unansweredQuestions.filter((question) => flags.includes(question.id))
  const timed = answered.filter((question) => (elapsedByQuestion[question.id] ?? 0) > 0)
  const averageSeconds = timed.length
    ? Math.round(timed.reduce((sum, question) => sum + seconds(elapsedByQuestion[question.id]), 0) / timed.length)
    : 0
  const overTimeQuestions = timed.filter((question) => seconds(elapsedByQuestion[question.id]) > question.estimatedSeconds * 1.25).length

  const poeQuestions = questions.filter((question) => (eliminated[question.id]?.length ?? 0) > 0)
  const poeCorrect = poeQuestions.filter((question) => isCorrectResponse(question, answers[question.id] ?? '')).length
  const noPoeAnswered = answered.filter((question) => !(eliminated[question.id]?.length ?? 0))
  const noPoeCorrect = noPoeAnswered.filter((question) => isCorrectResponse(question, answers[question.id] ?? '')).length

  const skillCounts = new Map<string, { correct: number; total: number; seconds: number }>()
  for (const question of questions) {
    const entry = skillCounts.get(question.skillId) ?? { correct: 0, total: 0, seconds: 0 }
    entry.total += 1
    entry.correct += Number(isCorrectResponse(question, answers[question.id] ?? ''))
    entry.seconds += seconds(elapsedByQuestion[question.id])
    skillCounts.set(question.skillId, entry)
  }

  const plan: MockTrainingAction[] = []
  const weakSkills = [...skillCounts.entries()]
    .filter(([skillId, entry]) => skillById.has(skillId) && entry.correct < entry.total)
    .sort((left, right) => (left[1].correct / left[1].total) - (right[1].correct / right[1].total) || right[1].total - left[1].total)
    .slice(0, 3)

  for (const [skillId, entry] of weakSkills) {
    const topic = skillById.get(skillId)!
    plan.push({
      skillId,
      title: topic.shortTitle,
      reason: `${entry.correct}/${entry.total} on this paper`,
      action: `Reread ${topic.title.toLowerCase()}, then do one fresh passage set targeting ${topic.shortTitle.toLowerCase()} before mixed practice.`,
      evidence: `Section A evidence from this sitting only`,
    })
  }

  if (unansweredQuestions.length) {
    plan.push({
      title: 'Finish the paper',
      reason: `${unansweredQuestions.length} blank${unansweredQuestions.length === 1 ? '' : 's'}`,
      action: 'Practise a timed set with a final two-minute sweep. Eliminate at least one option and answer every remaining blank.',
      evidence: 'LNAT gives one mark for a right answer and deducts nothing for a wrong one',
    })
  }
  if (flaggedUnanswered.length >= 2) {
    plan.push({
      title: 'Close flagged questions',
      reason: `${flaggedUnanswered.length} flagged blanks`,
      action: 'On your next mock, reserve the final four minutes for flagged items before opening the whole review grid.',
      evidence: 'Flagged questions only convert to marks if you return to them',
    })
  }
  if (averageSeconds > officialReference.questionSeconds * 1.12 || overTimeQuestions >= 8) {
    plan.push({
      title: 'Repair pacing',
      reason: `${averageSeconds}s average · ${overTimeQuestions} over budget`,
      action: 'Do two passage sets at a hard 75-second per-question cap. If a decision exceeds the cap, eliminate, mark, and move.',
      evidence: 'The official section allows about 135 seconds per question including reading time',
    })
  }
  const poeAccuracy = poeQuestions.length ? poeCorrect / poeQuestions.length : null
  const noPoeAccuracy = noPoeAnswered.length ? noPoeCorrect / noPoeAnswered.length : null
  if (poeAccuracy !== null && poeQuestions.length >= 4 && (noPoeAccuracy === null || poeAccuracy < noPoeAccuracy)) {
    plan.push({
      title: 'Slow the elimination',
      reason: `PoE accuracy ${Math.round(poeAccuracy * 100)}%`,
      action: 'For each option, name the exact passage word that kills it. Do not eliminate on topic mismatch alone.',
      evidence: `${poeCorrect}/${poeQuestions.length} with eliminations were correct`,
    })
  } else if (answered.length >= 8 && poeQuestions.length / answered.length < 0.4) {
    plan.push({
      title: 'Use elimination more often',
      reason: `PoE on only ${poeQuestions.length}/${answered.length}`,
      action: 'On the next set, cross out one clearly wrong option before choosing. Compare the two survivors against the exact ask.',
      evidence: 'Official guidance treats near-miss options as the central discrimination task',
    })
  }
  if (!plan.length) {
    plan.push({
      title: 'Maintain the method',
      reason: `${correct.length}/${questions.length} with balanced timing`,
      action: 'Take one harder multi-extract passage set, then preserve the method with a mixed review set in three days.',
      evidence: 'No systemic accuracy, pacing, coverage, or PoE weakness in this sitting',
    })
  }

  return {
    correct: correct.length,
    total: questions.length,
    band: bandForScore(correct.length),
    boundary:
      'Practice band over the official 0-42 raw scale. LNAT reports a raw mark; no official conversion, percentile, or admissions threshold is published.',
    averageSeconds,
    overTimeQuestions,
    unanswered: unansweredQuestions.length,
    flaggedUnanswered: flaggedUnanswered.length,
    poeUsedQuestions: poeQuestions.length,
    poeAccurateRate: poeQuestions.length ? Math.round(poeCorrect / poeQuestions.length * 100) / 100 : null,
    trainingPlan: plan.slice(0, 5),
  }
}

/** Guardrails for authored and generated passages, derived from the official shape. */
export function passageFidelityFault(passage: { wordCount: number; body?: string; extracts?: Array<{ body: string }> }): string | null {
  const words = passage.wordCount ?? wordCount(passage.body ?? passage.extracts?.map((item) => item.body).join(' ') ?? '')
  if (words < officialReference.passageWords.minimum) return `passage is only ${words} words`
  if (words > officialReference.passageWords.maximum) return `passage is ${words} words`
  return null
}

export function attemptIsOfficialScaleValid(attempt: Attempt) {
  return attempt.section === 'section-a' && Number.isFinite(attempt.difficulty)
}
