import { useState } from 'react'
import { ArrowRight, Brain, CheckCircle, Lightbulb, X, XCircle } from '@phosphor-icons/react'
import { Link } from 'wouter'
import { domainById, skillById } from '../data/curriculum'
import { displayAnswer, isCorrectResponse } from '../engine/questions'
import { DifficultyStars } from './DifficultyStars'
import type { AttemptAnalysis, ChoiceId, Confidence, Question } from '../types'

interface Props {
  question: Question
  response: string
  onResponse: (value: string) => void
  confidence?: Confidence
  onConfidence?: (value?: Confidence) => void
  submitted: boolean
  analysis?: AttemptAnalysis
  aiAvailable?: boolean
  onAnalyzeRequest?: (justification: string) => Promise<void>
  compact?: boolean
  showConfidence?: boolean
  showMeta?: boolean
  /** Elimination state, lifted when a mock has to persist it across a pause. */
  eliminated?: ChoiceId[]
  onEliminated?: (value: ChoiceId[]) => void
}

export function QuestionCard({
  question, response, onResponse, confidence, onConfidence, submitted, analysis,
  aiAvailable = false, onAnalyzeRequest, compact = false, showConfidence = true, showMeta = true,
  eliminated, onEliminated,
}: Props) {
  const correct = submitted && isCorrectResponse(question, response)
  const selectedTrap = question.whyWrong?.[response as ChoiceId]
  const [analysisOpen, setAnalysisOpen] = useState(false)
  const [justification, setJustification] = useState('')
  const [analysisPending, setAnalysisPending] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const [poeOpen, setPoeOpen] = useState(false)
  const [localEliminated, setLocalEliminated] = useState<ChoiceId[]>([])

  const crossed = eliminated ?? localEliminated
  const setCrossed = onEliminated ?? setLocalEliminated

  const requestAnalysis = async () => {
    if (!onAnalyzeRequest || justification.trim().length < 8) return
    setAnalysisPending(true)
    setAnalysisError('')
    try { await onAnalyzeRequest(justification.trim()) }
    catch (error) { setAnalysisError(error instanceof Error ? error.message : 'The reasoning review failed.') }
    finally { setAnalysisPending(false) }
  }

  const toggleEliminated = (choiceId: ChoiceId) => {
    if (submitted) return
    setCrossed(crossed.includes(choiceId) ? crossed.filter((id) => id !== choiceId) : [...crossed, choiceId])
    if (response === choiceId) onResponse('')
  }

  return (
    <article className={`question-card ${compact ? 'compact' : ''}`}>
      {showMeta && (
        <header className="question-meta">
          <span>{domainById.get(question.domain)?.shortTitle}</span>
          <span>{skillById.get(question.skillId)?.shortTitle}</span>
          <DifficultyStars difficulty={question.difficulty} />
        </header>
      )}

      <h2 className="question-prompt">{question.prompt}</h2>

      <div className="choice-area">
        {!submitted && (
          <div className="choice-tools">
            <button
              type="button"
              className={`poe-button ${poeOpen ? 'active' : ''}`}
              aria-pressed={poeOpen}
              onClick={() => setPoeOpen((value) => !value)}
            >
              <X size={13} weight="bold" />{poeOpen ? 'Elimination on' : 'Process of elimination'}
            </button>
            <small>
              {poeOpen
                ? 'Cross out an option to take it off the table. Cross it again to restore it.'
                : 'The official advice is to eliminate first. Nothing is deducted for a wrong answer, so never leave a blank.'}
            </small>
          </div>
        )}

        <div className="choice-list" role="radiogroup" aria-label="Answer choices">
          {question.choices.map((choice) => {
            const selected = response === choice.id
            const isAnswer = submitted && choice.id === question.answer
            const isWrong = submitted && selected && choice.id !== question.answer
            const isCrossed = crossed.includes(choice.id)
            return (
              <div className="choice-row" key={choice.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={submitted || isCrossed}
                  className={`choice ${selected ? 'selected' : ''} ${isAnswer ? 'correct' : ''} ${isWrong ? 'wrong' : ''} ${isCrossed ? 'eliminated' : ''}`}
                  onClick={() => onResponse(choice.id)}
                >
                  <span>{choice.id}</span>
                  <p>{choice.text}</p>
                  {isAnswer && <CheckCircle size={18} weight="fill" />}
                  {isWrong && <XCircle size={18} weight="fill" />}
                  {isCrossed && <X size={16} weight="bold" />}
                </button>
                {!submitted && poeOpen && (
                  <button
                    type="button"
                    className={`choice-poe ${isCrossed ? 'active' : ''}`}
                    aria-label={`${isCrossed ? 'Restore' : 'Eliminate'} option ${choice.id}`}
                    aria-pressed={isCrossed}
                    onClick={() => toggleEliminated(choice.id)}
                  >
                    <X size={12} weight="bold" /><span>{isCrossed ? 'Restore' : 'Cross out'}</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {!submitted && showConfidence && onConfidence && (
        <fieldset className="confidence-picker">
          <legend><span>Confidence</span><small>Optional. It weights the evidence only if you set it.</small></legend>
          {([
            ['guess', 'Pure guess'],
            ['low', 'Low'],
            ['medium', 'Even'],
            ['high', 'High'],
            ['certain', 'Certain'],
          ] as Array<[Confidence, string]>).map(([value, label]) => (
            <button
              type="button"
              key={value}
              aria-pressed={confidence === value}
              className={confidence === value ? 'active' : ''}
              onClick={() => onConfidence(confidence === value ? undefined : value)}
            >
              {label}
            </button>
          ))}
          {confidence && <button type="button" className="confidence-clear" onClick={() => onConfidence(undefined)}>Clear</button>}
        </fieldset>
      )}

      {submitted && (
        <section className={`answer-feedback ${correct ? 'success' : 'error'}`} aria-live="polite">
          <div className="feedback-title">
            {correct ? <CheckCircle size={21} weight="fill" /> : <Lightbulb size={21} weight="fill" />}
            <div>
              <span>{correct ? 'That is the one' : 'Reset the reading'}</span>
              <strong>{correct ? 'Your reasoning landed.' : `Correct answer: ${displayAnswer(question)}`}</strong>
            </div>
          </div>
          {!correct && selectedTrap && <p className="trap-callout"><b>Why ({response}) tempts:</b> {selectedTrap}</p>}
          <p>{question.explanation}</p>
          <div className="concept-reset">
            <span>The transferable rule</span>
            <p>{question.concept}</p>
            <Link href={`/learn?skill=${question.skillId}`}>Open the full lesson</Link>
          </div>
          <details className="all-distractors">
            <summary>Why each of the others fails</summary>
            <ul>
              {question.choices.filter((choice) => choice.id !== question.answer).map((choice) => (
                <li key={choice.id}><b>({choice.id})</b> {question.whyWrong?.[choice.id] ?? 'No diagnosis was recorded for this option.'}</li>
              ))}
            </ul>
          </details>
        </section>
      )}

      {submitted && !analysis && onAnalyzeRequest && (
        <section className={`analysis-request ${analysisOpen ? 'open' : ''}`}>
          {!analysisOpen ? (
            <div>
              <span>
                <Brain size={19} weight="duotone" />
                <span>
                  <strong>Want your reasoning checked, not just your answer?</strong>
                  <small>Optional. The analyst runs only when you ask.</small>
                </span>
              </span>
              <button className="secondary-button" disabled={!aiAvailable} onClick={() => setAnalysisOpen(true)}>
                {aiAvailable ? 'Review my reasoning' : 'Analyst offline'}
              </button>
            </div>
          ) : (
            <div className="analysis-request-form">
              <header>
                <Brain size={19} weight="duotone" />
                <div>
                  <strong>Say why you chose that option.</strong>
                  <p>Name the words in the passage you relied on and what you ruled out. The analyst judges the reasoning separately from whether the answer was right.</p>
                </div>
              </header>
              <label>
                <span>Your justification</span>
                <textarea
                  value={justification}
                  onChange={(event) => setJustification(event.target.value)}
                  rows={4}
                  maxLength={2400}
                  placeholder="I chose this because the third paragraph says…"
                  autoFocus
                />
              </label>
              {analysisError && <p className="analysis-error">{analysisError}</p>}
              <div className="analysis-request-actions">
                <button className="text-button" disabled={analysisPending} onClick={() => setAnalysisOpen(false)}>Cancel</button>
                <button className="primary-button" disabled={analysisPending || justification.trim().length < 8} onClick={() => void requestAnalysis()}>
                  {analysisPending ? 'Reading your reasoning…' : 'Review it'} {!analysisPending && <ArrowRight size={15} />}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {submitted && analysis && (
        <section className="ai-feedback ready" aria-live="polite">
          <header>
            <Brain size={18} weight="duotone" />
            <span><strong>Reasoning review</strong><small>{analysis.model} · {analysis.confidence} confidence</small></span>
            <em>{analysis.justificationQuality} justification</em>
          </header>
          <h3>{analysis.verdict}</h3>
          <p>{analysis.answerAssessment}</p>
          <div className="justification-review">
            <strong>What you wrote</strong>
            <blockquote>{analysis.learnerJustification}</blockquote>
            <p>{analysis.justificationAssessment}</p>
          </div>
          {analysis.soundMoves.length > 0 && (
            <div><strong>What was sound</strong><ul>{analysis.soundMoves.map((move) => <li key={move}>{move}</li>)}</ul></div>
          )}
          {analysis.gaps.length > 0 && (
            <div><strong>What needs repair</strong><ul>{analysis.gaps.map((gap) => <li key={gap}>{gap}</li>)}</ul></div>
          )}
          <div><strong>The lesson underneath</strong><p>{analysis.conceptLesson}</p></div>
          <div><strong>A stronger procedure</strong><ol>{analysis.betterApproach.map((step) => <li key={step}>{step}</li>)}</ol></div>
          <div className="transfer-check"><strong>Where this would recur</strong><p>{analysis.transferCheck}</p></div>
          <p className="next-move"><strong>Next move:</strong> {analysis.nextMove}</p>
        </section>
      )}
    </article>
  )
}
