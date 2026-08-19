import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Clock, Lightbulb, PencilSimpleLine, Play } from '@phosphor-icons/react'
import { essayPromptById, essayPrompts } from '../data/essayPrompts'
import { EssayComposer } from '../components/EssayComposer'
import { LNAT_SPEC } from '../engine/mock'
import { wordCount } from '../engine/questions'
import { useAppState } from '../state/AppState'
import type { EssayRecord } from '../types'

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

/** Deterministic-enough rotation so a candidate is not offered the same three every time. */
const pickThree = (usedPromptIds: Set<string>) => {
  const unused = essayPrompts.filter((prompt) => !usedPromptIds.has(prompt.id))
  const source = unused.length >= 3 ? unused : essayPrompts
  const shuffled = [...source].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, LNAT_SPEC.sectionB.prompts)
}

export function EssayPage() {
  const { essays, saveEssay, requestEssayFeedback, aiStatus } = useAppState()
  const [stage, setStage] = useState<'intro' | 'writing' | 'submitted'>('intro')
  const [timed, setTimed] = useState(true)
  const [remaining, setRemaining] = useState(LNAT_SPEC.sectionB.seconds)
  const [promptId, setPromptId] = useState<string | null>(null)
  const [plan, setPlan] = useState('')
  const [body, setBody] = useState('')
  const [savedEssayId, setSavedEssayId] = useState<string>()
  const [grading, setGrading] = useState(false)
  const [error, setError] = useState('')
  const startedAt = useRef(Date.now())

  const usedPromptIds = useMemo(() => new Set(essays.map((essay) => essay.promptId)), [essays])
  const [offered, setOffered] = useState(() => pickThree(usedPromptIds))

  useEffect(() => {
    if (stage !== 'writing' || !timed) return
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [stage, timed])

  const begin = () => {
    setOffered(pickThree(usedPromptIds))
    setRemaining(LNAT_SPEC.sectionB.seconds)
    startedAt.current = Date.now()
    setStage('writing')
  }

  const submit = async () => {
    if (!promptId) return
    const prompt = essayPromptById.get(promptId)
    if (!prompt) return
    const id = crypto.randomUUID()
    const record: EssayRecord = {
      id,
      promptId,
      promptText: prompt.text,
      plan,
      body: body.trim(),
      wordCount: wordCount(body),
      elapsedMs: Date.now() - startedAt.current,
      createdAt: new Date().toISOString(),
    }
    setError('')
    await saveEssay(record)
    setSavedEssayId(id)
    setStage('submitted')
    if (aiStatus.available) {
      setGrading(true)
      try { await requestEssayFeedback(id, prompt.pressurePoint) }
      catch (reason) { setError(reason instanceof Error ? reason.message : 'Essay feedback failed.') }
      finally { setGrading(false) }
    }
  }

  const saved = savedEssayId ? essays.find((essay) => essay.id === savedEssayId) : undefined
  const selectedPrompt = promptId ? essayPromptById.get(promptId) : undefined
  const outOfTime = timed && remaining === 0

  if (stage === 'intro') {
    return (
      <div className="essay-page">
        <header className="page-heading">
          <div>
            <p className="eyebrow">Section B</p>
            <h1>Forty minutes to be genuinely persuasive.</h1>
            <p>
              One question from three. Roughly 500 to 600 words. No official mark is awarded — the essay is sent to the
              universities you apply to exactly as you wrote it, and read as evidence of whether you can hold an argument
              steady under pressure.
            </p>
          </div>
          <span className={`analyst-pill ${aiStatus.state}`}><i />{aiStatus.available ? 'Feedback available' : 'Feedback offline'}</span>
        </header>

        <section className="essay-brief">
          <div className="essay-brief-grid">
            <div><Clock size={20} weight="light" /><strong>40 minutes</strong><p>Five planning, thirty writing, five checking is a reliable division.</p></div>
            <div><PencilSimpleLine size={20} weight="light" /><strong>500–600 words</strong><p>The official guidance. A very long essay is a disadvantage, not a display of effort.</p></div>
            <div><Lightbulb size={20} weight="light" /><strong>Take a side</strong><p>Fence-sitting reads as indecision. Defending a position you disagree with often produces a tighter argument.</p></div>
          </div>
          <div className="setup-row">
            <span>Clock</span>
            <div className="segmented">
              <button className={timed ? 'active' : ''} onClick={() => setTimed(true)}>Timed · 40 min</button>
              <button className={!timed ? 'active' : ''} onClick={() => setTimed(false)}>Untimed · learning</button>
            </div>
          </div>
          <button className="primary-button" onClick={begin}><Play size={15} weight="fill" /> Start writing</button>
        </section>

        {essays.length > 0 && (
          <section className="panel history-panel">
            <div className="section-heading">
              <div><h3>Your essays</h3><p>Every response is kept, with its feedback, so you can see the argument improve.</p></div>
              <span>{essays.length} written</span>
            </div>
            <div className="history-list">
              {essays.map((essay) => (
                <article className="history-row" key={essay.id}>
                  <div className="history-row-intro">
                    <strong>{essay.promptText}</strong>
                    <small>
                      {new Date(essay.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}{essay.wordCount} words · {Math.round(essay.elapsedMs / 60000)} min
                    </small>
                  </div>
                  {essay.feedback ? (
                    <div className="essay-criteria-strip">
                      {essay.feedback.criteria.map((criterion) => (
                        <span key={criterion.name} className={criterion.level} title={criterion.name}>{criterion.name.split(' ')[0]}</span>
                      ))}
                    </div>
                  ) : <em className="pending-label">No feedback recorded</em>}
                  <details className="essay-detail">
                    <summary>Read it</summary>
                    {essay.plan && <><h4>Plan</h4><pre>{essay.plan}</pre></>}
                    <h4>Essay</h4>
                    <div className="essay-read">{essay.body.split('\n').filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
                    {essay.feedback && (
                      <>
                        <h4>Feedback</h4>
                        <p>{essay.feedback.summary}</p>
                        <ul>{essay.feedback.criteria.map((criterion) => <li key={criterion.name}><b>{criterion.name} — {criterion.level}.</b> {criterion.feedback}</li>)}</ul>
                      </>
                    )}
                  </details>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    )
  }

  return (
    <div className="essay-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">{stage === 'submitted' ? 'Submitted' : 'Section B · in progress'}</p>
          <h1>{stage === 'submitted' ? 'Your essay is on the record.' : 'Answer one of the following.'}</h1>
        </div>
        {stage === 'writing' && timed && (
          <span className={`mock-clock ${remaining < 300 ? 'urgent' : ''}`}><Clock size={16} weight="light" />{formatTime(remaining)}</span>
        )}
      </header>

      {outOfTime && stage === 'writing' && (
        <div className="practice-notice" role="status">
          Time is up. On the day the essay would be submitted as it stands — submit it now and see what a reader would have received.
        </div>
      )}

      <EssayComposer
        prompts={offered}
        selectedPromptId={promptId}
        onSelectPrompt={setPromptId}
        plan={plan}
        onPlan={setPlan}
        body={body}
        onBody={setBody}
        remainingLabel={stage === 'writing' && timed ? formatTime(remaining) : undefined}
        disabled={stage === 'submitted'}
        feedback={saved?.feedback}
      />

      {stage === 'writing' && (
        <footer className="question-actions essay-actions">
          <button className="primary-button" disabled={!promptId || wordCount(body) < 80} onClick={() => void submit()}>
            Submit essay <ArrowRight size={16} />
          </button>
          <span className="hint-label">
            {!promptId ? 'Choose a question first.' : wordCount(body) < 80 ? 'At least eighty words before it can be reviewed.' : 'Once submitted, the text is fixed.'}
          </span>
        </footer>
      )}

      {stage === 'submitted' && (
        <section className="essay-after">
          {grading && <p className="pending-label">Reading your argument…</p>}
          {error && <p className="analysis-error">{error}</p>}
          {!aiStatus.available && !saved?.feedback && (
            <p className="pending-label">No analyst is configured, so the essay is stored without feedback. It is still on your record.</p>
          )}
          {selectedPrompt && (
            <div className="pressure-point">
              <span className="eyebrow">What this question was really testing</span>
              <p>{selectedPrompt.pressurePoint}</p>
            </div>
          )}
          <div className="button-row">
            <button className="secondary-button" onClick={() => { setStage('intro'); setPromptId(null); setPlan(''); setBody(''); setSavedEssayId(undefined) }}>
              Write another
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
