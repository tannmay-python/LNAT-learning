import type { DomainMeta, SkillTopic } from '../types'

/**
 * The LNAT publishes no syllabus. This map is built backwards from what the
 * official practice material and its commentary actually reward: close reading,
 * argument anatomy, and a candidate's willingness to answer the question asked
 * rather than the question they expected. Weights are honest ranges, not a
 * claimed blueprint.
 */
export const domains: DomainMeta[] = [
  {
    id: 'comprehension',
    section: 'section-a',
    title: 'Close comprehension',
    shortTitle: 'Comprehension',
    weight: 20,
    questionRange: '7–10',
    description: 'What the passage states, what a word is doing where it sits, and which voice is responsible for a claim.',
  },
  {
    id: 'interpretation',
    section: 'section-a',
    title: 'Interpretation and inference',
    shortTitle: 'Inference',
    weight: 25,
    questionRange: '9–12',
    description: 'Moving one careful step beyond the text without importing anything the text has not licensed.',
  },
  {
    id: 'argument',
    section: 'section-a',
    title: 'Argument analysis',
    shortTitle: 'Argument',
    weight: 35,
    questionRange: '13–17',
    description: 'Conclusion, supporting structure, unstated bridges, the effect of new evidence, and where reasoning breaks.',
  },
  {
    id: 'rhetoric',
    section: 'section-a',
    title: 'Style, tone, and rhetorical purpose',
    shortTitle: 'Rhetoric',
    weight: 20,
    questionRange: '7–10',
    description: 'Why the writer chose that comparison, that emphasis, that punctuation, and that stance.',
  },
  {
    id: 'essay-craft',
    section: 'section-b',
    title: 'The Section B essay',
    shortTitle: 'Essay',
    weight: 0,
    questionRange: '1 of 3',
    description: 'Forty minutes, one proposition, and roughly 500–600 words in which to be genuinely persuasive.',
  },
]

export const curriculum: SkillTopic[] = [
  // ---------------------------------------------------------------- Comprehension
  {
    id: 'literal-meaning',
    section: 'section-a',
    domain: 'comprehension',
    title: 'What the passage actually says',
    shortTitle: 'Literal meaning',
    description: 'Answer from the text in front of you, not from what you already believe about the topic.',
    whyItMatters:
      'Almost every LNAT distractor is true of the world. Only one is true of the passage. The official commentary keeps returning to the same instruction: take the material at face value and resist what you think you know about the subject. Candidates who lose marks here are rarely careless readers; they are informed readers who let outside knowledge do the work the passage was supposed to do. The discipline is to treat the twelve passages as a closed universe for ninety-five minutes.',
    frequency: 'Two to four items a form, usually the opening question on a passage.',
    coreIdeas: [
      'Every correct Section A answer is recoverable from the passage alone.',
      'A statement can be perfectly true and still be the wrong answer, because the passage never made it.',
      'Scope words — all, some, most, often, rarely, only — are usually where the right answer separates from the near-miss.',
      'If a question names a paragraph or a phrase, the answer lives there, but the surrounding argument tells you how to read it.',
    ],
    method: [
      'Read the question stem before you hunt, and note exactly what it is asking for.',
      'Find the sentence or sentences the stem points to, then read one sentence either side of them.',
      'Restate the relevant claim in your own words before you look at the options.',
      'Eliminate any option that adds a quantity, cause, or judgement the passage did not supply.',
    ],
    tells: [
      'Stems that quote the passage directly, or name a paragraph or a section.',
      'Options that are five paraphrases of the same idea at five different strengths.',
      'A "not", "except", or "least" in bold — the passage supports four of the five options.',
    ],
    traps: [
      'Choosing the option that matches your prior knowledge of the topic rather than the text.',
      'Accepting a stronger version of a claim the passage hedged, or a hedged version of one it asserted flatly.',
      'Answering from the first matching phrase without checking that the phrase is doing what the option says it does.',
    ],
    examples: [
      {
        level: 'Easier',
        extract:
          'Sentencing guidelines were introduced, their architects said, to make outcomes predictable. Predictability has largely followed. Whether the outcomes are just is a separate question, and one the guidelines were never designed to settle.',
        prompt: 'According to the writer, the sentencing guidelines have:',
        answer: 'achieved the aim their architects set for them',
        walkthrough:
          'The passage grants exactly one success — predictability — and explicitly withholds judgement on justice. An option saying the guidelines "made sentencing fairer" imports the very question the writer sets aside. An option saying they "failed" contradicts "predictability has largely followed". The answer must be the narrow one: the stated aim was met, and nothing more is claimed.',
      },
      {
        level: 'Harder',
        extract:
          'Most jurisdictions that abolished the exemption saw no measurable rise in litigation. Campaigners treat this as proof the exemption was unnecessary. It shows only that abolition was survivable, which is not at all the same thing.',
        prompt: 'Which of the following does the writer accept?',
        answer: 'that abolishing the exemption did not, in most cases, produce more litigation',
        walkthrough:
          'The writer concedes the empirical finding and disputes only what it proves. "The exemption was unnecessary" is the campaigners\' inference, and the last sentence rejects it, so it cannot be what the writer accepts. "Abolition was beneficial" is never claimed — "survivable" is deliberately weaker. The accepted claim is the raw finding, stripped of the interpretation attached to it.',
      },
    ],
    confusedWith: [
      { skillId: 'inference', distinction: 'Literal-meaning items ask what was said; inference items ask what follows from what was said. If you have to add a step, it is inference.' },
    ],
  },
  {
    id: 'word-in-context',
    section: 'section-a',
    domain: 'comprehension',
    title: 'Meaning in context',
    shortTitle: 'Word in context',
    description: 'Decide what a word or phrase is doing in this sentence, in this argument, rather than in a dictionary.',
    whyItMatters:
      'The LNAT does not test vocabulary. It tests whether you can watch a familiar word take an unfamiliar job. The commentary on the 2010 practice tests works through exactly this: "quandary" has to be read as dilemma, not as a general embarrassment, because the argument around it is about competing moral obligations. The word you are asked about is nearly always one the writer chose to carry weight — and the wrong options are usually correct dictionary definitions that do not fit the load the word is bearing.',
    frequency: 'One to three items a form.',
    coreIdeas: [
      'The context supplies the meaning; the dictionary only supplies the candidates.',
      'Substitute each option into the sentence and read the whole sentence back. Most fail on grammar, register, or logic.',
      'A word inside a comparison takes its meaning from what is being compared.',
      'When the writer is being ironic, the intended meaning is often the opposite of the surface one.',
    ],
    method: [
      'Cover the options and produce your own paraphrase of the word from the sentence alone.',
      'Widen to the paragraph and check the direction of the argument — is the word praising, conceding, or undercutting?',
      'Substitute each option back into the original sentence, whole.',
      'Prefer the option that preserves the writer\'s attitude, not just the denotation.',
    ],
    tells: [
      'Stems of the form "in line X, the word Y most nearly means", or "by Z the writer means".',
      'A word placed in inverted commas, italicised, or repeated across paragraphs.',
      'A metaphor that the passage then extends.',
    ],
    traps: [
      'Selecting the most common meaning when the passage uses a secondary one.',
      'Selecting a meaning that fits the sentence but reverses the writer\'s evaluation.',
      'Selecting a synonym that is more extreme than the word being defined.',
    ],
    examples: [
      {
        level: 'Easier',
        extract:
          'The reforms were sold as a modest housekeeping exercise. In practice they redrew the boundary between the courts and the executive, and did so permanently.',
        prompt: 'The writer\'s use of "housekeeping" is intended to convey:',
        answer: 'that the reforms were presented as trivial when they were not',
        walkthrough:
          '"Sold as" flags the description as someone else\'s, and "in practice" announces the correction. So "housekeeping" carries the promoters\' framing, which the next sentence dismantles. A literal answer about domestic tidiness misses that the word is being quoted, not endorsed. An answer about the reforms being genuinely small contradicts "redrew the boundary… permanently".',
      },
      {
        level: 'Harder',
        extract:
          'Critics call the doctrine elastic, and they intend no compliment. But elasticity is what allows a nineteenth-century rule to survive a twenty-first-century dispute without being rewritten every decade.',
        prompt: 'The writer\'s treatment of "elastic" shows that they:',
        answer: 'accept the critics\' description while rejecting the criticism attached to it',
        walkthrough:
          'Two moves happen in two sentences. The writer reports the label and its hostile intent, then keeps the label and reverses its value. So the answer must capture a split: description accepted, evaluation refused. "The writer disputes that the doctrine is elastic" fails on the second sentence. "The writer agrees with the critics" fails on "no compliment". The precise answer holds both halves.',
      },
    ],
    confusedWith: [
      { skillId: 'authorial-attitude', distinction: 'Word-in-context asks what a term means here; attitude asks how the writer feels overall. A single word can be sarcastic in a broadly sympathetic passage.' },
    ],
  },
  {
    id: 'attribution',
    section: 'section-a',
    domain: 'comprehension',
    title: 'Who claims what',
    shortTitle: 'Attribution',
    description: 'Keep the writer, the writer\'s opponents, and any quoted third parties strictly apart.',
    whyItMatters:
      'Several LNAT passages are composites: two or three short extracts by different writers on one subject, sometimes reviewing each other. The 2010 commentary walks through an item where the candidate must work out whether Simon Baron-Cohen, John Gray, or Deborah Cameron would endorse a particular statement, and the whole difficulty is bookkeeping. Single-author passages create the same problem more quietly, because a writer will often spend two paragraphs stating a position they are about to demolish. Losing track of the speaker is the single most expensive reading error on this test.',
    frequency: 'Two to four items a form, concentrated on multi-extract passages.',
    coreIdeas: [
      'A view stated in a passage is not thereby the writer\'s view.',
      'Verbs of attribution — argues, insists, is said to, critics contend — mark ownership. Read them as labels.',
      'On multi-extract passages, one writer may be describing a second writer\'s account of a third. Track the chain.',
      'Silence is informative: if a writer never endorses a claim, they have not endorsed it.',
    ],
    method: [
      'On first read, put a mark against every change of voice.',
      'For each named party, hold one sentence summarising their position.',
      'Reread the stem to see whose view is actually being asked about.',
      'Test each option against that party alone, and discard anything true of a different party.',
    ],
    tells: [
      'Stems naming a person, group, or extract: "Which of these would X accept?"',
      'Passages with headed extracts, or with a paragraph beginning "It is often said that…".',
      'Long stretches of reported speech followed by "But".',
    ],
    traps: [
      'Attributing to the writer a position they set up in order to reject it.',
      'On composite passages, choosing an option that is right for the wrong extract.',
      'Assuming that a writer who criticises one part of a position rejects all of it.',
    ],
    examples: [
      {
        level: 'Easier',
        extract:
          'It is often said that juries are unpredictable and should be reserved for the gravest cases. The claim is repeated with such confidence that it is rarely examined. When it has been examined, it has not survived.',
        prompt: 'The writer regards the claim about juries as:',
        answer: 'widely repeated but unsupported by the evidence',
        walkthrough:
          '"It is often said" hands the claim to other people. "Rarely examined" and "has not survived" are the writer\'s own verdict. An option saying the writer agrees juries are unpredictable adopts the reported view as the writer\'s. An option saying the claim has never been tested contradicts "when it has been examined".',
      },
      {
        level: 'Harder',
        extract:
          'Extract 1 (Halloran): Lang\'s study is careful but narrow; his conclusion about deterrence outruns his data.\nExtract 2 (Voss): Halloran is right that Lang overreaches. He is wrong to imply that a wider study would rescue the conclusion — the effect Lang looked for does not exist.',
        prompt: 'Which statement would both Halloran and Voss accept?',
        answer: 'that Lang\'s conclusion is not supported by the study he conducted',
        walkthrough:
          'Halloran says the conclusion outruns the data; Voss opens by agreeing with exactly that. Their disagreement begins one step later, over whether more data would help. So the shared ground is the narrow claim about Lang\'s own study. An option asserting that the deterrent effect does not exist is Voss alone. An option saying Lang\'s study was careless contradicts Halloran\'s "careful".',
      },
    ],
    confusedWith: [
      { skillId: 'authorial-attitude', distinction: 'Attribution asks whose claim it is; attitude asks how the writer regards it. You can locate a speaker correctly and still misjudge the writer\'s temperature.' },
    ],
  },

  // ---------------------------------------------------------------- Interpretation
  {
    id: 'inference',
    section: 'section-a',
    domain: 'interpretation',
    title: 'Supported inference',
    shortTitle: 'Inference',
    description: 'Take exactly one step past the text — the step the text guarantees, and no further.',
    whyItMatters:
      'This is the LNAT\'s central skill and the one law faculties are actually looking for. A supported inference is not the most plausible continuation of the passage; it is the claim that could not be false if the passage is true. The gap between "reasonable" and "entailed" is where most of the marks in Section A sit. Strong candidates habitually ask a blunt question of each option: could I construct a world in which the passage holds and this option fails? If yes, it is out, however sensible it sounds.',
    frequency: 'Four to six items a form.',
    coreIdeas: [
      'An inference must be true given the passage, not merely consistent with it.',
      'The safest inferences are usually the weakest-sounding ones.',
      'Combine statements deliberately: many inference items require two separated sentences to be put together.',
      'Watch conditionals. "If A then B" licenses "not B therefore not A", and licenses nothing about "not A".',
    ],
    method: [
      'Identify which parts of the passage the stem restricts you to.',
      'For each option, ask whether the passage makes it unavoidable.',
      'Actively look for a counterexample that keeps the passage true and the option false.',
      'Prefer the option with the narrowest scope that still survives.',
    ],
    tells: [
      'Stems using "implies", "it follows that", "the passage suggests", or "we can conclude".',
      'Options that differ only by a quantifier or a modal verb.',
      'Passages that state a rule in one paragraph and a case in another.',
    ],
    traps: [
      'Reversing a conditional, or treating a sufficient condition as a necessary one.',
      'Sliding from "many" to "most", or from "contributed to" to "caused".',
      'Choosing the option that predicts what happens next, when the passage only supports a claim about now.',
    ],
    examples: [
      {
        level: 'Easier',
        extract:
          'No appeal succeeds without new evidence. Marston\'s appeal succeeded.',
        prompt: 'It follows that:',
        answer: 'Marston presented new evidence',
        walkthrough:
          'The first sentence makes new evidence necessary for success. Marston succeeded, so the necessary condition held. An option saying "anyone with new evidence succeeds" reverses the conditional — necessity is not sufficiency. An option about the strength of Marston\'s case adds a judgement the two sentences never license.',
      },
      {
        level: 'Harder',
        extract:
          'Every tribunal that publishes its reasons has, within five years, seen its reversal rate fall. Two of the six regional tribunals do not publish. The national tribunal has published since its creation and its reversal rate is the lowest recorded.',
        prompt: 'Which of the following must be true?',
        answer: 'at least four regional tribunals have seen their reversal rate fall within five years of publishing',
        walkthrough:
          'Four regional tribunals publish, and the rule applies to every publishing tribunal, so the fall is guaranteed for those four. The national tribunal\'s low rate is reported but the passage never says publication caused it, so a causal option overreaches. An option about the two non-publishing tribunals having high rates is unlicensed: the rule says nothing about non-publishers.',
      },
    ],
    confusedWith: [
      { skillId: 'application', distinction: 'Inference stays inside the passage\'s subject; application carries the passage\'s principle to a case the passage never mentions.' },
      { skillId: 'assumption', distinction: 'An inference follows from the argument; an assumption is something the argument needed before it could get going.' },
    ],
  },
  {
    id: 'fact-vs-opinion',
    section: 'section-a',
    domain: 'interpretation',
    title: 'Fact, report, and judgement',
    shortTitle: 'Fact vs judgement',
    description: 'Separate what is being asserted as verifiable from what is being offered as an evaluation.',
    whyItMatters:
      'The official commentary is explicit that you must "look closely at the part each statement plays in the argument, not their absolute truth or otherwise". Passages mix three kinds of sentence — checkable claims, reports of other people\'s claims, and the writer\'s own judgements — and a large family of questions turns on telling them apart. This is also the habit that makes Section B work: a candidate who cannot see the judgements in someone else\'s prose cannot control the judgements in their own.',
    frequency: 'Two to four items a form.',
    coreIdeas: [
      'A fact is a claim that could in principle be checked, whether or not it is true.',
      'A judgement embeds a standard: better, unacceptable, excessive, overdue.',
      'A report is neither: it records that someone said something.',
      'Statistics are facts; what a statistic shows is almost always a judgement.',
    ],
    method: [
      'For each sentence, ask what evidence would settle it. If nothing could, it is a judgement.',
      'Underline evaluative adjectives and adverbs — they are where judgement hides.',
      'Check whether a number is being reported or interpreted.',
      'Match the option to the category the stem asks about, not to whether you agree.',
    ],
    tells: [
      'Stems asking which statement is "a matter of opinion", "a statement of fact", or "an interpretation".',
      'Sentences pairing a figure with a verdict: "only twelve per cent — a derisory share".',
      'Hedges such as arguably, surely, no doubt.',
    ],
    traps: [
      'Treating a false factual claim as an opinion because you disagree with it.',
      'Treating a widely shared judgement as a fact because it is uncontroversial.',
      'Missing the judgement smuggled into a single adjective attached to an otherwise factual sentence.',
    ],
    examples: [
      {
        level: 'Easier',
        extract:
          'Legal aid spending fell by a third between 2012 and 2019. That is an indefensible retreat from a basic guarantee.',
        prompt: 'Which part of the passage is a statement of fact?',
        answer: 'the claim that legal aid spending fell by a third between 2012 and 2019',
        walkthrough:
          'The first sentence is checkable against spending records, so it is factual regardless of whether the figure is right. "Indefensible retreat from a basic guarantee" embeds two standards — what counts as defensible and what counts as basic — and no measurement settles either.',
      },
      {
        level: 'Harder',
        extract:
          'The committee reported that delays had "worsened materially". Court statistics show median waiting times rose from 21 to 26 weeks. Twenty-six weeks is intolerable for anyone awaiting a custody decision.',
        prompt: 'The third sentence differs from the first two in that it:',
        answer: 'applies a standard rather than recording or reporting a measurement',
        walkthrough:
          'Sentence one reports what the committee said; sentence two states a measured figure; sentence three declares a threshold of tolerability. An option calling the third sentence "unsupported" misses the point — it is supported by sentence two, but support does not convert a judgement into a fact. An option calling the first sentence a judgement confuses the committee\'s evaluation with the writer\'s report of it.',
      },
    ],
    confusedWith: [
      { skillId: 'attribution', distinction: 'This skill sorts sentences by kind; attribution sorts them by owner. A reported judgement is both a report and a judgement, and the stem tells you which axis matters.' },
    ],
  },
  {
    id: 'application',
    section: 'section-a',
    domain: 'interpretation',
    title: 'Applying the passage elsewhere',
    shortTitle: 'Application',
    description: 'Carry the passage\'s principle to a case it never mentions, and test the fit condition by condition.',
    whyItMatters:
      'The official guidance warns that you "may be asked to apply the understanding you have gained from reading one passage to another example, unrelated by subject". These items look like a change of topic and are really a test of whether you extracted a rule or only a summary. They reward the same move a first-year law student learns: state the principle in general terms, break it into conditions, then check the new facts against each condition rather than against the atmosphere of the original case.',
    frequency: 'One to three items a form, often the last question on a passage.',
    coreIdeas: [
      'Restate the passage\'s principle without any of its original subject matter.',
      'A principle is a set of conditions. A new case fits only if it meets all of them.',
      'Surface similarity of topic is worthless; structural similarity is everything.',
      '"Which would NOT be an example" items require you to confirm four fits, not just find one misfit.',
    ],
    method: [
      'Write the principle as "whenever A and B, then C".',
      'For each option, name what plays the role of A, of B, and of C.',
      'Reject options where one role is unfilled or filled by something that only resembles it.',
      'If two options fit, reread the principle for a condition you dropped.',
    ],
    tells: [
      'Stems beginning "based on the passage", followed by an unrelated scenario.',
      'Options set in five different domains from the passage\'s own.',
      'A passage that spends a paragraph stating a general rule before its examples.',
    ],
    traps: [
      'Choosing the option nearest the passage\'s own subject matter.',
      'Applying the writer\'s conclusion rather than the writer\'s principle.',
      'Ignoring a negative condition — the principle may exclude a class the option belongs to.',
    ],
    examples: [
      {
        level: 'Easier',
        extract:
          'A rule earns obedience not because it is enforced but because those it binds had a real chance to shape it. Enforcement without that chance produces compliance, not legitimacy.',
        prompt: 'Based on the passage, which arrangement would lack legitimacy?',
        answer: 'a residents\' association fining members under a rule adopted before any of them joined',
        walkthrough:
          'The principle has one operative condition — a real chance to shape the rule — and one consequence: without it, you get compliance rather than legitimacy. The fining case fails the condition exactly, since no current member could have shaped the rule. An option about a rule that is unpopular but was voted on meets the condition and so is legitimate under this principle, however disliked.',
      },
      {
        level: 'Harder',
        extract:
          'The writer argues that expertise should confer authority only within the domain where it was earned, and only while the expert remains accountable to others in that domain.',
        prompt: 'Which of the following would the writer be LEAST likely to accept?',
        answer: 'an economist\'s judgement on constitutional design carrying particular weight because their economic work is highly regarded',
        walkthrough:
          'Two conditions govern: domain match and continuing accountability. The economist case breaks the first outright — authority is being exported from economics into constitutional design. Options where a specialist speaks within their field and remains subject to peer scrutiny satisfy both conditions. A case where a specialist speaks in-field but has retired tests only the second condition, so it is weaker as a "least likely" answer than one that fails the first condition cleanly.',
      },
    ],
    confusedWith: [
      { skillId: 'inference', distinction: 'Application changes the subject matter; inference does not. If the option is about the passage\'s own topic, you are inferring.' },
    ],
  },

  // ---------------------------------------------------------------- Argument
  {
    id: 'main-conclusion',
    section: 'section-a',
    domain: 'argument',
    title: 'The main conclusion',
    shortTitle: 'Main conclusion',
    description: 'Find the one claim every other claim in the passage exists to support.',
    whyItMatters:
      'The commentary advises following "the progress of the main argument and its structure as it goes through various stages". Conclusions in LNAT passages are frequently not in the final sentence, and are frequently not the most emphatic sentence either — writers often close on a qualification or an image. Locating the conclusion is the precondition for the assumption, strengthen, weaken, and flaw items on the same passage, so a mistake here compounds.',
    frequency: 'Two to four items a form.',
    coreIdeas: [
      'The conclusion is what the passage is for; everything else earns its place by supporting it.',
      'Test with "because": conclusion because premise reads naturally, the reverse does not.',
      'A conclusion may be stated once, early, and then defended for four paragraphs.',
      'Recommendations ("should", "must", "ought") are conclusions far more often than they are premises.',
    ],
    method: [
      'Summarise the passage in one sentence without looking at the options.',
      'For each candidate sentence, ask what supports it and what it supports.',
      'Discard vivid premises and striking examples, however memorable.',
      'Check that the option covers the whole argument, not one strand of it.',
    ],
    tells: [
      'Stems such as "the main point of the passage is", "the writer is principally arguing that".',
      'Connectives: therefore, so, which is why, it follows.',
      'A first paragraph that announces a position and a last that restates it in different words.',
    ],
    traps: [
      'Selecting a subsidiary conclusion that supports the real one.',
      'Selecting the passage\'s topic rather than its claim — "the role of juries" is a subject, not a conclusion.',
      'Selecting an option that is too broad, and so covers claims the passage never defended.',
    ],
    examples: [
      {
        level: 'Easier',
        extract:
          'Anonymity online is blamed for cruelty. But the cruellest campaigns of the past decade were run under real names, by people who wanted to be seen doing it. What licenses cruelty is not concealment; it is an audience that rewards it.',
        prompt: 'The main conclusion of the passage is that:',
        answer: 'cruelty online is enabled by an approving audience rather than by anonymity',
        walkthrough:
          'The named-campaigns sentence is evidence, not the point — it exists to defeat the anonymity explanation. The final sentence states the positive claim the whole paragraph builds toward. An option that says only "anonymity is not to blame" captures the negative half and drops the positive one, so it is a subsidiary conclusion.',
      },
      {
        level: 'Harder',
        extract:
          'Codified constitutions are said to protect rights. Yet the states with the longest lists of guaranteed rights include several with the worst records. The text does no work by itself. What protects rights is a judiciary willing to enforce the text against the government that appointed it — and no amount of drafting creates that willingness.',
        prompt: 'The writer\'s principal contention is that:',
        answer: 'rights are protected by judicial independence rather than by constitutional drafting',
        walkthrough:
          'The worst-records sentence is evidence; "the text does no work by itself" is an intermediate conclusion drawn from it; the final sentence supplies the positive account and the closing clause defends it. The principal contention is the positive one, because the intermediate conclusion is used to reach it. An option confined to "codified constitutions do not protect rights" stops at the intermediate step.',
      },
    ],
    confusedWith: [
      { skillId: 'passage-purpose', distinction: 'The conclusion is what the writer claims; the purpose is what the writer is trying to do — inform, provoke, correct a misconception. A passage can conclude one thing while its purpose is to unsettle you.' },
    ],
  },
  {
    id: 'argument-structure',
    section: 'section-a',
    domain: 'argument',
    title: 'The role a statement plays',
    shortTitle: 'Argument role',
    description: 'Identify whether a sentence is a premise, an example, a concession, an opposing view, or the conclusion itself.',
    whyItMatters:
      'The commentary is unusually direct here: "you will need to look closely at the part each statement plays in the argument, not their absolute truth or otherwise". Writers move constantly between asserting, illustrating, conceding, and rebutting, and a fluent reader tracks those moves without effort. LNAT role questions strip away the topic and ask only about the machinery. Getting good at this is also the fastest route to writing a Section B essay whose parts are visibly doing different jobs.',
    frequency: 'Two to four items a form.',
    coreIdeas: [
      'A concession is a claim the writer grants in order to limit its damage.',
      'An example illustrates a claim already made; it does not establish a new one.',
      'An intermediate conclusion is supported by something and supports something else.',
      'A rhetorical question is usually an assertion in disguise; read it as the answer it expects.',
    ],
    method: [
      'Locate the main conclusion first — every role is defined relative to it.',
      'Ask of the target sentence: does the passage support this, or does this support the passage?',
      'Check the connective in front of it — "admittedly", "of course", "but", "for instance" each name a role.',
      'Confirm by deleting the sentence: what breaks tells you what it was holding up.',
    ],
    tells: [
      'Stems quoting a sentence and asking what it "serves to do" or "is offered as".',
      'Paragraphs beginning "It is true that…" or "Critics will object that…".',
      'Numbered or lettered statements the stem asks you to classify.',
    ],
    traps: [
      'Calling a concession the writer\'s own position.',
      'Calling an example a premise, when it only illustrates a premise already stated.',
      'Assuming the final sentence is the conclusion when it is a qualification of it.',
    ],
    examples: [
      {
        level: 'Easier',
        extract:
          'Mandatory minimums do reduce sentencing disparity between judges — that much is established. They achieve it by removing the discretion that lets a judge respond to the case in front of them, which is why the disparity they remove is not the disparity that mattered.',
        prompt: 'The first sentence functions as:',
        answer: 'a concession the writer makes before limiting its significance',
        walkthrough:
          '"That much is established" grants the point, and the second sentence immediately reinterprets what the point is worth. The sentence is not the writer\'s conclusion, since the passage argues against mandatory minimums. It is not an example, because it states a general finding rather than illustrating one.',
      },
      {
        level: 'Harder',
        extract:
          '(1) Access to justice cannot mean access to lawyers alone. (2) Two thirds of litigants in the small claims track are unrepresented. (3) If the system is unusable without a lawyer, then for most of its users it is unusable. (4) The design brief, therefore, is a system a competent adult can navigate unaided.',
        prompt: 'Statement (2) is best described as:',
        answer: 'evidence supporting the conditional claim made in (3)',
        walkthrough:
          '(4) is the conclusion, signalled by "therefore". (3) is a conditional that turns the statistic into an argument. (2) supplies the "most of its users" that (3) relies on, so it feeds (3) rather than standing on its own. (1) states the position (4) refines. Calling (2) the conclusion mistakes a statistic for a claim about what ought to be done.',
      },
    ],
    confusedWith: [
      { skillId: 'main-conclusion', distinction: 'Role items ask about a nominated sentence; conclusion items ask about the whole passage. Find the conclusion first, then read the role off it.' },
    ],
  },
  {
    id: 'assumption',
    section: 'section-a',
    domain: 'argument',
    title: 'The unstated bridge',
    shortTitle: 'Assumption',
    description: 'Find what the argument needs to be true, and never says, for its reasons to reach its conclusion.',
    whyItMatters:
      'Every real argument leaves something out. The examinable question is which omission is load-bearing. Candidates who go wrong here usually select a claim that would help the argument rather than one the argument cannot survive without. The denial test settles almost every case in seconds and is worth drilling until it is automatic, because it is the same test that lets you dismantle an opposing position in Section B without misrepresenting it.',
    frequency: 'Two to four items a form.',
    coreIdeas: [
      'An assumption is necessary, not merely helpful.',
      'The gap is usually between the terms of the premise and the terms of the conclusion.',
      'Many assumptions rule something out: no other cause, no relevant difference, no countervailing effect.',
      'If the option restates a premise, it is not an assumption — it is already there.',
    ],
    method: [
      'State the premise and the conclusion in the fewest possible words.',
      'Name the term that appears in one and not the other.',
      'For each option, deny it. If the argument collapses, that is the assumption.',
      'If denying an option merely weakens the argument, it is a strengthener, not an assumption.',
    ],
    tells: [
      'Stems using "assumes", "takes for granted", "depends on", "relies on".',
      'Arguments that jump from a correlation to a recommendation.',
      'Conclusions about people in general drawn from one setting.',
    ],
    traps: [
      'Choosing a plausible background fact that the argument does not actually need.',
      'Choosing a claim so strong that the argument would work without it.',
      'Confusing what the writer probably believes with what the argument requires.',
    ],
    examples: [
      {
        level: 'Easier',
        extract:
          'Cases heard remotely conclude four weeks sooner than those heard in person. Remote hearings should therefore become the default.',
        prompt: 'The argument assumes that:',
        answer: 'speed of conclusion is not outweighed by other consequences of hearing cases remotely',
        walkthrough:
          'Deny it: if remote hearings are faster but produce worse outcomes, the recommendation fails immediately. That is the load-bearing gap between a timing premise and a policy conclusion. An option asserting that remote hearings are cheaper would help the argument but is not needed — the argument runs on speed alone. An option restating that remote hearings are faster is a premise, not an assumption.',
      },
      {
        level: 'Harder',
        extract:
          'Firms that publish pay ratios narrowed their internal pay gap within two years. Publication should be mandatory for all listed companies.',
        prompt: 'Which of the following is an assumption of the argument?',
        answer: 'firms that would publish only under compulsion would respond similarly to those that published voluntarily',
        walkthrough:
          'The evidence comes from self-selecting publishers; the conclusion applies to everyone. Deny the option and the argument dies, because the observed narrowing may be a property of firms already inclined to narrow. An option that publication is inexpensive is a convenience, not a necessity. An option that narrow pay gaps are desirable looks essential but the passage treats it as shared ground rather than as the inferential gap; the selection problem is the gap the argument cannot survive.',
      },
    ],
    confusedWith: [
      { skillId: 'strengthen-weaken', distinction: 'An assumption is required for the argument to work at all. A strengthener merely makes the conclusion likelier. Denying an assumption breaks the argument; denying a strengthener only loosens it.' },
    ],
  },
  {
    id: 'strengthen-weaken',
    section: 'section-a',
    domain: 'argument',
    title: 'The effect of new evidence',
    shortTitle: 'Strengthen / weaken',
    description: 'Judge each candidate fact by what it does to this conclusion, not by whether it is interesting.',
    whyItMatters:
      'The LNAT rewards candidates who can hold a specific conclusion still while a stream of new facts washes past it. Most wrong answers here are relevant to the topic and irrelevant to the inference. The habit to build is mechanical: restate the conclusion, identify the inferential step the argument is making, and ask of each option whether it attacks or shores up that step in particular. The same discipline is what stops a Section B essay from wandering into everything the candidate happens to know about the subject.',
    frequency: 'Two to four items a form.',
    coreIdeas: [
      'Evidence acts on the link between premise and conclusion, not on the topic.',
      'The strongest weakener usually supplies an alternative explanation for the same evidence.',
      'Ruling out a rival cause is the commonest way to strengthen.',
      'A fact that is merely consistent with the conclusion does nothing.',
    ],
    method: [
      'Write the conclusion, then write the step that gets you there.',
      'Ask of each option: does this make the step more or less safe?',
      'Prefer options that speak to the same population, period, and mechanism as the argument.',
      'Beware options that attack a premise the question did not put in issue.',
    ],
    tells: [
      'Stems asking what "most weakens", "most strengthens", or "would the writer find most damaging".',
      'Arguments resting on a single study, a single jurisdiction, or a single year.',
      'Conclusions asserting a cause where the evidence is a correlation.',
    ],
    traps: [
      'Choosing the option with the most dramatic content rather than the most relevant.',
      'Choosing something that weakens a claim the passage made in passing rather than the conclusion.',
      'Treating a fact about a different group as though it applied to the group under discussion.',
    ],
    examples: [
      {
        level: 'Easier',
        extract:
          'Districts that introduced restorative conferencing saw youth reoffending fall by a fifth. Conferencing evidently works.',
        prompt: 'Which of the following most weakens the argument?',
        answer: 'the districts that introduced conferencing had already begun diverting the highest-risk cases elsewhere',
        walkthrough:
          'The argument reads a fall in reoffending as an effect of conferencing. An option that supplies a different reason for the same fall attacks that step directly. An option reporting that conferencing is unpopular with victims criticises the policy without touching the causal claim. An option about adult reoffending changes the population and so says nothing about this conclusion.',
      },
      {
        level: 'Harder',
        extract:
          'Since the disclosure duty was extended, settlements have risen by a third. Defendants, facing the prospect of full disclosure, are choosing to settle rather than expose their records.',
        prompt: 'Which of the following would most strengthen the writer\'s explanation?',
        answer: 'the rise in settlements is concentrated among defendants with the largest volume of undisclosed records',
        walkthrough:
          'The writer offers a mechanism — fear of exposure. Evidence that the effect tracks exposure risk is exactly what a mechanism-based explanation predicts and a rival explanation would not. An option that settlements also rose in a jurisdiction without the duty undercuts rather than supports. An option that disclosure is expensive introduces a second possible cause, which weakens the specific explanation offered.',
      },
    ],
    confusedWith: [
      { skillId: 'reasoning-flaw', distinction: 'Flaw items ask what is already wrong with the argument; strengthen and weaken items ask what new information would do to it. A flawed argument can still be strengthened.' },
    ],
  },
  {
    id: 'reasoning-flaw',
    section: 'section-a',
    domain: 'argument',
    title: 'Where the reasoning breaks',
    shortTitle: 'Reasoning flaw',
    description: 'Name the precise move that fails, rather than the conclusion you happen to dislike.',
    whyItMatters:
      'A flaw question is not an invitation to disagree. It asks you to locate the join at which the reasons stop supporting the conclusion, and to describe that join accurately. The commonest LNAT flaws are quiet ones: a term that changes meaning between premise and conclusion, a sample that cannot bear the generalisation, a correlation promoted to a cause, an absence of evidence read as evidence of absence. Learn to name them, because an option that describes the right kind of error in the wrong place is still wrong.',
    frequency: 'Two to three items a form.',
    coreIdeas: [
      'The flaw is in the inference, not in the truth of the premises.',
      'Equivocation is the LNAT\'s favourite: one word doing two jobs.',
      'Generalising from an unrepresentative case is a flaw even when the conclusion is true.',
      'Attacking the person, or the motive, leaves the argument untouched.',
    ],
    method: [
      'Assume every premise is true, then ask why the conclusion still might not be.',
      'Check each key term for a change of sense between its appearances.',
      'Ask whether the evidence base can support the breadth of the claim.',
      'Match the option to the exact step, not to the general flavour of the error.',
    ],
    tells: [
      'Stems asking what is "the main weakness", "the flaw in the reasoning", or why the argument "does not follow".',
      'Conclusions much broader than the evidence offered.',
      'Arguments that dismiss a claim by explaining why someone made it.',
    ],
    traps: [
      'Criticising a premise when the question asks about the inference.',
      'Choosing an option that names a real fallacy the passage did not commit.',
      'Rejecting an argument because its conclusion is unwelcome.',
    ],
    examples: [
      {
        level: 'Easier',
        extract:
          'Every serious study of the reform was funded by bodies that stood to gain from it. Its supposed benefits can therefore be discounted.',
        prompt: 'The reasoning is flawed because it:',
        answer: 'treats the source of the evidence as sufficient to dismiss its content',
        walkthrough:
          'Funding gives a reason for scrutiny, not a reason for dismissal — the studies might still be sound. The option must name that move. "It generalises from too few studies" describes a different error the passage did not commit, since the passage refers to every serious study. "Its premise is false" attacks the premise, which flaw questions do not.',
      },
      {
        level: 'Harder',
        extract:
          'A discretionary system is one in which officials may depart from the rule. Our appeals system permits departure in exceptional cases. It is therefore a discretionary system, and inherits every objection made to discretion.',
        prompt: 'The principal flaw in the argument is that it:',
        answer: 'moves from a narrow, bounded permission to a general category as though the two were equivalent',
        walkthrough:
          'The definition covers any permission to depart; the appeals system permits it only in exceptional cases. The argument then imports objections aimed at broad discretion. The error is a shift in the scope of "discretionary" across the argument. An option about circular reasoning misnames it — nothing is assumed in the conclusion. An option denying that departures occur contradicts a premise rather than diagnosing the step.',
      },
    ],
    confusedWith: [
      { skillId: 'assumption', distinction: 'Assumption items ask what would repair the gap; flaw items ask what the gap is. They often point at the same join from opposite sides.' },
    ],
  },

  // ---------------------------------------------------------------- Rhetoric
  {
    id: 'authorial-attitude',
    section: 'section-a',
    domain: 'rhetoric',
    title: 'Attitude and tone',
    shortTitle: 'Attitude',
    description: 'Read the writer\'s stance from their word choice, and calibrate its strength precisely.',
    whyItMatters:
      'Attitude options are almost always five points on one scale: hostile, sceptical, detached, sympathetic, admiring. The question is rarely which direction the writer leans and almost always how far. LNAT writers are often ironic, and irony is where careless readers invert the answer entirely — the 2010 commentary hinges one item on a writer\'s "mocking or ironic reference" to an official justification. Calibrated reading, not emotional reading, is what gets rewarded.',
    frequency: 'Two to three items a form.',
    coreIdeas: [
      'Attitude lives in adjectives, verbs of attribution, and punctuation, not in the subject matter.',
      'Distinguish attitude to the topic from attitude to a particular argument about it.',
      'Irony reverses surface meaning; look for a mismatch between register and content.',
      'Most LNAT writers are qualified rather than extreme. Extreme options are usually wrong.',
    ],
    method: [
      'Collect three or four evaluative words from across the passage.',
      'Decide direction first, then strength.',
      'Ask whether the strongest language belongs to the writer or to a view being reported.',
      'Discard options whose intensity the passage never reaches.',
    ],
    tells: [
      'Stems asking about the writer\'s "attitude", "tone", or how they "regard" something.',
      'Scare quotes, italics, and words like "supposed", "so-called", "allegedly".',
      'A passage that praises an aim while criticising its execution.',
    ],
    traps: [
      'Choosing an extreme option — contemptuous, outraged — for a passage that is merely sceptical.',
      'Reading a sympathetic summary of an opponent as the writer\'s own sympathy.',
      'Missing irony and selecting the surface meaning.',
    ],
    examples: [
      {
        level: 'Easier',
        extract:
          'The scheme has its defenders, and their arguments deserve more attention than they have received. They are, in the end, unpersuasive — but they are not foolish, and the case against the scheme is weaker for pretending otherwise.',
        prompt: 'The writer\'s attitude towards the scheme\'s defenders is best described as:',
        answer: 'respectful disagreement',
        walkthrough:
          'Two evaluations sit side by side: "unpersuasive" fixes the direction, "deserve more attention" and "not foolish" fix the strength as mild. "Dismissive" contradicts the second half. "Broadly sympathetic" contradicts "unpersuasive". The answer must hold both.',
      },
      {
        level: 'Harder',
        extract:
          'We are assured the consultation was meaningful. Eleven days were allowed for responses, over a public holiday, and the final text differs from the draft by two commas.',
        prompt: 'The writer\'s tone in this passage is:',
        answer: 'ironic, using apparently neutral detail to imply the opposite of what is reported',
        walkthrough:
          '"We are assured" distances the writer from the claim, and the three details that follow are supplied without comment precisely because they do the work of comment. Nothing is asserted outright, so an option calling the tone "openly angry" overshoots. An option calling it "neutral" mistakes the absence of adjectives for the absence of attitude.',
      },
    ],
    confusedWith: [
      { skillId: 'attribution', distinction: 'Attitude asks how the writer feels; attribution asks whose view is on the page. Strong language often belongs to someone the writer is quoting.' },
    ],
  },
  {
    id: 'rhetorical-purpose',
    section: 'section-a',
    domain: 'rhetoric',
    title: 'Why the comparison is there',
    shortTitle: 'Rhetorical purpose',
    description: 'Explain what an analogy, example, contrast, or aside is doing for the argument at that point.',
    whyItMatters:
      'The commentary observes that a writer may "pause in the presentation of an argument to provide illustrative material such as analogies, metaphors, similes or any kind of comparison". Section A regularly asks not what the comparison means but why it appears where it appears. The answer is always a job: to concede, to dramatise a scale, to expose a hidden assumption in the opposing view, to make an abstraction concrete. Naming the job is a different act from paraphrasing the image.',
    frequency: 'Two to three items a form.',
    coreIdeas: [
      'A device is chosen for an effect on the reader at a specific point in the argument.',
      'Contrasts usually exist to isolate a single difference the writer cares about.',
      'An extended analogy is often carrying the argument\'s main inferential weight.',
      'An example placed after a concession is normally there to limit the concession.',
    ],
    method: [
      'Locate the claim immediately before and immediately after the device.',
      'Ask what would be missing from the argument if the device were deleted.',
      'Decide whether it illustrates, concedes, contrasts, ridicules, or transfers a structure.',
      'Discard options that describe the content of the device rather than its function.',
    ],
    tells: [
      'Stems asking why the writer "mentions", "refers to", or "introduces" something.',
      'Stems using "mainly" or "chiefly" — several options will be partly right.',
      'A sentence beginning "Consider…", "It is as if…", "Compare…".',
    ],
    traps: [
      'Answering with what the comparison says instead of what it does.',
      'Assuming a comparison implies similarity when it was introduced to stress a difference.',
      'Choosing an option that describes a real effect that is not the principal one.',
    ],
    examples: [
      {
        level: 'Easier',
        extract:
          'Regulators talk about deterrence as though a fine were a price. But a price is what you pay to be allowed to do something. If the fine is small enough, that is exactly what it becomes.',
        prompt: 'The writer refers to a price mainly in order to:',
        answer: 'show that a fine set too low changes the character of the prohibition',
        walkthrough:
          'The comparison is introduced to be examined, not endorsed: the second sentence defines "price" so that the third can show fines collapsing into it. Its job is to expose a consequence, not to defend regulators. An option saying the writer thinks fines and prices are the same misses "as though".',
      },
      {
        level: 'Harder',
        extract:
          'Admittedly the register has caught genuine offenders. So does a net dragged across a river catch fish; the question is what else comes up, and whether the river can stand it.',
        prompt: 'The image of the net serves chiefly to:',
        answer: 'concede the method\'s successes while redirecting attention to its indiscriminate costs',
        walkthrough:
          '"Admittedly" opens a concession, and the net accepts that the method catches what it aims at. The clause after the semicolon is the redirection: bycatch and damage to the river. So the image performs a concession-plus-limit, which is why an option confined to "criticise the register as ineffective" is wrong — the passage grants effectiveness. An option about the difficulty of enforcement describes something the image does not raise.',
      },
    ],
    confusedWith: [
      { skillId: 'argument-structure', distinction: 'Both ask about function, but role items classify a statement within the argument, while rhetorical-purpose items explain the effect a device is chosen for.' },
    ],
  },
  {
    id: 'emphasis-signals',
    section: 'section-a',
    domain: 'rhetoric',
    title: 'Italics, inverted commas, and emphasis',
    shortTitle: 'Emphasis signals',
    description: 'Read the writer\'s typography as argument: what is being quoted, distanced, defined, or mocked.',
    whyItMatters:
      'Two separate items in the official 2010 commentary turn on punctuation, and the commentary warns explicitly against "choosing an option based on what you think you know about inverted commas". This is an unusually LNAT-specific family. Inverted commas can quote, can flag a technical usage, can mark a term as contested, or can be plainly sarcastic — and only the surrounding argument decides which. Candidates who guess from a general rule about punctuation reliably lose these marks.',
    frequency: 'One to two items a form.',
    coreIdeas: [
      'Inverted commas do four different jobs: quotation, technical usage, distancing, and ridicule.',
      'Italics may mark emphasis, a foreign or technical term, or a title — the sentence tells you which.',
      'If the marked term is one the writer goes on to attack, the marks are almost certainly distancing.',
      'A term first placed in quotation marks and then used bare has usually been accepted for the sake of argument.',
    ],
    method: [
      'Read the sentence containing the mark, then the sentence after it.',
      'Ask whether the writer endorses the marked word.',
      'Check whether the passage supplies a source for the words. No source rules out quotation.',
      'Match the option to this passage\'s use, not to a general rule about punctuation.',
    ],
    tells: [
      'Stems asking why a word appears "in inverted commas" or "in italics".',
      'A term appearing in marks on first use and without them later.',
      'Official or institutional vocabulary — "reform", "efficiency", "consultation" — inside marks.',
    ],
    traps: [
      'Assuming inverted commas always indicate a quotation.',
      'Assuming italics always indicate emphasis.',
      'Reading distancing marks as neutral when the passage is plainly hostile.',
    ],
    examples: [
      {
        level: 'Easier',
        extract:
          'The department describes the process as "streamlining". Three offices closed, and the work they did was not transferred anywhere.',
        prompt: 'The inverted commas around "streamlining" indicate that the writer:',
        answer: 'is repeating the department\'s own word while declining to accept it',
        walkthrough:
          'A source is named — the department — and the next sentence supplies facts that contradict the word\'s favourable sense. That combination is distancing rather than plain quotation, and certainly not emphasis. An option saying the writer is defining a technical term fails because no definition follows.',
      },
      {
        level: 'Harder',
        extract:
          'A judgment is "final" in the sense that no further appeal lies from it. It is not final in the sense that its reasoning is settled: the next case may narrow it to nothing.',
        prompt: 'The inverted commas in the first sentence are used to:',
        answer: 'signal that the word is being used in a restricted, technical sense',
        walkthrough:
          '"In the sense that" immediately supplies a definition, and the second sentence contrasts that restricted sense with an ordinary one. The marks are doing definitional work. Reading them as sarcasm would require the writer to reject the technical sense, which the passage explicitly affirms; reading them as quotation would require a source, and none appears.',
      },
    ],
    confusedWith: [
      { skillId: 'word-in-context', distinction: 'Word-in-context asks what the term means; emphasis-signal items ask why it has been marked. A word can be marked precisely because its ordinary meaning does not apply.' },
    ],
  },
  {
    id: 'passage-purpose',
    section: 'section-a',
    domain: 'rhetoric',
    title: 'The purpose of a paragraph, and of the whole',
    shortTitle: 'Purpose',
    description: 'Say what the writer is trying to do here, which is not the same as what they claim.',
    whyItMatters:
      'The commentary notes that a question may ask about "the writer\'s purposes within a particular passage", and that identifying the stages of an argument is "a useful skill". Purpose questions often name a paragraph and ask for its job in the whole. The right answer describes a movement — establishing a problem, dismantling a rival account, narrowing an earlier concession, drawing out an implication — and the wrong answers usually describe the paragraph\'s contents accurately while getting its job wrong.',
    frequency: 'Two to three items a form.',
    coreIdeas: [
      'Purpose is a verb: to establish, to qualify, to refute, to illustrate, to complicate.',
      'A paragraph\'s job is defined by its position relative to the main conclusion.',
      'Opening paragraphs frequently set up a view the passage will spend its length undoing.',
      'A closing paragraph may deliberately withhold a conclusion in order to leave a question open.',
    ],
    method: [
      'Give each paragraph a two-word label on first read.',
      'Locate the main conclusion, then ask how the nominated paragraph serves it.',
      'Prefer options whose verb matches the movement you observed.',
      'Reject options that merely summarise the paragraph\'s content.',
    ],
    tells: [
      'Stems asking what a paragraph "is intended to do", or "the main purpose of the passage as a whole".',
      'A paragraph that introduces no new claim but reframes a previous one.',
      'A passage whose final sentence is a question.',
    ],
    traps: [
      'Selecting an accurate summary instead of a function.',
      'Selecting a purpose that fits one sentence of the paragraph rather than the paragraph.',
      'Assuming the purpose of the whole is to persuade, when it may be to complicate a settled view.',
    ],
    examples: [
      {
        level: 'Easier',
        extract:
          'Before asking whether the doctrine should be reformed, it is worth noticing how little agreement there is about what it currently requires. Four appellate courts have offered four formulations, and practitioners advise clients on the basis of whichever is local.',
        prompt: 'The main purpose of this paragraph is to:',
        answer: 'establish that the doctrine is unclear before any reform question can be addressed',
        walkthrough:
          '"Before asking whether…" announces the paragraph as preliminary, and the second sentence evidences the unclarity. Its job is to set a precondition, not to argue for or against reform. An option saying it "argues that the doctrine should be reformed" reads a later stage of the argument into this one.',
      },
      {
        level: 'Harder',
        extract:
          'None of this shows that the critics are wrong. It shows that the strongest version of their case has not yet been made, and that the version usually made is not the strongest. Whether the stronger case succeeds is a question this article has not tried to settle.',
        prompt: 'The main purpose of the passage as a whole is best described as:',
        answer: 'to clear away weak versions of an argument without adjudicating the underlying dispute',
        walkthrough:
          'The closing paragraph is unusually explicit: it disclaims a verdict twice. So the purpose cannot be to refute the critics or to endorse them. What the passage has done is separate a weak case from a strong one and stop there. An option describing the purpose as "to defend the critics" inverts it; an option describing it as "to demonstrate the critics are mistaken" is denied by the first sentence.',
      },
    ],
    confusedWith: [
      { skillId: 'main-conclusion', distinction: 'The conclusion is the claim; the purpose is the act. A passage can conclude nothing at all and still have a clear purpose.' },
    ],
  },

  // ---------------------------------------------------------------- Section B
  {
    id: 'question-interrogation',
    section: 'section-b',
    domain: 'essay-craft',
    title: 'Interrogating the question',
    shortTitle: 'Interrogation',
    description: 'Spend the first four minutes finding the contested term, not planning paragraphs.',
    whyItMatters:
      'The LNAT essay is not a general knowledge test and is not marked by Pearson; it goes to admissions tutors as it stands, and Oxford and UCL among others read it closely. Almost every prompt contains one word doing quiet work — "exploit", "just", "necessary", "should" — and the essays that fail are usually the ones that answered a nearby question. Four minutes of interrogation buys a whole essay of relevance, and it is the same close-reading move Section A has just spent ninety-five minutes training.',
    frequency: 'Every essay begins here.',
    coreIdeas: [
      'Identify the load-bearing term and say, in your essay, how you are reading it.',
      'Notice the form of the question: "should", "is it ever justified", "do you agree" each demand a different shape.',
      'A question with an embedded assumption may be challenged, but you must say that you are challenging it.',
      'Narrowing the question is legitimate and often wise; changing it is not.',
    ],
    method: [
      'Underline every word whose meaning could be disputed.',
      'Write one sentence defining the key term as you will use it.',
      'Write the strongest one-sentence case for each side before choosing.',
      'Fix the scope: which cases are in, which are out, and say so in the opening.',
    ],
    tells: [
      'Prompts containing evaluative words: fair, exploit, offensive, deserve.',
      'Prompts in quotation marks followed by "How do you respond?".',
      'Prompts that contain two claims joined by "and", where you may agree with one.',
    ],
    traps: [
      'Writing everything you know about the topic rather than answering the question.',
      'Defining a term so conveniently that the question becomes trivial.',
      'Missing that the question asks "in what circumstances", which demands criteria rather than a verdict.',
    ],
    examples: [
      {
        level: 'Easier',
        extract: 'Prompt: "Should voting be compulsory?"',
        prompt: 'What is the load-bearing move in this question?',
        answer: 'deciding what "compulsory" is permitted to mean, and what would count as a justification for compulsion',
        walkthrough:
          'Compulsion admits of degrees: a small fine, an enforced attendance with a blank-ballot option, or a criminal penalty. Each is defended and attacked on different grounds. An essay that fixes the sense early — say, a modest civil penalty with a formal abstention option — can argue precisely, while one that leaves it open will slide between senses and appear to contradict itself.',
      },
      {
        level: 'Harder',
        extract: 'Prompt: "Is it ever right to break an unjust law?"',
        prompt: 'What does the phrasing "is it ever" require of the answer?',
        answer: 'an existence claim, which can be settled by one well-defended case rather than by a general theory',
        walkthrough:
          '"Is it ever" asks whether at least one instance exists, so a "yes" needs a single defensible case and a "no" needs a universal claim — a much heavier burden. Recognising the asymmetry lets you choose the side you can actually discharge. An essay that treats the question as "is it usually right" answers something easier and less well.',
      },
    ],
    confusedWith: [
      { skillId: 'thesis-position', distinction: 'Interrogation decides what is being asked; the thesis decides what you say about it. Do them in that order or the thesis will drift.' },
    ],
  },
  {
    id: 'thesis-position',
    section: 'section-b',
    domain: 'essay-craft',
    title: 'Taking a defensible line',
    shortTitle: 'Thesis',
    description: 'Commit to a position narrow enough to defend in six hundred words and broad enough to be interesting.',
    whyItMatters:
      'The official advice is blunt: avoid fence-sitting, and consider defending a position you do not personally hold, because the argument is usually tighter. Admissions readers are not looking for your opinions. They are looking for whether you can hold a claim steady under pressure. The most common failure is a thesis so hedged that nothing in the essay can contradict it — which also means nothing in the essay can support it.',
    frequency: 'Every essay.',
    coreIdeas: [
      'A thesis someone could sensibly deny is a thesis worth defending.',
      'Qualification belongs inside the thesis, not instead of it: "compulsion is justified only where X".',
      'Choose the side you can argue best, not the side you believe.',
      'State the thesis in the first paragraph and again, developed, in the last.',
    ],
    method: [
      'Draft the thesis as a single sentence containing a claim and a condition.',
      'Ask what the strongest objection to it is; if there is none, it is too weak.',
      'Ask whether you can supply three distinct reasons for it in the space available.',
      'Refine the condition until both tests pass.',
    ],
    tells: [
      'Your plan has three reasons that all say the same thing — the thesis is too narrow.',
      'You cannot name an opponent — the thesis is too weak.',
      'You need five paragraphs before reaching a claim — the thesis is undecided.',
    ],
    traps: [
      'Concluding that "there are arguments on both sides", which is not a position.',
      'Overclaiming, then spending the essay retreating.',
      'Announcing a thesis in paragraph one and quietly arguing a different one thereafter.',
    ],
    examples: [
      {
        level: 'Easier',
        extract: 'Prompt: "Should universities select students on academic potential alone?"',
        prompt: 'Which is the better thesis?',
        answer: '"Selection should track academic potential alone, but potential must be measured against opportunity, which contextual data does and raw attainment does not."',
        walkthrough:
          'It takes a side, contains a real condition, and generates its own structure: one section on why potential is the right criterion, one on why attainment is a poor proxy for it, one on the objection that contextual measures are unreliable. A thesis reading "there are good arguments for and against contextual admissions" gives you nothing to write and nothing to defend.',
      },
      {
        level: 'Harder',
        extract: 'Prompt: "\'Free speech must include the freedom to offend.\' Discuss."',
        prompt: 'What makes the following thesis strong: "The freedom to offend is necessary, but it is a freedom from legal penalty, not from social consequence"?',
        answer: 'it accepts the proposition on one axis while denying the conflation that gives it rhetorical force',
        walkthrough:
          'The thesis is not a compromise; it is a distinction, and distinctions are the most defensible form of qualification. It commits to a clear legal claim, identifies precisely what it refuses, and predicts its own objection — that social consequence can be so severe as to function as penalty — which the essay can then meet head-on.',
      },
    ],
    confusedWith: [
      { skillId: 'counterargument', distinction: 'A thesis with a condition is still one position. Counterargument is what you do to the strongest case against it, later and separately.' },
    ],
  },
  {
    id: 'argument-development',
    section: 'section-b',
    domain: 'essay-craft',
    title: 'Developing an argument',
    shortTitle: 'Development',
    description: 'Give reasons that actually support the thesis, and show why each reason bears on it.',
    whyItMatters:
      'The official guidance says data is not required and an argument built on stated assumptions can be just as good. What is required is that each paragraph does inferential work. The commonest weak essay lists three considerations without ever explaining why they favour the conclusion, which is the written equivalent of the Section A distractor that is relevant to the topic and irrelevant to the inference. Marking the connection explicitly is what separates a competent essay from a persuasive one.',
    frequency: 'Every essay: usually three developed reasons.',
    coreIdeas: [
      'A reason needs a warrant: the sentence explaining why it supports the thesis.',
      'Examples illustrate; they do not prove. Say what the example is an example of.',
      'A stated assumption, openly flagged, is stronger than a hidden one.',
      'Three developed reasons beat six mentioned ones every time.',
    ],
    method: [
      'For each paragraph write the claim first, then the support, then the warrant.',
      'After drafting a paragraph, ask "so what?" and answer it in the last sentence.',
      'Prefer reasons that are independent of one another.',
      'Cut any paragraph whose removal leaves the thesis equally well supported.',
    ],
    tells: [
      'A paragraph you can move anywhere in the essay without loss — it has no warrant.',
      'A paragraph that ends on an example rather than on a claim.',
      'Two paragraphs that would be defeated by the same objection.',
    ],
    traps: [
      'Assertion by adverb — "clearly", "obviously", "surely" — in place of a reason.',
      'Piling on examples where one worked example would do.',
      'Making a point that supports a neighbouring thesis rather than yours.',
    ],
    examples: [
      {
        level: 'Easier',
        extract:
          'Thesis: jury trial should be retained for serious offences. Paragraph: "Juries are drawn from the community. In 2019, over 200,000 people were summoned."',
        prompt: 'What is missing?',
        answer: 'the warrant explaining why community composition makes jury verdicts preferable for serious offences',
        walkthrough:
          'Both sentences are true and neither supports the thesis yet. A warrant might be: because serious offences require a judgement about what conduct a community will not tolerate, and that judgement is not a technical one, so it is better made by people who are not professional decision-makers. With the warrant supplied, the statistic becomes evidence; without it, the statistic is scenery.',
      },
      {
        level: 'Harder',
        extract:
          'Thesis: anonymity should be preserved for complainants in sexual offence cases. A candidate offers as a reason that anonymity increases reporting rates.',
        prompt: 'How should the paragraph be developed to withstand an obvious objection?',
        answer: 'by stating the assumption that increased reporting is desirable independently of conviction rates, and defending it',
        walkthrough:
          'The obvious objection is that more reports without more convictions may serve no one. Naming the assumption — that a justice system in which offences go unreported has failed even before the question of conviction arises — turns a vulnerable empirical claim into a normative one the candidate can actually defend, and does so in the open, which the official guidance explicitly rewards.',
      },
    ],
    confusedWith: [
      { skillId: 'counterargument', distinction: 'Development builds your case; counterargument dismantles the other one. A paragraph that does both usually does neither well.' },
    ],
  },
  {
    id: 'counterargument',
    section: 'section-b',
    domain: 'essay-craft',
    title: 'Counterargument and qualification',
    shortTitle: 'Counterargument',
    description: 'State the strongest opposing case in its own best terms, then say precisely why it does not win.',
    whyItMatters:
      'Admissions readers are looking for exactly the disposition a law degree requires: the willingness to put an opponent\'s case better than the opponent would. A caricatured objection is worse than none, because it advertises that you have not understood the dispute. It is also a Section A skill: the same discipline that stops you attributing a straw position to a passage\'s author stops you inventing one for your essay.',
    frequency: 'One substantial paragraph, usually the fourth or fifth.',
    coreIdeas: [
      'Steelman first: write the objection so its holders would accept the wording.',
      'Then choose your response — deny a premise, limit the scope, or accept it and show your thesis survives.',
      'Conceding a real point costs nothing and buys credibility for the rest.',
      'A qualification you introduce yourself is a strength; one forced on you by an objection is a repair.',
    ],
    method: [
      'Name the objection\'s best version in one sentence.',
      'Decide which of the three responses you are giving, and signal it.',
      'Show the objection\'s reach — what it does defeat, so the reader sees you are not evading.',
      'Return explicitly to the thesis at the end of the paragraph.',
    ],
    tells: [
      'Your objection paragraph is shorter than your weakest supporting paragraph.',
      'You introduce the objection with "some might say", which usually precedes a caricature.',
      'You answer the objection by repeating your thesis more loudly.',
    ],
    traps: [
      'Answering a weaker objection than the one a real opponent would raise.',
      'Conceding so much that the thesis quietly disappears.',
      'Leaving the objection standing because you ran out of time — plan the paragraph, do not append it.',
    ],
    examples: [
      {
        level: 'Easier',
        extract: 'Thesis: sentencing should be fully guideline-bound. Objection considered: "some people think judges know best."',
        prompt: 'Why is this objection badly stated?',
        answer: 'it reports a sentiment rather than an argument, so nothing in it can be answered',
        walkthrough:
          'The real objection has a structure: guidelines are written for a typical case, cases are not typical, and only the judge sees the particulars. Stated that way it can be met — for instance by allowing structured departure with published reasons. Stated as a sentiment it can only be dismissed, and dismissal persuades nobody.',
      },
      {
        level: 'Harder',
        extract:
          'Thesis: hate speech laws are justified. Strongest objection: enforcement discretion means such laws are applied disproportionately against the minorities they were enacted to protect.',
        prompt: 'Which response is strongest?',
        answer: 'accept the empirical claim and argue that it indicts the enforcement regime rather than the underlying justification',
        walkthrough:
          'Denying a well-evidenced pattern of disproportionate enforcement would be unpersuasive and would look evasive. Accepting it and separating the two questions — whether the prohibition is justified, and whether this enforcement mechanism is acceptable — preserves the thesis while showing the reader that you have taken the objection seriously. It also generates a concrete concession: the thesis now carries a condition about enforcement safeguards.',
      },
    ],
    confusedWith: [
      { skillId: 'thesis-position', distinction: 'Qualifying the thesis in advance is not counterargument. Counterargument engages a case someone actually holds.' },
    ],
  },
  {
    id: 'structure-economy',
    section: 'section-b',
    domain: 'essay-craft',
    title: 'Structure and economy',
    shortTitle: 'Structure',
    description: 'Plan in five minutes, write around 500–600 words, and make every paragraph announce its job.',
    whyItMatters:
      'The official guidance is specific: aim at 500–600 words, remove repetition and digression, and expect that discipline to be rewarded. Forty minutes is not long, and the constraint is deliberate — it is a test of selection. A planned essay of 550 words consistently reads better than an unplanned one of 800, because the unplanned one spends its first two paragraphs deciding what it thinks.',
    frequency: 'Every essay.',
    coreIdeas: [
      'Five minutes planning, thirty writing, five checking is a reliable division of forty.',
      'A workable shape: position, three developed reasons, one counterargument, a conclusion that adds something.',
      'Every paragraph should be summarisable in one clause.',
      'A conclusion that only restates the introduction has wasted eighty words.',
    ],
    method: [
      'Write the thesis, then three paragraph-claims, then the objection, before any prose.',
      'Open with the position, not with throat-clearing about how important the topic is.',
      'Signpost with argumentative connectives, not with "firstly, secondly, thirdly".',
      'End by drawing out what follows if you are right.',
    ],
    tells: [
      'Your first paragraph contains no claim — it is throat-clearing.',
      'You are at 400 words and have not reached your second reason.',
      'Your conclusion introduces a new argument, which means it belonged earlier.',
    ],
    traps: [
      'Writing to the 750-word ceiling as though it were a target.',
      'Spending a paragraph on background the reader does not need.',
      'Running out of time before the counterargument, which is the paragraph readers weight most heavily.',
    ],
    examples: [
      {
        level: 'Easier',
        extract: 'Prompt: "Should the voting age be lowered to sixteen?" A candidate opens: "Voting is one of the most important rights in any democracy and has been debated for centuries."',
        prompt: 'What is wrong with this opening?',
        answer: 'it makes no claim and could precede an essay on either side of any franchise question',
        walkthrough:
          'The sentence spends roughly twenty of a six-hundred-word budget establishing nothing. A working opening states the position and its condition immediately: "The voting age should be lowered to sixteen, because the case for the current threshold rests on a claim about competence that we do not apply consistently anywhere else in the law." The reader now knows the thesis and the line of attack.',
      },
      {
        level: 'Harder',
        extract: 'A candidate has 8 minutes left, 380 words written, and has completed two of three planned supporting paragraphs, with the counterargument unwritten.',
        prompt: 'What is the best move?',
        answer: 'abandon the third supporting paragraph and write the counterargument',
        walkthrough:
          'Three supporting reasons are a convention, not a requirement, and the third is by construction the weakest. An essay with two well-warranted reasons and a serious engagement with the opposing case reads as controlled; one with three reasons and no counterargument reads as one-sided, which is the specific failure readers are alert to. Deciding this at the eight-minute mark is itself the skill.',
      },
    ],
    confusedWith: [
      { skillId: 'precision-register', distinction: 'Structure is where things go; register is how they sound. An impeccably organised essay can still be unreadably ornate.' },
    ],
  },
  {
    id: 'precision-register',
    section: 'section-b',
    domain: 'essay-craft',
    title: 'Precision and register',
    shortTitle: 'Precision',
    description: 'Write plainly, hedge deliberately, and let the argument rather than the vocabulary do the work.',
    whyItMatters:
      'The official advice warns against elaborate vocabulary and complex style, and the reason is diagnostic rather than aesthetic: ornate prose usually conceals a claim the writer has not made precise. Law is a discipline in which the difference between "may" and "must", or between "unreasonable" and "irrational", decides cases. An essay that uses hedges with control demonstrates a habit of mind; one that uses them decoratively demonstrates the opposite.',
    frequency: 'Every sentence.',
    coreIdeas: [
      'Prefer the shorter word unless the longer one is more exact.',
      'Hedge where you are genuinely uncertain, and only there.',
      'Quantify claims honestly: "in most jurisdictions" beats "everyone knows".',
      'Rhetorical flourish is permitted; it must be paid for by an argument underneath.',
    ],
    method: [
      'After drafting, cut every intensifier that adds no information.',
      'Check each modal — should, must, may, might — is the one you meant.',
      'Replace abstract nouns with verbs where the sentence allows.',
      'Read the final paragraph aloud in your head; awkwardness is usually imprecision.',
    ],
    tells: [
      'Sentences over about forty words, which usually contain two claims.',
      'A stack of hedges — "it could arguably perhaps be said" — which asserts nothing.',
      'Words you would not use in speech to an intelligent adult.',
    ],
    traps: [
      'Using technical legal vocabulary imprecisely, which is worse than not using it.',
      'Absolute claims — never, always, everyone — that a single counterexample defeats.',
      'Passive constructions that hide who is doing what to whom.',
    ],
    examples: [
      {
        level: 'Easier',
        extract: '"It is arguably the case that there may perhaps be certain circumstances in which such measures could conceivably be considered justified."',
        prompt: 'Rewrite this to assert something.',
        answer: '"Such measures are justified where the harm they prevent is serious and no lesser measure would prevent it."',
        walkthrough:
          'The original stacks five hedges and commits to nothing, so no reader can disagree with it and no reader is persuaded. The rewrite states a claim and supplies its two conditions, which the rest of the paragraph can then defend. Note that it is still qualified — "where" carries the qualification — but the qualification is doing work.',
      },
      {
        level: 'Harder',
        extract: '"The court held that the decision was unreasonable, which means no reasonable authority could have reached it."',
        prompt: 'What is imprecise here?',
        answer: 'it treats an ordinary-language sense of "unreasonable" and a demanding legal standard as though they were the same',
        walkthrough:
          'The gloss offered belongs to a high threshold for review; "unreasonable" in ordinary use means merely unwise. Collapsing the two makes the sentence look informed while being wrong, which is more damaging than avoiding the vocabulary altogether. Either use the term with its standard and say so, or say "the court considered the decision unjustified" and keep the claim you can support.',
      },
    ],
    confusedWith: [
      { skillId: 'structure-economy', distinction: 'Economy is about how much you say; precision is about saying it exactly. Cutting words does not by itself make a claim sharper.' },
    ],
  },
]

export const skillById = new Map(curriculum.map((topic) => [topic.id, topic]))
export const domainById = new Map(domains.map((domain) => [domain.id, domain]))
export const sectionASkills = curriculum.filter((topic) => topic.section === 'section-a')
export const sectionASkillIds = sectionASkills.map((topic) => topic.id)
export const essaySkillIds = curriculum.filter((topic) => topic.section === 'section-b').map((topic) => topic.id)
