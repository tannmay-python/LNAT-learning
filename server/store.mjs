import { appendFile, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const dataDirectory = resolve(projectRoot, 'data')

/**
 * The learning record is ordinary files. Append-only JSONL for evidence that
 * must never be silently rewritten, atomic JSON for derived state that is
 * replaced wholesale. A candidate can read, back up, or hand the whole folder
 * to another tool without this app's cooperation.
 */
const paths = {
  settings: resolve(dataDirectory, 'profile/settings.json'),
  skills: resolve(dataDirectory, 'profile/skill-state.json'),
  learnerModel: resolve(dataDirectory, 'profile/learner-model.json'),
  attempts: resolve(dataDirectory, 'events/attempts.jsonl'),
  sessions: resolve(dataDirectory, 'events/sessions.jsonl'),
  essays: resolve(dataDirectory, 'events/essays.jsonl'),
  mockAssessments: resolve(dataDirectory, 'events/mock-assessments.jsonl'),
  analyses: resolve(dataDirectory, 'events/analyses.jsonl'),
  passages: resolve(dataDirectory, 'content/generated-passages.jsonl'),
  questions: resolve(dataDirectory, 'content/generated-questions.jsonl'),
  reportsIndex: resolve(dataDirectory, 'reports/index.json'),
  activeMock: resolve(dataDirectory, 'active/mock.json'),
}

const defaultSettings = {
  id: 'learner',
  name: '',
  targetScore: 27,
  dailyMinutes: 30,
  theme: 'light',
  targetUniversity: '',
  onboardingComplete: false,
}

const defaultLearnerModel = {
  summary: 'The analyst is waiting for enough answer evidence to form a defensible LNAT learning model.',
  strengths: [],
  hypotheses: [],
  priorities: [],
  skillDirectives: [],
  coachingStyle: 'Name the decisive reading move, then verify it on a fresh passage.',
  nextSession: 'Begin with one passage set as a calibration.',
}

const ensureParent = (file) => mkdir(dirname(file), { recursive: true })

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch (error) {
    if (error?.code !== 'ENOENT') console.warn(`Could not read ${file}:`, error.message)
    return structuredClone(fallback)
  }
}

async function readJsonl(file) {
  try {
    const text = await readFile(file, 'utf8')
    return text.split('\n').filter(Boolean).map((line) => JSON.parse(line))
  } catch (error) {
    if (error?.code !== 'ENOENT') console.warn(`Could not read ${file}:`, error.message)
    return []
  }
}

async function atomicJson(file, value) {
  await ensureParent(file)
  const temporary = `${file}.${process.pid}.tmp`
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(temporary, file)
}

async function appendJsonl(file, value) {
  await ensureParent(file)
  await appendFile(file, `${JSON.stringify(value)}\n`, 'utf8')
}

const defaultSkillState = (skillId) => ({
  skillId, theta: 0, alpha: 1, beta: 1, attempts: 0, correct: 0,
  streak: 0, lapses: 0, avgTimeMs: 0, intervalDays: 0, ease: 2.3,
})

const expectedSuccess = (theta, difficulty) => 1 / (1 + Math.exp(-(theta - (difficulty - 3) * 0.72)))

/**
 * Mirrors `src/engine/adaptive.ts`. The server owns the authoritative skill
 * state so that a browser refresh, a second tab, or a crashed mock can never
 * lose or double-count evidence.
 */
function updateSkillState(previous, attempt) {
  const state = previous ?? defaultSkillState(attempt.skillId)
  const confidenceWeight = { guess: 0.82, low: 0.91, medium: 1, high: 1.07, certain: 1.13 }
  const evidenceWeight = (attempt.confidence ? confidenceWeight[attempt.confidence] ?? 1 : 1) * (attempt.usedHint ? 0.72 : 1)
  const expected = expectedSuccess(state.theta, attempt.difficulty)
  const learningRate = Math.max(0.12, 0.46 / Math.sqrt(1 + state.attempts / 4))
  const theta = Math.max(-3, Math.min(3, state.theta + learningRate * evidenceWeight * ((attempt.correct ? 1 : 0) - expected)))
  const streak = attempt.correct ? state.streak + 1 : 0
  const highConfidenceMiss = !attempt.correct && (attempt.confidence === 'high' || attempt.confidence === 'certain')
  const ease = Math.max(1.3, Math.min(3, state.ease + (attempt.correct ? 0.04 : -0.22) + (highConfidenceMiss ? -0.08 : 0)))

  let intervalDays
  if (!attempt.correct) intervalDays = 0.01
  else if (state.intervalDays < 1) intervalDays = 1
  else if (streak === 2) intervalDays = Math.max(3, state.intervalDays * 2)
  else intervalDays = Math.min(60, Math.max(1, state.intervalDays * ease * (0.86 + attempt.difficulty * 0.05)))

  const lastSeen = attempt.createdAt
  return {
    ...state,
    theta,
    alpha: state.alpha + (attempt.correct ? evidenceWeight : 0),
    beta: state.beta + (attempt.correct ? 0 : evidenceWeight),
    attempts: state.attempts + 1,
    correct: state.correct + (attempt.correct ? 1 : 0),
    streak,
    lapses: state.lapses + (attempt.correct ? 0 : 1),
    avgTimeMs: state.attempts === 0 ? attempt.elapsedMs : Math.round(state.avgTimeMs * 0.72 + attempt.elapsedMs * 0.28),
    lastSeen,
    dueAt: new Date(new Date(lastSeen).getTime() + intervalDays * 86_400_000).toISOString(),
    intervalDays,
    ease,
  }
}

export async function initializeStore() {
  await Promise.all([
    mkdir(resolve(dataDirectory, 'profile'), { recursive: true }),
    mkdir(resolve(dataDirectory, 'events'), { recursive: true }),
    mkdir(resolve(dataDirectory, 'content'), { recursive: true }),
    mkdir(resolve(dataDirectory, 'reports/session'), { recursive: true }),
    mkdir(resolve(dataDirectory, 'reports/comprehensive'), { recursive: true }),
    mkdir(resolve(dataDirectory, 'active'), { recursive: true }),
  ])
  const [settings, skills, learnerModel, reports] = await Promise.all([
    readJson(paths.settings, defaultSettings),
    readJson(paths.skills, []),
    readJson(paths.learnerModel, defaultLearnerModel),
    readJson(paths.reportsIndex, []),
  ])
  await Promise.all([
    atomicJson(paths.settings, { ...defaultSettings, ...settings }),
    atomicJson(paths.skills, skills),
    atomicJson(paths.learnerModel, learnerModel),
    atomicJson(paths.reportsIndex, reports),
  ])
}

export async function getState(aiStatus) {
  const [settings, skillStates, learnerModel, attempts, sessions, essays, analyses, generatedPassages, generatedQuestions, reports, activeMock, mockAssessments] =
    await Promise.all([
      readJson(paths.settings, defaultSettings),
      readJson(paths.skills, []),
      readJson(paths.learnerModel, defaultLearnerModel),
      readJsonl(paths.attempts),
      readJsonl(paths.sessions),
      readJsonl(paths.essays),
      readJsonl(paths.analyses),
      readJsonl(paths.passages),
      readJsonl(paths.questions),
      readJson(paths.reportsIndex, []),
      readJson(paths.activeMock, null),
      readJsonl(paths.mockAssessments),
    ])
  return {
    settings: { ...defaultSettings, ...settings },
    skillStates,
    learnerModel,
    attempts: attempts.toReversed(),
    sessions: sessions.toReversed(),
    essays: essays.toReversed(),
    analyses: analyses.toReversed(),
    generatedPassages: generatedPassages.filter((passage) => passage.validationStatus === 'accepted'),
    generatedQuestions: generatedQuestions.filter((question) => question.validationStatus === 'accepted'),
    reports: reports.toReversed(),
    mockAssessments: mockAssessments.toReversed(),
    activeMock,
    aiStatus,
    dataDirectory,
  }
}

/** Answers are written before anything else looks at them, and never twice. */
export async function recordAttempt(attempt, question, passage) {
  const existing = await readJsonl(paths.attempts)
  if (existing.some((item) => item.id === attempt.id)) {
    return { saved: false, skillStates: await readJson(paths.skills, []) }
  }
  await appendJsonl(paths.attempts, {
    ...attempt,
    questionSnapshot: question ? { ...question } : undefined,
    passageSnapshot: passage ? { ...passage } : undefined,
  })
  const skillStates = await readJson(paths.skills, [])
  const index = skillStates.findIndex((state) => state.skillId === attempt.skillId)
  const next = updateSkillState(index >= 0 ? skillStates[index] : undefined, attempt)
  if (index >= 0) skillStates[index] = next
  else skillStates.push(next)
  await atomicJson(paths.skills, skillStates)
  return { saved: true, skillStates }
}

export async function recordAttempts(records) {
  const results = []
  for (const record of records) {
    results.push(await recordAttempt(record.attempt, record.question, record.passage))
  }
  return { saved: results.filter((result) => result.saved).length }
}

export async function saveSession(session) {
  const existing = await readJsonl(paths.sessions)
  if (existing.some((item) => item.id === session.id)) return false
  await appendJsonl(paths.sessions, session)
  return true
}

export async function saveEssay(essay) {
  const existing = await readJsonl(paths.essays)
  if (existing.some((item) => item.id === essay.id)) return false
  await appendJsonl(paths.essays, essay)
  return true
}

/** Feedback arrives after the essay, so the record is rewritten in place. */
export async function attachEssayFeedback(essayId, feedback) {
  const existing = await readJsonl(paths.essays)
  const index = existing.findIndex((item) => item.id === essayId)
  if (index < 0) return null
  existing[index] = { ...existing[index], feedback }
  await ensureParent(paths.essays)
  const temporary = `${paths.essays}.${process.pid}.tmp`
  await writeFile(temporary, existing.map((item) => JSON.stringify(item)).join('\n') + '\n', 'utf8')
  await rename(temporary, paths.essays)
  return existing[index]
}

export async function saveMockAssessment(assessment) {
  const existing = await readJsonl(paths.mockAssessments)
  if (existing.some((item) => item.sessionId === assessment.sessionId)) return false
  await appendJsonl(paths.mockAssessments, assessment)
  return true
}

export async function saveGeneratedContent({ passages = [], questions = [] }) {
  const existingPassages = await readJsonl(paths.passages)
  const passageIds = new Set(existingPassages.map((item) => item.id))
  for (const passage of passages) if (!passageIds.has(passage.id)) await appendJsonl(paths.passages, passage)
  const existingQuestions = await readJsonl(paths.questions)
  const questionIds = new Set(existingQuestions.map((item) => item.id))
  for (const question of questions) if (!questionIds.has(question.id)) await appendJsonl(paths.questions, question)
}

export async function updateSettings(patch) {
  const settings = await readJson(paths.settings, defaultSettings)
  const next = { ...defaultSettings, ...settings, ...patch, id: 'learner' }
  await atomicJson(paths.settings, next)
  return next
}

export async function saveAnalysis(analysis) {
  const existing = await readJsonl(paths.analyses)
  if (existing.some((item) => item.attemptId === analysis.attemptId)) return false
  await appendJsonl(paths.analyses, analysis)
  return true
}

export async function saveLearnerModel(model) {
  await atomicJson(paths.learnerModel, model)
}

export async function saveReport(report, markdown, json) {
  const folder = report.type === 'comprehensive' ? 'comprehensive' : 'session'
  const jsonPath = resolve(dataDirectory, `reports/${folder}/${report.id}.json`)
  const markdownPath = resolve(dataDirectory, `reports/${folder}/${report.id}.md`)
  await atomicJson(jsonPath, json)
  await ensureParent(markdownPath)
  await writeFile(markdownPath, `${markdown.trim()}\n`, 'utf8')
  const reports = await readJson(paths.reportsIndex, [])
  await atomicJson(paths.reportsIndex, [...reports.filter((item) => item.id !== report.id), { ...report, path: markdownPath, jsonPath }])
  return markdownPath
}

export async function hasReport(id) {
  const reports = await readJson(paths.reportsIndex, [])
  return reports.some((report) => report.id === id)
}

export async function getEvidence() {
  const [attempts, sessions, essays, analyses, skillStates, learnerModel, settings, mockAssessments] = await Promise.all([
    readJsonl(paths.attempts),
    readJsonl(paths.sessions),
    readJsonl(paths.essays),
    readJsonl(paths.analyses),
    readJson(paths.skills, []),
    readJson(paths.learnerModel, defaultLearnerModel),
    readJson(paths.settings, defaultSettings),
    readJsonl(paths.mockAssessments),
  ])
  return { attempts, sessions, essays, analyses, skillStates, learnerModel, settings, mockAssessments }
}

export async function setActiveMock(mock) {
  if (mock === null) {
    await rm(paths.activeMock, { force: true })
    return
  }
  await atomicJson(paths.activeMock, mock)
}

export async function resetStore() {
  for (const folder of ['profile', 'events', 'content', 'reports', 'active']) {
    await rm(resolve(dataDirectory, folder), { recursive: true, force: true })
  }
  await initializeStore()
}

export { defaultLearnerModel, defaultSettings }
