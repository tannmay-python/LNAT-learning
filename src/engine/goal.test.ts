import { describe, expect, it } from 'vitest'
import { computeGoalProgress } from './goal'
import type { Attempt, LearnerSettings, SessionRecord, SkillState } from '../types'

const settings = (over: Partial<LearnerSettings> = {}): LearnerSettings => ({
  id: 'learner',
  name: 'Test',
  targetScore: 28,
  dailyMinutes: 30,
  theme: 'light',
  targetUniversity: 'UCL',
  onboardingComplete: true,
  ...over,
})

const attempt = (over: Partial<Attempt> = {}): Attempt => ({
  id: crypto.randomUUID(),
  sessionId: 'practice',
  questionId: crypto.randomUUID(),
  passageId: 'p-jury',
  section: 'section-a',
  domain: 'argument',
  skillId: 'main-conclusion',
  difficulty: 3,
  response: 'a',
  correct: true,
  elapsedMs: 60_000,
  usedHint: false,
  createdAt: '2026-01-10T10:00:00.000Z',
  ...over,
})

const mock = (id: string, score: number, completedAt: string): SessionRecord => ({
  id,
  type: 'mock',
  startedAt: completedAt,
  completedAt,
  questionIds: [],
  passageIds: [],
  answers: {},
  flags: [],
  sectionAScore: score,
})

describe('with no evidence at all', () => {
  const progress = computeGoalProgress(settings(), [], [], [])

  it('still produces an in-range estimate rather than a blank', () => {
    expect(progress.currentEstimate.score).toBeGreaterThanOrEqual(0)
    expect(progress.currentEstimate.score).toBeLessThanOrEqual(42)
  })

  it('says plainly that there is nothing to go on', () => {
    expect(progress.estimateJustification).toMatch(/No answered questions yet/i)
  })

  it('withholds a trend and a projection', () => {
    expect(progress.weeklyTrend).toBeNull()
    expect(progress.projectedScore).toBeNull()
    expect(progress.onTrackMargin).toBeNull()
  })

  it('carries the target through so the gap can be shown', () => {
    expect(progress.targetScore).toBe(28)
    expect(progress.gapToGoal).toBe(28 - progress.currentEstimate.score)
    expect(progress.targetUniversity).toBe('UCL')
  })
})

describe('evidence accounting', () => {
  const attempts = [
    attempt({ sessionId: 'practice', skillId: 'inference', passageId: 'p-canon' }),
    attempt({ sessionId: 'practice', skillId: 'assumption', passageId: 'p-jury' }),
    attempt({ sessionId: 'm1', skillId: 'attribution', passageId: 'p-canon', correct: false }),
  ]
  const sessions: SessionRecord[] = [
    mock('m1', 24, '2026-01-11T10:00:00.000Z'),
    {
      id: 'practice', type: 'adaptive', startedAt: '2026-01-10T10:00:00.000Z', completedAt: '2026-01-10T10:20:00.000Z',
      questionIds: ['a', 'b'], passageIds: ['p-canon', 'p-jury'], answers: {}, flags: [],
    },
  ]
  const progress = computeGoalProgress(settings(), [], sessions, attempts, 2)

  it('separates practice answers from mock answers', () => {
    expect(progress.evidence.practiceAttempts).toBe(2)
    expect(progress.evidence.mockAttempts).toBe(1)
    expect(progress.evidence.totalAttempts).toBe(3)
  })

  it('counts distinct passages read, not answers given', () => {
    expect(progress.evidence.passagesRead).toBe(2)
  })

  it('counts completed practice sets and full mocks separately', () => {
    expect(progress.evidence.practiceSessions).toBe(1)
    expect(progress.evidence.fullMocks).toBe(1)
  })

  it('records essays written', () => {
    expect(progress.evidence.essaysWritten).toBe(2)
  })

  it('shows its working in the justification', () => {
    expect(progress.estimateJustification).toContain('3 answered questions')
    expect(progress.estimateJustification).toContain('1 full mock')
  })
})

describe('trend and projection', () => {
  const sessions = [
    mock('m1', 20, '2026-01-01T10:00:00.000Z'),
    mock('m2', 24, '2026-01-15T10:00:00.000Z'),
    mock('m3', 28, '2026-01-29T10:00:00.000Z'),
  ]

  it('needs two mocks before it will state a trend', () => {
    expect(computeGoalProgress(settings(), [], [sessions[0]], []).weeklyTrend).toBeNull()
    expect(computeGoalProgress(settings(), [], sessions.slice(0, 2), []).weeklyTrend).not.toBeNull()
  })

  it('fits a rising trend through every checkpoint', () => {
    const progress = computeGoalProgress(settings(), [], sessions, [])
    expect(progress.weeklyTrend).toBeGreaterThan(0)
    expect(progress.mockHistory.map((point) => point.score)).toEqual([20, 24, 28])
  })

  it('projects to the test date and compares against the target', () => {
    const progress = computeGoalProgress(
      settings({ testDate: '2026-02-26', targetScore: 30 }),
      [], sessions, [], 0, new Date('2026-01-29T10:00:00.000Z'),
    )
    expect(progress.daysRemaining).toBe(28)
    expect(progress.projectedScore).not.toBeNull()
    expect(progress.projectedScore!).toBeGreaterThan(28)
    expect(progress.onTrackMargin).toBe(progress.projectedScore! - 30)
  })

  it('never projects outside the forty-two mark scale', () => {
    const runaway = [
      mock('m1', 20, '2026-01-01T10:00:00.000Z'),
      mock('m2', 40, '2026-01-08T10:00:00.000Z'),
    ]
    const progress = computeGoalProgress(
      settings({ testDate: '2026-06-01' }), [], runaway, [], 0, new Date('2026-01-08T10:00:00.000Z'),
    )
    expect(progress.projectedScore!).toBeLessThanOrEqual(42)
  })

  it('withholds a projection when no test date is set', () => {
    expect(computeGoalProgress(settings({ testDate: undefined }), [], sessions, []).projectedScore).toBeNull()
  })
})

describe('the prediction track shown to the candidate', () => {
  it('marks each point with what kind of evidence it is', () => {
    const progress = computeGoalProgress(
      settings({ testDate: '2026-03-01' }), [],
      [mock('m1', 22, '2026-01-01T10:00:00.000Z'), mock('m2', 26, '2026-01-15T10:00:00.000Z')],
      [], 0, new Date('2026-01-15T10:00:00.000Z'),
    )
    expect(progress.predictionTrack.actual.every((point) => point.kind === 'mock')).toBe(true)
    expect(progress.predictionTrack.current.kind).toBe('current')
    expect(progress.predictionTrack.projection?.kind).toBe('projection')
    expect(progress.predictionTrack.target?.kind).toBe('target')
  })
})

describe('robustness', () => {
  it('ignores malformed attempts rather than corrupting the estimate', () => {
    const bad = [
      attempt({ createdAt: 'not-a-date' }),
      { ...attempt(), difficulty: Number.NaN } as unknown as Attempt,
      attempt({ section: 'section-b' }),
    ]
    const progress = computeGoalProgress(settings(), [], [], bad)
    expect(progress.evidence.totalAttempts).toBe(0)
    expect(Number.isFinite(progress.currentEstimate.score)).toBe(true)
  })

  it('falls back to stored skill states when no attempt history survives', () => {
    const states: SkillState[] = [{
      skillId: 'inference', theta: 1.2, alpha: 8, beta: 2, attempts: 10, correct: 8,
      streak: 3, lapses: 2, avgTimeMs: 50_000, intervalDays: 3, ease: 2.4,
    }]
    const progress = computeGoalProgress(settings(), states, [], [])
    expect(progress.currentEstimate.score).toBeGreaterThan(0)
  })

  it('blends a completed mock towards the live calibration rather than replacing it', () => {
    const attempts = Array.from({ length: 12 }, () => attempt({ correct: true, difficulty: 4 }))
    const withoutMock = computeGoalProgress(settings(), [], [], attempts)
    const withMock = computeGoalProgress(settings(), [], [mock('m1', 12, '2026-01-11T10:00:00.000Z')], attempts)
    expect(withMock.currentEstimate.score).toBeLessThan(withoutMock.currentEstimate.score)
    expect(withMock.currentEstimate.score).toBeGreaterThan(12)
  })

  it('attaches a band to whatever estimate it produces', () => {
    expect(computeGoalProgress(settings(), [], [], []).band.label.length).toBeGreaterThan(0)
  })
})
