import type { Attempt, Confidence, Difficulty, Passage, Question, QuestionBlueprint, SkillDirective, SkillState } from '../types'
import { bandForScore, scoreBands } from './officialReference'

const DAY_MS = 24 * 60 * 60 * 1000

export const defaultSkillState = (skillId: string): SkillState => ({
  skillId,
  theta: 0,
  alpha: 1,
  beta: 1,
  attempts: 0,
  correct: 0,
  streak: 0,
  lapses: 0,
  avgTimeMs: 0,
  intervalDays: 0,
  ease: 2.3,
})

const finiteOr = (value: number | undefined, fallback: number): number => Number.isFinite(value) ? value as number : fallback
const clampDifficulty = (value: number | undefined): Difficulty => Math.max(1, Math.min(5, Math.round(finiteOr(value, 3)))) as Difficulty

export const difficultyToTheta = (difficulty: Difficulty) => (clampDifficulty(difficulty) - 3) * 0.72

export const expectedSuccess = (theta: number, difficulty: Difficulty) => {
  const safeTheta = finiteOr(theta, 0)
  return 1 / (1 + Math.exp(-(safeTheta - difficultyToTheta(difficulty))))
}

export const masteryPercent = (state?: SkillState) => {
  const attempts = finiteOr(state?.attempts, 0)
  if (!state || attempts <= 0) return 0
  const alpha = Math.max(0, finiteOr(state.alpha, 1))
  const beta = Math.max(0, finiteOr(state.beta, 1))
  const observed = alpha / Math.max(1, alpha + beta)
  const ability = 1 / (1 + Math.exp(-finiteOr(state.theta, 0)))
  return Math.round((observed * 0.55 + ability * 0.45) * 100)
}

/**
 * One answer moves one skill. Confidence weights the evidence — a correct
 * answer the candidate called a guess says less than one they were certain of,
 * and a confident miss is treated as a genuine misconception rather than a slip.
 */
export function updateSkillState(previous: SkillState | undefined, attempt: Attempt): SkillState {
  const base = defaultSkillState(attempt.skillId)
  const state: SkillState = previous ? {
    ...base,
    ...previous,
    theta: finiteOr(previous.theta, base.theta),
    alpha: Math.max(0, finiteOr(previous.alpha, base.alpha)),
    beta: Math.max(0, finiteOr(previous.beta, base.beta)),
    attempts: Math.max(0, Math.floor(finiteOr(previous.attempts, base.attempts))),
    correct: Math.max(0, Math.floor(finiteOr(previous.correct, base.correct))),
    streak: Math.max(0, Math.floor(finiteOr(previous.streak, base.streak))),
    lapses: Math.max(0, Math.floor(finiteOr(previous.lapses, base.lapses))),
    avgTimeMs: Math.max(0, finiteOr(previous.avgTimeMs, base.avgTimeMs)),
    intervalDays: Math.max(0, finiteOr(previous.intervalDays, base.intervalDays)),
    ease: Math.max(1.3, Math.min(3, finiteOr(previous.ease, base.ease))),
  } : base

  const difficulty = clampDifficulty(attempt.difficulty)
  const expected = expectedSuccess(state.theta, difficulty)
  const confidenceWeight: Record<Confidence, number> = { guess: 0.82, low: 0.91, medium: 1, high: 1.07, certain: 1.13 }
  const evidenceWeight = (attempt.confidence ? confidenceWeight[attempt.confidence] ?? 1 : 1) * (attempt.usedHint === true ? 0.72 : 1)
  const outcome = attempt.correct === true ? 1 : 0
  const learningRate = Math.max(0.12, 0.46 / Math.sqrt(1 + state.attempts / 4))
  const theta = Math.max(-3, Math.min(3, state.theta + learningRate * evidenceWeight * (outcome - expected)))
  const streak = outcome ? state.streak + 1 : 0
  const highConfidenceMiss = !outcome && (attempt.confidence === 'high' || attempt.confidence === 'certain')
  const ease = Math.max(1.3, Math.min(3, state.ease + (outcome ? 0.04 : -0.22) + (highConfidenceMiss ? -0.08 : 0)))

  let intervalDays: number
  if (!outcome) intervalDays = 0.01
  else if (state.intervalDays < 1) intervalDays = 1
  else if (streak === 2) intervalDays = Math.max(3, state.intervalDays * 2)
  else intervalDays = Math.min(60, Math.max(1, state.intervalDays * ease * (0.86 + difficulty * 0.05)))

  const lastSeen = typeof attempt.createdAt === 'string' && !Number.isNaN(Date.parse(attempt.createdAt)) ? attempt.createdAt : new Date().toISOString()
  const elapsedMs = Math.max(0, finiteOr(attempt.elapsedMs, 0))

  return {
    ...state,
    theta,
    alpha: state.alpha + (outcome ? evidenceWeight : 0),
    beta: state.beta + (outcome ? 0 : evidenceWeight),
    attempts: state.attempts + 1,
    correct: state.correct + (outcome ? 1 : 0),
    streak,
    lapses: state.lapses + (outcome ? 0 : 1),
    avgTimeMs: state.attempts === 0 ? elapsedMs : Math.round(state.avgTimeMs * 0.72 + elapsedMs * 0.28),
    lastSeen,
    dueAt: new Date(new Date(lastSeen).getTime() + intervalDays * DAY_MS).toISOString(),
    intervalDays,
    ease,
  }
}

export function targetDifficulty(state?: SkillState): Difficulty {
  if (!state || state.attempts < 2) return 2
  const targetSuccess = 0.74
  return ([1, 2, 3, 4, 5] as Difficulty[])
    .sort((a, b) => Math.abs(expectedSuccess(state.theta, a) - targetSuccess) - Math.abs(expectedSuccess(state.theta, b) - targetSuccess))[0]
}

/**
 * A form-wide calibration prevents sparse per-skill histories from pinning an
 * otherwise strong reader to Difficulty 2. It moves one level at a time and
 * needs a meaningful run of recent evidence before the baseline shifts.
 */
export function paperTargetDifficulty(attempts: Attempt[]): Difficulty {
  const recent = attempts.filter((attempt) => attempt.section === 'section-a' && Number.isFinite(attempt.difficulty)).slice(0, 24)
  if (!recent.length) return 2
  const averageDifficulty = recent.reduce((sum, attempt) => sum + attempt.difficulty, 0) / recent.length
  const accuracy = recent.filter((attempt) => attempt.correct).length / recent.length
  let target = Math.round(averageDifficulty)
  if (recent.length >= 8 && accuracy >= 0.84) target += 1
  else if (recent.length >= 6 && accuracy < 0.55) target -= 1
  return clampDifficulty(target)
}

export function recommendedDifficulty(
  state: SkillState | undefined,
  directive: SkillDirective | undefined,
  paperTarget: Difficulty,
): Difficulty {
  const measured = targetDifficulty(state)
  if (directive) {
    const directiveWeight = Math.max(0, Math.min(1, directive.priority))
    return clampDifficulty(directive.targetDifficulty * (0.65 + directiveWeight * 0.35) + Math.max(measured, paperTarget) * (0.35 - directiveWeight * 0.35))
  }
  return clampDifficulty(Math.max(measured, paperTarget))
}

export function isDue(state?: SkillState, now = new Date()): boolean {
  if (!state?.dueAt) return true
  return new Date(state.dueAt).getTime() <= now.getTime()
}

export function selectionPriority(
  question: Question,
  states: Map<string, SkillState>,
  seenQuestionIds: Set<string>,
  now = new Date(),
  directives: SkillDirective[] = [],
  paperTarget?: Difficulty,
): number {
  const state = states.get(question.skillId)
  const masteryGap = 1 - masteryPercent(state) / 100
  const due = isDue(state, now) ? 1 : 0
  const uncertainty = state ? 1 / Math.sqrt(state.attempts + 1) : 1
  const directive = directives.find((item) => item.skillId === question.skillId)
  const desired = recommendedDifficulty(state, directive, paperTarget ?? targetDifficulty(state))
  const challengeGap = Math.abs(question.difficulty - desired) / 4
  const novelty = seenQuestionIds.has(question.id) ? 0 : 1
  const lowEvidence = state ? Math.max(0, 1 - state.attempts / 5) : 1
  const analyticPriority = directive?.priority ?? 0
  return masteryGap * 0.25 + due * 0.14 + uncertainty * 0.09 + (1 - challengeGap) * 0.22 + novelty * 0.1 + lowEvidence * 0.05 + analyticPriority * 0.15
}

export function selectNextQuestion(
  questions: Question[],
  states: Map<string, SkillState>,
  seenQuestionIds: Set<string>,
  forcedSkillId?: string,
  directives: SkillDirective[] = [],
  paperTarget?: Difficulty,
): Question | undefined {
  const skillCandidates = forcedSkillId ? questions.filter((question) => question.skillId === forcedSkillId) : questions
  const candidates = skillCandidates.length ? skillCandidates : questions
  const exactFits = candidates.filter((question) => {
    const directive = directives.find((item) => item.skillId === question.skillId)
    const desired = recommendedDifficulty(states.get(question.skillId), directive, paperTarget ?? targetDifficulty(states.get(question.skillId)))
    return question.difficulty === desired
  })
  const ranked = exactFits.length ? exactFits : candidates
  return [...ranked].sort((a, b) =>
    selectionPriority(b, states, seenQuestionIds, new Date(), directives, paperTarget)
    - selectionPriority(a, states, seenQuestionIds, new Date(), directives, paperTarget))[0]
}

/**
 * The LNAT is passage-led, so practice selects a *passage* and then works its
 * question set in order. Choosing at the passage level is what makes a set feel
 * like the real thing: the reading cost is paid once and amortised across three
 * or four questions, exactly as it is on the day.
 */
export function rankPassages(
  passages: Passage[],
  questionsByPassage: Map<string, Question[]>,
  states: Map<string, SkillState>,
  seenQuestionIds: Set<string>,
  seenPassageIds: Set<string>,
  directives: SkillDirective[] = [],
  paperTarget?: Difficulty,
): Passage[] {
  const score = (passage: Passage) => {
    const questions = questionsByPassage.get(passage.id) ?? []
    if (!questions.length) return -1
    const average = questions.reduce((sum, question) =>
      sum + selectionPriority(question, states, seenQuestionIds, new Date(), directives, paperTarget), 0) / questions.length
    // A passage already read this session teaches much less on a second visit.
    return average - (seenPassageIds.has(passage.id) ? 0.45 : 0)
  }
  return [...passages].sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id))
}

/**
 * Build a passage-sized run of question slots for the model to write against.
 * Repeated skills are penalised so that one passage does not produce four
 * variations of the same question.
 */
export function planQuestionBlueprint(
  pool: Question[],
  count: number,
  states: Map<string, SkillState>,
  seenQuestionIds: Set<string>,
  directives: SkillDirective[],
  paperTarget: Difficulty,
): QuestionBlueprint[] {
  const chosenIds = new Set<string>()
  const skillUses = new Map<string, number>()
  const result: QuestionBlueprint[] = []
  for (let index = 0; index < count; index += 1) {
    const candidates = pool.filter((question) => !chosenIds.has(question.id))
    const next = [...candidates].sort((a, b) => {
      const value = (question: Question) =>
        selectionPriority(question, states, seenQuestionIds, new Date(), directives, paperTarget)
        - (skillUses.get(question.skillId) ?? 0) * 0.2
      return value(b) - value(a)
    })[0]
    if (!next) break
    const directive = directives.find((item) => item.skillId === next.skillId)
    result.push({
      domain: next.domain,
      skillId: next.skillId,
      difficulty: recommendedDifficulty(states.get(next.skillId), directive, paperTarget),
    })
    chosenIds.add(next.id)
    skillUses.set(next.skillId, (skillUses.get(next.skillId) ?? 0) + 1)
  }
  return result
}

/**
 * Map the candidate's calibration onto the 42-mark Section A scale.
 *
 * There is no published raw-mark conversion to defend here — the LNAT reports a
 * raw mark — so this is a straightforward expected-score model: for each of the
 * forty-two slots on a representative form, the probability of a correct answer
 * at that slot's difficulty, floored by the 20% a five-option guess returns.
 */
export function sectionAScoreEstimate(theta: number) {
  const safeTheta = finiteOr(theta, 0)
  // A representative form skews to the middle, with a tail at each end.
  const formShape: Array<[Difficulty, number]> = [[1, 4], [2, 10], [3, 15], [4, 9], [5, 4]]
  const expected = formShape.reduce((sum, [difficulty, slots]) => {
    const skill = expectedSuccess(safeTheta, difficulty)
    // A candidate who cannot reason to the answer still guesses among five.
    return sum + slots * (skill + (1 - skill) * 0.2)
  }, 0)
  const score = Math.max(9, Math.min(42, Math.round(expected)))
  const confidenceRadius = Math.max(3, Math.round(9 - 1.4 * Math.min(4, Math.abs(safeTheta))))
  return { score, confidenceRadius }
}

export function overallTheta(states: SkillState[], skillIds: string[]) {
  const selected = states.filter((state) =>
    skillIds.includes(state.skillId) && Number.isFinite(state.attempts) && state.attempts > 0 && Number.isFinite(state.theta))
  if (!selected.length) return 0
  const totalWeight = selected.reduce((sum, state) => sum + Math.sqrt(state.attempts), 0)
  if (!Number.isFinite(totalWeight) || totalWeight <= 0) return 0
  return finiteOr(selected.reduce((sum, state) => sum + state.theta * Math.sqrt(state.attempts), 0) / totalWeight, 0)
}

/**
 * Published context for a raw mark. The mean is the reported cohort average for
 * a recent cycle; the rest are the ranges successful applicants have tended to
 * present. None of this is an official conversion or a prediction of an offer.
 */
export { bandForScore, scoreBands }
