import { describe, expect, it } from 'vitest'
import { buildForm, createCheckpoint, createMock, LNAT_SPEC, passageGroups, questionLocation } from './mock'
import { passages } from '../data/passages'
import { questionBank } from '../data/questionBank'
import { rawScore } from './questions'

describe('the mock reproduces the published LNAT blueprint', () => {
  it('times Section A at ninety-five minutes and Section B at forty', () => {
    expect(LNAT_SPEC.sectionA.seconds).toBe(95 * 60)
    expect(LNAT_SPEC.sectionB.seconds).toBe(40 * 60)
  })

  it('builds twelve passages and forty-two questions', () => {
    const mock = createMock(7)
    expect(mock.passages).toHaveLength(LNAT_SPEC.sectionA.passages)
    expect(mock.questions).toHaveLength(LNAT_SPEC.sectionA.questions)
  })

  it('offers exactly three essay prompts', () => {
    expect(createMock(7).prompts).toHaveLength(LNAT_SPEC.sectionB.prompts)
  })

  it('keeps a passage worth 750 words as the essay ceiling and 500-600 as the guidance', () => {
    expect(LNAT_SPEC.sectionB.wordLimit).toBe(750)
    expect(LNAT_SPEC.sectionB.recommendedWords).toEqual([500, 600])
  })
})

describe('form assembly', () => {
  it('groups a passage\'s questions together and in order', () => {
    const mock = createMock(11)
    const order = mock.questions.map((question) => question.passageId)
    const firstIndex = new Map<string, number>()
    order.forEach((id, index) => { if (!firstIndex.has(id)) firstIndex.set(id, index) })
    for (const [id, start] of firstIndex) {
      const indices = order.reduce<number[]>((result, value, index) => (value === id ? [...result, index] : result), [])
      expect(indices, `${id} is not contiguous`).toEqual(indices.map((_, offset) => start + offset))
    }
  })

  it('only uses passages that have a full question set', () => {
    const { passages: chosen, questions } = buildForm(passages, questionBank, 3)
    for (const passage of chosen) {
      const count = questions.filter((question) => question.passageId === passage.id).length
      expect(count, passage.id).toBeGreaterThanOrEqual(3)
    }
  })

  it('never repeats a question inside one form', () => {
    const mock = createMock(23)
    expect(new Set(mock.questions.map((question) => question.id)).size).toBe(mock.questions.length)
  })

  it('is reproducible for a given seed', () => {
    expect(createMock(5).questions.map((question) => question.id))
      .toEqual(createMock(5).questions.map((question) => question.id))
  })

  it('varies between seeds', () => {
    const a = createMock(1).passages.map((passage) => passage.id).join()
    const b = createMock(999).passages.map((passage) => passage.id).join()
    expect(a).not.toBe(b)
  })
})

describe('the checkpoint a paused sitting is restored from', () => {
  it('starts on the intro stage with the full Section A clock', () => {
    const checkpoint = createCheckpoint(createMock(13))
    expect(checkpoint.stage).toBe('intro')
    expect(checkpoint.remaining).toBe(LNAT_SPEC.sectionA.seconds)
    expect(checkpoint.questionIndex).toBe(0)
    expect(checkpoint.answers).toEqual({})
    expect(checkpoint.flags).toEqual([])
    expect(checkpoint.essayPromptId).toBeNull()
  })

  it('refuses a form of the wrong size', () => {
    const mock = createMock(13)
    expect(() => createCheckpoint({ ...mock, questions: mock.questions.slice(0, 40) })).toThrow(/42 questions/)
    expect(() => createCheckpoint({ ...mock, passages: mock.passages.slice(0, 10) })).toThrow(/12 passages/)
  })
})

describe('navigation helpers', () => {
  it('reports where a question sits within its passage set', () => {
    const mock = createMock(17)
    const location = questionLocation(mock, 0)
    expect(location?.passageNumber).toBe(1)
    expect(location?.positionInSet).toBe(1)
    expect(location?.setSize).toBeGreaterThanOrEqual(3)
    expect(location?.passage?.id).toBe(mock.questions[0].passageId)
  })

  it('produces one navigator group per passage, covering every question exactly once', () => {
    const mock = createMock(17)
    const groups = passageGroups(mock)
    expect(groups).toHaveLength(LNAT_SPEC.sectionA.passages)
    const covered = groups.flatMap((group) => group.indices).sort((a, b) => a - b)
    expect(covered).toEqual(mock.questions.map((_, index) => index))
  })
})

describe('scoring', () => {
  it('awards one mark per correct answer and deducts nothing for a wrong one', () => {
    const mock = createMock(29)
    const answers: Record<string, string> = {}
    mock.questions.forEach((question, index) => {
      answers[question.id] = index % 2 === 0 ? question.answer : (question.answer === 'a' ? 'b' : 'a')
    })
    const result = rawScore(mock.questions, answers)
    expect(result.total).toBe(42)
    expect(result.correct).toBe(21)
  })

  it('treats an unanswered question as wrong rather than as a penalty', () => {
    const mock = createMock(31)
    expect(rawScore(mock.questions, {})).toEqual({ correct: 0, total: 42 })
  })

  it('reaches full marks on a perfect paper', () => {
    const mock = createMock(31)
    const answers = Object.fromEntries(mock.questions.map((question) => [question.id, question.answer]))
    expect(rawScore(mock.questions, answers).correct).toBe(42)
  })
})
