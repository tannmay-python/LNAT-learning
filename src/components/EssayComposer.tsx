import { CheckCircle, Warning } from '@phosphor-icons/react'
import { LNAT_SPEC } from '../engine/mock'
import { wordCount } from '../engine/questions'
import type { EssayFeedback, EssayPrompt } from '../types'

const [LOW, HIGH] = LNAT_SPEC.sectionB.recommendedWords
const LIMIT = LNAT_SPEC.sectionB.wordLimit

export function essayLengthVerdict(count: number) {
  if (count === 0) return { tone: 'idle' as const, label: 'Not started' }
  if (count < 250) return { tone: 'warn' as const, label: 'Far too short to be assessed' }
  if (count < LOW) return { tone: 'warn' as const, label: `Short — the guidance is ${LOW}–${HIGH}` }
  if (count <= HIGH) return { tone: 'good' as const, label: 'In the recommended range' }
  if (count <= LIMIT) return { tone: 'warn' as const, label: 'Over the guidance — cut repetition and digression' }
  return { tone: 'bad' as const, label: `Over the ${LIMIT}-word ceiling` }
}

interface Props {
  prompts: EssayPrompt[]
  selectedPromptId: string | null
  onSelectPrompt: (id: string) => void
  plan: string
  onPlan: (value: string) => void
  body: string
  onBody: (value: string) => void
  /** Shown while the sitting is timed; omitted when the candidate is writing untimed. */
  remainingLabel?: string
  disabled?: boolean
  feedback?: EssayFeedback
}

/**
 * The Section B surface. Choosing a prompt is itself part of the task, so the
 * three options stay visible while writing rather than disappearing after a
 * click — the official advice is explicitly that a candidate may be better off
 * defending a position they do not personally hold.
 */
export function EssayComposer({
  prompts, selectedPromptId, onSelectPrompt, plan, onPlan, body, onBody, remainingLabel, disabled = false, feedback,
}: Props) {
  const count = wordCount(body)
  const verdict = essayLengthVerdict(count)
  const selected = prompts.find((prompt) => prompt.id === selectedPromptId)

  return (
    <div className="essay-composer">
      <section className="essay-prompts" aria-label="Choose one question">
        <div className="section-heading">
          <div><h3>Answer one of the following</h3><p>Your answer should be a reasoned and substantiated argument that justifies your response to the question.</p></div>
          {remainingLabel && <span className="essay-clock">{remainingLabel}</span>}
        </div>
        <div className="essay-prompt-list">
          {prompts.map((prompt, index) => (
            <button
              type="button"
              key={prompt.id}
              className={`essay-prompt ${selectedPromptId === prompt.id ? 'active' : ''}`}
              aria-pressed={selectedPromptId === prompt.id}
              disabled={disabled}
              onClick={() => onSelectPrompt(prompt.id)}
            >
              <span>{index + 1}</span>
              <p>{prompt.text}</p>
            </button>
          ))}
        </div>
      </section>

      {selected && (
        <div className="essay-workspace">
          <label className="essay-plan">
            <span>Plan <small>Five minutes here is worth ten later. Position, three reasons, the objection.</small></span>
            <textarea
              value={plan}
              onChange={(event) => onPlan(event.target.value)}
              rows={6}
              disabled={disabled}
              placeholder={'Thesis:\n1.\n2.\n3.\nStrongest objection:\nResponse:'}
            />
          </label>

          <label className="essay-body">
            <span>
              Your essay
              <small className={`word-verdict ${verdict.tone}`}>
                {verdict.tone === 'good' ? <CheckCircle size={13} weight="fill" /> : verdict.tone !== 'idle' ? <Warning size={13} weight="fill" /> : null}
                {count} words · {verdict.label}
              </small>
            </span>
            <textarea
              value={body}
              onChange={(event) => onBody(event.target.value)}
              rows={20}
              disabled={disabled}
              placeholder="Open with your position, not with how important the topic is."
            />
            <div className="word-track" aria-hidden="true">
              <i style={{ width: `${Math.min(100, count / LIMIT * 100)}%` }} className={verdict.tone} />
              <b style={{ left: `${LOW / LIMIT * 100}%` }} />
              <b style={{ left: `${HIGH / LIMIT * 100}%` }} />
            </div>
          </label>
        </div>
      )}

      {feedback && (
        <section className="essay-feedback" aria-live="polite">
          <header>
            <div><span className="eyebrow">Formative feedback</span><h3>{feedback.summary}</h3></div>
            <small>{feedback.model}</small>
          </header>
          <div className="criteria-grid">
            {feedback.criteria.map((criterion) => (
              <article key={criterion.name} className={`criterion ${criterion.level}`}>
                <header><strong>{criterion.name}</strong><em>{criterion.level}</em></header>
                <p>{criterion.feedback}</p>
              </article>
            ))}
          </div>
          {feedback.lineNotes.length > 0 && (
            <div className="line-notes">
              <h4>On specific lines</h4>
              {feedback.lineNotes.map((note) => (
                <div key={note.quote}><blockquote>{note.quote}</blockquote><p>{note.note}</p></div>
              ))}
            </div>
          )}
          <div className="essay-closing">
            <p><strong>Strongest thing here:</strong> {feedback.strength}</p>
            <p><strong>Next move:</strong> {feedback.nextMove}</p>
          </div>
          <p className="essay-boundary">
            The LNAT essay carries no official mark. It is sent to universities as written, and this feedback is a
            practice aid only — never a predicted score or an indication of an offer.
          </p>
        </section>
      )}
    </div>
  )
}
