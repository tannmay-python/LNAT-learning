import express from 'express'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { z } from 'zod'
import {
  attachEssayFeedback,
  dataDirectory,
  getEvidence,
  getState,
  hasReport,
  initializeStore,
  recordAttempt,
  recordAttempts,
  resetStore,
  saveAnalysis,
  saveEssay,
  saveGeneratedContent,
  saveLearnerModel,
  saveMockAssessment,
  saveReport,
  saveSession,
  setActiveMock,
  updateSettings,
} from './server/store.mjs'
import {
  analyzeAttempt,
  assessMock,
  generateComprehensiveReport,
  generatePassageSet,
  generateSessionReport,
  getAiStatus,
  gradeEssay,
  invalidateAiWork,
  renderReportMarkdown,
  skillMap,
} from './server/ai.mjs'

for (const file of ['.env', '.env.local']) {
  try { process.loadEnvFile(file) } catch { /* Local overrides are optional. */ }
}

await initializeStore()

const app = express()
const port = Number(process.env.PORT || 4177)
app.use(express.json({ limit: '4mb' }))

const allSkills = Object.values(skillMap).flat()

const attemptSchema = z.object({
  id: z.string().min(4),
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
  passageId: z.string().min(1),
  section: z.enum(['section-a', 'section-b']),
  domain: z.string().min(2),
  skillId: z.string().min(2),
  difficulty: z.number().int().min(1).max(5),
  response: z.string(),
  correct: z.boolean(),
  confidence: z.enum(['guess', 'low', 'medium', 'high', 'certain']).optional(),
  elapsedMs: z.number().int().nonnegative(),
  passageReadMs: z.number().int().nonnegative().optional(),
  usedHint: z.boolean(),
  mistakeType: z.string().optional(),
  createdAt: z.string(),
}).passthrough()

const settingsSchema = z.object({
  name: z.string().max(80).optional(),
  targetScore: z.number().int().min(1).max(42).optional(),
  testDate: z.string().optional(),
  dailyMinutes: z.number().int().min(5).max(240).optional(),
  theme: z.enum(['system', 'light', 'dark']).optional(),
  targetUniversity: z.string().max(80).optional(),
  onboardingComplete: z.boolean().optional(),
}).strict()

const blueprintSchema = z.object({
  theme: z.string().max(40).optional(),
  register: z.string().max(40).optional(),
  questions: z.array(z.object({
    domain: z.string().min(2),
    skillId: z.enum(allSkills),
    difficulty: z.number().int().min(1).max(5),
  })).min(3).max(4),
})

app.get('/api/state', async (_request, response) => {
  response.json(await getState(getAiStatus()))
})

app.get('/api/ai/status', (_request, response) => response.json(getAiStatus()))

app.post('/api/attempts', async (request, response) => {
  const parsed = attemptSchema.safeParse(request.body?.attempt)
  if (!parsed.success) return response.status(400).json({ error: 'Invalid answer record.', details: parsed.error.flatten() })
  const result = await recordAttempt(parsed.data, request.body?.question, request.body?.passage)
  response.status(result.saved ? 201 : 200).json(result)
})

/** A completed mock writes forty-two answers at once rather than one per question. */
app.post('/api/attempts/batch', async (request, response) => {
  const records = Array.isArray(request.body?.records) ? request.body.records : []
  if (!records.length) return response.status(400).json({ error: 'No answer records were supplied.' })
  for (const record of records) {
    const parsed = attemptSchema.safeParse(record?.attempt)
    if (!parsed.success) return response.status(400).json({ error: 'One of the answer records was invalid.', details: parsed.error.flatten() })
  }
  response.status(201).json(await recordAttempts(records))
})

app.post('/api/sessions', async (request, response) => {
  const session = request.body?.session
  if (!session?.id || !session?.startedAt || !Array.isArray(session.questionIds)) {
    return response.status(400).json({ error: 'Invalid session record.' })
  }
  const saved = await saveSession(session)
  if (saved && session.completedAt) {
    queueSessionReport(session).catch(() => undefined)
    if (session.type === 'mock') queueMockAssessment(session).catch(() => undefined)
  }
  response.status(saved ? 201 : 200).json({ saved, reportQueued: saved && Boolean(session.completedAt) && getAiStatus().available })
})

app.patch('/api/settings', async (request, response) => {
  const parsed = settingsSchema.safeParse(request.body)
  if (!parsed.success) return response.status(400).json({ error: 'Invalid settings.', details: parsed.error.flatten() })
  response.json(await updateSettings(parsed.data))
})

app.post('/api/practice/generate', async (request, response) => {
  const parsed = blueprintSchema.safeParse(request.body?.blueprint)
  if (!parsed.success) return response.status(400).json({ error: 'The fresh-passage plan was invalid.', details: parsed.error.flatten() })
  try {
    const state = await getState(getAiStatus())
    const result = await generatePassageSet(parsed.data, state.generatedPassages, { purpose: request.body?.purpose === 'mock' ? 'mock' : 'practice' })
    await saveGeneratedContent({ passages: [result.passage], questions: result.questions })
    response.status(201).json(result)
  } catch (error) {
    response.status(409).json({ error: error instanceof Error ? error.message : 'Fresh-passage generation failed.' })
  }
})

app.post('/api/analyses/attempt', async (request, response) => {
  const attemptId = String(request.body?.attemptId || '')
  const justification = String(request.body?.justification || '').trim()
  if (attemptId.length < 4 || justification.length < 8 || justification.length > 2400) {
    return response.status(400).json({ error: 'Add a short justification (8–2,400 characters) before requesting a review.' })
  }
  const state = await getState(getAiStatus())
  const existing = state.analyses.find((item) => item.attemptId === attemptId)
  if (existing) return response.json({ analysis: existing, existing: true })
  const attempt = state.attempts.find((item) => item.id === attemptId)
  if (!attempt?.questionSnapshot) return response.status(404).json({ error: 'The answer evidence or question snapshot was not found.' })
  try {
    const analysis = await analyzeAttempt({
      attempt,
      question: attempt.questionSnapshot,
      passage: attempt.passageSnapshot,
      justification,
    })
    await saveAnalysis(analysis)
    response.status(201).json({ analysis })
  } catch (error) {
    response.status(409).json({ error: error instanceof Error ? error.message : 'The reasoning review failed.' })
  }
})

app.post('/api/essays', async (request, response) => {
  const essay = request.body?.essay
  if (!essay?.id || !essay?.promptId || typeof essay.body !== 'string') {
    return response.status(400).json({ error: 'Invalid essay record.' })
  }
  const saved = await saveEssay(essay)
  response.status(saved ? 201 : 200).json({ saved })
})

app.post('/api/essays/:id/feedback', async (request, response) => {
  const state = await getState(getAiStatus())
  const essay = state.essays.find((item) => item.id === request.params.id)
  if (!essay) return response.status(404).json({ error: 'That essay was not found.' })
  if (essay.feedback) return response.json({ feedback: essay.feedback, existing: true })
  try {
    const feedback = await gradeEssay({
      promptText: essay.promptText,
      pressurePoint: request.body?.pressurePoint,
      plan: essay.plan,
      essay: essay.body,
    })
    const updated = await attachEssayFeedback(essay.id, feedback)
    response.status(201).json({ feedback: updated?.feedback ?? feedback })
  } catch (error) {
    response.status(409).json({ error: error instanceof Error ? error.message : 'Essay feedback failed.' })
  }
})

app.put('/api/active-mock', async (request, response) => {
  await setActiveMock(request.body?.mock ?? null)
  response.status(204).end()
})

app.delete('/api/active-mock', async (_request, response) => {
  await setActiveMock(null)
  response.status(204).end()
})

app.post('/api/reports/comprehensive', async (_request, response) => {
  try {
    const evidence = await getEvidence()
    const { report, learnerModel } = await generateComprehensiveReport(evidence)
    await saveReport(report, renderReportMarkdown(report), report)
    await saveLearnerModel(learnerModel)
    response.json({ report })
  } catch (error) {
    response.status(409).json({ error: error instanceof Error ? error.message : 'The complete learning report failed.' })
  }
})

app.get('/api/reports/:id/markdown', async (request, response) => {
  const state = await getState(getAiStatus())
  const report = state.reports.find((item) => item.id === request.params.id)
  if (!report?.path || !report.path.startsWith(dataDirectory)) return response.status(404).send('Report not found.')
  response.type('text/markdown').send(await readFile(report.path, 'utf8'))
})

app.get('/api/reports/:id/json', async (request, response) => {
  const state = await getState(getAiStatus())
  const report = state.reports.find((item) => item.id === request.params.id)
  if (!report?.jsonPath || !report.jsonPath.startsWith(dataDirectory)) return response.status(404).json({ error: 'Report not found.' })
  response.type('application/json').send(await readFile(report.jsonPath, 'utf8'))
})

app.post('/api/reset', async (_request, response) => {
  invalidateAiWork()
  await resetStore()
  response.status(204).end()
})

/**
 * Analysis runs after the evidence is on disk, never before, and never blocks
 * the answer being saved. If the analyst is offline the record is still
 * complete; only the commentary is missing.
 */
async function queueSessionReport(session) {
  if (!getAiStatus().available) return
  if (await hasReport(session.id)) return
  const evidence = await getEvidence()
  const { report, learnerModel } = await generateSessionReport({
    session,
    attempts: evidence.attempts,
    learnerModel: evidence.learnerModel,
    essays: evidence.essays.filter((essay) => essay.sessionId === session.id),
  })
  await saveReport(report, renderReportMarkdown(report), report)
  await saveLearnerModel(learnerModel)
}

async function queueMockAssessment(session) {
  if (!getAiStatus().available) return
  const evidence = await getEvidence()
  if (evidence.mockAssessments.some((item) => item.sessionId === session.id)) return
  const assessment = await assessMock({
    session,
    attempts: evidence.attempts,
    sessions: evidence.sessions,
    learnerModel: evidence.learnerModel,
  })
  await saveMockAssessment(assessment)
}

/** Pick up any completed session whose report was interrupted by a restart. */
async function recoverPending() {
  if (!getAiStatus().available) return
  const evidence = await getEvidence()
  for (const session of evidence.sessions.filter((item) => item.completedAt).slice(-8)) {
    try {
      await queueSessionReport(session)
      if (session.type === 'mock') await queueMockAssessment(session)
    } catch { /* A single failure must not stop the sweep. */ }
  }
}

const dist = resolve('dist')
if (existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*path', (_request, response) => response.sendFile(resolve(dist, 'index.html')))
}

app.listen(port, '127.0.0.1', async () => {
  const status = getAiStatus()
  console.log(`LNATLAS is listening on http://127.0.0.1:${port}`)
  console.log(`Learning memory: ${dataDirectory}`)
  console.log(status.available ? `Analyst ready: ${status.provider} · ${status.model}` : `Analyst offline: ${status.lastError ?? status.access}`)
  await recoverPending()
})

const recoveryTimer = setInterval(() => recoverPending().catch(() => undefined), 90_000)
recoveryTimer.unref()
