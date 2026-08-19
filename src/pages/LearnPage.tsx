import { useMemo, useState } from 'react'
import { Link } from 'wouter'
import { ArrowRight, CaretDown, Compass, MagnifyingGlass } from '@phosphor-icons/react'
import { curriculum, domains, skillById } from '../data/curriculum'
import { masteryPercent } from '../engine/adaptive'
import { useAppState } from '../state/AppState'
import type { SectionId } from '../types'

export function LearnPage() {
  const { stateMap } = useAppState()
  const params = new URLSearchParams(window.location.search)
  const [section, setSection] = useState<'all' | SectionId>('all')
  const [query, setQuery] = useState('')
  const selectedDomain = params.get('domain')
  const selectedSkill = params.get('skill')

  const filtered = useMemo(() => curriculum.filter((topic) => {
    if (section !== 'all' && topic.section !== section) return false
    if (selectedDomain && topic.domain !== selectedDomain) return false
    const haystack = `${topic.title} ${topic.description} ${topic.coreIdeas.join(' ')} ${topic.tells.join(' ')} ${topic.traps.join(' ')}`.toLowerCase()
    return haystack.includes(query.toLowerCase())
  }), [section, selectedDomain, query])

  return (
    <div className="learn-layout">
      <section className="library-intro">
        <div>
          <p className="eyebrow">Complete method map</p>
          <h2>Know the move, then drill it.</h2>
          <p>
            {curriculum.length} lessons across the four families of Section A question and the craft of Section B, with
            the tells and the traps surfaced before the theory.
          </p>
        </div>
        <div className="library-stats"><strong>{curriculum.length}</strong><span>lessons · {domains.length} domains</span></div>
      </section>

      <div className="library-toolbar">
        <div className="segmented" role="group" aria-label="Filter by section">
          {([['all', 'All'], ['section-a', 'Section A · reading'], ['section-b', 'Section B · essay']] as const).map(([value, label]) => (
            <button key={value} className={section === value ? 'active' : ''} onClick={() => setSection(value)}>{label}</button>
          ))}
        </div>
        <label className="search-field">
          <MagnifyingGlass size={16} />
          <span className="sr-only">Search the lessons</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a skill, tell, or trap" />
        </label>
      </div>

      <div className="lesson-groups">
        {domains
          .filter((domain) => (section === 'all' || domain.section === section) && (!selectedDomain || domain.id === selectedDomain))
          .map((domain) => {
            const topics = filtered.filter((topic) => topic.domain === domain.id)
            if (!topics.length) return null
            return (
              <section key={domain.id} className="lesson-domain">
                <header>
                  <div><h3>{domain.title}</h3><p>{domain.description}</p></div>
                  <span>
                    {domain.weight ? `${domain.weight}%` : 'Section B'}
                    <small>{domain.questionRange} questions</small>
                  </span>
                </header>
                <div className="lesson-list">
                  {topics.map((topic) => {
                    const state = stateMap.get(topic.id)
                    return (
                      <details key={topic.id} className="lesson" open={selectedSkill === topic.id}>
                        <summary>
                          <span className="lesson-index" aria-hidden="true">{topic.shortTitle.slice(0, 2)}</span>
                          <span><strong>{topic.title}</strong><small>{topic.description}</small></span>
                          <span className="lesson-score">{state ? `${masteryPercent(state)}% mastery` : topic.section === 'section-b' ? 'Essay craft' : 'Not tested'}</span>
                          <CaretDown size={14} weight="light" className="summary-caret" />
                        </summary>
                        <div className="lesson-body">
                          <p className="lesson-why">{topic.whyItMatters}</p>
                          <p className="lesson-frequency">{topic.frequency}</p>
                          <div className="lesson-column"><h4>The core idea</h4>{topic.coreIdeas.map((item) => <p key={item}>{item}</p>)}</div>
                          <div className="lesson-column"><h4>Method</h4><ol>{topic.method.map((item) => <li key={item}>{item}</li>)}</ol></div>
                          <div className="lesson-column accent"><h4>Tells</h4>{topic.tells.map((item) => <p key={item}>{item}</p>)}</div>
                          <div className="lesson-column warning"><h4>Traps</h4>{topic.traps.map((item) => <p key={item}>{item}</p>)}</div>
                          <div className="worked-example-grid">
                            {topic.examples.map((example) => (
                              <div className="worked-example" key={example.level}>
                                <span>{example.level} worked example</span>
                                <blockquote>{example.extract}</blockquote>
                                <strong>{example.prompt}</strong>
                                <p><b>{example.answer}</b> — {example.walkthrough}</p>
                              </div>
                            ))}
                          </div>
                          {topic.confusedWith && topic.confusedWith.length > 0 && (
                            <div className="confusion-note">
                              {topic.confusedWith.map((item) => {
                                const other = skillById.get(item.skillId)
                                return (
                                  <div key={item.skillId}>
                                    <Compass size={14} />
                                    <p>
                                      <strong>Often confused with {other?.title ?? item.skillId}.</strong> {item.distinction}{' '}
                                      <Link href={`/learn?skill=${item.skillId}`}>Open that lesson <ArrowRight size={11} /></Link>
                                    </p>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                          {topic.section === 'section-a' && (
                            <div className="lesson-actions">
                              <Link className="secondary-button" href={`/practice?skill=${topic.id}`}>Drill this skill <ArrowRight size={14} /></Link>
                            </div>
                          )}
                        </div>
                      </details>
                    )
                  })}
                </div>
              </section>
            )
          })}
        {!filtered.length && (
          <div className="empty-state">
            <MagnifyingGlass size={26} />
            <h3>No lesson matches that search.</h3>
            <p>Try a broader term such as conclusion, tone, assumption, or economy.</p>
          </div>
        )}
      </div>
    </div>
  )
}
