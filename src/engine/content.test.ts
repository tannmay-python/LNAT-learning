import { describe, expect, it } from 'vitest'
import { curriculum, domains, sectionASkillIds, skillById } from '../data/curriculum'
import { passages, passageParagraphs } from '../data/passages'
import { questionBank } from '../data/questionBank'
import { expansionPassages, expansionQuestions } from '../data/bankExpansion'
import { essayPrompts } from '../data/essayPrompts'
import { CHOICE_IDS, questionFault } from './questions'
import { LNAT_SPEC } from './mock'

describe('the authored bank can supply a complete Section A form', () => {
  it('retains the original full-form bank', () => {
    expect(questionBank).toHaveLength(LNAT_SPEC.sectionA.questions)
  })

  it('expands the practice pool without breaking passage-led structure', () => {
    const allPassages = [...passages, ...expansionPassages]
    const allQuestions = [...questionBank, ...expansionQuestions]
    expect(allQuestions.length).toBeGreaterThanOrEqual(62)
    expect(new Set(allQuestions.map((question) => question.id)).size).toBe(allQuestions.length)
    expect(new Set(allPassages.map((passage) => passage.id)).size).toBe(allPassages.length)
  })

  it('has at least twelve passages', () => {
    expect(passages.length).toBeGreaterThanOrEqual(LNAT_SPEC.sectionA.passages)
  })

  it('has exactly forty-two questions', () => {
    expect(questionBank).toHaveLength(LNAT_SPEC.sectionA.questions)
  })

  it('gives every passage three or four questions, as the real form does', () => {
    const byPassage = new Map<string, number>()
    for (const question of [...questionBank, ...expansionQuestions]) {
      byPassage.set(question.passageId, (byPassage.get(question.passageId) ?? 0) + 1)
    }
    for (const passage of [...passages, ...expansionPassages]) {
      const count = byPassage.get(passage.id) ?? 0
      expect(count, `${passage.id} has ${count} questions`).toBeGreaterThanOrEqual(3)
      expect(count, `${passage.id} has ${count} questions`).toBeLessThanOrEqual(4)
    }
  })

  it('offers at least three essay prompts', () => {
    expect(essayPrompts.length).toBeGreaterThanOrEqual(LNAT_SPEC.sectionB.prompts)
  })
})

describe('every passage is readable and self-contained', () => {
  it('sits in a plausible LNAT length band', () => {
    for (const passage of [...passages, ...expansionPassages]) {
      expect(passage.wordCount, `${passage.id} is ${passage.wordCount} words`).toBeGreaterThanOrEqual(280)
      expect(passage.wordCount, `${passage.id} is ${passage.wordCount} words`).toBeLessThanOrEqual(700)
    }
  })

  it('has multiple paragraphs and a reading budget', () => {
    for (const passage of passages) {
      expect(passageParagraphs(passage).length, passage.id).toBeGreaterThanOrEqual(3)
      expect(passage.readingSeconds).toBeGreaterThan(0)
    }
  })

  it('attributes every extract on a multi-extract passage', () => {
    for (const passage of [...passages, ...expansionPassages].filter((item) => item.register === 'multi-extract')) {
      expect(passage.extracts?.length, passage.id).toBeGreaterThanOrEqual(2)
      for (const extract of passage.extracts ?? []) {
        expect(extract.attribution.trim().length).toBeGreaterThan(0)
        expect(extract.label.trim().length).toBeGreaterThan(0)
      }
    }
  })

it('uses unique identifiers', () => {
    expect(new Set([...passages, ...expansionPassages].map((passage) => passage.id)).size).toBe(passages.length + expansionPassages.length)
  })
})

describe('every question is structurally sound', () => {
  it('passes structural validation', () => {
    for (const question of [...questionBank, ...expansionQuestions]) {
      expect(questionFault(question), question.id).toBeNull()
    }
  })

  it('uses lowercase (a) to (e) labels, as the LNAT does', () => {
    for (const question of [...questionBank, ...expansionQuestions]) {
      expect(question.choices.map((choice) => choice.id), question.id).toEqual(CHOICE_IDS)
    }
  })

  it('attaches to a passage that exists', () => {
    const ids = new Set([...passages, ...expansionPassages].map((passage) => passage.id))
    for (const question of [...questionBank, ...expansionQuestions]) {
      expect(ids.has(question.passageId), `${question.id} -> ${question.passageId}`).toBe(true)
    }
  })

  it('names a skill that exists in the curriculum, and never an essay skill', () => {
    for (const question of [...questionBank, ...expansionQuestions]) {
      const skill = skillById.get(question.skillId)
      expect(skill, question.id).toBeDefined()
      expect(skill?.section, question.id).toBe('section-a')
      expect(skill?.domain, question.id).toBe(question.domain)
    }
  })

  it('diagnoses every wrong option and never the right one', () => {
    for (const question of [...questionBank, ...expansionQuestions]) {
      const wrong = CHOICE_IDS.filter((id) => id !== question.answer)
      for (const id of wrong) {
        expect(question.whyWrong?.[id], `${question.id} option (${id})`).toBeTruthy()
      }
      expect(question.whyWrong?.[question.answer], `${question.id} keys its own answer`).toBeUndefined()
    }
  })

  it('teaches a transferable concept alongside the explanation', () => {
    for (const question of [...questionBank, ...expansionQuestions]) {
      expect(question.concept.trim().split(/\s+/).length, question.id).toBeGreaterThanOrEqual(8)
      expect(question.explanation.trim().split(/\s+/).length, question.id).toBeGreaterThanOrEqual(15)
    }
  })

  it('uses unique identifiers', () => {
    const allQuestions = [...questionBank, ...expansionQuestions]
    expect(new Set(allQuestions.map((question) => question.id)).size).toBe(allQuestions.length)
  })
})

describe('the bank exercises the whole Section A skill map', () => {
  it('covers every Section A skill at least once', () => {
    const used = new Set([...questionBank, ...expansionQuestions].map((question) => question.skillId))
    for (const skillId of sectionASkillIds) {
      expect(used.has(skillId), `${skillId} is never tested`).toBe(true)
    }
  })

  it('spreads difficulty rather than clustering on one level', () => {
    const levels = new Set(questionBank.map((question) => question.difficulty))
    expect(levels.size).toBeGreaterThanOrEqual(3)
  })

  it('does not let one skill dominate the form', () => {
    const counts = new Map<string, number>()
    for (const question of [...questionBank, ...expansionQuestions]) counts.set(question.skillId, (counts.get(question.skillId) ?? 0) + 1)
    for (const [skillId, count] of counts) {
      expect(count, `${skillId} appears ${count} times`).toBeLessThanOrEqual(6)
    }
  })
})

describe('the lesson library is complete', () => {
  it('gives every skill a domain that exists', () => {
    const ids = new Set(domains.map((domain) => domain.id))
    for (const topic of curriculum) expect(ids.has(topic.domain), topic.id).toBe(true)
  })

  it('gives every lesson an easier and a harder worked example', () => {
    for (const topic of curriculum) {
      expect(topic.examples.map((example) => example.level).sort(), topic.id).toEqual(['Easier', 'Harder'])
      for (const example of topic.examples) {
        expect(example.walkthrough.trim().split(/\s+/).length, `${topic.id} ${example.level}`).toBeGreaterThanOrEqual(25)
        expect(example.extract.trim().length, `${topic.id} ${example.level}`).toBeGreaterThan(0)
      }
    }
  })

  it('gives every lesson method steps, tells, and traps', () => {
    for (const topic of curriculum) {
      expect(topic.method.length, topic.id).toBeGreaterThanOrEqual(3)
      expect(topic.tells.length, topic.id).toBeGreaterThanOrEqual(2)
      expect(topic.traps.length, topic.id).toBeGreaterThanOrEqual(2)
      expect(topic.coreIdeas.length, topic.id).toBeGreaterThanOrEqual(3)
    }
  })

  it('only cross-references skills that exist', () => {
    for (const topic of curriculum) {
      for (const confusion of topic.confusedWith ?? []) {
        expect(skillById.has(confusion.skillId), `${topic.id} -> ${confusion.skillId}`).toBe(true)
        expect(confusion.skillId).not.toBe(topic.id)
      }
    }
  })

  it('covers Section B craft as well as Section A reading', () => {
    expect(curriculum.some((topic) => topic.section === 'section-b')).toBe(true)
    expect(curriculum.filter((topic) => topic.section === 'section-b').length).toBeGreaterThanOrEqual(5)
  })
})

describe('essay prompts are usable', () => {
  it('phrases each as a question or an invitation to respond', () => {
    for (const prompt of essayPrompts) {
      expect(/[?.]$/.test(prompt.text.trim()), prompt.id).toBe(true)
      expect(prompt.pressurePoint.trim().split(/\s+/).length, prompt.id).toBeGreaterThanOrEqual(12)
    }
  })

  it('draws on more than one subject area', () => {
    expect(new Set(essayPrompts.map((prompt) => prompt.theme)).size).toBeGreaterThanOrEqual(5)
  })
})
