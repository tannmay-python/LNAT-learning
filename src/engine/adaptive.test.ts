import { describe, expect, it } from 'vitest'
import {
  bandForScore,
  defaultSkillState,
  expectedSuccess,
  isDue,
  masteryPercent,
  paperTargetDifficulty,
  planQuestionBlueprint,
  rankPassages,
  recommendedDifficulty,
  sectionAScoreEstimate,
  selectNextQuestion,
  targetDifficulty,
  updateSkillState,
} from './adaptive'
import { passages } from '../data/passages'
import { questionBank } from '../data/questionBank'
import type { Attempt, Difficulty, SkillState } from '../types'

const attempt = (over: Partial<Attempt> = {}): Attempt => ({
  id: crypto.randomUUID(),
  sessionId: 'session',
  questionId: 'q',
  passageId: 'p-jury',
  section: 'section-a',
  domain: 'argument',
  skillId: 'main-conclusion',
  difficulty: 3,
  response: 'a',
  correct: true,
  elapsedMs: 60_000,
  usedHint: false,
  createdAt: new Date().toISOString(),
  ...over,
})

describe('skill state', () => {
  it('raises ability after a correct answer and lowers it after a miss', () => {
    const base = defaultSkillState('main-conclusion')
    expect(updateSkillState(base, attempt({ correct: true })).theta).toBeGreaterThan(base.theta)
    expect(updateSkillState(base, attempt({ correct: false })).theta).toBeLessThan(base.theta)
  })

  it('weights a confident miss more heavily than a guessed one', () => {
    const base = defaultSkillState('inference')
    const confident = updateSkillState(base, attempt({ correct: false, confidence: 'certain' }))
    const guessed = updateSkillState(base, attempt({ correct: false, confidence: 'guess' }))
    expect(confident.theta).toBeLessThan(guessed.theta)
    expect(confident.ease).toBeLessThan(guessed.ease)
  })

  it('schedules an immediate review after a miss and a longer one after a run', () => {
    const missed = updateSkillState(defaultSkillState('assumption'), attempt({ correct: false }))
    expect(missed.intervalDays).toBeLessThan(1)
    let state = defaultSkillState('assumption')
    for (let index = 0; index < 4; index += 1) state = updateSkillState(state, attempt({ skillId: 'assumption' }))
    expect(state.intervalDays).toBeGreaterThanOrEqual(1)
    expect(state.streak).toBe(4)
  })

  it('survives corrupt stored values without producing NaN', () => {
    const corrupt = { ...defaultSkillState('inference'), theta: Number.NaN, alpha: -3, attempts: Number.POSITIVE_INFINITY } as SkillState
    const next = updateSkillState(corrupt, attempt({ skillId: 'inference' }))
    expect(Number.isFinite(next.theta)).toBe(true)
    expect(Number.isFinite(next.alpha)).toBe(true)
    expect(Number.isFinite(next.attempts)).toBe(true)
  })

  it('reports no mastery before any evidence exists', () => {
    expect(masteryPercent(undefined)).toBe(0)
    expect(masteryPercent(defaultSkillState('inference'))).toBe(0)
  })

  it('treats a never-seen skill as due', () => {
    expect(isDue(undefined)).toBe(true)
  })
})

describe('difficulty calibration', () => {
  it('starts a new candidate below test level', () => {
    expect(targetDifficulty(undefined)).toBe(2)
    expect(paperTargetDifficulty([])).toBe(2)
  })

  it('raises the paper target after a strong run', () => {
    const strong = Array.from({ length: 12 }, () => attempt({ difficulty: 3, correct: true }))
    expect(paperTargetDifficulty(strong)).toBeGreaterThan(3)
  })

  it('lowers the paper target after a poor run', () => {
    const weak = Array.from({ length: 10 }, () => attempt({ difficulty: 3, correct: false }))
    expect(paperTargetDifficulty(weak)).toBeLessThan(3)
  })

  it('never leaves the one-to-five band', () => {
    const extreme = Array.from({ length: 30 }, () => attempt({ difficulty: 5, correct: true }))
    const target = paperTargetDifficulty(extreme)
    expect(target).toBeGreaterThanOrEqual(1)
    expect(target).toBeLessThanOrEqual(5)
  })

  it('lets an analyst directive pull the level towards its own target', () => {
    const state = defaultSkillState('inference')
    const plain = recommendedDifficulty(state, undefined, 2)
    const directed = recommendedDifficulty(state, {
      skillId: 'inference', priority: 1, targetDifficulty: 5, reason: '', evidenceIds: [],
    }, 2)
    expect(directed).toBeGreaterThan(plain)
  })

  it('models success as rising with ability and falling with difficulty', () => {
    expect(expectedSuccess(1, 2)).toBeGreaterThan(expectedSuccess(0, 2))
    expect(expectedSuccess(0, 5)).toBeLessThan(expectedSuccess(0, 1))
  })
})

describe('selection', () => {
  it('respects a forced skill when one is available', () => {
    const chosen = selectNextQuestion(questionBank, new Map(), new Set(), 'attribution')
    expect(chosen?.skillId).toBe('attribution')
  })

  it('prefers an unseen question to one already answered', () => {
    const pool = questionBank.filter((question) => question.skillId === 'inference')
    const seen = new Set(pool.slice(1).map((question) => question.id))
    const chosen = selectNextQuestion(pool, new Map(), seen, 'inference')
    expect(chosen?.id).toBe(pool[0].id)
  })

  it('always returns something when the pool is non-empty', () => {
    expect(selectNextQuestion(questionBank, new Map(), new Set(), 'no-such-skill')).toBeDefined()
  })

  it('ranks an unread passage above one already read this session', () => {
    const byPassage = new Map<string, typeof questionBank>()
    for (const question of questionBank) {
      if (!byPassage.has(question.passageId)) byPassage.set(question.passageId, [])
      byPassage.get(question.passageId)!.push(question)
    }
    const first = passages[0]
    const ranked = rankPassages(passages, byPassage, new Map(), new Set(), new Set([first.id]))
    expect(ranked[ranked.length - 1].id).toBe(first.id)
  })
})

describe('blueprint planning', () => {
  it('produces the requested number of slots', () => {
    const plan = planQuestionBlueprint(questionBank, 4, new Map(), new Set(), [], 3)
    expect(plan).toHaveLength(4)
  })

  it('varies the skills within one passage rather than repeating a template', () => {
    const plan = planQuestionBlueprint(questionBank, 4, new Map(), new Set(), [], 3)
    expect(new Set(plan.map((slot) => slot.skillId)).size).toBeGreaterThanOrEqual(3)
  })

  it('keeps every slot inside the one-to-five band', () => {
    for (const slot of planQuestionBlueprint(questionBank, 8, new Map(), new Set(), [], 5)) {
      expect(slot.difficulty).toBeGreaterThanOrEqual(1)
      expect(slot.difficulty).toBeLessThanOrEqual(5)
    }
  })
})

describe('the Section A score estimate', () => {
  it('stays inside the forty-two mark scale', () => {
    for (const theta of [-3, -1, 0, 1, 3]) {
      const { score } = sectionAScoreEstimate(theta)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(42)
    }
  })

  it('never falls below what guessing five options would return', () => {
    // Forty-two questions, one option in five: about eight or nine marks.
    expect(sectionAScoreEstimate(-3).score).toBeGreaterThanOrEqual(8)
  })

  it('rises with ability', () => {
    expect(sectionAScoreEstimate(1.5).score).toBeGreaterThan(sectionAScoreEstimate(-1.5).score)
  })

  it('narrows its uncertainty as ability moves away from the middle', () => {
    expect(sectionAScoreEstimate(3).confidenceRadius).toBeLessThan(sectionAScoreEstimate(0).confidenceRadius)
  })

  it('describes a raw mark with an honest band rather than an official score', () => {
    expect(bandForScore(21).label).toMatch(/mean/i)
    expect(bandForScore(30).label).toBe('Strong')
    expect(bandForScore(40).label).toBe('Exceptional')
  })

  it('gives every possible mark a band', () => {
    for (let score = 0; score <= 42; score += 1) {
      expect(bandForScore(score), `no band for ${score}`).toBeDefined()
    }
  })
})

describe('difficulty typing', () => {
  it('returns a value the Difficulty type accepts', () => {
    const value: Difficulty = paperTargetDifficulty([attempt({ difficulty: 4 })])
    expect([1, 2, 3, 4, 5]).toContain(value)
  })
})
