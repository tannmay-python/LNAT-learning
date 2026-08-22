import { describe, expect, it } from 'vitest'
import { canonicalizeAttempts, rebuildSkillStates } from './store.mjs'

const attempt = (overrides = {}) => ({
  id: overrides.id ?? crypto.randomUUID(),
  sessionId: 'session-1',
  questionId: overrides.questionId ?? 'q-1',
  section: 'section-a',
  skillId: 'inference',
  difficulty: 3,
  correct: true,
  confidence: undefined,
  usedHint: false,
  elapsedMs: 40_000,
  createdAt: '2026-08-22T10:00:00.000Z',
  ...overrides,
})

describe('attempt canonicalization', () => {
  it('keeps one event per sitting-question pair even when retry ids differ', () => {
    const attempts = [
      attempt({ id: 'old', correct: false, createdAt: '2026-08-22T09:59:00.000Z' }),
      attempt({ id: 'new', correct: true }),
    ]
    const canonical = canonicalizeAttempts(attempts)
    expect(canonical).toHaveLength(1)
    expect(canonical[0].correct).toBe(true)
  })

  it('rebuilds skill evidence deterministically from canonical events', () => {
    const states = rebuildSkillStates([
      attempt({ correct: false }),
      attempt({ questionId: 'q-2', correct: true }),
      attempt({ id: 'duplicate-id-different-answer', questionId: 'q-2', correct: false, createdAt: '2026-08-22T09:00:00.000Z' }),
    ])
    expect(states).toHaveLength(1)
    expect(states[0].attempts).toBe(2)
    expect(states[0].correct).toBe(1)
  })
})
