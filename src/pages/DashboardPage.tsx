import { Link } from 'wouter'
import { ArrowRight } from '@phosphor-icons/react'
import { curriculum, skillById } from '../data/curriculum'
import { isDue, masteryPercent } from '../engine/adaptive'
import { computeGoalProgress } from '../engine/goal'
import { readingPace } from '../engine/insights'
import { friendlyReportSummary, friendlyReportTitle } from '../engine/reportCopy'
import { useAppState } from '../state/AppState'

export function DashboardPage() {
  const { settings, attempts, sessions, essays, skillStates, learnerModel, analyses, reports } = useAppState()
  const due = skillStates.filter((state) => isDue(state)).length
  const recent = attempts.slice(0, 20)
  const accuracy = recent.length ? Math.round(recent.filter((item) => item.correct).length / recent.length * 100) : null
  const weakest = [...skillStates].filter((state) => state.attempts).sort((a, b) => masteryPercent(a) - masteryPercent(b))[0]
  const latestAnalysis = analyses[0]
  const priority = learnerModel.priorities[0]
  const ready = attempts.length > 0
  const goal = computeGoalProgress(settings, skillStates, sessions, attempts, essays.length)
  const pace = readingPace(attempts)

  return (
    <div className="dashboard-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">{ready ? `Today${settings.name ? ` · ${settings.name}` : ''}` : 'Private LNAT workspace'}</p>
          <h1>{ready ? 'Here is the next best move.' : 'Build an honest baseline.'}</h1>
        </div>
        <span className="date-label">
          Target {settings.targetScore}/42{settings.targetUniversity ? ` · ${settings.targetUniversity}` : ''} · {settings.dailyMinutes} min/day
          {goal.daysRemaining !== undefined && <><br />{goal.daysRemaining} days to the test</>}
        </span>
      </header>

      <section className="recommendation">
        <div className="recommendation-main">
          <p className="section-kicker">Analyst recommendation</p>
          <h2>{ready ? learnerModel.nextSession : 'Work through one passage set as a calibration.'}</h2>
          <p>
            {priority?.claim ?? (ready
              ? learnerModel.summary
              : 'Three or four questions on one passage is enough to start separating a comprehension problem from an argument problem — and they are very different problems.')}
          </p>
          <div className="button-row">
            <Link className="primary-button" href={ready ? '/practice' : '/practice?mode=diagnostic'}>
              {ready ? 'Start the recommended set' : 'Begin calibration'} <ArrowRight size={16} weight="light" />
            </Link>
            <Link className="quiet-link" href="/insights">Why this plan?</Link>
            <span className="recommendation-evidence">
              {priority
                ? `${priority.confidence.charAt(0).toUpperCase()}${priority.confidence.slice(1)} confidence · ${priority.evidenceIds.length} linked answer${priority.evidenceIds.length === 1 ? '' : 's'}`
                : `${attempts.length} answers logged · ${attempts.length < 4 ? 'More evidence needed' : 'Model update pending'}`}
            </span>
          </div>
        </div>
        <div className="recommendation-evidence-panel">
          <span>Estimated Section A</span>
          <p>{goal.currentEstimate.score} <small>±{goal.currentEstimate.confidenceRadius}</small></p>
          <small>{goal.band.label}</small>
        </div>
      </section>

      <section className="stat-strip" aria-label="Current evidence">
        <div><span>Recent accuracy</span><strong>{accuracy === null ? '—' : `${accuracy}%`}</strong><small>last {recent.length} answers</small></div>
        <div><span>Review queue</span><strong>{due}</strong><small>skills due now</small></div>
        <div><span>Reading pace</span><strong>{pace.wordsPerMinute ? `${pace.wordsPerMinute}` : '—'}</strong><small>{pace.wordsPerMinute ? 'words a minute on passages' : 'not measured yet'}</small></div>
        <div><span>Lowest signal</span><strong>{weakest ? `${masteryPercent(weakest)}%` : '—'}</strong><small>{weakest ? skillById.get(weakest.skillId)?.shortTitle : 'not mapped'}</small></div>
      </section>

      <div className="dashboard-columns">
        <section className="plain-section">
          <div className="section-heading">
            <div><h2>Latest requested review</h2></div>
            <span>{latestAnalysis ? new Date(latestAnalysis.createdAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : ''}</span>
          </div>
          {latestAnalysis ? (
            <article className="observation">
              <h3>{latestAnalysis.verdict}</h3>
              <p>{latestAnalysis.justificationAssessment}</p>
              <Link href="/insights">Read the full analysis <ArrowRight size={13} weight="light" /></Link>
            </article>
          ) : (
            <div className="empty-line"><p>After an answer, choose “Review my reasoning” and say why you picked what you picked. Nothing runs unless you ask.</p></div>
          )}
          <p className="section-footnote">Reasoning reviews are requested, never automatic.</p>
        </section>

        <section className="plain-section today-list">
          <div className="section-heading"><div><h2>Today&apos;s sequence</h2></div><span>{settings.dailyMinutes} min</span></div>
          <Link href="/practice?mode=review">
            <span>Recall</span>
            <strong>{due ? `Repair ${due} due skill${due === 1 ? '' : 's'}` : 'Short mixed warm-up'}</strong>
            <em>{Math.round(settings.dailyMinutes * 0.25)} min</em>
          </Link>
          <Link href="/practice">
            <span>Read</span>
            <strong>{learnerModel.skillDirectives[0] ? skillById.get(learnerModel.skillDirectives[0].skillId)?.title ?? learnerModel.skillDirectives[0].skillId : 'Adaptive passage set'}</strong>
            <em>{Math.round(settings.dailyMinutes * 0.45)} min</em>
          </Link>
          <Link href="/essay">
            <span>Argue</span>
            <strong>{essays.length ? 'Another Section B, timed' : 'First Section B essay'}</strong>
            <em>{Math.round(settings.dailyMinutes * 0.2)} min</em>
          </Link>
          <Link href="/learn">
            <span>Consolidate</span>
            <strong>{weakest ? `Reread ${skillById.get(weakest.skillId)?.shortTitle}` : `${curriculum.length} lessons`}</strong>
            <em>{Math.round(settings.dailyMinutes * 0.1)} min</em>
          </Link>
          <p className="section-footnote">A compact plan, revised after each completed set.</p>
        </section>
      </div>

      {reports[0] && (
        <Link href="/insights" className="report-ribbon">
          <span>Latest report</span>
          <strong>{friendlyReportTitle(reports[0])}</strong>
          <p>{friendlyReportSummary(reports[0])}</p>
          <ArrowRight size={16} weight="light" />
        </Link>
      )}
    </div>
  )
}
