/**
 * LNATLAS domain model.
 *
 * The LNAT is passage-led: 42 Section A questions hang off 12 passages, and no
 * question is answerable without the passage it belongs to. Everything here is
 * therefore keyed on a Passage rather than on a free-standing item, which is the
 * one structural difference from a question-led test.
 */

export type SectionId = 'section-a' | 'section-b'

export type DomainId =
  | 'comprehension'
  | 'interpretation'
  | 'argument'
  | 'rhetoric'
  | 'essay-craft'

export type Difficulty = 1 | 2 | 3 | 4 | 5
export type ChoiceId = 'a' | 'b' | 'c' | 'd' | 'e'
export type Confidence = 'guess' | 'low' | 'medium' | 'high' | 'certain'
export type SessionType = 'adaptive' | 'diagnostic' | 'review' | 'passage' | 'mock'

/** Broad subject families the LNAT draws on. Used to keep a set from reading like one topic. */
export type PassageTheme =
  | 'law-and-ethics'
  | 'politics-and-society'
  | 'science-and-technology'
  | 'arts-and-culture'
  | 'education'
  | 'economics'
  | 'history'
  | 'philosophy'
  | 'media'
  | 'environment'

/**
 * Real LNAT passages are not all single-author essays. Several are composites of
 * short extracts by different writers, and those generate a distinct family of
 * "who actually claims this" questions.
 */
export type PassageRegister =
  | 'argumentative-essay'
  | 'opinion-column'
  | 'review'
  | 'historical-source'
  | 'multi-extract'

export interface PassageExtract {
  /** Displayed marker, e.g. "Extract 1". */
  label: string
  /** Named voice the extract is attributed to, so attribution questions have a referent. */
  attribution: string
  body: string
}

export interface Passage {
  id: string
  title: string
  theme: PassageTheme
  register: PassageRegister
  /** Paragraphs separated by a blank line. Empty on a multi-extract passage. */
  body: string
  extracts?: PassageExtract[]
  wordCount: number
  /** Reading budget before the questions, in seconds. Used for pace feedback. */
  readingSeconds: number
  source: 'local-original' | 'ai-generated'
}

export interface Choice {
  id: ChoiceId
  text: string
}

export interface Question {
  id: string
  passageId: string
  section: SectionId
  domain: DomainId
  skillId: string
  difficulty: Difficulty
  prompt: string
  choices: Choice[]
  answer: ChoiceId
  /** What the passage actually licenses, and why that decides the item. */
  explanation: string
  /** The transferable rule the item is really teaching. */
  concept: string
  /** Per-distractor diagnosis. Every wrong choice on the LNAT is wrong for a reason. */
  whyWrong?: Partial<Record<ChoiceId, string>>
  estimatedSeconds: number
  source: 'local-original' | 'ai-generated'
}

export interface LessonExample {
  level: 'Easier' | 'Harder'
  /** Short self-contained extract the example question is asked about. */
  extract: string
  prompt: string
  answer: string
  /** Full reasoning chain: what to notice, what to eliminate and why, what the answer does that the others do not. */
  walkthrough: string
}

/** A skill that candidates genuinely conflate with this one, plus the rule that separates them. */
export interface SkillConfusion {
  skillId: string
  distinction: string
}

export interface SkillTopic {
  id: string
  section: SectionId
  domain: DomainId
  title: string
  shortTitle: string
  description: string
  /** Tutor-voice paragraph: what the LNAT is testing here and what separates a candidate who has it. */
  whyItMatters: string
  /** Rough share of a 42-question form, as an honest range rather than a false precision. */
  frequency: string
  coreIdeas: string[]
  method: string[]
  tells: string[]
  traps: string[]
  examples: LessonExample[]
  confusedWith?: SkillConfusion[]
}

export interface DomainMeta {
  id: DomainId
  section: SectionId
  title: string
  shortTitle: string
  /** Approximate share of Section A. Section B carries no question weight. */
  weight: number
  questionRange: string
  description: string
}

export interface Attempt {
  id: string
  sessionId: string
  questionId: string
  passageId: string
  section: SectionId
  domain: DomainId
  skillId: string
  difficulty: Difficulty
  response: string
  correct: boolean
  confidence?: Confidence
  elapsedMs: number
  /** Time spent on the passage before the first question of its set, when recorded. */
  passageReadMs?: number
  usedHint: boolean
  /** Choices the learner crossed out with process of elimination, when tracked. */
  eliminatedChoices?: ChoiceId[]
  mistakeType?: string
  createdAt: string
  questionSnapshot?: Question
  passageSnapshot?: Passage
}

export interface SkillState {
  skillId: string
  theta: number
  alpha: number
  beta: number
  attempts: number
  correct: number
  streak: number
  lapses: number
  avgTimeMs: number
  lastSeen?: string
  dueAt?: string
  intervalDays: number
  ease: number
}

export interface SessionRecord {
  id: string
  type: SessionType
  startedAt: string
  completedAt?: string
  questionIds: string[]
  passageIds: string[]
  answers: Record<string, string>
  flags: string[]
  correct?: number
  total?: number
  /** Section A raw mark out of 42, mock sessions only. */
  sectionAScore?: number
  questionSources?: Record<string, Question['source']>
  questionDifficulties?: Record<string, Difficulty>
  /** Set when the sitting included a Section B response. */
  essayId?: string
  scoreReport?: MockScoreReport
}

export interface MockTrainingAction {
  skillId?: string
  title: string
  reason: string
  action: string
  evidence: string
}

export interface MockScoreReport {
  correct: number
  total: number
  band: { label: string; note: string }
  boundary: string
  averageSeconds: number
  overTimeQuestions: number
  unanswered: number
  flaggedUnanswered: number
  poeUsedQuestions: number
  poeAccurateRate: number | null
  trainingPlan: MockTrainingAction[]
}

export interface EssayPrompt {
  id: string
  text: string
  /** The contested term or hidden move the candidate has to handle to answer well. */
  pressurePoint: string
  theme: PassageTheme
  source: 'local-original' | 'ai-generated'
}

export type EssayCriterionName =
  | 'Engagement with the question'
  | 'Quality of argument'
  | 'Counterargument and qualification'
  | 'Structure and economy'
  | 'Clarity and precision'

export interface EssayCriterion {
  name: EssayCriterionName
  level: 'developing' | 'secure' | 'strong'
  feedback: string
}

export interface EssayFeedback {
  summary: string
  criteria: EssayCriterion[]
  strength: string
  nextMove: string
  /** Concrete line edits, quoting the candidate's own words. */
  lineNotes: Array<{ quote: string; note: string }>
  model: string
  createdAt: string
}

export interface EssayRecord {
  id: string
  sessionId?: string
  promptId: string
  promptText: string
  plan: string
  body: string
  wordCount: number
  elapsedMs: number
  createdAt: string
  feedback?: EssayFeedback
}

export interface LearnerSettings {
  id: 'learner'
  name: string
  /** Target Section A raw mark out of 42. */
  targetScore: number
  testDate?: string
  dailyMinutes: number
  theme: 'system' | 'light' | 'dark'
  /** Shown alongside the score estimate so a target has a real-world referent. */
  targetUniversity: string
  onboardingComplete: boolean
}

export interface GeneratedPassageRecord extends Passage {
  createdAt: string
  validationStatus: 'accepted' | 'quarantined'
}

export interface GeneratedQuestionRecord extends Question {
  createdAt: string
  validationStatus: 'accepted' | 'quarantined'
  generation?: {
    model: string
    promptVersion: string
    blueprint: QuestionBlueprint
    reviewerModel: string
    reviewerVerdict: string
    reviewedAt: string
  }
}

export interface QuestionBlueprint {
  domain: DomainId
  skillId: string
  difficulty: Difficulty
}

/** One passage plus the question slots that hang off it. The unit of generation. */
export interface PassageBlueprint {
  theme: PassageTheme
  register: PassageRegister
  questions: QuestionBlueprint[]
}

export type EvidenceConfidence = 'tentative' | 'moderate' | 'strong'

export interface EvidenceClaim {
  claim: string
  evidenceIds: string[]
  confidence: EvidenceConfidence
}

export interface SkillDirective {
  skillId: string
  priority: number
  targetDifficulty: Difficulty
  reason: string
  evidenceIds: string[]
}

export interface LearnerModel {
  updatedAt?: string
  summary: string
  strengths: EvidenceClaim[]
  hypotheses: EvidenceClaim[]
  priorities: EvidenceClaim[]
  skillDirectives: SkillDirective[]
  coachingStyle: string
  nextSession: string
}

export interface AttemptAnalysis {
  id: string
  attemptId: string
  createdAt: string
  model: string
  promptVersion: string
  learnerJustification: string
  verdict: string
  answerAssessment: string
  justificationQuality: 'thin' | 'partial' | 'sound' | 'excellent'
  justificationAssessment: string
  soundMoves: string[]
  gaps: string[]
  conceptLesson: string
  betterApproach: string[]
  transferCheck: string
  nextMove: string
  evidenceIds: string[]
  confidence: EvidenceConfidence
}

export interface ReportDomainBreakdown {
  domain: DomainId
  accuracySummary: string
  pacingSummary: string
  findings: EvidenceClaim[]
  recommendedFocus: string
}

export interface ReportSkillBreakdown {
  skillId: string
  correct: number
  total: number
  averageSeconds: number
  diagnosis: string
  nextDifficulty: Difficulty
  action: string
  evidenceIds: string[]
  confidence: EvidenceConfidence
}

export interface ReportErrorClass {
  label: string
  count: number
  mechanism: string
  evidenceIds: string[]
}

export interface StudyPriority {
  skillId: string
  action: string
  reason: string
  evidenceIds: string[]
}

export interface StudyDay {
  day: string
  minutes: number
  work: string
  successCheck: string
}

export interface ReportSummary {
  id: string
  type: 'session' | 'comprehensive'
  title: string
  period: string
  createdAt: string
  executiveSummary: string
  path: string
  jsonPath: string
  model: string
  answerCount?: number
  domainBreakdown: ReportDomainBreakdown[]
  skillBreakdown: ReportSkillBreakdown[]
  errorTaxonomy: ReportErrorClass[]
  studyPriorities: StudyPriority[]
  sevenDayPlan: StudyDay[]
  recommendedMix: string
  limitations: string[]
}

export interface MockAssessment {
  sessionId: string
  /** How demanding this particular form was, judged from its composition alone. */
  formDemand: 'accessible' | 'balanced' | 'demanding'
  expectedScore: number
  confidence: EvidenceConfidence
  rationale: string
  boundary: string
  model: string
  createdAt: string
}

export interface AiStatus {
  available: boolean
  provider: 'antigravity' | 'gemini' | 'claude' | 'none'
  access: string
  model: string | null
  state: 'idle' | 'working' | 'offline' | 'error'
  queued: number
  activeTask?: string
  lastCompletedAt?: string
  lastError?: string
}

export type MockStage = 'intro' | 'section-a' | 'review' | 'confirm' | 'break' | 'essay-choice' | 'essay' | 'complete'

export interface ActiveMockCheckpoint {
  id: string
  passages: Passage[]
  questions: Question[]
  prompts: EssayPrompt[]
  stage: MockStage
  questionIndex: number
  answers: Record<string, string>
  flags: string[]
  eliminated: Record<string, ChoiceId[]>
  remaining: number
  timeExpired: boolean
  essayPromptId: string | null
  essayPlan: string
  essay: string
  startedAt: string
  elapsedByQuestion: Record<string, number>
  checkpointedAt: string
  /** Built when Section A is submitted; retained so a paused sitting keeps its diagnosis. */
  scoreReport?: MockScoreReport
}

export interface LearningStateSnapshot {
  settings: LearnerSettings
  attempts: Attempt[]
  sessions: SessionRecord[]
  skillStates: SkillState[]
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
}
