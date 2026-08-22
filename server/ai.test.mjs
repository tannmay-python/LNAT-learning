import { describe, expect, it } from 'vitest'
import { getAiStatus, normalizeDirectivePriority, renderReportMarkdown } from './ai.mjs'

describe('AI boundary', () => {
  it('is offline unless a provider is explicitly configured', () => {
    const previous = process.env.AI_PROVIDER
    delete process.env.AI_PROVIDER
    try {
      expect(getAiStatus().available).toBe(false)
      expect(getAiStatus().provider).toBe('none')
    } finally {
      if (previous === undefined) delete process.env.AI_PROVIDER
      else process.env.AI_PROVIDER = previous
    }
  })

  it('normalizes ranking-style directives without letting them exceed the deterministic range', () => {
    expect(normalizeDirectivePriority(0)).toBe(0)
    expect(normalizeDirectivePriority(0.7)).toBe(0.7)
    expect(normalizeDirectivePriority(1)).toBe(1)
    expect(normalizeDirectivePriority(3)).toBe(0.8)
    expect(normalizeDirectivePriority('nonsense')).toBe(0)
  })

  it('renders a readable report rather than raw JSON', () => {
    const markdown = renderReportMarkdown({
      title: 'Set review',
      period: 'August 2026',
      answerCount: 4,
      model: 'test',
      executiveSummary: 'Two reading moves need repair.',
      skillBreakdown: [{ skillId: 'inference', correct: 1, total: 2, averageSeconds: 60, diagnosis: 'Scope drift.', action: 'Drill inference.' }],
      errorTaxonomy: [{ label: 'Outside knowledge', count: 2, mechanism: 'World knowledge replaced passage evidence.' }],
      studyPriorities: [],
      sevenDayPlan: [],
      limitations: ['One set cannot establish a trend.'],
    })
    expect(markdown).toContain('# Set review')
    expect(markdown).toContain('| Skill | Correct | Average | Diagnosis | Next |')
    expect(markdown).toContain('Outside knowledge')
  })
})
