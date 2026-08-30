import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'wouter'
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Flag, List, Sparkle, Warning, X } from '@phosphor-icons/react'
import { EssayComposer } from '../components/EssayComposer'
import { PassagePane } from '../components/PassagePane'
import { QuestionCard } from '../components/QuestionCard'
import { createCheckpoint, createMock, LNAT_SPEC, mockPassageBlueprints, passageGroups, questionLocation } from '../engine/mock'
import { isCorrectResponse, rawScore, wordCount } from '../engine/questions'
import { buildMockScoreReport } from '../engine/officialReference'
import { useAppState } from '../state/AppState'
import type {
  ActiveMockCheckpoint, Attempt, ChoiceId, EssayRecord,
  MockStage, Passage, Question, SessionRecord,
} from '../types'

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
const runsClock = (stage: MockStage) => stage === 'section-a' || stage === 'review' || stage === 'essay'

/**
 * How much of the form is written before the candidate may begin. The rest is
 * written in the background while they read, and swapped in ahead of them —
 * the same shape as SATLAS preparing Math module 1 during Reading and Writing.
 *
 * Two is deliberate. A passage set costs two model calls (write, then an
 * independent solve), which runs to a few minutes; four would leave a candidate
 * staring at a progress bar for ten. Two passages is roughly fifteen minutes of
 * the sitting against a writer that produces one every three or so, so the
 * background stays comfortably ahead of the reader from the first minute.
 */
const FOREGROUND_PASSAGES = 2

/** A resumed sitting must not gain the time it spent closed. */
const resumeClock = (mock: ActiveMockCheckpoint): ActiveMockCheckpoint => {
  if (!runsClock(mock.stage) || !mock.checkpointedAt) return mock
  const elapsed = Math.max(0, Math.floor((Date.now() - new Date(mock.checkpointedAt).getTime()) / 1000))
  const remaining = Math.max(0, mock.remaining - elapsed)
  return remaining === mock.remaining ? mock : { ...mock, remaining, timeExpired: remaining === 0 }
}

export function MockRunner() {
  const [, navigate] = useLocation()
  const {
    loading, activeMock, saveActiveMock, recordAttempts, saveSession, saveEssay,
    requestEssayFeedback, preparePassageSet, aiStatus, essays, mockAssessments,
  } = useAppState()
  const [mock, setMock] = useState<ActiveMockCheckpoint | null>(null)
  const backgroundStarted = useRef(false)
  const generationCancelled = useRef(false)
  const [navigatorOpen, setNavigatorOpen] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [result, setResult] = useState<{ correct: number; total: number; sessionId: string } | null>(null)
  const [savedEssayId, setSavedEssayId] = useState<string>()
  const [error, setError] = useState('')
  const checkpointRef = useRef<ActiveMockCheckpoint | null>(null)
  const questionStarted = useRef(Date.now())
  const sessionStarted = useRef(new Date().toISOString())

  const replaceMock = useCallback((next: ActiveMockCheckpoint) => {
    const stamped = { ...next, checkpointedAt: new Date().toISOString() }
    checkpointRef.current = stamped
    setMock(stamped)
    return stamped
  }, [])

  const updateMock = useCallback((change: (current: ActiveMockCheckpoint) => ActiveMockCheckpoint) => {
    setMock((current) => {
      if (!current) return current
      const next = { ...change(current), checkpointedAt: new Date().toISOString() }
      checkpointRef.current = next
      return next
    })
  }, [])

  const persist = useCallback(async (value = checkpointRef.current) => {
    if (!value || value.stage === 'complete') return
    await saveActiveMock({ ...value, checkpointedAt: new Date().toISOString() })
  }, [saveActiveMock])

  // Restore a paused sitting, or build a fresh form. With an analyst configured
  // the sitting opens on the prepare stage and the first passages are written
  // before it can begin; without one it goes straight to the bank-built intro.
  useEffect(() => {
    if (loading || checkpointRef.current) return
    if (activeMock) {
      const restored = resumeClock(activeMock)
      checkpointRef.current = restored
      setMock(restored)
      sessionStarted.current = restored.startedAt || new Date().toISOString()
      questionStarted.current = Date.now()
      if (restored.remaining !== activeMock.remaining) void persist(restored)
      return
    }
    const bankBuilt = createCheckpoint(createMock())
    const opening: ActiveMockCheckpoint = aiStatus.available
      ? {
        ...bankBuilt,
        stage: 'prepare',
        preparation: {
          status: 'running',
          total: LNAT_SPEC.sectionA.passages,
          fresh: 0,
          fallback: 0,
          backgroundRemaining: LNAT_SPEC.sectionA.passages - FOREGROUND_PASSAGES,
          message: 'Waiting for the analyst',
        },
        freshPassageIds: [],
      }
      : bankBuilt
    checkpointRef.current = opening
    setMock(opening)
    void saveActiveMock(opening)
  }, [activeMock, aiStatus.available, loading, persist, saveActiveMock])

  useEffect(() => () => { generationCancelled.current = true }, [])

  /**
   * Write one passage set at a time. A slot the analyst cannot deliver is not
   * retried and does not stop the run: it is counted as a fallback and the bank
   * covers it, which is how SATLAS treats a rejected generation batch.
   */
  const generatePassages = useCallback(async (
    blueprints: ReturnType<typeof mockPassageBlueprints>,
    onProgress: (fresh: number, fallback: number, index: number) => void,
  ) => {
    const passages: Passage[] = []
    const questions: Question[] = []
    let fallback = 0
    for (const [index, blueprint] of blueprints.entries()) {
      if (generationCancelled.current) break
      try {
        const result = await preparePassageSet(blueprint, 'mock')
        passages.push(result.passage)
        questions.push(...result.questions)
      } catch {
        fallback += 1
      }
      onProgress(passages.length, fallback, index + 1)
    }
    return { passages, questions, fallback }
  }, [preparePassageSet])

  /**
   * Swap one freshly written passage set in for a bank passage the candidate has
   * not reached. The guards are strict on purpose: a swap must never disturb
   * recorded evidence or the 42-question blueprint, so a set is only exchanged
   * for a bank set of the same size with no answers against it and not currently
   * on screen. If nothing qualifies, the new set is simply kept in the store for
   * a later sitting rather than forced in.
   */
  const swapInPassage = useCallback((passage: Passage, questions: Question[]) => {
    updateMock((current) => {
      const freshIds = new Set(current.freshPassageIds ?? [])
      const displayed = current.questions[current.questionIndex]?.passageId
      const target = current.passages.find((candidate) => {
        if (freshIds.has(candidate.id) || candidate.id === displayed) return false
        const set = current.questions.filter((question) => question.passageId === candidate.id)
        if (set.length !== questions.length) return false
        return set.every((question) => current.answers[question.id] === undefined)
      })
      if (!target) return current

      let replaced = false
      const nextQuestions = current.questions.flatMap((question) => {
        if (question.passageId !== target.id) return [question]
        if (replaced) return []
        replaced = true
        return questions
      })
      return {
        ...current,
        passages: current.passages.map((item) => item.id === target.id ? passage : item),
        questions: nextQuestions,
        freshPassageIds: [...freshIds, passage.id],
      }
    })
  }, [updateMock])

  const backgroundTopUp = useCallback(async (blueprints: ReturnType<typeof mockPassageBlueprints>, seed: number) => {
    void seed
    let remaining = blueprints.length
    for (const blueprint of blueprints) {
      if (generationCancelled.current) break
      const stage = checkpointRef.current?.stage
      // Stop writing once the paper is over; nothing can use it.
      if (stage === 'complete' || stage === 'break' || stage === 'essay' || stage === 'essay-choice') break
      try {
        const result = await preparePassageSet(blueprint, 'mock')
        swapInPassage(result.passage, result.questions)
      } catch {
        // A background failure is invisible: the bank passage already in the
        // form stays exactly where it is.
      }
      remaining -= 1
      updateMock((current) => current.preparation
        ? { ...current, preparation: { ...current.preparation, backgroundRemaining: remaining } }
        : current)
    }
    updateMock((current) => current.preparation
      ? { ...current, preparation: { ...current.preparation, backgroundRemaining: 0 } }
      : current)
  }, [preparePassageSet, swapInPassage, updateMock])

  // Foreground preparation: enough of the form to start reading.
  useEffect(() => {
    if (!mock || mock.stage !== 'prepare' || mock.preparation?.status !== 'running') return
    if (backgroundStarted.current) return
    backgroundStarted.current = true
    let cancelled = false

    const run = async () => {
      const seed = Date.now()
      const plan = mockPassageBlueprints(seed)
      const { passages, questions, fallback } = await generatePassages(
        plan.slice(0, FOREGROUND_PASSAGES),
        (fresh, failed, index) => {
          if (cancelled) return
          updateMock((current) => ({
            ...current,
            preparation: {
              status: 'running',
              total: LNAT_SPEC.sectionA.passages,
              fresh,
              fallback: failed,
              backgroundRemaining: LNAT_SPEC.sectionA.passages - FOREGROUND_PASSAGES,
              message: index >= FOREGROUND_PASSAGES ? 'Assembling the form' : `Passage ${index + 1} of ${FOREGROUND_PASSAGES}`,
            },
          }))
        },
      )
      if (cancelled) return

      // Rebuild the form with what was written, letting the bank cover the rest.
      // The blueprint is never compromised: 12 passages and 42 questions either
      // way, only the provenance of each slot changes.
      let assembled: ActiveMockCheckpoint
      try {
        assembled = createCheckpoint(createMock(seed, { passages, questions }))
      } catch {
        assembled = createCheckpoint(createMock(seed))
      }
      const current = checkpointRef.current
      const freshIds = passages.map((passage) => passage.id).filter((id) => assembled.passages.some((item) => item.id === id))
      const next: ActiveMockCheckpoint = {
        ...assembled,
        // Keep the identity the store already knows about.
        id: current?.id ?? assembled.id,
        stage: 'intro',
        freshPassageIds: freshIds,
        preparation: {
          status: passages.length ? 'complete' : 'failed',
          total: LNAT_SPEC.sectionA.passages,
          fresh: freshIds.length,
          fallback,
          backgroundRemaining: LNAT_SPEC.sectionA.passages - FOREGROUND_PASSAGES,
          message: passages.length
            ? `${freshIds.length} passage${freshIds.length === 1 ? '' : 's'} written for this sitting`
            : 'The analyst could not write anything; the whole form comes from the bank',
        },
      }
      void persist(replaceMock(next))

      // Everything after the opening passages is written while the candidate
      // reads, and swapped in ahead of them.
      void backgroundTopUp(plan.slice(FOREGROUND_PASSAGES), seed)
    }

    void run()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mock?.stage, mock?.preparation?.status])

  // Checkpoint on a timer and on the way out, so a closed tab costs nothing.
  useEffect(() => {
    if (!mock?.id || mock.stage === 'complete') return
    const timer = window.setInterval(() => { void persist() }, 10_000)
    const onHide = () => { void persist() }
    window.addEventListener('pagehide', onHide)
    return () => { window.clearInterval(timer); window.removeEventListener('pagehide', onHide) }
  }, [mock?.id, mock?.stage, persist])

  useEffect(() => {
    if (!mock || !runsClock(mock.stage)) return
    const timer = window.setInterval(() => updateMock((current) => {
      const remaining = Math.max(0, current.remaining - 1)
      return { ...current, remaining, timeExpired: remaining === 0 ? true : current.timeExpired }
    }), 1000)
    return () => window.clearInterval(timer)
  }, [mock?.stage, mock?.id, updateMock])

  const location = useMemo(() => mock ? questionLocation(mock, mock.questionIndex) : null, [mock])
  const groups = useMemo(() => mock ? passageGroups(mock) : [], [mock])
  const answeredCount = mock ? Object.keys(mock.answers).length : 0

  const markQuestionTime = useCallback(() => {
    const current = checkpointRef.current
    const question = current?.questions[current.questionIndex]
    if (!current || !question) return
    const elapsed = Math.max(0, Date.now() - questionStarted.current)
    updateMock((state) => ({
      ...state,
      elapsedByQuestion: { ...state.elapsedByQuestion, [question.id]: (state.elapsedByQuestion[question.id] ?? 0) + elapsed },
    }))
    questionStarted.current = Date.now()
  }, [updateMock])

  const goTo = (index: number) => {
    if (!mock) return
    markQuestionTime()
    updateMock((current) => ({ ...current, questionIndex: Math.max(0, Math.min(current.questions.length - 1, index)) }))
    setNavigatorOpen(false)
  }

  const answer = (value: string) => {
    const question = location?.question
    if (!question) return
    updateMock((current) => ({ ...current, answers: { ...current.answers, [question.id]: value } }))
  }

  const setEliminated = (value: ChoiceId[]) => {
    const question = location?.question
    if (!question) return
    updateMock((current) => ({ ...current, eliminated: { ...current.eliminated, [question.id]: value } }))
  }

  const toggleFlag = () => {
    const question = location?.question
    if (!question) return
    updateMock((current) => ({
      ...current,
      flags: current.flags.includes(question.id) ? current.flags.filter((id) => id !== question.id) : [...current.flags, question.id],
    }))
  }

  /** Writing forty-two answers, the session, and the score happens in one step. */
  const finishSectionA = async () => {
    if (!mock || finishing) return
    setFinishing(true)
    markQuestionTime()
    const current = checkpointRef.current ?? mock
    try {
      const records = current.questions.map((question) => {
        const passage = current.passages.find((item) => item.id === question.passageId)
        const response = current.answers[question.id] ?? ''
        return {
          attempt: {
            id: crypto.randomUUID(),
            sessionId: current.id,
            questionId: question.id,
            passageId: question.passageId,
            section: 'section-a' as const,
            domain: question.domain,
            skillId: question.skillId,
            difficulty: question.difficulty,
            response,
            correct: isCorrectResponse(question, response),
            elapsedMs: Math.round(current.elapsedByQuestion[question.id] ?? 0),
            usedHint: false,
            eliminatedChoices: current.eliminated[question.id] ?? [],
            mistakeType: isCorrectResponse(question, response)
              ? undefined
              : response ? question.whyWrong?.[response as ChoiceId] ?? 'Reading or reasoning error' : 'Left unanswered',
            createdAt: new Date().toISOString(),
          } satisfies Attempt,
          question,
          passage,
        }
      })
      await recordAttempts(records)
      const score = rawScore(current.questions, current.answers)
      const session: SessionRecord = {
        id: current.id,
        type: 'mock',
        startedAt: current.startedAt || sessionStarted.current,
        completedAt: new Date().toISOString(),
        questionIds: current.questions.map((question) => question.id),
        passageIds: current.passages.map((passage) => passage.id),
        answers: current.answers,
        flags: current.flags,
        correct: score.correct,
        total: score.total,
        sectionAScore: score.correct,
        questionSources: Object.fromEntries(current.questions.map((question) => [question.id, question.source])),
        questionDifficulties: Object.fromEntries(current.questions.map((question) => [question.id, question.difficulty])),
        scoreReport: buildMockScoreReport({
          questions: current.questions,
          answers: current.answers,
          flags: current.flags,
          eliminated: current.eliminated,
          elapsedByQuestion: current.elapsedByQuestion,
        }),
      }
      await saveSession(session)
      setResult({ ...score, sessionId: current.id })
      replaceMock({ ...current, stage: 'break', remaining: 0, timeExpired: false })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The Section A result could not be saved.')
    } finally {
      setFinishing(false)
    }
  }

  const submitEssay = async () => {
    if (!mock?.essayPromptId) return
    const prompt = mock.prompts.find((item) => item.id === mock.essayPromptId)
    if (!prompt) return
    const id = crypto.randomUUID()
    const record: EssayRecord = {
      id,
      sessionId: mock.id,
      promptId: prompt.id,
      promptText: prompt.text,
      plan: mock.essayPlan,
      body: mock.essay.trim(),
      wordCount: wordCount(mock.essay),
      elapsedMs: (LNAT_SPEC.sectionB.seconds - mock.remaining) * 1000,
      createdAt: new Date().toISOString(),
    }
    await saveEssay(record)
    setSavedEssayId(id)
    replaceMock({ ...mock, stage: 'complete' })
    await saveActiveMock(null)
    if (aiStatus.available) {
      try { await requestEssayFeedback(id, prompt.pressurePoint) }
      catch (reason) { setError(reason instanceof Error ? reason.message : 'Essay feedback failed.') }
    }
  }

  const abandon = async () => {
    if (!confirm('Leave this mock? The checkpoint is kept, so you can resume where you stopped.')) return
    await persist()
    navigate('/mocks')
  }

  if (loading || !mock) {
    return <div className="app-loading" role="status"><div className="brand-mark">L</div><div className="loading-lines"><span /><span /><span /></div></div>
  }

  // ---------------------------------------------------------------- prepare
  if (mock.stage === 'prepare') {
    const preparation = mock.preparation
    const resolved = (preparation?.fresh ?? 0) + (preparation?.fallback ?? 0)
    const percent = Math.round(Math.min(1, resolved / FOREGROUND_PASSAGES) * 100)
    return (
      <div className="mock-frame intro">
        <section className="mock-intro" role="status" aria-live="polite">
          <div className="preparing-mark"><Sparkle size={17} weight="fill" /></div>
          <p className="eyebrow">Preparing your sitting</p>
          <h1>Writing a form for you.</h1>
          <p>
            The analyst is writing the opening passages against your current calibration, and independently solving every
            question on them before it reaches the paper. A passage set that does not survive that check is discarded, and
            the bank covers that slot instead.
          </p>
          <p>
            You can begin as soon as the first {FOREGROUND_PASSAGES} are ready. The remaining{' '}
            {LNAT_SPEC.sectionA.passages - FOREGROUND_PASSAGES} are written while you read and swapped in ahead of you, so
            nothing waits on the clock.
          </p>
          <div className="preparing-progress" aria-label={`${percent}% of the opening passages are ready`}>
            <div className="preparing-progress-heading">
              <strong>{percent}% ready</strong>
              <span>{resolved} of {FOREGROUND_PASSAGES} opening passages resolved</span>
            </div>
            <div className="preparing-progress-track"><i style={{ width: `${percent}%` }} /></div>
            <div className="preparing-progress-meta">
              <span>{preparation?.message ?? 'Waiting for the analyst'}</span>
              <span>{preparation?.fresh ?? 0} fresh · {preparation?.fallback ?? 0} from the bank</span>
            </div>
          </div>
          <div className="preparing-lines"><span /><span /><span /></div>
          <div className="button-row">
            <button
              className="ghost-button"
              onClick={() => {
                // Skipping is always allowed: the bank-built form underneath is
                // already a complete, valid paper.
                generationCancelled.current = true
                void persist(replaceMock({
                  ...mock,
                  stage: 'intro',
                  preparation: mock.preparation
                    ? { ...mock.preparation, status: 'complete', backgroundRemaining: 0, message: 'Preparation skipped; this form comes from the bank' }
                    : undefined,
                }))
              }}
            >
              Skip and use the authored bank
            </button>
            <button className="text-button" onClick={() => navigate('/mocks')}>Not now</button>
          </div>
        </section>
      </div>
    )
  }

  // ------------------------------------------------------------------ intro
  if (mock.stage === 'intro') {
    return (
      <div className="mock-frame intro">
        <section className="mock-intro">
          <p className="eyebrow">Full simulation</p>
          <h1>Ninety-five minutes, then forty.</h1>
          <p>
            Section A is {LNAT_SPEC.sectionA.questions} questions on {LNAT_SPEC.sectionA.passages} passages. You may move
            freely between them, flag anything you want to return to, and nothing is deducted for a wrong answer. When
            the clock stops, Section B gives you forty minutes and three questions, of which you answer one.
          </p>
          <div className="mock-blueprint" aria-label="Sitting structure">
            <div><span>Section A</span><strong>95 min</strong><small>42 questions · 12 passages</small></div>
            <i />
            <div><span>Section B</span><strong>40 min</strong><small>1 essay of 3 · 500–600 words</small></div>
          </div>
          <ul className="mock-rules">
            <li>Free navigation across the whole of Section A, exactly as on the day.</li>
            <li>Your progress is checkpointed every ten seconds; closing the tab costs you nothing but the seconds it was shut.</li>
            <li>The result is a raw mark out of 42. That is what the LNAT reports, and this app will not invent anything beyond it.</li>
          </ul>
          {mock.preparation && (
            <p className="mock-provenance">
              {mock.preparation.fresh
                ? <>
                  <strong>{mock.preparation.fresh} of the opening passages {mock.preparation.fresh === 1 ? 'was' : 'were'} written for this sitting</strong>
                  {mock.preparation.fallback > 0 && <> and {mock.preparation.fallback} came from the authored bank</>}
                  {mock.preparation.backgroundRemaining > 0 && <>. Another {mock.preparation.backgroundRemaining} {mock.preparation.backgroundRemaining === 1 ? 'is' : 'are'} being written while you read</>}
                  .
                </>
                : <><strong>This form comes entirely from the authored bank.</strong> Every item in it has still been checked and is passage-bound.</>}
            </p>
          )}
          <div className="button-row">
            <button className="primary-button" onClick={() => { questionStarted.current = Date.now(); void persist(replaceMock({ ...mock, stage: 'section-a', startedAt: new Date().toISOString() })) }}>
              Begin Section A <ArrowRight size={16} />
            </button>
            <button className="ghost-button" onClick={() => navigate('/mocks')}>Not now</button>
          </div>
        </section>
      </div>
    )
  }

  // -------------------------------------------------------------- section A
  if (mock.stage === 'section-a' || mock.stage === 'review') {
    const question = location?.question
    const passage = location?.passage
    const flagged = question ? mock.flags.includes(question.id) : false
    const unanswered = mock.questions.filter((item) => !mock.answers[item.id])

    if (mock.stage === 'review') {
      return (
        <div className="mock-frame">
          <header className="mock-bar">
            <span className="mock-label">Section A · review</span>
            <span className={`mock-clock ${mock.remaining < 300 ? 'urgent' : ''}`}><Clock size={15} weight="light" />{formatTime(mock.remaining)}</span>
            <button className="ghost-button" onClick={() => updateMock((current) => ({ ...current, stage: 'section-a' }))}>Back to questions</button>
          </header>
          <section className="mock-review">
            <h1>{unanswered.length ? `${unanswered.length} question${unanswered.length === 1 ? '' : 's'} unanswered` : 'Every question answered'}</h1>
            <p>
              Nothing is deducted for a wrong answer, so a guess is strictly better than a blank. Flagged questions are
              marked below.
            </p>
            <div className="review-grid">
              {groups.map((group) => (
                <div className="review-group" key={group.passage.id}>
                  <h3><span>{group.passageNumber}</span>{group.passage.title}</h3>
                  <div className="review-cells">
                    {group.indices.map((index) => {
                      const item = mock.questions[index]
                      const answered = Boolean(mock.answers[item.id])
                      return (
                        <button
                          key={item.id}
                          className={`review-cell ${answered ? 'answered' : 'blank'} ${mock.flags.includes(item.id) ? 'flagged' : ''}`}
                          onClick={() => { goTo(index); updateMock((current) => ({ ...current, stage: 'section-a' })) }}
                        >
                          {index + 1}
                          {mock.flags.includes(item.id) && <Flag size={9} weight="fill" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            {error && <p className="analysis-error">{error}</p>}
            <div className="button-row">
              <button className="primary-button" disabled={finishing} onClick={() => void finishSectionA()}>
                {finishing ? 'Saving your paper…' : 'Submit Section A'} <ArrowRight size={16} />
              </button>
              <button className="ghost-button" onClick={() => updateMock((current) => ({ ...current, stage: 'section-a' }))}>Keep working</button>
            </div>
          </section>
        </div>
      )
    }

    return (
      <div className="mock-frame">
        <header className="mock-bar">
          <span className="mock-label">Section A · question {mock.questionIndex + 1} of {mock.questions.length}</span>
          <div className="mock-progress"><i style={{ width: `${answeredCount / mock.questions.length * 100}%` }} /></div>
          <span className={`mock-clock ${mock.remaining < 300 ? 'urgent' : ''}`}><Clock size={15} weight="light" />{formatTime(mock.remaining)}</span>
          <button className={`mock-tool ${flagged ? 'active' : ''}`} aria-pressed={flagged} onClick={toggleFlag}>
            <Flag size={14} weight={flagged ? 'fill' : 'light'} />Flag
          </button>
          <button className="mock-tool" onClick={() => setNavigatorOpen((value) => !value)}><List size={14} weight="light" />Navigator</button>
          {(mock.preparation?.backgroundRemaining ?? 0) > 0 && (
            <span
              className="analyst-pill working"
              title="Later passages are still being written and will be swapped in before you reach them."
            >
              <i />{mock.preparation!.backgroundRemaining} being written
            </span>
          )}
          <button className="ghost-button" onClick={() => void abandon()}>Pause</button>
        </header>

        {mock.timeExpired && (
          <div className="mock-expired" role="alert">
            <Warning size={16} weight="fill" /> Section A time has run out. Submit now to see the paper as a reader would receive it.
            <button className="primary-button" disabled={finishing} onClick={() => void finishSectionA()}>Submit Section A</button>
          </div>
        )}

        <div className="reader-layout mock-reader">
          {passage && (
            <PassagePane
              passage={passage}
              index={location?.passageNumber}
              total={mock.passages.length}
              notes=""
              onNotes={() => undefined}
              highlights={[]}
              onHighlights={() => undefined}
            />
          )}
          <div className="question-column">
            {question && (
              <QuestionCard
                key={question.id}
                question={question}
                response={mock.answers[question.id] ?? ''}
                onResponse={answer}
                submitted={false}
                showConfidence={false}
                showMeta={false}
                eliminated={mock.eliminated[question.id] ?? []}
                onEliminated={setEliminated}
              />
            )}
            <footer className="question-actions mock-actions">
              <button className="secondary-button" disabled={mock.questionIndex === 0} onClick={() => goTo(mock.questionIndex - 1)}>
                <ArrowLeft size={15} /> Previous
              </button>
              {mock.questionIndex + 1 < mock.questions.length ? (
                <button className="primary-button" onClick={() => goTo(mock.questionIndex + 1)}>Next <ArrowRight size={15} /></button>
              ) : (
                <button className="primary-button" onClick={() => { markQuestionTime(); updateMock((current) => ({ ...current, stage: 'review' })) }}>
                  Review and submit <ArrowRight size={15} />
                </button>
              )}
              <button className="text-button" onClick={() => { markQuestionTime(); updateMock((current) => ({ ...current, stage: 'review' })) }}>
                Review all
              </button>
            </footer>
          </div>
        </div>

        {navigatorOpen && (
          <div className="navigator-sheet" role="dialog" aria-label="Question navigator">
            <header>
              <strong>{answeredCount} of {mock.questions.length} answered</strong>
              <button className="icon-button" aria-label="Close the navigator" onClick={() => setNavigatorOpen(false)}><X size={15} /></button>
            </header>
            <div className="review-grid">
              {groups.map((group) => (
                <div className="review-group" key={group.passage.id}>
                  <h3><span>{group.passageNumber}</span>{group.passage.title}</h3>
                  <div className="review-cells">
                    {group.indices.map((index) => {
                      const item = mock.questions[index]
                      return (
                        <button
                          key={item.id}
                          className={`review-cell ${mock.answers[item.id] ? 'answered' : 'blank'} ${mock.flags.includes(item.id) ? 'flagged' : ''} ${index === mock.questionIndex ? 'current' : ''}`}
                          onClick={() => goTo(index)}
                        >
                          {index + 1}
                          {mock.flags.includes(item.id) && <Flag size={9} weight="fill" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ------------------------------------------------------------------ break
  if (mock.stage === 'break') {
    const scoreReport = mock.scoreReport
    return (
      <div className="mock-frame intro">
        <section className="mock-intro">
          <p className="eyebrow">Section A complete</p>
          <h1>{result ? `${result.correct} / ${result.total}` : 'Saved'}</h1>
          {scoreReport && (
            <div className="mock-training-report">
              <p className="score-band"><strong>{scoreReport.band.label}.</strong> {scoreReport.band.note}</p>
              <div className="report-metric-grid">
                <span><small>Average decision</small><strong>{scoreReport.averageSeconds}s</strong></span>
                <span><small>Blanks</small><strong>{scoreReport.unanswered}</strong></span>
                <span><small>PoE used</small><strong>{scoreReport.poeUsedQuestions}/{result?.total ?? 42}</strong></span>
              </div>
              <ol className="training-plan">
                {scoreReport.trainingPlan.map((item) => (
                  <li key={item.title}><strong>{item.title}</strong><span>{item.reason}</span><p>{item.action}</p></li>
                ))}
              </ol>
            </div>
          )}
          <p>
            That is a raw mark and nothing more. The LNAT publishes no conversion beyond it, so this app will not invent
            a scaled score, a percentile, or a prediction about an offer.
          </p>
          <p>
            Section B is next: forty minutes, three questions, and you answer one. On the day you would go straight into
            it. Take the break if you need it — the clock for Section B does not start until you begin.
          </p>
          <div className="button-row">
            <button className="primary-button" onClick={() => void persist(replaceMock({ ...mock, stage: 'essay-choice', remaining: LNAT_SPEC.sectionB.seconds }))}>
              Continue to Section B <ArrowRight size={16} />
            </button>
            <button className="ghost-button" onClick={() => { void saveActiveMock(null); navigate('/mocks') }}>Stop here — Section A only</button>
          </div>
        </section>
      </div>
    )
  }

  // -------------------------------------------------------------- section B
  if (mock.stage === 'essay-choice' || mock.stage === 'essay') {
    const started = mock.stage === 'essay'
    return (
      <div className="mock-frame">
        <header className="mock-bar">
          <span className="mock-label">Section B · essay</span>
          {started && <span className={`mock-clock ${mock.remaining < 300 ? 'urgent' : ''}`}><Clock size={15} weight="light" />{formatTime(mock.remaining)}</span>}
          {!started && <span className="mock-label">The clock starts when you begin</span>}
          <button className="ghost-button" onClick={() => void abandon()}>Pause</button>
        </header>

        {mock.timeExpired && started && (
          <div className="mock-expired" role="alert">
            <Warning size={16} weight="fill" /> Time is up. Submit the essay as it stands, which is what a reader would receive.
          </div>
        )}

        <div className="mock-essay-frame">
          <EssayComposer
            prompts={mock.prompts}
            selectedPromptId={mock.essayPromptId}
            onSelectPrompt={(id) => updateMock((current) => ({ ...current, essayPromptId: id }))}
            plan={mock.essayPlan}
            onPlan={(value) => updateMock((current) => ({ ...current, essayPlan: value }))}
            body={mock.essay}
            onBody={(value) => updateMock((current) => ({ ...current, essay: value.split(/\s+/).length > LNAT_SPEC.sectionB.wordLimit + 40 ? current.essay : value }))}
            remainingLabel={started ? formatTime(mock.remaining) : undefined}
            disabled={!started}
          />
          <footer className="question-actions essay-actions">
            {!started ? (
              <button className="primary-button" disabled={!mock.essayPromptId} onClick={() => void persist(replaceMock({ ...mock, stage: 'essay', timeExpired: false }))}>
                Start the forty minutes <ArrowRight size={16} />
              </button>
            ) : (
              <button className="primary-button" disabled={wordCount(mock.essay) < 80} onClick={() => void submitEssay()}>
                Submit essay <ArrowRight size={16} />
              </button>
            )}
            <span className="hint-label">
              {!mock.essayPromptId
                ? 'Choose one of the three.'
                : !started ? 'You may change question after starting, but the clock will not restart.'
                  : wordCount(mock.essay) < 80 ? 'At least eighty words.' : 'The guidance is 500 to 600 words.'}
            </span>
          </footer>
        </div>
      </div>
    )
  }

  // --------------------------------------------------------------- complete
  const essay = savedEssayId ? essays.find((item) => item.id === savedEssayId) : undefined
  const assessment = result ? mockAssessments.find((item) => item.sessionId === result.sessionId) : undefined
  const scoreReport = mock.scoreReport
  return (
    <div className="mock-frame intro">
      <section className="mock-intro">
        <CheckCircle size={30} weight="fill" />
        <p className="eyebrow">Sitting complete</p>
        <h1>{result ? `${result.correct} / 42` : 'Saved'}</h1>
        {result && scoreReport && (
          <>
            <p className="score-band"><strong>{scoreReport.band.label}.</strong> {scoreReport.band.note}</p>
            <div className="training-plan">
              {scoreReport.trainingPlan.map((item) => (
                <article key={item.title}><strong>{item.title}</strong><p>{item.action}</p></article>
              ))}
            </div>
          </>
        )}
        {assessment && (
          <p className="mock-assessment-rationale">
            <strong>Expected beforehand: {assessment.expectedScore}.</strong> {assessment.rationale}
          </p>
        )}
        <p>
          Both sections are on your record. The essay is stored exactly as you wrote it, with formative feedback if an
          analyst is configured — never a mark, because the LNAT does not award one.
        </p>
        {error && <p className="analysis-error">{error}</p>}
        {essay?.feedback && (
          <div className="criteria-grid">
            {essay.feedback.criteria.map((criterion) => (
              <article key={criterion.name} className={`criterion ${criterion.level}`}>
                <header><strong>{criterion.name}</strong><em>{criterion.level}</em></header>
                <p>{criterion.feedback}</p>
              </article>
            ))}
          </div>
        )}
        <div className="button-row">
          <button className="primary-button" onClick={() => navigate('/insights')}>See what changed <ArrowRight size={16} /></button>
          <button className="ghost-button" onClick={() => navigate('/mocks')}>Back to mocks</button>
        </div>
      </section>
    </div>
  )
}
