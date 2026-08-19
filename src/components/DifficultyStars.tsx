import { Circle } from '@phosphor-icons/react'
import type { Difficulty } from '../types'

/**
 * The LNAT publishes no difficulty scale, so these labels describe the *reading
 * decision* rather than a claimed official level: what separates the answer from
 * the best wrong option.
 */
const labels: Record<Difficulty, string> = {
  1: 'One sentence decides it',
  2: 'One paragraph decides it',
  3: 'Test-level',
  4: 'Two options survive',
  5: 'Hardest',
}

const short: Record<Difficulty, string> = {
  1: 'Warm-up',
  2: 'Straightforward',
  3: 'Test-level',
  4: 'Hard',
  5: 'Hardest',
}

export function DifficultyStars({ difficulty, showLabel = true, size = 8 }: { difficulty: Difficulty; showLabel?: boolean; size?: number }) {
  return (
    <span className="difficulty-marks" title={`${labels[difficulty]} — ${difficulty} of 5`} aria-label={`Difficulty ${difficulty} of 5, ${short[difficulty]}`}>
      <span aria-hidden="true">
        {([1, 2, 3, 4, 5] as const).map((step) => (
          <Circle key={step} size={size} weight={step <= difficulty ? 'fill' : 'bold'} className={step <= difficulty ? 'filled' : ''} />
        ))}
      </span>
      {showLabel && <em>{short[difficulty]}</em>}
    </span>
  )
}

export const difficultyLabel = (difficulty: Difficulty) => short[difficulty]
export const difficultyDescription = (difficulty: Difficulty) => labels[difficulty]

/**
 * Lets a candidate pin a set to one level instead of letting calibration decide.
 * "Adaptive" hands the target back to `paperTargetDifficulty`.
 */
export function DifficultyScalePicker({ value, onChange }: { value: Difficulty | 'adaptive'; onChange: (value: Difficulty | 'adaptive') => void }) {
  return (
    <div className="difficulty-scale-picker">
      <button type="button" className={value === 'adaptive' ? 'active' : ''} onClick={() => onChange('adaptive')}>Adaptive</button>
      {([1, 2, 3, 4, 5] as const).map((step) => (
        <button
          type="button"
          key={step}
          className={value === step ? 'active' : ''}
          title={`${labels[step]} — ${step} of 5`}
          aria-label={`Fix difficulty at ${step} of 5, ${short[step]}`}
          aria-pressed={value === step}
          onClick={() => onChange(step)}
        >
          <Circle size={9} weight={typeof value === 'number' && step <= value ? 'fill' : 'bold'} />
        </button>
      ))}
      <em>{value === 'adaptive' ? 'Follows your calibration' : labels[value]}</em>
    </div>
  )
}
