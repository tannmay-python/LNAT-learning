import { useMemo, useState } from 'react'
import { Link } from 'wouter'
import { ArrowRight, Brain, CheckCircle, Funnel, WarningCircle } from '@phosphor-icons/react'
import { domainById, skillById } from '../data/curriculum'
import { QuestionCard } from '../components/QuestionCard'
import { PassagePane } from '../components/PassagePane'
import { useAppState } from '../state/AppState'
import type { DomainId } from '../types'

const FILTERS: Array<['all' | DomainId, string]> = [
  ['all', 'All'],
  ['comprehension', 'Comprehension'],
  ['interpretation', 'Inference'],
  ['argument', 'Argument'],
  ['rhetoric', 'Rhetoric'],
]

export function MistakesPage() {
  const { attempts } = useAppState()
  const [domain, setDomain] = useState<'all' | DomainId>('all')

  const mistakes = useMemo(
    () => attempts.filter((attempt) => !attempt.correct && (domain === 'all' || attempt.domain === domain)),
    [attempts, domain],
  )

  /**
   * The interesting pattern on the LNAT is which *wrong option* keeps attracting
   * you, so the tally is over the recorded diagnosis rather than over the skill.
   */
  const patterns = useMemo(() => Object.entries(
    mistakes.reduce<Record<string, number>>((result, attempt) => {
      const key = attempt.mistakeType ?? 'Reading or reasoning error'
      result[key] = (result[key] ?? 0) + 1
      return result
    }, {}),
  ).sort((a, b) => b[1] - a[1]), [mistakes])

  return (
    <div className="mistakes-page">
      <section className="mistake-hero">
        <div>
          <p className="eyebrow">Turn every miss into a rule</p>
          <h2>Your mistakes are the curriculum.</h2>
          <p>
            LNATLAS keeps the passage, the question, the option you chose, the time you took, and the diagnosis for the
            option that tempted you. Nothing is deleted, because a miss you cannot revisit teaches nothing.
          </p>
        </div>
        <div className="mistake-count"><strong>{mistakes.length}</strong><span>miss{mistakes.length === 1 ? '' : 'es'} logged</span></div>
      </section>

      <div className="library-toolbar">
        <div className="segmented">
          {FILTERS.map(([value, label]) => (
            <button key={value} className={domain === value ? 'active' : ''} onClick={() => setDomain(value)}>{label}</button>
          ))}
        </div>
        <span className="filter-label"><Funnel size={15} />Newest first</span>
      </div>

      {mistakes.length ? (
        <div className="mistake-layout">
          <section className="panel mistake-list">
            <div className="section-heading"><div><h3>Item log</h3><p>Open one to see the passage and the question exactly as you met them.</p></div></div>
            {mistakes.map((attempt) => (
              <article className="mistake-row" key={attempt.id}>
                <span className="mistake-icon"><WarningCircle size={17} weight="light" /></span>
                <div>
                  <span className="meta-line">
                    {domainById.get(attempt.domain)?.shortTitle} · Level {attempt.difficulty}
                    {attempt.passageSnapshot ? ` · ${attempt.passageSnapshot.title}` : ''}
                  </span>
                  <strong>{skillById.get(attempt.skillId)?.title ?? attempt.skillId}</strong>
                  <p>{attempt.mistakeType ?? 'Reading or reasoning error'}</p>
                  <small>
                    {new Date(attempt.createdAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                    {attempt.confidence ? ` · ${attempt.confidence} confidence` : ''} · {Math.round(attempt.elapsedMs / 1000)}s
                    {attempt.response ? ` · chose (${attempt.response})` : ' · left blank'}
                  </small>
                  <details className="mistake-question">
                    <summary>Open the passage and the question</summary>
                    {attempt.questionSnapshot ? (
                      <div className="mistake-replay">
                        {attempt.passageSnapshot && (
                          <PassagePane
                            passage={attempt.passageSnapshot}
                            notes=""
                            onNotes={() => undefined}
                            highlights={[]}
                            onHighlights={() => undefined}
                          />
                        )}
                        <QuestionCard
                          question={attempt.questionSnapshot}
                          response={attempt.response}
                          onResponse={() => undefined}
                          submitted
                          compact
                          showConfidence={false}
                          showMeta={false}
                        />
                      </div>
                    ) : (
                      <p className="muted-copy">This answer was saved before question snapshots were kept. Use the lesson link to repair the skill.</p>
                    )}
                  </details>
                </div>
                <Link href={`/learn?skill=${attempt.skillId}`} aria-label={`Review ${skillById.get(attempt.skillId)?.title}`}><ArrowRight size={16} weight="light" /></Link>
              </article>
            ))}
          </section>

          <aside className="panel pattern-panel">
            <div className="section-heading"><div><h3>What keeps tempting you</h3><p>Most frequent first.</p></div><Brain size={19} weight="light" /></div>
            <div className="pattern-list">
              {patterns.slice(0, 8).map(([label, count]) => (
                <div key={label}><span>{label}</span><strong>{count}</strong></div>
              ))}
            </div>
            <Link className="primary-button" href="/practice?mode=review">Repair due skills <ArrowRight size={16} weight="light" /></Link>
          </aside>
        </div>
      ) : (
        <div className="empty-state large">
          <CheckCircle size={32} weight="light" />
          <h3>No misses logged yet.</h3>
          <p>That is not evidence of strength — it is an absence of evidence. Work through a calibration set and this page becomes the most useful one here.</p>
          <Link className="primary-button" href="/practice?mode=diagnostic">Begin calibration</Link>
        </div>
      )}
    </div>
  )
}
