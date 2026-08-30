import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'wouter'
import { ArrowRight, BookOpen, Brain, CheckCircle, Clock, Repeat, Sparkle, XCircle } from '@phosphor-icons/react'
import { curriculum, domains, skillById } from '../data/curriculum'
import { passages as authoredPassages } from '../data/passages'
import { questionBank } from '../data/questionBank'
import { expansionPassages, expansionQuestions } from '../data/bankExpansion'
import { paperTargetDifficulty, planQuestionBlueprint, rankPassages } from '../engine/adaptive'
import { isCorrectResponse, sanitizePassage } from '../engine/questions'
import { DifficultyScalePicker, DifficultyStars, difficultyLabel } from '../components/DifficultyStars'
import { PassagePane } from '../components/PassagePane'
import { QuestionCard } from '../components/QuestionCard'
import { useAppState } from '../state/AppState'
import type { Attempt, ChoiceId, Confidence, Difficulty, Passage, Question, SessionRecord } from '../types'

type QuestionSource = 'fresh' | 'authored'

export function PracticePage() {
  const {
    stateMap, attempts, recordAttempt, analyzeAttempt, saveSession, preparePassageSet,
    generatedPassages, generatedQuestions, learnerModel, analyses, aiStatus, settings,
  } = useAppState()

  const params = new URLSearchParams(window.location.search)
  const diagnostic = params.get('mode') === 'diagnostic'
  const reviewOnly = params.get('mode') === 'review'
  const skillFromUrl = params.get('skill') ?? undefined

  const [started, setStarted] = useState(diagnostic || reviewOnly)
  const [passageCount, setPassageCount] = useState(diagnostic ? 3 : 2)
  // Fresh by default wherever an analyst is configured: a set written against
  // the candidate's own calibration is the point of connecting one at all. The
  // toggle falls back to the bank on its own when none is available.
  const [questionSource, setQuestionSource] = useState<QuestionSource>('fresh')
  const [difficultyOverride, setDifficultyOverride] = useState<Difficulty | 'adaptive'>('adaptive')
  const [drillSkillId, setDrillSkillId] = useState<string | undefined>(skillFromUrl)
  const drillSkill = drillSkillId ? skillById.get(drillSkillId) : undefined

  const [preparing, setPreparing] = useState(false)
  const [preparationNotice, setPreparationNotice] = useState('')
  const [preparationProgress, setPreparationProgress] = useState({ ready: 0, total: 0, fresh: 0, fallback: 0 })

  const [plan, setPlan] = useState<Array<{ passage: Passage; questions: Question[] }>>([])
  const [passageIndex, setPassageIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [response, setResponse] = useState('')
  const [confidence, setConfidence] = useState<Confidence>()
  const [submitted, setSubmitted] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [correctCount, setCorrectCount] = useState(0)
  const [complete, setComplete] = useState(false)
  const [currentAttemptId, setCurrentAttemptId] = useState<string>()
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [highlights, setHighlights] = useState<Record<string, string[]>>({})
  const [eliminated, setEliminated] = useState<Record<string, ChoiceId[]>>({})

  const sessionId = useRef(crypto.randomUUID())
  const sessionStarted = useRef(new Date().toISOString())
  const questionStarted = useRef(Date.now())
  const passageOpened = useRef(Date.now())
  const passageReadLogged = useRef<Set<string>>(new Set())

  const pool = useMemo(() => {
    const allPassages = [...authoredPassages, ...expansionPassages, ...generatedPassages].map(sanitizePassage)
    const allQuestions = [...questionBank, ...expansionQuestions, ...generatedQuestions]
    const byPassage = new Map<string, Question[]>()
    for (const question of allQuestions) {
      if (!byPassage.has(question.passageId)) byPassage.set(question.passageId, [])
      byPassage.get(question.passageId)!.push(question)
    }
    return { allPassages, allQuestions, byPassage }
  }, [generatedPassages, generatedQuestions])

  const paperTarget = useMemo(() => paperTargetDifficulty(attempts), [attempts])
  const target: Difficulty = difficultyOverride === 'adaptive' ? paperTarget : difficultyOverride

  const buildAuthoredPlan = () => {
    const seenQuestionIds = new Set(attempts.map((attempt) => attempt.questionId))
    const ranked = rankPassages(
      pool.allPassages, pool.byPassage, stateMap, seenQuestionIds, new Set(),
      learnerModel.skillDirectives, target,
    )
    // A skill drill only makes sense on passages that actually carry that skill.
    const eligible = drillSkill
      ? ranked.filter((passage) => (pool.byPassage.get(passage.id) ?? []).some((question) => question.skillId === drillSkill.id))
      : ranked
    return (eligible.length ? eligible : ranked).slice(0, passageCount).map((passage) => {
      let questions = pool.byPassage.get(passage.id) ?? []
      if (drillSkill) {
        const matching = questions.filter((question) => question.skillId === drillSkill.id)
        if (matching.length) questions = matching
      }
      if (difficultyOverride !== 'adaptive') {
        const exact = questions.filter((question) => question.difficulty === difficultyOverride)
        if (exact.length) questions = exact
      }
      return { passage, questions }
    }).filter((entry) => entry.questions.length > 0)
  }

  const begin = async () => {
    setPreparationNotice('')
    if (questionSource === 'fresh' && aiStatus.available) {
      setPreparing(true)
      setPreparationProgress({ ready: 0, total: passageCount, fresh: 0, fallback: 0 })
      const prepared: Array<{ passage: Passage; questions: Question[] }> = []
      const seenQuestionIds = new Set(attempts.map((attempt) => attempt.questionId))
      const themes = ['law-and-ethics', 'politics-and-society', 'science-and-technology', 'philosophy', 'media', 'economics'] as const
      let failed = 0
      try {
        for (let index = 0; index < passageCount; index += 1) {
          const slots = drillSkill
            ? Array.from({ length: 4 }, () => ({ domain: drillSkill.domain, skillId: drillSkill.id, difficulty: target }))
            : planQuestionBlueprint(pool.allQuestions, 4, stateMap, seenQuestionIds, learnerModel.skillDirectives, target)
          try {
            const result = await preparePassageSet({
              theme: themes[(index + Math.floor(Math.random() * themes.length)) % themes.length],
              register: index % 4 === 3 ? 'multi-extract' : 'argumentative-essay',
              questions: slots.slice(0, 4),
            })
            prepared.push({ passage: sanitizePassage(result.passage), questions: result.questions })
          } catch {
            // A failed passage falls back to the authored bank rather than
            // blocking the whole set on one model timeout.
            failed += 1
          }
          setPreparationProgress({ ready: index + 1, total: passageCount, fresh: prepared.length, fallback: failed })
        }
        if (prepared.length < passageCount) {
          const written = prepared.length
          const fallback = buildAuthoredPlan().filter((entry) => !prepared.some((item) => item.passage.id === entry.passage.id))
          prepared.push(...fallback.slice(0, passageCount - written))
          setPreparationNotice(written
            ? `${written} of ${passageCount} passages were written for you. The remaining ${prepared.length - written} come from the authored bank.`
            : 'No passage could be written just now, so the whole set comes from the authored bank. Every item in it is still checked and passage-bound.')
        }
      } finally {
        setPreparing(false)
      }
      startWith(prepared.length ? prepared : buildAuthoredPlan())
      return
    }
    startWith(buildAuthoredPlan())
  }

  const startWith = (next: Array<{ passage: Passage; questions: Question[] }>) => {
    setPlan(next)
    setPassageIndex(0)
    setQuestionIndex(0)
    setStarted(true)
    resetQuestionState()
    passageOpened.current = Date.now()
  }

  const resetQuestionState = () => {
    setResponse('')
    setConfidence(undefined)
    setSubmitted(false)
    setCurrentAttemptId(undefined)
    if (current) setEliminated((items) => ({ ...items, [current.id]: [] }))
    setElapsedSeconds(0)
    questionStarted.current = Date.now()
  }

  useEffect(() => {
    if (started && !plan.length && !complete) startWith(buildAuthoredPlan())
    // Seed the auto-started diagnostic and review modes exactly once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started])

  const entry = plan[passageIndex]
  const current = entry?.questions[questionIndex]
  const totalQuestions = plan.reduce((sum, item) => sum + item.questions.length, 0)
  const answeredCount = Object.keys(answers).length

  useEffect(() => {
    if (!current || submitted || complete) return
    setElapsedSeconds(Math.floor((Date.now() - questionStarted.current) / 1000))
    const timer = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - questionStarted.current) / 1000)), 1000)
    return () => window.clearInterval(timer)
  }, [current, submitted, complete])

  const submit = async () => {
    if (!current || !entry || !response.trim()) return
    const correct = isCorrectResponse(current, response)
    const id = crypto.randomUUID()
    // Reading time is charged once, to the first question of a passage, so the
    // pace figure reflects reading rather than deliberation.
    const firstOfPassage = !passageReadLogged.current.has(entry.passage.id)
    if (firstOfPassage) passageReadLogged.current.add(entry.passage.id)

    const attempt: Attempt = {
      id,
      sessionId: sessionId.current,
      questionId: current.id,
      passageId: current.passageId,
      section: 'section-a',
      domain: current.domain,
      skillId: current.skillId,
      difficulty: current.difficulty,
      response,
      correct,
      confidence,
      elapsedMs: Date.now() - questionStarted.current,
      eliminatedChoices: eliminated[current.id] ?? [],
      ...(firstOfPassage ? { passageReadMs: Math.max(0, questionStarted.current - passageOpened.current) } : {}),
      usedHint: false,
      mistakeType: correct ? undefined : current.whyWrong?.[response as 'a'] ?? 'Reading or reasoning error',
      createdAt: new Date().toISOString(),
    }
    await recordAttempt(attempt, current, entry.passage)
    setCurrentAttemptId(id)
    setSubmitted(true)
    setAnswers((items) => ({ ...items, [current.id]: response }))
    if (correct) setCorrectCount((value) => value + 1)
  }

  const advance = async () => {
    if (!entry) return
    if (questionIndex + 1 < entry.questions.length) {
      setQuestionIndex((value) => value + 1)
      resetQuestionState()
      return
    }
    if (passageIndex + 1 < plan.length) {
      setPassageIndex((value) => value + 1)
      setQuestionIndex(0)
      resetQuestionState()
      passageOpened.current = Date.now()
      return
    }
    const session: SessionRecord = {
      id: sessionId.current,
      type: diagnostic ? 'diagnostic' : reviewOnly ? 'review' : 'adaptive',
      startedAt: sessionStarted.current,
      completedAt: new Date().toISOString(),
      questionIds: plan.flatMap((item) => item.questions.map((question) => question.id)),
      passageIds: plan.map((item) => item.passage.id),
      answers,
      flags: [],
      correct: correctCount,
      total: totalQuestions,
    }
    await saveSession(session)
    setComplete(true)
  }

  const restart = () => {
    sessionId.current = crypto.randomUUID()
    sessionStarted.current = new Date().toISOString()
    passageReadLogged.current = new Set()
    setPlan([]); setAnswers({}); setCorrectCount(0); setComplete(false); setStarted(false)
    setPassageIndex(0); setQuestionIndex(0); setNotes({}); setHighlights({}); setPreparationNotice('')
    resetQuestionState()
  }

  if (preparing) {
    const percent = preparationProgress.total ? Math.round(preparationProgress.ready / preparationProgress.total * 100) : 0
    return (
      <section className="set-preparing" role="status" aria-live="polite">
        <div className="preparing-mark"><Sparkle size={17} weight="fill" /></div>
        <p className="eyebrow">Preparing your set</p>
        <h1>Writing fresh passages.</h1>
        <p>
          Each passage is written to your current calibration, then every question on it is independently solved before
          it reaches you. A passage whose set does not survive that check is discarded, not patched.
        </p>
        <div className="preparing-progress" aria-label={`${percent}% ready`}>
          <div className="preparing-progress-heading">
            <strong>{percent}% ready</strong>
            <span>{preparationProgress.ready} of {preparationProgress.total} passages resolved</span>
          </div>
          <div className="preparing-progress-track"><i style={{ width: `${percent}%` }} /></div>
          <div className="preparing-progress-meta">
            <span>{preparationProgress.ready >= preparationProgress.total ? 'Assembling the set' : `Passage ${preparationProgress.ready + 1} of ${preparationProgress.total}`}</span>
            <span>{preparationProgress.fresh} fresh · {preparationProgress.fallback} from the bank</span>
          </div>
        </div>
        <div className="preparing-lines"><span /><span /><span /></div>
      </section>
    )
  }

  if (!started) {
    return (
      <div className="practice-setup">
        <header className="page-heading">
          <div>
            <p className="eyebrow">Adaptive practice</p>
            <h1>Read closely, at the edge of your ability.</h1>
            <p>Passages come with their whole question set, exactly as they do on the day. The reading is the work.</p>
          </div>
          <span className={`analyst-pill ${aiStatus.state}`}><i />{aiStatus.available ? 'Analyst available' : 'Calibration only'}</span>
        </header>

        <section className="setup-panel">
          <div className="setup-row">
            <span>Passages</span>
            <div className="segmented">
              {[1, 2, 3, 4].map((value) => (
                <button key={value} className={passageCount === value ? 'active' : ''} onClick={() => setPassageCount(value)}>{value}</button>
              ))}
            </div>
          </div>
          <div className="setup-row">
            <span>Skill drill</span>
            <select className="topic-select" value={drillSkillId ?? ''} onChange={(event) => setDrillSkillId(event.target.value || undefined)}>
              <option value="">All skills — follow the analyst</option>
              {domains.filter((domain) => domain.section === 'section-a').map((domain) => (
                <optgroup key={domain.id} label={domain.title}>
                  {curriculum.filter((skill) => skill.domain === domain.id).map((skill) => (
                    <option key={skill.id} value={skill.id}>{skill.title}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="setup-row">
            <span>Difficulty</span>
            <DifficultyScalePicker value={difficultyOverride} onChange={setDifficultyOverride} />
          </div>
          <div className="setup-row">
            <span>Passage source</span>
            <div className="segmented">
              <button className={questionSource === 'authored' ? 'active' : ''} onClick={() => setQuestionSource('authored')}>Authored · instant</button>
              <button className={questionSource === 'fresh' ? 'active' : ''} disabled={!aiStatus.available} onClick={() => setQuestionSource('fresh')}>Fresh · written for you</button>
            </div>
          </div>

          <div className="setup-intelligence">
            <Brain size={18} />
            <div>
              <strong>
                {passageCount} passage{passageCount === 1 ? '' : 's'}
                {drillSkill ? ` · ${drillSkill.title} only` : ''}
                {' · about '}{Math.round(passageCount * 7.5)} minutes at test pace
              </strong>
              <p>
                {drillSkill
                  ? <>Every question shown will test {drillSkill.title}, at {difficultyOverride === 'adaptive' ? `your current ${difficultyLabel(target)} target` : difficultyLabel(difficultyOverride)}. Passages are chosen for having that skill on them.</>
                  : difficultyOverride === 'adaptive'
                    ? <>Current target: {difficultyLabel(target)}. Skill evidence and analyst directives choose which passages come up.</>
                    : <>Fixed at {difficultyLabel(difficultyOverride)} for every question. Calibration keeps recording, but the level will not move.</>}
              </p>
            </div>
          </div>

          <button className="primary-button" onClick={() => void begin()}>Start set <ArrowRight size={16} /></button>
        </section>

        <div className="practice-principles">
          <span><Clock size={15} /> Reading pace is recorded separately from answering</span>
          <span><Repeat size={15} /> Misses come back on the review queue</span>
          <span><BookOpen size={15} /> Nothing is deducted for a wrong answer — never leave a blank</span>
        </div>
      </div>
    )
  }

  if (complete) {
    const accuracy = totalQuestions ? Math.round(correctCount / totalQuestions * 100) : 0
    return (
      <section className="session-summary">
        <CheckCircle size={28} weight="fill" />
        <p className="eyebrow">Set complete</p>
        <h1>{accuracy}%</h1>
        <p>
          {correctCount} of {totalQuestions} correct across {plan.length} passage{plan.length === 1 ? '' : 's'}. Your
          calibration is updated.{aiStatus.available ? ' A set review is being written.' : ' The set is saved to your record.'}
        </p>
        <div className="button-row">
          <button className="primary-button" onClick={restart}>Practise again</button>
          <Link className="quiet-link" href="/insights">See your insights</Link>
        </div>
      </section>
    )
  }

  if (!entry || !current) return null

  const analysis = currentAttemptId ? analyses.find((item) => item.attemptId === currentAttemptId) : undefined
  const timeLabel = `${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, '0')}`
  const overTime = elapsedSeconds > current.estimatedSeconds

  return (
    <div className="practice-runner">
      <header className="runner-header">
        <div>
          <span>Passage {passageIndex + 1} of {plan.length}<DifficultyStars difficulty={current.difficulty} size={7} showLabel={false} /></span>
          <strong>Question {questionIndex + 1} of {entry.questions.length}</strong>
        </div>
        <div className="inline-progress"><i style={{ width: `${answeredCount / Math.max(1, totalQuestions) * 100}%` }} /></div>
        <div className={`question-timer ${overTime ? 'over' : ''}`}>
          <Clock size={17} weight="duotone" />
          <span><small>On this question</small><strong>{timeLabel}</strong></span>
          <em>target {current.estimatedSeconds}s</em>
        </div>
        <button className="ghost-button" onClick={() => { if (confirm('End this set? Everything you have answered is already on disk.')) setComplete(true) }}>End</button>
      </header>

      {preparationNotice && <div className="practice-notice" role="status">{preparationNotice}</div>}
      {settings.dailyMinutes > 0 && questionIndex === 0 && !submitted && (
        <p className="reading-hint">Read it once at speed, then again with the questions in mind. On the day you have about eight minutes per passage including its whole set.</p>
      )}

      <div className="reader-layout">
        <PassagePane
          passage={entry.passage}
          index={passageIndex + 1}
          total={plan.length}
          notes={notes[entry.passage.id] ?? ''}
          onNotes={(value) => setNotes((items) => ({ ...items, [entry.passage.id]: value }))}
          highlights={highlights[entry.passage.id] ?? []}
          onHighlights={(value) => setHighlights((items) => ({ ...items, [entry.passage.id]: value }))}
        />
        <div className="question-column">
          <QuestionCard
            key={current.id}
            question={current}
            response={response}
            onResponse={setResponse}
            confidence={confidence}
            onConfidence={setConfidence}
            submitted={submitted}
            analysis={analysis}
            aiAvailable={aiStatus.available}
            onAnalyzeRequest={currentAttemptId ? (justification) => analyzeAttempt(currentAttemptId, justification).then(() => undefined) : undefined}
            eliminated={eliminated[current.id] ?? []}
            onEliminated={(value) => setEliminated((items) => ({ ...items, [current.id]: value }))}
          />
          <footer className="question-actions">
            {!submitted ? (
              <button className="primary-button" disabled={!response.trim()} onClick={() => void submit()}>Check answer <ArrowRight size={16} /></button>
            ) : (
              <button className="primary-button" onClick={() => void advance()}>
                {passageIndex + 1 >= plan.length && questionIndex + 1 >= entry.questions.length
                  ? 'Finish set'
                  : questionIndex + 1 >= entry.questions.length ? 'Next passage' : 'Next question'} <ArrowRight size={16} />
              </button>
            )}
            {submitted && (
              <span className={isCorrectResponse(current, response) ? 'correct-label' : 'incorrect-label'}>
                {isCorrectResponse(current, response) ? <CheckCircle size={15} /> : <XCircle size={15} />}
                {isCorrectResponse(current, response) ? 'Correct' : 'Read the diagnosis, then move on'}
              </span>
            )}
          </footer>
        </div>
      </div>
    </div>
  )
}
