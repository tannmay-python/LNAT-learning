import { useMemo, useState } from 'react'
import { Link } from 'wouter'
import { ArrowRight, ChartLineUp, Sparkle } from '@phosphor-icons/react'
import { domainById, skillById } from '../data/curriculum'
import { buildLearningInsights } from '../engine/insights'
import { computeGoalProgress } from '../engine/goal'
import { friendlyReportSummary, friendlyReportTitle, readerText } from '../engine/reportCopy'
import { masteryPercent } from '../engine/adaptive'
import { useAppState } from '../state/AppState'
import type { DomainId } from '../types'

/** A small, honest chart: mock checkpoints, the live estimate, and the target. */
function ScoreTrack({ progress }: { progress: ReturnType<typeof computeGoalProgress> }) {
  const { actual, current, projection, target } = progress.predictionTrack
  const points = [...actual, current, ...(projection ? [projection] : [])]
  if (points.length < 2) return null
  const times = points.map((point) => new Date(point.date).getTime())
  const minTime = Math.min(...times)
  const maxTime = Math.max(...times)
  const x = (date: string) => 40 + ((new Date(date).getTime() - minTime) / Math.max(1, maxTime - minTime)) * 420
  const y = (score: number) => 150 - (score / 42) * 120

  return (
    <figure className="score-track">
      <svg viewBox="0 0 480 170" role="img" aria-label="Section A mark over time">
        <g className="track-grid" aria-hidden="true">
          {[0, 14, 21, 28, 42].map((mark) => (
            <g key={mark}><line x1="40" y1={y(mark)} x2="470" y2={y(mark)} /><text x="34" y={y(mark) + 3} textAnchor="end">{mark}</text></g>
          ))}
        </g>
        {target && <line className="track-target" x1="40" y1={y(target.score)} x2="470" y2={y(target.score)} />}
        {actual.length > 1 && <polyline className="track-actual" points={actual.map((point) => `${x(point.date)},${y(point.score)}`).join(' ')} />}
        {projection && <line className="track-projection" x1={x(current.date)} y1={y(current.score)} x2={x(projection.date)} y2={y(projection.score)} />}
        {actual.map((point) => <circle key={point.date} className="track-point" cx={x(point.date)} cy={y(point.score)} r="4" />)}
        <circle className="track-current" cx={x(current.date)} cy={y(current.score)} r="5" />
      </svg>
      <figcaption>
        <span className="key mock">Completed mocks</span>
        <span className="key current">Live estimate</span>
        {projection && <span className="key projection">Projected to test date</span>}
        {target && <span className="key target">Target {target.score}</span>}
      </figcaption>
    </figure>
  )
}

export function InsightsPage() {
  const { settings, attempts, sessions, essays, skillStates, reports, analyses, learnerModel, aiStatus, generateComprehensiveReport } = useAppState()
  const [building, setBuilding] = useState(false)
  const [error, setError] = useState('')
  const insights = useMemo(() => buildLearningInsights(attempts, sessions), [attempts, sessions])
  const progress = useMemo(() => computeGoalProgress(settings, skillStates, sessions, attempts, essays.length), [settings, skillStates, sessions, attempts, essays.length])

  const build = async () => {
    setBuilding(true)
    setError('')
    try { await generateComprehensiveReport() }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'The report could not be built.') }
    finally { setBuilding(false) }
  }

  if (!attempts.length) {
    return (
      <div className="empty-state large">
        <ChartLineUp size={32} weight="light" />
        <h3>Nothing to show yet.</h3>
        <p>Insights are built from real answers, not from a placeholder. Work through one passage set and this page fills in.</p>
        <Link className="primary-button" href="/practice?mode=diagnostic">Begin calibration</Link>
      </div>
    )
  }

  return (
    <div className="insights-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Insights</p>
          <h1>What the evidence actually shows.</h1>
          <p>Every figure here is computed from your answers. Every claim in a report cites the answers behind it.</p>
        </div>
        <button className="secondary-button" disabled={building || !aiStatus.available} onClick={() => void build()}>
          <Sparkle size={14} weight="fill" /> {building ? 'Writing…' : 'Build complete report'}
        </button>
      </header>
      {error && <p className="analysis-error">{error}</p>}

      <section className="goal-panel">
        <div className="goal-headline">
          <div>
            <span className="eyebrow">Estimated Section A mark</span>
            <strong>{progress.currentEstimate.score}<small>±{progress.currentEstimate.confidenceRadius}</small></strong>
            <p>{progress.band.label} — {progress.band.note}</p>
          </div>
          <div className="goal-figures">
            <span><small>Target</small><strong>{progress.targetScore ?? '—'}</strong>{progress.targetUniversity && <em>{progress.targetUniversity}</em>}</span>
            <span><small>Gap</small><strong>{progress.gapToGoal !== undefined ? (progress.gapToGoal > 0 ? `+${progress.gapToGoal}` : progress.gapToGoal) : '—'}</strong><em>marks to close</em></span>
            <span><small>Weekly trend</small><strong>{progress.weeklyTrend === null ? '—' : `${progress.weeklyTrend > 0 ? '+' : ''}${progress.weeklyTrend}`}</strong><em>{progress.weeklyTrend === null ? 'needs two mocks' : 'marks a week'}</em></span>
            <span><small>Projected</small><strong>{progress.projectedScore ?? '—'}</strong><em>{progress.daysRemaining !== undefined ? `in ${progress.daysRemaining} days` : 'no test date set'}</em></span>
          </div>
        </div>
        <ScoreTrack progress={progress} />
        <p className="goal-justification">{progress.estimateJustification}</p>
      </section>

      <section className="stat-strip" aria-label="Overall evidence">
        <div><span>Questions answered</span><strong>{insights.overall.total}</strong><small>{insights.overall.accuracy}% correct</small></div>
        <div><span>Passages read</span><strong>{progress.evidence.passagesRead}</strong><small>{insights.pace.wordsPerMinute ? `${insights.pace.wordsPerMinute} words a minute` : 'pace not measured'}</small></div>
        <div><span>Average per question</span><strong>{insights.overall.averageSeconds}s</strong><small>target {insights.overall.averageTargetSeconds || 80}s</small></div>
        <div><span>Essays written</span><strong>{essays.length}</strong><small>{essays.filter((essay) => essay.feedback).length} with feedback</small></div>
      </section>

      <div className="insights-columns">
        <section className="plain-section">
          <div className="section-heading"><div><h2>By question family</h2><p>Where the marks are actually going.</p></div></div>
          <div className="domain-bars">
            {(Object.keys(insights.byDomain) as DomainId[]).map((domain) => {
              const stats = insights.byDomain[domain]
              return (
                <div className="domain-bar" key={domain}>
                  <span>{domainById.get(domain)?.title ?? domain}</span>
                  <div className="bar-track"><i style={{ width: `${stats.total ? stats.accuracy : 0}%` }} /></div>
                  <strong>{stats.total ? `${stats.accuracy}%` : '—'}</strong>
                  <small>{stats.total} answered · {stats.averageSeconds}s</small>
                </div>
              )
            })}
          </div>
        </section>

        <section className="plain-section">
          <div className="section-heading"><div><h2>By difficulty</h2><p>Whether the level you are working at is the right one.</p></div></div>
          <div className="domain-bars">
            {([1, 2, 3, 4, 5] as const).map((level) => {
              const stats = insights.byDifficulty[level]
              return (
                <div className="domain-bar" key={level}>
                  <span>Level {level}</span>
                  <div className="bar-track"><i style={{ width: `${stats.total ? stats.accuracy : 0}%` }} /></div>
                  <strong>{stats.total ? `${stats.accuracy}%` : '—'}</strong>
                  <small>{stats.total} answered</small>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="section-heading"><div><h3>Skill by skill</h3><p>Ordered by how much evidence there is, weakest first within that.</p></div><span>{insights.bySkill.length} skills seen</span></div>
        <div className="skill-table">
          {insights.bySkill.map((skill) => {
            const topic = skillById.get(skill.skillId)
            const state = skillStates.find((item) => item.skillId === skill.skillId)
            return (
              <div className="skill-row" key={skill.skillId}>
                <div><strong>{topic?.title ?? skill.skillId}</strong><small>{domainById.get(topic?.domain ?? 'argument')?.shortTitle}</small></div>
                <span className="skill-accuracy">{skill.correct}/{skill.total}</span>
                <div className="bar-track small"><i style={{ width: `${masteryPercent(state)}%` }} /></div>
                <span className="skill-mastery">{masteryPercent(state)}%</span>
                <span className="skill-time">{skill.averageSeconds}s</span>
                <Link href={`/practice?skill=${skill.skillId}`} aria-label={`Drill ${topic?.title}`}><ArrowRight size={14} /></Link>
              </div>
            )
          })}
        </div>
      </section>

      {learnerModel.updatedAt && (
        <section className="panel learner-model">
          <div className="section-heading">
            <div><h3>The analyst&apos;s model of you</h3><p>Rebuilt after every completed set. Claims without evidence are dropped.</p></div>
            <span>{new Date(learnerModel.updatedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
          </div>
          <p className="model-summary">{readerText(learnerModel.summary)}</p>
          <div className="claim-columns">
            {([['Strengths', learnerModel.strengths], ['Working hypotheses', learnerModel.hypotheses], ['Priorities', learnerModel.priorities]] as const).map(([title, claims]) => (
              <div key={title}>
                <h4>{title}</h4>
                {claims.length ? claims.map((claim) => (
                  <p key={claim.claim}>{readerText(claim.claim)} <em>{claim.confidence} · {claim.evidenceIds.length} answer{claim.evidenceIds.length === 1 ? '' : 's'}</em></p>
                )) : <p className="muted-copy">Not enough evidence yet.</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {reports.length > 0 && (
        <section className="panel">
          <div className="section-heading"><div><h3>Reports</h3><p>One per completed set, plus any complete report you have asked for.</p></div><span>{reports.length}</span></div>
          <div className="history-list">
            {reports.map((report) => (
              <article className="history-row" key={report.id}>
                <div className="history-row-intro">
                  <strong>{friendlyReportTitle(report)}</strong>
                  <small>{new Date(report.createdAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} · {report.model}</small>
                </div>
                <p className="report-summary">{friendlyReportSummary(report)}</p>
                <details className="report-detail">
                  <summary>Open the full report</summary>
                  <p>{readerText(report.executiveSummary)}</p>
                  {report.errorTaxonomy.length > 0 && (
                    <>
                      <h4>Recurring errors</h4>
                      <ul>{report.errorTaxonomy.map((item) => <li key={item.label}><b>{item.label} ({item.count})</b> — {readerText(item.mechanism)}</li>)}</ul>
                    </>
                  )}
                  {report.studyPriorities.length > 0 && (
                    <>
                      <h4>Priorities</h4>
                      <ol>{report.studyPriorities.map((item) => <li key={item.skillId}><b>{skillById.get(item.skillId)?.title ?? item.skillId}</b> — {readerText(item.action)} <em>{readerText(item.reason)}</em></li>)}</ol>
                    </>
                  )}
                  {report.sevenDayPlan.length > 0 && (
                    <>
                      <h4>Next seven days</h4>
                      <ul>{report.sevenDayPlan.map((day) => <li key={day.day}><b>{day.day} ({day.minutes} min)</b> — {readerText(day.work)} <em>{readerText(day.successCheck)}</em></li>)}</ul>
                    </>
                  )}
                  {report.limitations.length > 0 && (
                    <>
                      <h4>What this cannot show</h4>
                      <ul>{report.limitations.map((item) => <li key={item}>{readerText(item)}</li>)}</ul>
                    </>
                  )}
                  <a href={`/api/reports/${encodeURIComponent(report.id)}/markdown`} target="_blank" rel="noreferrer">Open the raw markdown</a>
                </details>
              </article>
            ))}
          </div>
        </section>
      )}

      {analyses.length > 0 && (
        <section className="panel">
          <div className="section-heading"><div><h3>Reasoning reviews</h3><p>Only the answers where you asked for one.</p></div><span>{analyses.length}</span></div>
          <div className="history-list">
            {analyses.slice(0, 8).map((analysis) => (
              <article className="history-row" key={analysis.id}>
                <div className="history-row-intro">
                  <strong>{analysis.verdict}</strong>
                  <small>{new Date(analysis.createdAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} · {analysis.justificationQuality} justification</small>
                </div>
                <p className="report-summary">{analysis.justificationAssessment}</p>
                <details className="report-detail">
                  <summary>What you wrote, and what to do next</summary>
                  <blockquote>{analysis.learnerJustification}</blockquote>
                  <p>{analysis.conceptLesson}</p>
                  <ol>{analysis.betterApproach.map((step) => <li key={step}>{step}</li>)}</ol>
                  <p><b>Next move:</b> {analysis.nextMove}</p>
                </details>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
