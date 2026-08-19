import type { Attempt, Difficulty, DomainId, SessionRecord } from '../types'

export interface AggregateStats {
  total: number
  correct: number
  accuracy: number
  averageSeconds: number
  averageTargetSeconds: number
}

export interface DailyStats extends AggregateStats { date: string }
export interface SkillStats extends AggregateStats { skillId: string }

const summarize = (attempts: Attempt[]): AggregateStats => {
  const total = attempts.length
  const correct = attempts.filter((attempt) => attempt.correct).length
  const withTarget = attempts.filter((attempt) => attempt.questionSnapshot?.estimatedSeconds)
  return {
    total,
    correct,
    accuracy: total ? Math.round(correct / total * 100) : 0,
    averageSeconds: total ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.elapsedMs, 0) / total / 1000) : 0,
    averageTargetSeconds: withTarget.length
      ? Math.round(withTarget.reduce((sum, attempt) => sum + (attempt.questionSnapshot?.estimatedSeconds ?? 0), 0) / withTarget.length)
      : 0,
  }
}

const utcDay = (value: Date | string) => new Date(value).toISOString().slice(0, 10)

const DOMAIN_IDS: DomainId[] = ['comprehension', 'interpretation', 'argument', 'rhetoric']

/**
 * Reading pace is the LNAT's real constraint: twelve passages and forty-two
 * questions in ninety-five minutes leaves under eight minutes per passage
 * including its whole question set. Tracking it separately from accuracy is the
 * only way to tell a candidate who cannot reason from one who cannot finish.
 */
export function readingPace(attempts: Attempt[]) {
  const withRead = attempts.filter((attempt) => Number.isFinite(attempt.passageReadMs) && (attempt.passageReadMs ?? 0) > 0 && attempt.passageSnapshot?.wordCount)
  const seen = new Map<string, { ms: number; words: number }>()
  for (const attempt of withRead) {
    const key = `${attempt.sessionId}:${attempt.passageId}`
    if (seen.has(key)) continue
    seen.set(key, { ms: attempt.passageReadMs ?? 0, words: attempt.passageSnapshot?.wordCount ?? 0 })
  }
  const readings = [...seen.values()]
  if (!readings.length) return { passagesRead: 0, wordsPerMinute: 0, averageSeconds: 0 }
  const totalMs = readings.reduce((sum, item) => sum + item.ms, 0)
  const totalWords = readings.reduce((sum, item) => sum + item.words, 0)
  return {
    passagesRead: readings.length,
    wordsPerMinute: totalMs ? Math.round(totalWords / (totalMs / 60_000)) : 0,
    averageSeconds: Math.round(totalMs / readings.length / 1000),
  }
}

export function buildLearningInsights(attempts: Attempt[], sessions: SessionRecord[], now = new Date()) {
  const chronological = [...attempts].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const endDate = new Date(Math.max(now.getTime(), ...chronological.map((attempt) => new Date(attempt.createdAt).getTime())))

  const daily: DailyStats[] = Array.from({ length: 14 }, (_, offset) => {
    const date = new Date(endDate)
    date.setUTCDate(endDate.getUTCDate() - (13 - offset))
    const key = utcDay(date)
    return { date: key, ...summarize(chronological.filter((attempt) => utcDay(attempt.createdAt) === key)) }
  })

  const byDomain = Object.fromEntries(DOMAIN_IDS.map((domain) => [
    domain,
    summarize(chronological.filter((attempt) => attempt.domain === domain)),
  ])) as Record<DomainId, AggregateStats>

  const byDifficulty = Object.fromEntries(([1, 2, 3, 4, 5] as Difficulty[]).map((difficulty) => [
    difficulty,
    summarize(chronological.filter((attempt) => attempt.difficulty === difficulty)),
  ])) as Record<Difficulty, AggregateStats>

  const bySkill: SkillStats[] = [...new Set(chronological.map((attempt) => attempt.skillId))]
    .map((skillId) => ({ skillId, ...summarize(chronological.filter((attempt) => attempt.skillId === skillId)) }))
    .sort((a, b) => b.total - a.total || a.accuracy - b.accuracy || a.skillId.localeCompare(b.skillId))

  return {
    overall: summarize(chronological),
    totalMinutes: Math.round(chronological.reduce((sum, attempt) => sum + attempt.elapsedMs, 0) / 60_000),
    activeDays: new Set(chronological.map((attempt) => utcDay(attempt.createdAt))).size,
    completedSessions: sessions.filter((session) => session.completedAt).length,
    daily,
    byDomain,
    byDifficulty,
    bySkill,
    pace: readingPace(chronological),
  }
}
