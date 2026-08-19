import { useState } from 'react'
import { ArrowRight, Check, Scales } from '@phosphor-icons/react'
import { useAppState } from '../state/AppState'
import { bandForScore } from '../engine/adaptive'

/** Rough averages successful applicants have presented, used only as a referent for a target. */
const universities = [
  { name: 'University of Glasgow', typical: 23 },
  { name: 'University of Bristol', typical: 25 },
  { name: 'University of Nottingham', typical: 25 },
  { name: 'SOAS, University of London', typical: 25 },
  { name: "King's College London", typical: 26 },
  { name: 'London School of Economics', typical: 26 },
  { name: 'University College London', typical: 28 },
  { name: 'Durham University', typical: 29 },
  { name: 'University of Oxford', typical: 30 },
]

export function Onboarding() {
  const { settings, updateSettings } = useAppState()
  const [name, setName] = useState(settings.name)
  const [targetUniversity, setTargetUniversity] = useState(settings.targetUniversity)
  const [targetScore, setTargetScore] = useState(settings.targetScore)
  const [dailyMinutes, setDailyMinutes] = useState(settings.dailyMinutes)
  const [testDate, setTestDate] = useState(settings.testDate ?? '')

  const pickUniversity = (value: string) => {
    setTargetUniversity(value)
    const match = universities.find((item) => item.name === value)
    if (match) setTargetScore(match.typical)
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="onboarding" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
        <div className="onboarding-copy">
          <span className="brand-mark large"><Scales size={23} weight="light" /></span>
          <p className="eyebrow">Your private LNAT workspace</p>
          <h2 id="onboarding-title">Let the system learn how you read.</h2>
          <p>
            Ninety-five minutes, twelve passages, forty-two questions, and then forty minutes to argue. Every answer you
            give here changes what comes next.
          </p>
          <div className="onboarding-points">
            <span><Check size={15} weight="bold" /> Written to readable files inside this project</span>
            <span><Check size={15} weight="bold" /> Raw evidence kept separate from any AI claim</span>
            <span><Check size={15} weight="bold" /> A raw mark out of 42, never an invented official score</span>
          </div>
        </div>
        <form
          className="onboarding-form"
          onSubmit={(event) => {
            event.preventDefault()
            void updateSettings({
              name: name.trim(),
              targetUniversity,
              targetScore,
              dailyMinutes,
              testDate: testDate || undefined,
              onboardingComplete: true,
            })
          }}
        >
          <label>
            <span>Your name <small>optional</small></span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="What should LNATLAS call you?" />
          </label>
          <label>
            <span>Where you are aiming</span>
            <select value={targetUniversity} onChange={(event) => pickUniversity(event.target.value)}>
              <option value="">Not decided yet</option>
              {universities.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
            </select>
            <small>Sets a starting target from the mark successful applicants have typically presented. You can change it.</small>
          </label>
          <label>
            <span>Target Section A mark</span>
            <output>{targetScore} / 42</output>
            <input type="range" min="15" max="42" step="1" value={targetScore} onChange={(event) => setTargetScore(Number(event.target.value))} />
            <small>{bandForScore(targetScore).label} — {bandForScore(targetScore).note}</small>
          </label>
          <label>
            <span>Daily study time</span>
            <select value={dailyMinutes} onChange={(event) => setDailyMinutes(Number(event.target.value))}>
              <option value="20">20 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </label>
          <label>
            <span>Test date <small>optional</small></span>
            <input type="date" value={testDate} onChange={(event) => setTestDate(event.target.value)} />
          </label>
          <button className="primary-button" type="submit">Build my plan <ArrowRight size={16} weight="bold" /></button>
        </form>
      </section>
    </div>
  )
}
