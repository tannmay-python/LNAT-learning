import { useMemo, useState } from 'react'
import { Highlighter, NotePencil, TextAa } from '@phosphor-icons/react'
import { passageParagraphs } from '../data/passages'
import type { Passage } from '../types'

/**
 * Split a paragraph into sentences for click-to-highlight. Abbreviations are not
 * a real hazard in this prose, but a lookbehind for a lower-case letter or a
 * closing quote keeps decimal points and initials from splitting a sentence.
 */
const sentences = (paragraph: string) =>
  paragraph.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g)?.map((part) => part.trimEnd()).filter(Boolean) ?? [paragraph]

type TypeSize = 'compact' | 'regular' | 'large'

interface Props {
  passage: Passage
  /** Passage number within the form, when the pane is used inside a mock. */
  index?: number
  total?: number
  notes: string
  onNotes: (value: string) => void
  highlights: string[]
  onHighlights: (value: string[]) => void
}

/**
 * The reading half of the two-pane runner. The LNAT gives candidates a physical
 * whiteboard and the official advice is to note key words as you read, so the
 * pane carries a scratchpad and a click-to-highlight layer rather than leaving
 * the candidate to hold twelve passages in their head.
 */
export function PassagePane({ passage, index, total, notes, onNotes, highlights, onHighlights }: Props) {
  const [size, setSize] = useState<TypeSize>('regular')
  const [highlighting, setHighlighting] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const marked = useMemo(() => new Set(highlights), [highlights])

  const toggle = (key: string) => {
    if (!highlighting) return
    onHighlights(marked.has(key) ? highlights.filter((item) => item !== key) : [...highlights, key])
  }

  const renderParagraph = (paragraph: string, groupKey: string, paragraphIndex: number) => (
    <p key={`${groupKey}-${paragraphIndex}`}>
      {sentences(paragraph).map((sentence, sentenceIndex) => {
        const key = `${groupKey}-${paragraphIndex}-${sentenceIndex}`
        return (
          <span
            key={key}
            className={`passage-sentence ${marked.has(key) ? 'marked' : ''} ${highlighting ? 'markable' : ''}`}
            onClick={() => toggle(key)}
            role={highlighting ? 'button' : undefined}
            tabIndex={highlighting ? 0 : undefined}
            onKeyDown={highlighting ? (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(key) } } : undefined}
          >
            {sentence}{' '}
          </span>
        )
      })}
    </p>
  )

  return (
    <section className={`passage-pane type-${size}`} aria-label={`Passage: ${passage.title}`}>
      <header className="passage-head">
        <div>
          {index !== undefined && <span className="passage-counter">Passage {index}{total ? ` of ${total}` : ''}</span>}
          <h2>{passage.title}</h2>
          <small>{passage.wordCount} words · about {Math.round(passage.readingSeconds / 60 * 10) / 10} min to read closely</small>
        </div>
        <div className="passage-tools">
          <button
            type="button"
            className={`passage-tool ${highlighting ? 'active' : ''}`}
            aria-pressed={highlighting}
            onClick={() => setHighlighting((value) => !value)}
            title="Click a sentence to mark it. Click again to clear it."
          >
            <Highlighter size={15} weight="light" />{highlighting ? 'Marking' : 'Mark'}
          </button>
          <button
            type="button"
            className={`passage-tool ${notesOpen ? 'active' : ''}`}
            aria-pressed={notesOpen}
            onClick={() => setNotesOpen((value) => !value)}
            title="A scratchpad, in place of the whiteboard you get on the day."
          >
            <NotePencil size={15} weight="light" />Notes
          </button>
          <div className="type-size" role="group" aria-label="Text size">
            <TextAa size={15} weight="light" aria-hidden="true" />
            {(['compact', 'regular', 'large'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={size === value ? 'active' : ''}
                aria-pressed={size === value}
                aria-label={`${value} text`}
                onClick={() => setSize(value)}
              >
                {value === 'compact' ? 'S' : value === 'regular' ? 'M' : 'L'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {notesOpen && (
        <label className="passage-notes">
          <span className="sr-only">Notes on this passage</span>
          <textarea
            value={notes}
            onChange={(event) => onNotes(event.target.value)}
            rows={3}
            placeholder="Conclusion? Whose view is paragraph 2? Where does the writer concede?"
          />
        </label>
      )}

      <div className="passage-body">
        {passage.extracts?.length
          ? passage.extracts.map((extract, extractIndex) => (
            <article className="passage-extract" key={extract.label}>
              <header><strong>{extract.label}</strong><span>{extract.attribution}</span></header>
              {extract.body.split('\n\n').map((paragraph, paragraphIndex) => renderParagraph(paragraph, `x${extractIndex}`, paragraphIndex))}
            </article>
          ))
          : passageParagraphs(passage).map((paragraph, paragraphIndex) => renderParagraph(paragraph, 'p', paragraphIndex))}
      </div>
    </section>
  )
}
