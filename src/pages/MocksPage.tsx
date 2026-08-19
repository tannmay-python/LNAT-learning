import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { ArrowRight, Flag, ListChecks, NotePencil, Timer, Trash, WarningCircle } from '@phosphor-icons/react'
import { LNAT_SPEC } from '../engine/mock'
import { bandForScore } from '../engine/adaptive'
import { useAppState } from '../state/AppState'

export function MocksPage() {
  const { sessions, essays, mockAssessments, activeMock, saveActiveMock } = useAppState()
  const [, navigate] = useLocation()
  const [confirmClear, setConfirmClear] = useState(false)
  const [clearing, setClearing] = useState(false)
  const mocks = sessions.filter((session) => session.type === 'mock' && session.completedAt)
  const hasActive = Boolean(activeMock)

  const clearAndRestart = async () => {
    setClearing(true)
    try {
      await saveActiveMock(null)
      navigate('/mock/run')
    } finally {
      setClearing(false)
      setConfirmClear(false)
    }
  }

  return (
    <div className="mocks-page">
      <section className="mock-hero">
        <div>
          <p className="eyebrow">Full simulation</p>
          <h2>Two hours and fifteen minutes. One honest read.</h2>
          <p>
            Take a full mock when you can protect the whole sitting. The result updates your calibration, your review
            queue, and your reading-pace profile — and a mock taken in fragments tells you nothing about endurance, which
            is most of what a full paper measures.
          </p>
          <div className="hero-actions">
            <Link href="/mock/run" className="primary-button">
              {hasActive ? 'Resume mock' : 'Start full mock'} <ArrowRight size={16} weight="light" />
            </Link>
            {hasActive && !confirmClear && (
              <button className="ghost-button" onClick={() => setConfirmClear(true)}><Trash size={14} weight="light" /> Clear and restart</button>
            )}
            {hasActive && confirmClear && (
              <div className="mock-clear-confirm" role="alert">
                <span>Discard the saved sitting?</span>
                <button className="text-button" disabled={clearing} onClick={() => setConfirmClear(false)}>Cancel</button>
                <button className="danger-button" disabled={clearing} onClick={() => void clearAndRestart()}>{clearing ? 'Clearing…' : 'Clear it'}</button>
              </div>
            )}
            <Link href="/practice" className="text-button">Take a shorter set instead</Link>
          </div>
        </div>
        <div className="mock-blueprint" aria-label="Sitting structure">
          <div><span>Section A</span><strong>95 min</strong><small>{LNAT_SPEC.sectionA.questions} questions · {LNAT_SPEC.sectionA.passages} passages</small></div>
          <i />
          <div><span>Section B</span><strong>40 min</strong><small>1 of {LNAT_SPEC.sectionB.prompts} · 500–600 words</small></div>
        </div>
      </section>

      <section className="mock-feature-grid">
        <div><Timer size={20} weight="light" /><strong>One clock, not five</strong><p>Ninety-five minutes covers all twelve passages. Budgeting across them is part of what is being tested.</p></div>
        <div><Flag size={20} weight="light" /><strong>Free navigation and flagging</strong><p>Move anywhere in Section A, mark anything for review, and come back before you submit — as the real interface allows.</p></div>
        <div><ListChecks size={20} weight="light" /><strong>Nothing deducted for a wrong answer</strong><p>The review screen shows every blank, because a guess is strictly better than an omission.</p></div>
        <div><NotePencil size={20} weight="light" /><strong>Section B written under the clock</strong><p>Three questions, forty minutes, and a word counter that shows the official 500–600 band rather than the ceiling.</p></div>
      </section>

      <section className="score-caveat">
        <WarningCircle size={20} weight="light" />
        <div>
          <strong>A raw mark, and nothing dressed up as more.</strong>
          <p>
            Section A is scored out of 42, which is exactly what the LNAT reports. No scaled score, percentile, or
            conversion is published, so none is invented here. Section B carries no official mark at all — it is sent to
            universities as written, and any feedback in this app is formative practice, not an assessment.
          </p>
        </div>
      </section>

      <section className="panel history-panel">
        <div className="section-heading">
          <div><h3>Sitting history</h3><p>Completed full mocks appear here as checkpoints in your trend.</p></div>
          <span>{mocks.length} complete</span>
        </div>
        {mocks.length ? (
          <div className="history-list">
            {mocks.map((mock) => {
              const assessment = mockAssessments.find((item) => item.sessionId === mock.id)
              const essay = essays.find((item) => item.sessionId === mock.id)
              const score = mock.sectionAScore ?? mock.correct ?? 0
              const gap = assessment ? score - assessment.expectedScore : null
              return (
                <article className="history-row mock-history-row" key={mock.id}>
                  <div className="history-row-intro">
                    <strong>{new Date(mock.completedAt!).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                    <small>{score} of {mock.total ?? 42} correct · {mock.passageIds.length} passages · {mock.flags.length} flagged</small>
                    <small>{essay ? `Section B written — ${essay.wordCount} words` : 'Section A only'}</small>
                  </div>
                  <div className="mock-history-metrics">
                    <span><small>Raw mark</small><strong>{score}</strong><em>{bandForScore(score).label}</em></span>
                    <span>
                      <small>Expected beforehand</small>
                      <strong>{assessment?.expectedScore ?? '—'}</strong>
                      {gap !== null && <em className={gap >= 0 ? 'positive' : 'negative'}>{gap >= 0 ? '+' : ''}{gap} vs expected</em>}
                    </span>
                    <span><small>Form demand</small><strong className="demand">{assessment?.formDemand ?? '—'}</strong></span>
                  </div>
                  {assessment && <p className="mock-assessment-rationale">{assessment.rationale}</p>}
                </article>
              )
            })}
          </div>
        ) : (
          <div className="empty-state small">
            <ListChecks size={24} />
            <h3>No full mock yet.</h3>
            <p>Your first completed sitting establishes the pacing and endurance baseline everything else is measured against.</p>
          </div>
        )}
      </section>
    </div>
  )
}
