import { sectionASkillIds } from '../data/curriculum'
import { bandForScore, defaultSkillState, overallTheta, sectionAScoreEstimate, updateSkillState } from './adaptive'
import type { Attempt, LearnerSettings, SessionRecord, SkillState } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000

export interface ScorePoint { date: string; score: number }
export interface PredictionPoint extends ScorePoint { kind: 'mock' | 'current' | 'projection' | 'target' }

export interface GoalEvidenceSummary {
  totalAttempts: number
  practiceAttempts: number
  mockAttempts: number
  practiceSessions: number
  fullMocks: number
  essaysWritten: number
  passagesRead: number
}

export interface GoalProgress {
  targetScore?: number
  targetUniversity: string
  testDate?: string
  daysRemaining?: number
  currentEstimate: { score: number; confidenceRadius: number }
  band: ReturnType<typeof bandForScore>
  estimateJustification: string
  evidence: GoalEvidenceSummary
  gapToGoal?: number
  mockHistory: ScorePoint[]
  weeklyTrend: number | null
  projectedScore: number | null
  onTrackMargin: number | null
  predictionTrack: {
    actual: PredictionPoint[]
    current: PredictionPoint
    projection: PredictionPoint | null
    target: PredictionPoint | null
  }
}

const finiteOr = (value: number | undefined, fallback: number): number => Number.isFinite(value) ? value as number : fallback
const validDate = (value: string | undefined) => Boolean(value && !Number.isNaN(Date.parse(value)))
const scoreable = (attempt: Attempt) => Boolean(
  attempt?.skillId
  && attempt.section === 'section-a'
  && Number.isFinite(attempt.difficulty)
  && typeof attempt.correct === 'boolean'
  && validDate(attempt.createdAt),
)

/**
 * Pace maths is deliberately modest. The live estimate is skill-weighted from
 * the complete answer history; completed full mocks act as a small calibration
 * anchor rather than as the estimate itself. `null` fields mean "not enough
 * evidence yet", which is the correct thing to show a candidate with one mock
 * rather than a confident-looking number.
 */
export function computeGoalProgress(
  settings: LearnerSettings,
  skillStates: SkillState[],
  sessions: SessionRecord[],
  attempts: Attempt[] = [],
  essayCount = 0,
  now: Date = new Date(),
): GoalProgress {
  const mockHistory: ScorePoint[] = sessions
    .filter((session): session is SessionRecord & { completedAt: string; sectionAScore: number } =>
      session.type === 'mock' && validDate(session.completedAt) && Number.isFinite(session.sectionAScore))
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt))
    .map((session) => ({ date: session.completedAt, score: session.sectionAScore }))

  const scoredAttempts = attempts.filter(scoreable)
  const estimateStates = scoredAttempts.length
    ? [...scoredAttempts].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).reduce<SkillState[]>((states, attempt) => {
      const index = states.findIndex((state) => state.skillId === attempt.skillId)
      const next = updateSkillState(index >= 0 ? states[index] : defaultSkillState(attempt.skillId), attempt)
      if (index >= 0) states[index] = next
      else states.push(next)
      return states
    }, [])
    : skillStates

  const live = sectionAScoreEstimate(overallTheta(estimateStates, sectionASkillIds))
  const latestMock = mockHistory[mockHistory.length - 1]
  const mockWeight = mockHistory.length ? Math.min(0.42, 0.2 + Math.max(0, mockHistory.length - 1) * 0.08) : 0
  const blended = latestMock
    ? Math.round(live.score * (1 - mockWeight) + latestMock.score * mockWeight)
    : live.score

  const mockSessionIds = new Set(sessions.filter((session) => session.type === 'mock').map((session) => session.id))
  const evidence: GoalEvidenceSummary = {
    totalAttempts: scoredAttempts.length,
    mockAttempts: scoredAttempts.filter((attempt) => mockSessionIds.has(attempt.sessionId)).length,
    practiceAttempts: scoredAttempts.filter((attempt) => !mockSessionIds.has(attempt.sessionId)).length,
    practiceSessions: sessions.filter((session) => session.type !== 'mock' && Boolean(session.completedAt) && session.questionIds.length > 0).length,
    fullMocks: mockHistory.length,
    essaysWritten: essayCount,
    passagesRead: new Set(scoredAttempts.map((attempt) => attempt.passageId).filter(Boolean)).size,
  }

  const coverage = new Set(estimateStates.filter((state) => state.attempts > 0).map((state) => state.skillId)).size / Math.max(1, sectionASkillIds.length)
  const confidenceRadius = Math.max(2, Math.min(12, Math.round(
    live.confidenceRadius + 4 - Math.sqrt(evidence.totalAttempts) * 0.6 - coverage * 3 - Math.min(3, mockHistory.length),
  )))
  const currentEstimate = { score: Math.max(9, Math.min(42, blended)), confidenceRadius }

  const answerLabel = (count: number) => `${count} answered question${count === 1 ? '' : 's'}`
  const estimateJustification = evidence.totalAttempts
    ? `Based on ${answerLabel(evidence.totalAttempts)} across ${evidence.passagesRead} passage${evidence.passagesRead === 1 ? '' : 's'}, ${evidence.practiceSessions} completed practice set${evidence.practiceSessions === 1 ? '' : 's'}, and ${evidence.fullMocks} full mock${evidence.fullMocks === 1 ? '' : 's'}. Practice drives the live calibration; a completed mock adds a modest full-form checkpoint. The ±${confidenceRadius} range reflects how much evidence exists and how many of the ${sectionASkillIds.length} Section A skills it covers.`
    : `No answered questions yet. Work through a few passages and the estimate will appear, wide at first and narrowing as evidence accumulates across all ${sectionASkillIds.length} Section A skills.`

  let weeklyTrend: number | null = null
  if (mockHistory.length >= 2) {
    const firstDate = new Date(mockHistory[0].date).getTime()
    const points = mockHistory.map((point) => ({ x: (new Date(point.date).getTime() - firstDate) / DAY_MS, y: point.score }))
    const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length
    const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length
    const denominator = points.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0)
    const slopePerDay = denominator ? points.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0) / denominator : 0
    weeklyTrend = Math.round(slopePerDay * 7 * 10) / 10
  }

  const testDate = validDate(settings.testDate) ? settings.testDate : undefined
  const daysRemaining = testDate ? Math.ceil((new Date(testDate).getTime() - now.getTime()) / DAY_MS) : undefined

  let projectedScore: number | null = null
  if (weeklyTrend !== null && daysRemaining !== undefined && latestMock) {
    projectedScore = Math.max(0, Math.min(42, Math.round(latestMock.score + weeklyTrend * Math.max(0, daysRemaining / 7))))
  }

  const targetScore = Number.isFinite(settings.targetScore) && settings.targetScore > 0 ? settings.targetScore : undefined
  return {
    targetScore,
    targetUniversity: settings.targetUniversity,
    testDate,
    daysRemaining,
    currentEstimate,
    band: bandForScore(currentEstimate.score),
    estimateJustification,
    evidence,
    gapToGoal: targetScore ? targetScore - currentEstimate.score : undefined,
    mockHistory,
    weeklyTrend,
    projectedScore,
    onTrackMargin: projectedScore !== null && targetScore ? projectedScore - targetScore : null,
    predictionTrack: {
      actual: mockHistory.map((point) => ({ ...point, kind: 'mock' as const })),
      current: { date: now.toISOString(), score: currentEstimate.score, kind: 'current' },
      projection: projectedScore !== null && testDate
        ? { date: new Date(testDate).toISOString(), score: projectedScore, kind: 'projection' as const }
        : null,
      target: targetScore
        ? { date: testDate ? new Date(testDate).toISOString() : now.toISOString(), score: targetScore, kind: 'target' as const }
        : null,
    },
  }
}

export const finite = finiteOr
