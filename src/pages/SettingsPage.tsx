import { useEffect, useState } from 'react'
import { CheckCircle, Copy, Database, ShieldCheck, Trash, WarningCircle } from '@phosphor-icons/react'
import { bandForScore } from '../engine/adaptive'
import { useAppState } from '../state/AppState'

export function SettingsPage() {
  const { settings, updateSettings, attempts, sessions, essays, aiStatus, dataDirectory } = useAppState()
  const [draft, setDraft] = useState(settings)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  useEffect(() => setDraft(settings), [settings])

  const save = async () => {
    await updateSettings({
      name: draft.name,
      targetScore: draft.targetScore,
      testDate: draft.testDate || undefined,
      dailyMinutes: draft.dailyMinutes,
      theme: draft.theme,
      targetUniversity: draft.targetUniversity,
    })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  const copyPath = async () => {
    await navigator.clipboard.writeText(dataDirectory)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const reset = async () => {
    if (!confirm('Erase every LNATLAS answer, essay, report, learner model, and setting from the project data folder?')) return
    if (!confirm('Final check: this deletes the local learning record and cannot be undone. Continue?')) return
    const response = await fetch('/api/reset', { method: 'POST' })
    if (!response.ok) return alert('LNATLAS could not reset the local data folder.')
    location.reload()
  }

  return (
    <div className="settings-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Local, private, inspectable.</h1>
          <p>Your learning record is ordinary files inside this project. No browser database, no account, and no key stored in the app.</p>
        </div>
      </header>

      <section className="settings-section">
        <div className="section-heading">
          <div><h2>Candidate profile</h2><p>Used to shape session length, the study plan, and the target line on your chart.</p></div>
          {saved && <span className="saved-label"><CheckCircle size={14} weight="fill" /> Saved</span>}
        </div>
        <div className="settings-grid">
          <label><span>Name</span><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Optional" /></label>
          <label><span>Where you are aiming</span><input value={draft.targetUniversity} onChange={(event) => setDraft({ ...draft, targetUniversity: event.target.value })} placeholder="Optional" /></label>
          <label>
            <span>Target Section A mark</span>
            <input type="number" min="1" max="42" step="1" value={draft.targetScore} onChange={(event) => setDraft({ ...draft, targetScore: Number(event.target.value) })} />
            <small>{bandForScore(draft.targetScore).label} — {bandForScore(draft.targetScore).note}</small>
          </label>
          <label><span>Test date</span><input type="date" value={draft.testDate ?? ''} onChange={(event) => setDraft({ ...draft, testDate: event.target.value || undefined })} /></label>
          <label>
            <span>Daily minutes</span>
            <select value={draft.dailyMinutes} onChange={(event) => setDraft({ ...draft, dailyMinutes: Number(event.target.value) })}>
              {[20, 30, 45, 60, 90].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>
            <span>Theme</span>
            <select value={draft.theme} onChange={(event) => setDraft({ ...draft, theme: event.target.value as typeof draft.theme })}>
              <option value="system">Follow system</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
        <button className="primary-button" onClick={() => void save()}>Save profile</button>
      </section>

      <section className="settings-section">
        <div className="section-heading">
          <div><h2>The analyst</h2><p>Optional. Everything in the app works without it; only the commentary is missing.</p></div>
          {aiStatus.available ? <CheckCircle size={19} weight="fill" /> : <WarningCircle size={19} weight="fill" />}
        </div>
        <div className={`ai-connection ${aiStatus.state}`}>
          <span className="analyst-dot" />
          <div>
            <strong>{aiStatus.available ? `${aiStatus.provider} connected` : 'No analyst configured'}</strong>
            <p>{aiStatus.access}</p>
            {aiStatus.model && <small>Model: {aiStatus.model}</small>}
            {aiStatus.lastError && <small className="error-copy">{aiStatus.lastError}</small>}
          </div>
        </div>
        <div className="privacy-note">
          <ShieldCheck size={17} />
          <p>
            Set <code>AI_PROVIDER</code> in <code>.env.local</code> to <code>antigravity</code>, <code>gemini</code>, or{' '}
            <code>claude</code>. Antigravity uses your existing local Google OAuth session through the <code>agy</code>{' '}
            binary, so no key is stored here at all. The analyst can write fresh passages, review a justification you
            submit, report on a completed set, and give formative essay feedback. Raw evidence is always written to disk
            before any of that runs, and a failed analysis never loses an answer.
          </p>
        </div>
      </section>

      <section className="settings-section">
        <div className="section-heading">
          <div><h2>Project-owned memory</h2><p>{attempts.length} answers, {sessions.length} sessions, and {essays.length} essays are stored on disk.</p></div>
          <Database size={19} />
        </div>
        <div className="path-field">
          <code>{dataDirectory || 'Starting the local data store…'}</code>
          <button className="secondary-button" disabled={!dataDirectory} onClick={() => void copyPath()}><Copy size={14} /> {copied ? 'Copied' : 'Copy path'}</button>
        </div>
        <p className="data-footnote">
          The folder holds append-only JSONL evidence, readable markdown reports, the learner model, your essays, and any
          paused mock. You can back it up, read it, or hand the whole folder to another tool without this app&apos;s help.
        </p>
        <button className="danger-button" onClick={() => void reset()}><Trash size={15} /> Erase the local learning record</button>
      </section>

      <section className="settings-section">
        <div className="section-heading"><div><h2>What this app is not</h2></div></div>
        <div className="privacy-note">
          <WarningCircle size={17} />
          <p>
            LNATLAS is an independent study tool. It is not affiliated with, endorsed by, or approved by LNAT Consortium
            Ltd, Pearson VUE, or any university. Every passage, question, and essay prompt in it is original. Section A
            is reported as a raw mark out of 42 because that is what the LNAT reports; no scaled score or percentile is
            published, so none is invented here. Section B carries no official mark at all.
          </p>
        </div>
      </section>
    </div>
  )
}
