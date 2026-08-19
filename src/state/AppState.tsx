import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type {
  ActiveMockCheckpoint,
  AiStatus,
  Attempt,
  AttemptAnalysis,
  EssayFeedback,
  EssayRecord,
  GeneratedPassageRecord,
  GeneratedQuestionRecord,
  LearnerModel,
  LearnerSettings,
  LearningStateSnapshot,
  MockAssessment,
  Passage,
  PassageBlueprint,
  Question,
  ReportSummary,
  SessionRecord,
  SkillState,
} from '../types'

const defaultSettings: LearnerSettings = {
  id: 'learner',
  name: '',
  targetScore: 27,
  dailyMinutes: 30,
  theme: 'light',
  targetUniversity: '',
  onboardingComplete: false,
}

const defaultLearnerModel: LearnerModel = {
  summary: 'The analyst is waiting for enough answer evidence to form a defensible LNAT learning model.',
  strengths: [],
  hypotheses: [],
  priorities: [],
  skillDirectives: [],
  coachingStyle: 'Name the decisive reading move, then verify it on a fresh passage.',
  nextSession: 'Begin with one passage set as a calibration.',
}

const defaultAiStatus: AiStatus = {
  available: false,
  provider: 'none',
  access: 'Offline authored mode',
  model: null,
  state: 'offline',
  queued: 0,
}

interface AppStateValue {
  loading: boolean
  error?: string
  settings: LearnerSettings
  skillStates: SkillState[]
  attempts: Attempt[]
  sessions: SessionRecord[]
  essays: EssayRecord[]
  generatedPassages: GeneratedPassageRecord[]
  generatedQuestions: GeneratedQuestionRecord[]
  analyses: AttemptAnalysis[]
  learnerModel: LearnerModel
  reports: ReportSummary[]
  mockAssessments: MockAssessment[]
  aiStatus: AiStatus
  activeMock: ActiveMockCheckpoint | null
  dataDirectory: string
  stateMap: Map<string, SkillState>
  refresh: () => Promise<void>
  recordAttempt: (attempt: Attempt, question?: Question, passage?: Passage) => Promise<void>
  recordAttempts: (records: Array<{ attempt: Attempt; question?: Question; passage?: Passage }>) => Promise<void>
  analyzeAttempt: (attemptId: string, justification: string) => Promise<AttemptAnalysis>
  saveSession: (session: SessionRecord) => Promise<void>
  saveEssay: (essay: EssayRecord) => Promise<void>
  requestEssayFeedback: (essayId: string, pressurePoint?: string) => Promise<EssayFeedback>
  preparePassageSet: (blueprint: PassageBlueprint, purpose?: 'practice' | 'mock') => Promise<{ passage: GeneratedPassageRecord; questions: GeneratedQuestionRecord[] }>
  updateSettings: (patch: Partial<LearnerSettings>) => Promise<void>
  saveActiveMock: (mock: ActiveMockCheckpoint | null) => Promise<void>
  generateComprehensiveReport: () => Promise<void>
}

const AppStateContext = createContext<AppStateValue | null>(null)

async function post<T>(url: string, body: unknown, failure: string): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const payload = await response.json().catch(() => ({})) as T & { error?: string }
  if (!response.ok) throw new Error(payload.error || failure)
  return payload
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<LearningStateSnapshot | null>(null)
  const [error, setError] = useState<string>()
  const mounted = useRef(true)

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/state', { cache: 'no-store' })
      if (!response.ok) throw new Error('The local LNATLAS server did not return learning state.')
      const next = await response.json() as LearningStateSnapshot
      if (mounted.current) { setSnapshot(next); setError(undefined) }
    } catch (reason) {
      if (mounted.current) setError(reason instanceof Error ? reason.message : 'Could not read the local learning record.')
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    void refresh()
    // The server owns the record, and analysis lands asynchronously, so the
    // browser polls rather than assuming its own copy is current.
    const poll = window.setInterval(() => void refresh(), 4000)
    return () => { mounted.current = false; window.clearInterval(poll) }
  }, [refresh])

  const settings = snapshot?.settings ?? defaultSettings
  useEffect(() => { document.documentElement.dataset.theme = settings.theme }, [settings.theme])

  const recordAttempt = useCallback(async (attempt: Attempt, question?: Question, passage?: Passage) => {
    await post('/api/attempts', { attempt, question, passage }, 'LNATLAS could not write this answer to disk.')
    await refresh()
  }, [refresh])

  const recordAttemptsBatch = useCallback(async (records: Array<{ attempt: Attempt; question?: Question; passage?: Passage }>) => {
    await post('/api/attempts/batch', { records }, 'LNATLAS could not write these answers to disk.')
    await refresh()
  }, [refresh])

  const analyzeAttempt = useCallback(async (attemptId: string, justification: string) => {
    const payload = await post<{ analysis?: AttemptAnalysis }>('/api/analyses/attempt', { attemptId, justification }, 'The reasoning review failed.')
    if (!payload.analysis) throw new Error('The reasoning review returned nothing.')
    await refresh()
    return payload.analysis
  }, [refresh])

  const saveSession = useCallback(async (session: SessionRecord) => {
    await post('/api/sessions', { session }, 'LNATLAS could not write this session to disk.')
    await refresh()
  }, [refresh])

  const saveEssay = useCallback(async (essay: EssayRecord) => {
    await post('/api/essays', { essay }, 'LNATLAS could not save this essay.')
    await refresh()
  }, [refresh])

  const requestEssayFeedback = useCallback(async (essayId: string, pressurePoint?: string) => {
    const payload = await post<{ feedback?: EssayFeedback }>(`/api/essays/${essayId}/feedback`, { pressurePoint }, 'Essay feedback failed.')
    if (!payload.feedback) throw new Error('Essay feedback returned nothing.')
    await refresh()
    return payload.feedback
  }, [refresh])

  const preparePassageSet = useCallback(async (blueprint: PassageBlueprint, purpose: 'practice' | 'mock' = 'practice') => {
    const payload = await post<{ passage?: GeneratedPassageRecord; questions?: GeneratedQuestionRecord[] }>(
      '/api/practice/generate', { blueprint, purpose }, 'A fresh passage could not be prepared.',
    )
    if (!payload.passage || !payload.questions?.length) throw new Error('A fresh passage could not be prepared.')
    await refresh()
    return { passage: payload.passage, questions: payload.questions }
  }, [refresh])

  const updateSettings = useCallback(async (patch: Partial<LearnerSettings>) => {
    const response = await fetch('/api/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
    })
    if (!response.ok) throw new Error('LNATLAS could not save settings.')
    await refresh()
  }, [refresh])

  const saveActiveMock = useCallback(async (mock: ActiveMockCheckpoint | null) => {
    const response = await fetch('/api/active-mock', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mock }),
    })
    if (!response.ok) throw new Error('LNATLAS could not save the mock checkpoint.')
    // Applied locally rather than refetched: the mock runner writes a checkpoint
    // every ten seconds, and a full state refresh on each one would fight the clock.
    setSnapshot((current) => current ? { ...current, activeMock: mock } : current)
  }, [])

  const generateComprehensiveReport = useCallback(async () => {
    await post('/api/reports/comprehensive', {}, 'The complete learning report failed.')
    await refresh()
  }, [refresh])

  const skillStates = snapshot?.skillStates ?? []
  const stateMap = useMemo(() => new Map(skillStates.map((state) => [state.skillId, state])), [skillStates])

  const value = useMemo<AppStateValue>(() => ({
    loading: !snapshot && !error,
    error,
    settings,
    skillStates,
    attempts: snapshot?.attempts ?? [],
    sessions: snapshot?.sessions ?? [],
    essays: snapshot?.essays ?? [],
    generatedPassages: snapshot?.generatedPassages ?? [],
    generatedQuestions: snapshot?.generatedQuestions ?? [],
    analyses: snapshot?.analyses ?? [],
    learnerModel: snapshot?.learnerModel ?? defaultLearnerModel,
    reports: snapshot?.reports ?? [],
    mockAssessments: snapshot?.mockAssessments ?? [],
    aiStatus: snapshot?.aiStatus ?? defaultAiStatus,
    activeMock: snapshot?.activeMock ?? null,
    dataDirectory: snapshot?.dataDirectory ?? '',
    stateMap,
    refresh,
    recordAttempt,
    recordAttempts: recordAttemptsBatch,
    analyzeAttempt,
    saveSession,
    saveEssay,
    requestEssayFeedback,
    preparePassageSet,
    updateSettings,
    saveActiveMock,
    generateComprehensiveReport,
  }), [
    snapshot, error, settings, skillStates, stateMap, refresh, recordAttempt, recordAttemptsBatch,
    analyzeAttempt, saveSession, saveEssay, requestEssayFeedback, preparePassageSet, updateSettings,
    saveActiveMock, generateComprehensiveReport,
  ])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const value = useContext(AppStateContext)
  if (!value) throw new Error('useAppState must be used inside AppStateProvider')
  return value
}
