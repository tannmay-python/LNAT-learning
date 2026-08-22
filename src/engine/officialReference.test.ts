import { describe, expect, it } from 'vitest'
import { bandForScore, buildMockScoreReport, officialReference, scoreBands } from './officialReference'
import type { Question } from '../types'

const question = (id: string, answer: string, estimatedSeconds = 80): Question => ({
  id,
  passageId: `p-${id}`,
  section: 'section-a',
  domain: 'argument',
  skillId: 'inference',
  difficulty: 3,
  prompt: 'Which statement follows from the passage?',
  choices: [
    { id: 'a', text: 'first option' },
    { id: 'b', text: 'second option' },
    { id: 'c', text: 'third option' },
    { id: 'd', text: 'fourth option' },
    { id: 'e', text: 'fifth option' },
  ],
  answer: answer as 'a',
  explanation: 'The passage states the claim directly in its final paragraph.',
  concept: 'Only an entailed claim survives a close reading of the passage.',
  whyWrong: { a: 'Too broad.', b: 'Wrong voice.', c: 'Not stated.', d: 'Opposes the passage.' },
  estimatedSeconds,
  source: 'local-original',
})

describe('official LNAT reference', () => {
  it('keeps the published blueprint without inventing a scaled score', () => {
    expect(officialReference.sectionA).toMatchObject({ passages: 12, questions: 42, seconds: 95 * 60 })
    expect(officialReference.sectionA.choicesPerQuestion).toBe(5)
    expect(officialReference.sectionA.negativeMarking).toBe(false)
    expect(officialReference.scoreScale.maximum).toBe(42)
    expect(officialReference.scoreScale.publishedConversion).toBe(false)
  })

  it('covers every raw mark exactly once with practice bands', () => {
    const covered = scoreBands.flatMap((band) => Array.from({ length: band.to - band.from + 1 }, (_, index) => band.from + index))
    expect(covered).toEqual(Array.from({ length: 43 }, (_, index) => index))
    expect(bandForScore(42).label).toBe('Exceptional')
  })
})

describe('post-mock training report', () => {
  it('scores answers, diagnoses blanks and timing, and prescribes the next work', () => {
    const questions = [
      question('q-1', 'a'),
      question('q-2', 'b'),
      question('q-3', 'c'),
      question('q-4', 'd'),
    ]
    const report = buildMockScoreReport({
      questions,
      answers: { 'q-1': 'a', 'q-2': 'b' },
      flags: ['q-4'],
      eliminated: { 'q-1': ['e'] },
      elapsedByQuestion: {
        'q-1': 60_000,
        'q-2': 140_000,
      },
    })

    expect(report.correct).toBe(2)
    expect(report.total).toBe(4)
    expect(report.unanswered).toBe(2)
    expect(report.flaggedUnanswered).toBe(1)
    expect(report.poeUsedQuestions).toBe(1)
    expect(report.poeAccurateRate).toBe(1)
    expect(report.overTimeQuestions).toBe(1)
    expect(report.trainingPlan.some((action) => action.title === 'Finish the paper')).toBe(true)
    expect(report.trainingPlan.some((action) => action.title === 'Repair pacing')).toBe(true)
    expect(report.boundary).toContain('0-42')
  })

  it('recommends more elimination when a candidate uses it rarely', () => {
    const questions = Array.from({ length: 10 }, (_, index) => question(`q-${index}`, 'a'))
    const answers = Object.fromEntries(questions.map((item) => [item.id, item.answer]))
    const report = buildMockScoreReport({
      questions,
      answers,
      eliminated: Object.fromEntries(questions.slice(0, 2).map((item) => [item.id, ['e']])),
      elapsedByQuestion: Object.fromEntries(questions.map((item) => [item.id, 60_000])),
    })
    expect(report.trainingPlan.some((action) => action.title === 'Use elimination more often')).toBe(true)
  })
})
