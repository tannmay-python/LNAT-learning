import type { Question } from '../types'

/**
 * Forty-two original Section A items — one full form's worth — written against
 * the passages in `passages.ts`. Every item is answerable from its passage
 * alone, has exactly five options, exactly one defensible answer, and a
 * diagnosis for each distractor. Nothing here is drawn from a past or live LNAT
 * paper.
 *
 * `estimatedSeconds` is the per-question share of the real budget: 95 minutes
 * covers reading twelve passages and answering forty-two questions, which
 * leaves roughly 80 seconds of decision time once reading is accounted for.
 */

export const questionBank: Question[] = [
  // ------------------------------------------------------------------ p-jury
  {
    id: 'q-jury-1',
    passageId: 'p-jury',
    section: 'section-a',
    domain: 'argument',
    skillId: 'main-conclusion',
    difficulty: 3,
    prompt: 'The main conclusion of the passage is that:',
    choices: [
      { id: 'a', text: 'juries reason about statistical evidence no worse than judges do' },
      { id: 'b', text: 'the inexperience of jurors is what the institution exists to supply, not a defect to be reduced' },
      { id: 'c', text: 'long and document-heavy trials impose an unfair burden on jurors' },
      { id: 'd', text: 'reformers who would replace juries with expert panels have misread the evidence' },
      { id: 'e', text: 'a verdict expresses a community judgement about intolerable conduct' },
    ],
    answer: 'b',
    explanation:
      'The final sentence states it outright — "It is what the institution is for" — and the whole passage is built to reach it: the reform case is stated, the statistical objection is neutralised, and then the positive account of what ignorance contributes is developed. Everything else in the passage earns its place by supporting that claim.',
    concept:
      'A conclusion is the claim every other claim in the passage is working for. Test each candidate with "because": the conclusion sits comfortably after it, the premises do not.',
    whyWrong: {
      a: 'True in the passage, but offered in paragraph three purely to defuse the reform argument. It supports the conclusion rather than being it.',
      c: 'This is the concession in the final paragraph, and the writer explicitly declines to settle it. A point the writer leaves open cannot be their conclusion.',
      d: 'A stage of the argument, not its destination. Defeating the reformers clears the ground; the passage then goes on to say what juries are positively for.',
      e: 'A premise. It is introduced as "a deeper reason", meaning a reason for the conclusion rather than the conclusion itself.',
    },
    estimatedSeconds: 80,
    source: 'local-original',
  },
  {
    id: 'q-jury-2',
    passageId: 'p-jury',
    section: 'section-a',
    domain: 'argument',
    skillId: 'argument-structure',
    difficulty: 3,
    prompt: 'The sentence "The complaint is not frivolous" functions in the argument as:',
    choices: [
      { id: 'a', text: 'the writer\'s main claim about reform' },
      { id: 'b', text: 'an example of the reformers\' position' },
      { id: 'c', text: 'a concession that opens the strongest case against the writer\'s own view' },
      { id: 'd', text: 'evidence that mock juries reason badly about probability' },
      { id: 'e', text: 'a restatement of the praise for jurors\' inexperience' },
    ],
    answer: 'c',
    explanation:
      'The sentence opens the second paragraph and hands the floor to the opposing case, which is then set out at its strongest for a full paragraph before the writer answers it in paragraph three. That is the classic function of a concession: grant the objection real weight so that the reply is worth something.',
    concept:
      'Identify a sentence\'s role by asking what it supports and what supports it. A concession supports nothing in the writer\'s own case; it introduces material the writer will later have to answer.',
    whyWrong: {
      a: 'The writer\'s main claim is the defence of amateurism in the final paragraph. This sentence points the other way.',
      b: 'It is not itself an example of the reformers\' position; it is the writer\'s evaluation of that position before stating it.',
      d: 'The mock-jury research appears later, inside the concession, as one of its supports. This sentence precedes and frames it.',
      e: 'It reverses the first paragraph rather than restating it — "not frivolous" signals a turn against the praise just described.',
    },
    estimatedSeconds: 80,
    source: 'local-original',
  },
  {
    id: 'q-jury-3',
    passageId: 'p-jury',
    section: 'section-a',
    domain: 'argument',
    skillId: 'assumption',
    difficulty: 4,
    prompt: 'In arguing that poor statistical reasoning is not a reason to remove juries, the writer assumes that:',
    choices: [
      { id: 'a', text: 'jurors can be trained to assess genetic evidence reliably' },
      { id: 'b', text: 'the purpose of a trial is to establish what happened' },
      { id: 'c', text: 'expert presentation can be improved enough to matter' },
      { id: 'd', text: 'a defect shared by the proposed replacement is not a reason to prefer that replacement' },
      { id: 'e', text: 'mock-jury studies are a reliable guide to real jury behaviour' },
    ],
    answer: 'd',
    explanation:
      'The reply in paragraph three is entirely comparative: jurors reason badly, but the studies "have not found much difference" for judges, so the objection does not favour the switch. Deny the assumption — allow that a defect shared by both still counts in favour of replacement — and the reply collapses immediately.',
    concept:
      'Use the denial test. An assumption is what the argument cannot survive without, not merely a claim that would help it along.',
    whyWrong: {
      a: 'The passage nowhere claims jurors can be trained; its remedy is better expert presentation, which is a change to the input rather than to the juror.',
      b: 'The passage actually resists this, insisting a verdict is also a community statement. An argument does not assume what it goes on to deny.',
      c: 'Offered as a suggested remedy, not as a premise the comparative reply depends on. Deny it and the comparison between jurors and judges still stands.',
      e: 'The writer accepts the mock-jury findings and works with them, so their reliability is conceded ground rather than a hidden bridge.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },
  {
    id: 'q-jury-4',
    passageId: 'p-jury',
    section: 'section-a',
    domain: 'argument',
    skillId: 'strengthen-weaken',
    difficulty: 4,
    prompt: 'Which of the following would most weaken the writer\'s central defence of jury trial?',
    choices: [
      { id: 'a', text: 'jurors report finding long trials financially damaging' },
      { id: 'b', text: 'judges who try many cases show no measurable drift in their expectations of defendants' },
      { id: 'c', text: 'most jurisdictions use juries for only a small minority of criminal cases' },
      { id: 'd', text: 'expert witnesses frequently disagree with one another about statistical evidence' },
      { id: 'e', text: 'acquittal rates before juries and before judges are broadly similar' },
    ],
    answer: 'b',
    explanation:
      'The central defence rests on a specific causal claim: experience unavoidably builds "a working expectation of what defendants are like", and jurors are valuable because they lack it. Evidence that experienced judges develop no such expectation removes the contrast the argument is built on.',
    concept:
      'Attack the inferential step, not the topic. The strongest weakener speaks to the exact mechanism the conclusion depends on.',
    whyWrong: {
      a: 'This supports the concession the writer already makes about long trials; it does not touch the defence of amateurism.',
      c: 'A fact about scope. The passage argues about what juries are for where they are used, not about how often they are used.',
      d: 'If anything this helps the writer, since it suggests the technical material is contestable rather than settled by expertise.',
      e: 'Similar outcomes are compatible with the writer\'s view, which is about what a verdict expresses rather than about how often it is an acquittal.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },

  // --------------------------------------------------------------- p-consent
  {
    id: 'q-consent-1',
    passageId: 'p-consent',
    section: 'section-a',
    domain: 'rhetoric',
    skillId: 'rhetorical-purpose',
    difficulty: 3,
    prompt: 'The writer introduces the example of surgical consent mainly in order to:',
    choices: [
      { id: 'a', text: 'show that medical law is better drafted than data protection law' },
      { id: 'b', text: 'supply a standard for consent that the data economy can then be measured against' },
      { id: 'c', text: 'suggest that handing over personal data carries risks comparable to surgery' },
      { id: 'd', text: 'demonstrate that written agreements are unreliable evidence of a person\'s wishes' },
      { id: 'e', text: 'establish that consent is a legal concept rather than an everyday one' },
    ],
    answer: 'b',
    explanation:
      'The surgical case is set out in paragraph two as a list of requirements — disclosure of what will be done, of what may go wrong, of the alternatives — and paragraph three then walks through those requirements one by one for privacy notices, concluding that "every element the surgical analogy requires is absent". Its job is to provide the yardstick.',
    concept:
      'Ask what the argument would lose if the device were deleted. Here it would lose its criterion, which is the whole basis of the comparison that follows.',
    whyWrong: {
      a: 'The passage makes no comparison between the two bodies of law as drafting. It borrows a standard from one and applies it to a practice.',
      c: 'The analogy is about what consent requires, not about how dangerous the two activities are. Nothing suggests the risks are comparable in magnitude.',
      d: 'The passage says a signature without understanding is not consent — which is a point about understanding, not about the unreliability of written records.',
      e: 'The passage draws on law but the argument is about what consent substantively requires, and it applies that standard outside legal settings.',
    },
    estimatedSeconds: 80,
    source: 'local-original',
  },
  {
    id: 'q-consent-2',
    passageId: 'p-consent',
    section: 'section-a',
    domain: 'comprehension',
    skillId: 'literal-meaning',
    difficulty: 2,
    prompt: 'According to the passage, the reason better-written privacy notices will not solve the problem is that:',
    choices: [
      { id: 'a', text: 'people would not read them even if they were short' },
      { id: 'b', text: 'the party disclosing does not itself know what the data will later be used for' },
      { id: 'c', text: 'plain language cannot express technical concepts accurately' },
      { id: 'd', text: 'the notices are written by lawyers rather than by the engineers who hold the data' },
      { id: 'e', text: 'regulators lack the resources to check that notices are accurate' },
    ],
    answer: 'b',
    explanation:
      'The fifth paragraph is explicit: "Disclosure is adequate when the person disclosing knows what they are disclosing. The data broker does not, and cannot, because the value of the holding lies in uses not yet invented."',
    concept:
      'When a stem asks for a stated reason, locate the sentence that gives it and resist substituting a different objection the passage happens to raise elsewhere.',
    whyWrong: {
      a: 'The passage discusses reading time as an obstacle to consent generally, but the reason given for the failure of better notices is specifically the discloser\'s own ignorance.',
      c: 'Never claimed. The passage doubts that shorter and clearer notices help, but not because plain language cannot carry the content.',
      d: 'Authorship of the notices is not mentioned anywhere in the passage.',
      e: 'Enforcement resources are not discussed. The passage\'s remedy is substantive limits, but it does not say regulators currently lack capacity.',
    },
    estimatedSeconds: 70,
    source: 'local-original',
  },
  {
    id: 'q-consent-3',
    passageId: 'p-consent',
    section: 'section-a',
    domain: 'argument',
    skillId: 'reasoning-flaw',
    difficulty: 4,
    prompt: 'The writer argues that revealed indifference is "only revealing where refusal is available at a bearable cost". The defenders\' argument, on this view, goes wrong by:',
    choices: [
      { id: 'a', text: 'assuming that people are capable of understanding what they agree to' },
      { id: 'b', text: 'treating behaviour produced by the absence of alternatives as evidence of preference' },
      { id: 'c', text: 'relying on an analogy with medical treatment that does not hold' },
      { id: 'd', text: 'confusing the number of people who click with the proportion who have read the notice' },
      { id: 'e', text: 'generalising from a small number of unusually attentive users' },
    ],
    answer: 'b',
    explanation:
      'The writer grants the defenders their evidence — people do click — and disputes what it shows. Where the alternative to clicking is exclusion from employment, banking, or education, the click records the cost of refusal rather than any judgement about the exchange. The flaw is in the inference from behaviour to preference.',
    concept:
      'A flaw lives in the step, not in the premises. Assume the reported behaviour is exactly as described and ask what it can and cannot establish.',
    whyWrong: {
      a: 'The defenders make no such assumption; their whole point is that people do not read and do not mind.',
      c: 'The analogy is the writer\'s own device, not something the defenders rely on. A flaw in it would be a flaw in the writer\'s argument.',
      d: 'A real difference, but not the one the writer identifies. Their objection would stand even if every clicker had read every word.',
      e: 'No generalisation from a small sample is involved; the defenders appeal to the ordinary behaviour of almost everyone.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },
  {
    id: 'q-consent-4',
    passageId: 'p-consent',
    section: 'section-a',
    domain: 'interpretation',
    skillId: 'application',
    difficulty: 4,
    prompt: 'Based on the passage, which of the following would the writer regard as a genuine act of consent?',
    choices: [
      { id: 'a', text: 'a shopper accepting a loyalty scheme after a clear explanation of which partners receive their purchase history and for how long' },
      { id: 'b', text: 'an employee agreeing to workplace monitoring described in a contract they were given ten minutes to sign' },
      { id: 'c', text: 'a patient signing a general authorisation covering any procedure the hospital later thinks necessary' },
      { id: 'd', text: 'a commuter using a transport app whose notice permits sharing with "our partners and their affiliates"' },
      { id: 'e', text: 'a student accepting a university platform\'s terms because the alternative is to withdraw from the course' },
    ],
    answer: 'a',
    explanation:
      'The passage sets three conditions: the person is told what will be done, the recipients and uses are specified rather than open-ended, and refusal is available at a bearable cost. A loyalty scheme with named partners and a stated period meets all three, and a shopper can decline it without losing access to ordinary life.',
    concept:
      'Break the principle into conditions, then test each option against every condition. Topic similarity is worthless; structural fit is everything.',
    whyWrong: {
      b: 'The time pressure and the employment relationship mean refusal carries a cost the passage treats as disqualifying.',
      c: 'This is precisely the open-ended authorisation the surgical example rules out — future uses unknown at the moment of agreement.',
      d: '"Partners and their affiliates" is the unnamed onward licensing the third paragraph identifies as fatal.',
      e: 'Withdrawal from a course is exactly the unbearable alternative the fourth paragraph describes; the acceptance reveals the cost of refusal, not a preference.',
    },
    estimatedSeconds: 90,
    source: 'local-original',
  },

  // ----------------------------------------------------------------- p-canon
  {
    id: 'q-canon-1',
    passageId: 'p-canon',
    section: 'section-a',
    domain: 'comprehension',
    skillId: 'attribution',
    difficulty: 3,
    prompt: 'Which of the following would Havel accept but Oyelaran reject?',
    choices: [
      { id: 'a', text: 'that judgements of quality influence which books remain in print' },
      { id: 'b', text: 'that a book\'s status as a classic can be stated without evaluating the book' },
      { id: 'c', text: 'that examination syllabuses affect which books stay in circulation' },
      { id: 'd', text: 'that most books set for examination do not survive three generations of syllabus' },
      { id: 'e', text: 'that the word "classic" is used in more than one sense' },
    ],
    answer: 'b',
    explanation:
      'Havel\'s definition is "deliberately mechanical" and reports "a fact about its durability, not awarding it a prize". Oyelaran\'s central objection is that durability "is critical judgement, accumulated and then forgotten" — that is, the evaluation is inside the report whether or not it is visible.',
    concept:
      'On multi-extract passages, hold one sentence per voice and check both halves of the stem separately. An option that both writers accept, or both reject, fails however true it is.',
    whyWrong: {
      a: 'Oyelaran asserts this; Havel does not deny it so much as decline to record it, and she explicitly accepts that the circle exists.',
      c: 'Havel concedes exactly this — "books remain in print because they are set for examinations" — so it is not a point of disagreement.',
      d: 'This is Havel\'s own claim, offered against the circle objection, and Oyelaran nowhere contradicts it.',
      e: 'This is Fabre\'s contribution, not Havel\'s, and Fabre presents it as something neither of the others has noticed.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },
  {
    id: 'q-canon-2',
    passageId: 'p-canon',
    section: 'section-a',
    domain: 'comprehension',
    skillId: 'attribution',
    difficulty: 4,
    prompt: 'Fabre\'s assessment of the dispute is that:',
    choices: [
      { id: 'a', text: 'Oyelaran is right and Havel\'s definition should be abandoned' },
      { id: 'b', text: 'the disagreement is real but neither party has enough evidence to settle it' },
      { id: 'c', text: 'each is correct about a different thing, and much of the dispute comes from using one word for three concepts' },
      { id: 'd', text: 'both have overlooked the commercial pressures that determine what is published' },
      { id: 'e', text: 'the category of the classic serves no useful function and should be retired' },
    ],
    answer: 'c',
    explanation:
      'Fabre opens by saying both assume the category has a single function, distinguishes commercial, institutional, and descriptive uses, and then endorses a claim from each: Oyelaran on judgements being buried in the record, Havel on their being unavailable for inspection once buried.',
    concept:
      'A third voice in a composite passage is usually reframing rather than taking sides. Read for what it grants to each party before deciding what it concludes.',
    whyWrong: {
      a: 'Fabre explicitly says "Havel is right" about the sediment, so she does not abandon the definition.',
      b: 'Fabre does not describe the dispute as evidentially undecided; she describes it as partly verbal.',
      d: 'Commercial pressure appears only as one of the three uses of the word, and Fabre does not claim the others overlooked it in the publishing process.',
      e: 'Fabre distinguishes three working functions of the category, which is the opposite of saying it is useless.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },
  {
    id: 'q-canon-3',
    passageId: 'p-canon',
    section: 'section-a',
    domain: 'argument',
    skillId: 'main-conclusion',
    difficulty: 3,
    prompt: 'The main point of Oyelaran\'s extract is that:',
    choices: [
      { id: 'a', text: 'critics who pronounce only in retrospect are really historians' },
      { id: 'b', text: 'publishers and reviewers control which books reach examiners' },
      { id: 'c', text: 'Havel\'s definition conceals the evaluative judgements it in fact depends on' },
      { id: 'd', text: 'Havel\'s definition cannot be applied until the relevant readers are dead' },
      { id: 'e', text: 'the circle between syllabus and print run is more damaging than Havel admits' },
    ],
    answer: 'c',
    explanation:
      'The extract closes on it: "Durability is not an alternative to critical judgement. It is critical judgement, accumulated and then forgotten." The publishing chain in the middle paragraph is the evidence for that claim, and the opening remark about historians is a subsidiary jab.',
    concept:
      'The most memorable sentence is often not the conclusion. Ask which claim the others are working to establish.',
    whyWrong: {
      a: 'A rhetorical point in the first paragraph, complete in itself and not what the second paragraph is arguing for.',
      b: 'A premise. The stages of the publishing chain are set out precisely to show that a judgement is made at each of them.',
      d: 'Part of the first objection, about testability. Oyelaran moves past it to the deeper charge about concealed evaluation.',
      e: 'Closer, but it stops at the negative point. Oyelaran\'s claim is not merely that the circle matters more; it is what the circle consists of.',
    },
    estimatedSeconds: 80,
    source: 'local-original',
  },
  {
    id: 'q-canon-4',
    passageId: 'p-canon',
    section: 'section-a',
    domain: 'interpretation',
    skillId: 'inference',
    difficulty: 4,
    prompt: 'Which of the following follows from Havel\'s extract?',
    choices: [
      { id: 'a', text: 'a book that is widely admired today is not yet a classic' },
      { id: 'b', text: 'no book set for examination can become a classic' },
      { id: 'c', text: 'a book that is beautiful and morally serious is more likely to survive' },
      { id: 'd', text: 'most books on any given syllabus will still be read three generations later' },
      { id: 'e', text: 'the syllabus is the principal mechanism by which books survive' },
    ],
    answer: 'a',
    explanation:
      'Havel defines a classic as a book that "survives the loss of the audience it was written for". A book admired by its own audience has not yet met that condition, whatever its eventual fate. The inference is narrow, which is why it holds.',
    concept:
      'An inference must be unavoidable given the text. Prefer the weakest-sounding option that survives an attempt to construct a counterexample.',
    whyWrong: {
      b: 'Havel concedes syllabuses keep books in print and never suggests this disqualifies them; her point is that most such books still fail to survive.',
      c: 'Havel expressly refuses to make survival depend on beauty or moral seriousness — that is the whole force of "deliberately mechanical".',
      d: 'She asserts the opposite: "almost none of the books on any given syllabus survive three of them".',
      e: 'She grants the syllabus a role and then argues its explanatory power is limited. "Principal mechanism" overstates what she allows.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },

  // ----------------------------------------------------------- p-improvement
  {
    id: 'q-improvement-1',
    passageId: 'p-improvement',
    section: 'section-a',
    domain: 'rhetoric',
    skillId: 'authorial-attitude',
    difficulty: 3,
    prompt: 'The writer\'s attitude towards those who oppose the reading rooms is best described as:',
    choices: [
      { id: 'a', text: 'contemptuous of their motives and dismissive of their reasoning' },
      { id: 'b', text: 'willing to grant the factual basis of their fear while rejecting what they want to preserve' },
      { id: 'c', text: 'broadly sympathetic, but doubtful that their proposals are practical' },
      { id: 'd', text: 'indifferent, since he regards the outcome as already settled' },
      { id: 'e', text: 'alarmed by the consequences they describe and anxious to prevent them' },
    ],
    answer: 'b',
    explanation:
      'The second paragraph concedes their point squarely — "There is no doubt that a man who reads becomes aware of conditions elsewhere" — and even notes that the objectors are often those with practical experience. The third paragraph then rejects not their prediction but their goal: "I confess I do not wish him to be tranquil."',
    concept:
      'Decide direction first, then strength. A writer who concedes an opponent\'s facts and refuses their values is disagreeing precisely, not contemptuously.',
    whyWrong: {
      a: 'He explicitly declines to dismiss the objection and observes that those who dismiss it briskly are usually inexperienced.',
      c: 'He is not sympathetic to their aim at all, and his objection is to what they want rather than to whether it can be achieved.',
      d: 'The final paragraph argues actively for a course of action, which is inconsistent with indifference.',
      e: 'He accepts that discontent will follow and welcomes it. Alarm is the objectors\' posture, not his.',
    },
    estimatedSeconds: 80,
    source: 'local-original',
  },
  {
    id: 'q-improvement-2',
    passageId: 'p-improvement',
    section: 'section-a',
    domain: 'rhetoric',
    skillId: 'emphasis-signals',
    difficulty: 3,
    prompt: 'The inverted commas around "settled" in the third paragraph indicate that the writer:',
    choices: [
      { id: 'a', text: 'is quoting a phrase used in an official report' },
      { id: 'b', text: 'is defining a technical term used in agricultural administration' },
      { id: 'c', text: 'is using a word he attributes to others and immediately refuses' },
      { id: 'd', text: 'wishes to place particular stress on the word for emphasis' },
      { id: 'e', text: 'is signalling that the word is unfamiliar to his readers' },
    ],
    answer: 'c',
    explanation:
      '"What is called the \'settled\' state" hands the word to other people, and the very next clause replaces it: "is not settlement but stupor". The marks distance the writer from a description he is about to reject.',
    concept:
      'Inverted commas do at least four different jobs. Decide which by asking whether the writer goes on to endorse the marked word or to dismantle it.',
    whyWrong: {
      a: 'No source is named. "What is called" attributes the word to general usage rather than to a document that could be quoted.',
      b: 'No definition follows, and the passage treats the word as ordinary rather than technical.',
      d: 'Emphasis would require the writer to mean the word; he means its opposite, which is why the correction follows immediately.',
      e: 'Nothing suggests unfamiliarity, and an unfamiliar word would be explained rather than contradicted.',
    },
    estimatedSeconds: 75,
    source: 'local-original',
  },
  {
    id: 'q-improvement-3',
    passageId: 'p-improvement',
    section: 'section-a',
    domain: 'comprehension',
    skillId: 'literal-meaning',
    difficulty: 2,
    prompt: 'The writer says the promoters of the reading rooms have made an error. That error is:',
    choices: [
      { id: 'a', text: 'selecting books unsuitable for working readers' },
      { id: 'b', text: 'justifying the institutions by a benefit that is beside the point' },
      { id: 'c', text: 'establishing them in manufacturing towns rather than agricultural districts' },
      { id: 'd', text: 'underestimating how strongly employers would object' },
      { id: 'e', text: 'assuming that working men would use them at all' },
    ],
    answer: 'b',
    explanation:
      'The fourth paragraph names it as "an error of prospectus rather than of principle": they promised instruction would produce a better workman, which invites the reply that reading Shakespeare will not speed up weaving — "perfectly true and entirely beside the point".',
    concept:
      'When the passage supplies its own label for something, use that label. Options that describe other shortcomings, however plausible, are not what the stem asked for.',
    whyWrong: {
      a: 'Book selection is mentioned favourably in the final paragraph — "such books as sensible persons have selected" — not as an error.',
      c: 'The location is stated in the opening sentence as a fact, and the writer never criticises it.',
      d: 'He takes employer objection seriously but does not accuse the promoters of failing to anticipate it.',
      e: 'The final paragraph asserts the men are going to read regardless, so uptake is assumed by the writer rather than doubted.',
    },
    estimatedSeconds: 70,
    source: 'local-original',
  },
  {
    id: 'q-improvement-4',
    passageId: 'p-improvement',
    section: 'section-a',
    domain: 'rhetoric',
    skillId: 'passage-purpose',
    difficulty: 4,
    prompt: 'The main purpose of the final paragraph is to:',
    choices: [
      { id: 'a', text: 'summarise the arguments made earlier in the passage' },
      { id: 'b', text: 'concede that the objectors may after all be right about the consequences' },
      { id: 'c', text: 'recast the disagreement so that the objectors are choosing between instructors rather than preventing instruction' },
      { id: 'd', text: 'warn that public houses are becoming more numerous than reading rooms' },
      { id: 'e', text: 'appeal to employers to fund the institutions directly' },
    ],
    answer: 'c',
    explanation:
      'The paragraph changes the question. "The question before us is not whether they shall read but whether they shall read in a room provided for the purpose… Those who obstruct the reading room are not preventing the education of the labouring man. They are choosing his instructor." The purpose is to relocate the choice.',
    concept:
      'A purpose is a verb. Look for the movement the paragraph performs — reframing, conceding, narrowing — rather than for a summary of its contents.',
    whyWrong: {
      a: 'It introduces a new premise, that the men will read regardless, which appears nowhere earlier.',
      b: 'The consequences were conceded in paragraph two. This paragraph does something different with them.',
      d: 'The public house is an illustration of the alternative source of reading matter, not a claim about relative numbers.',
      e: 'Funding is never discussed, and the paragraph addresses those who obstruct rather than those who might pay.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },

  // ----------------------------------------------------------------- p-nudge
  {
    id: 'q-nudge-1',
    passageId: 'p-nudge',
    section: 'section-a',
    domain: 'comprehension',
    skillId: 'word-in-context',
    difficulty: 3,
    prompt: 'In the first paragraph, the writer\'s use of "architecture" conveys:',
    choices: [
      { id: 'a', text: 'the physical design of the buildings in which public services are delivered' },
      { id: 'b', text: 'a structured arrangement of choices that produces an outcome without commanding it' },
      { id: 'c', text: 'the formal constitutional structure that limits what ministers may do' },
      { id: 'd', text: 'a long-term plan that governments follow across successive administrations' },
      { id: 'e', text: 'the technical vocabulary that conceals a policy\'s real purpose' },
    ],
    answer: 'b',
    explanation:
      'The word is set against "prohibition" in the same sentence and follows two examples — a pension default and shelf placement — in which the outcome the government wanted "arrives anyway" without compulsion. Architecture names the arrangement that produces the result.',
    concept:
      'Substitute each candidate meaning back into the sentence, whole. Only one will preserve both the grammar and the contrast the sentence is built on.',
    whyWrong: {
      a: 'A literal reading. The examples are a pension form and a supermarket shelf, neither of which is a public building.',
      c: 'Constitutional limits are never mentioned, and the sentence contrasts architecture with prohibition rather than with executive power.',
      d: 'Nothing in the paragraph concerns continuity between administrations.',
      e: 'Concealment is a theme of the third paragraph, but here the word is naming the technique rather than criticising its presentation.',
    },
    estimatedSeconds: 75,
    source: 'local-original',
  },
  {
    id: 'q-nudge-2',
    passageId: 'p-nudge',
    section: 'section-a',
    domain: 'argument',
    skillId: 'assumption',
    difficulty: 3,
    prompt: 'In arguing that automatic pension enrolment is not manipulation, the writer assumes that:',
    choices: [
      { id: 'a', text: 'pension saving is beneficial for those enrolled' },
      { id: 'b', text: 'a decision a person endorses on reflection has not bypassed their rational agency' },
      { id: 'c', text: 'governments are generally trustworthy in their choice of defaults' },
      { id: 'd', text: 'people who leave a scheme face no financial penalty for doing so' },
      { id: 'e', text: 'most people are incapable of arranging their own savings' },
    ],
    answer: 'b',
    explanation:
      'The writer defines manipulation as producing a decision the person "would not endorse on reflection", then observes that the enrolled overwhelmingly say afterwards they are glad. That inference works only if reflective endorsement settles the question. Deny it and the example proves nothing.',
    concept:
      'The assumption is usually the bridge between the terms of the premise and the terms of the conclusion. Here the premise is about subsequent approval and the conclusion is about agency.',
    whyWrong: {
      a: 'The writer never argues the merits of pension saving; the case rests on how the enrolled themselves regard it.',
      c: 'Paragraph three raises serious doubts about how governments choose defaults, so this is nearly the opposite of an assumption.',
      d: 'Ease of exit is stated as a fact — a phone call — rather than being an unstated bridge the argument needs.',
      e: 'No claim about incapacity appears, and the argument would be weaker if it did, since incapacity is what manipulation exploits.',
    },
    estimatedSeconds: 80,
    source: 'local-original',
  },
  {
    id: 'q-nudge-3',
    passageId: 'p-nudge',
    section: 'section-a',
    domain: 'argument',
    skillId: 'argument-structure',
    difficulty: 4,
    prompt: 'The comparison with judges in the fourth paragraph is used to establish that:',
    choices: [
      { id: 'a', text: 'behavioural policy should be subject to judicial review' },
      { id: 'b', text: 'unavoidable decisions generate a duty to justify rather than an excuse from it' },
      { id: 'c', text: 'judges and civil servants face similar pressures when deciding cases' },
      { id: 'd', text: 'the courts have been more transparent than government departments' },
      { id: 'e', text: 'defaults, like judgments, create precedents that bind later decisions' },
    ],
    answer: 'b',
    explanation:
      'The defenders say a default is unavoidable, so no justification is owed. The judicial comparison answers exactly that: "the inevitability of the decision is what generates the duty, not what discharges it." The analogy carries a single structural point.',
    concept:
      'An analogy borrows a structure, not a subject. Identify which structural feature is being transferred and ignore everything else the two cases share.',
    whyWrong: {
      a: 'The passage proposes published objectives and effect reporting, not litigation.',
      c: 'The comparison is about the logic of the duty, not about the working conditions of either group.',
      d: 'No comparison of actual transparency records is made.',
      e: 'Precedent plays no part in the analogy; the shared feature is compulsory decision plus obligatory reasons.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },
  {
    id: 'q-nudge-4',
    passageId: 'p-nudge',
    section: 'section-a',
    domain: 'argument',
    skillId: 'main-conclusion',
    difficulty: 4,
    prompt: 'The writer\'s principal contention is that:',
    choices: [
      { id: 'a', text: 'behavioural policy is a form of manipulation and should be abandoned' },
      { id: 'b', text: 'automatic enrolment shows that nudging can be entirely benign' },
      { id: 'c', text: 'the real question is not whether nudging is permissible but how it can be made accountable' },
      { id: 'd', text: 'defaults are unavoidable, so objections to them are misconceived' },
      { id: 'e', text: 'governments prefer nudges to taxes because nudges are cheaper to administer' },
    ],
    answer: 'c',
    explanation:
      'The final paragraph says so directly: "the interesting question is not whether nudging is permissible… The question is what it would take to make the practice accountable", followed by a concrete programme. Everything before it clears away the manipulation charge in order to arrive here.',
    concept:
      'Where a passage explicitly names the question it thinks worth asking, that sentence is almost always carrying the conclusion.',
    whyWrong: {
      a: 'The passage rejects the manipulation charge for many nudges and never calls for abandonment.',
      b: 'The pension case is conceded ground used to defeat one objection; the writer then raises a different and unanswered one.',
      d: 'The writer quotes this as the defenders\' reply and calls it "the beginning of the problem rather than the end of it".',
      e: 'Ministerial comfort with architecture is noted in passing, but administrative cost is never given as the reason.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },

  // ------------------------------------------------------------- p-rewilding
  {
    id: 'q-rewilding-1',
    passageId: 'p-rewilding',
    section: 'section-a',
    domain: 'argument',
    skillId: 'strengthen-weaken',
    difficulty: 3,
    prompt: 'Which of the following would most weaken the writer\'s objection to rewilding\'s refusal of objectives?',
    choices: [
      { id: 'a', text: 'rewilding projects are frequently supported by private rather than public funds' },
      { id: 'b', text: 'conventional conservation targets have often been revised when they proved unattainable' },
      { id: 'c', text: 'published monitoring data from unmanaged sites reliably identifies which projects have gone wrong' },
      { id: 'd', text: 'the six-thousand-year baseline is accepted by most ecologists' },
      { id: 'e', text: 'rural communities support rewilding more strongly than critics claim' },
    ],
    answer: 'c',
    explanation:
      'The objection is that a project without objectives "cannot fail" and therefore cannot be evaluated. Evidence that monitoring alone identifies failure removes the link between having no target and being unevaluable, which is the step the objection depends on.',
    concept:
      'Weaken the inference, not the topic. Ask what would have to be true for the writer\'s step from "no objective" to "no evaluation" to fail.',
    whyWrong: {
      a: 'The writer\'s point about public money is one instance of a general evaluability problem, and private funding does not restore evaluability.',
      b: 'This criticises conventional targets rather than defending the absence of them, so it does not repair the evaluability gap.',
      d: 'The baseline argument is a separate point in the first paragraph and does not bear on the evaluation objection.',
      e: 'This addresses the imposition complaint, which the writer already treats as a fixable matter of process.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },
  {
    id: 'q-rewilding-2',
    passageId: 'p-rewilding',
    section: 'section-a',
    domain: 'interpretation',
    skillId: 'inference',
    difficulty: 3,
    prompt: 'It can be inferred from the passage that the writer regards the complaint about imposition on rural communities as:',
    choices: [
      { id: 'a', text: 'the strongest of the three criticisms considered' },
      { id: 'b', text: 'legitimate but not fatal, because it concerns how projects are done rather than whether they should be' },
      { id: 'c', text: 'a disguised objection to the ownership of land in Britain' },
      { id: 'd', text: 'unsupported by evidence about the areas actually withdrawn from production' },
      { id: 'e', text: 'less serious than the objection about food production' },
    ],
    answer: 'b',
    explanation:
      'The writer calls it "a real complaint" that "deserves a real answer", then adds that "it is a complaint about process, and processes can be fixed without abandoning the project". That combination is exactly legitimacy without fatality.',
    concept:
      'When a writer grades several objections, read the qualifier attached to each. "Real but fixable" is a different verdict from "decisive".',
    whyWrong: {
      a: 'The passage reserves that status for the evaluability objection, where the critics "land a genuine blow".',
      c: 'That is the writer\'s response to the first criticism, about wealthy landowners, not to the third.',
      d: 'The evidence about marginal ground answers the second criticism, about food production.',
      e: 'The food-production objection is dismissed on the evidence, so it is treated as weaker rather than stronger.',
    },
    estimatedSeconds: 80,
    source: 'local-original',
  },
  {
    id: 'q-rewilding-3',
    passageId: 'p-rewilding',
    section: 'section-a',
    domain: 'rhetoric',
    skillId: 'authorial-attitude',
    difficulty: 4,
    prompt: 'The writer\'s overall stance towards rewilding is best characterised as:',
    choices: [
      { id: 'a', text: 'supportive of the aim while insisting on a discipline the movement currently resists' },
      { id: 'b', text: 'opposed, on the ground that its chosen baseline is arbitrary' },
      { id: 'c', text: 'neutral, presenting the arguments on each side without preference' },
      { id: 'd', text: 'enthusiastic, and impatient with critics who raise procedural difficulties' },
      { id: 'e', text: 'undecided, because the evidence about land use remains incomplete' },
    ],
    answer: 'a',
    explanation:
      'The writer dismantles three of the four criticisms, describes the remaining problem as fixable by "a discipline", and closes by contrasting that discipline with a movement asking "to be judged by its intentions". The tone is corrective from a position of broad sympathy.',
    concept:
      'Attitude is read from the balance of the writer\'s own evaluations, not from the volume of criticism a passage reports.',
    whyWrong: {
      b: 'The baseline point opens the passage but is never used to reject rewilding; the writer immediately turns on the critics.',
      c: 'The writer takes explicit positions throughout — the critics have been "unusually careless", the movement should adopt a protocol.',
      d: 'The final two paragraphs press a procedural demand rather than dismissing one.',
      e: 'The land-use evidence is treated as settled enough to answer the food-production objection.',
    },
    estimatedSeconds: 80,
    source: 'local-original',
  },
  {
    id: 'q-rewilding-4',
    passageId: 'p-rewilding',
    section: 'section-a',
    domain: 'interpretation',
    skillId: 'fact-vs-opinion',
    difficulty: 3,
    prompt: 'Which of the following statements in the passage is best described as a matter of judgement rather than of fact?',
    choices: [
      { id: 'a', text: 'that the landscape the enthusiasts have in mind ended roughly six thousand years ago' },
      { id: 'b', text: 'that where land withdrawal has been measured, the areas involved are of very low yield' },
      { id: 'c', text: 'that conventional conservation schemes set reviewable objectives' },
      { id: 'd', text: 'that a century of species-focused management produced landscapes as artificial as farmland' },
      { id: 'e', text: 'that some rewilding projects refuse objectives on principle' },
    ],
    answer: 'd',
    explanation:
      'Artificiality here is a comparative evaluation: it requires a standard for how artificial a landscape is and a ranking of two very different kinds of intervention against it. No measurement settles it, which is what distinguishes it from the other four.',
    concept:
      'Ask what evidence would settle the claim. If nothing could, because the claim embeds a standard, it is a judgement however widely shared.',
    whyWrong: {
      a: 'A datable claim about ecological history — checkable in principle, whether or not the date is right.',
      b: 'Explicitly presented as a measured finding: "where it has been measured".',
      c: 'A description of how such schemes are designed, verifiable from the schemes themselves.',
      e: 'A report of what certain projects do, which can be confirmed from their published approach.',
    },
    estimatedSeconds: 80,
    source: 'local-original',
  },

  // ----------------------------------------------------------------- p-exams
  {
    id: 'q-exams-1',
    passageId: 'p-exams',
    section: 'section-a',
    domain: 'argument',
    skillId: 'main-conclusion',
    difficulty: 4,
    prompt: 'The main conclusion of the passage is that:',
    choices: [
      { id: 'a', text: 'public examinations should be replaced by teacher assessment' },
      { id: 'b', text: 'examinations are fairer than the alternatives currently proposed' },
      { id: 'c', text: 'treating fairness in selection as though it were adequacy in measurement guarantees the problem persists' },
      { id: 'd', text: 'a three-hour paper cannot register the ability to sustain a long project' },
      { id: 'e', text: 'curricula are shaped by whatever the examination happens to measure' },
    ],
    answer: 'c',
    explanation:
      'The last sentence delivers it, and the whole structure builds towards it: fairness is conceded, the separateness of the two claims is asserted, the limits of a three-hour paper are set out, the strongest counter is met, and the trap is then named. The conclusion is about the conflation, not about examinations as such.',
    concept:
      'Where a passage insists that two claims are "entirely separate", the conclusion is often about the consequence of confusing them.',
    whyWrong: {
      a: 'The passage says abolition "would not solve this" and criticises teacher assessment on evidence.',
      b: 'Conceded in the first paragraph and used as the starting point, not as the destination.',
      d: 'One item in the list of what an examination cannot register — evidence for the conclusion.',
      e: 'A step in the account of the trap, which the conclusion then diagnoses.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },
  {
    id: 'q-exams-2',
    passageId: 'p-exams',
    section: 'section-a',
    domain: 'interpretation',
    skillId: 'inference',
    difficulty: 3,
    prompt: 'It follows from the passage that a reliable measure of a trivial capacity may be worse than an unreliable measure of an important one when:',
    choices: [
      { id: 'a', text: 'the measure is used to select candidates for scarce places' },
      { id: 'b', text: 'the measure is also used to tell schools what they should be teaching' },
      { id: 'c', text: 'the capacity being measured is one employers do not value' },
      { id: 'd', text: 'teacher predictions are known to correlate with social background' },
      { id: 'e', text: 'the assessment takes place under time pressure' },
    ],
    answer: 'b',
    explanation:
      'The passage grants that an unreliable measure of an important thing may be worse "because it invites arbitrary decisions dressed as findings" — but only "if the only purpose of assessment is selection". Once assessment also directs the curriculum, "measuring the trivial thing reliably is exactly how you get a system that teaches the trivial thing".',
    concept:
      'When a passage qualifies a concession with "this assumes X", the inference you are being offered concerns what happens when X fails.',
    whyWrong: {
      a: 'Selection is the case in which the concession holds, so the writer\'s reservation does not apply.',
      c: 'Employer valuation is never mentioned; the passage discusses occupational relevance only in passing.',
      d: 'This supports the fairness claim about examinations rather than the point about purposes.',
      e: 'Time pressure is one of the things examinations do register, not a condition under which the trade-off changes.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },
  {
    id: 'q-exams-3',
    passageId: 'p-exams',
    section: 'section-a',
    domain: 'rhetoric',
    skillId: 'passage-purpose',
    difficulty: 4,
    prompt: 'The writer describes the situation as "a trap rather than a scandal" chiefly in order to:',
    choices: [
      { id: 'a', text: 'exonerate examination boards from criticism of their marking' },
      { id: 'b', text: 'indicate that the outcome arises from individually reasonable behaviour rather than from anyone\'s decision' },
      { id: 'c', text: 'suggest the problem is too entrenched to be worth addressing' },
      { id: 'd', text: 'contrast the education system with other public services' },
      { id: 'e', text: 'concede that the writer\'s own criticism has been overstated' },
    ],
    answer: 'b',
    explanation:
      'The phrase is immediately unpacked: "no one designed it, and everyone in it is behaving sensibly". Each actor — the defender of fairness, the school responding to the measure — is acting reasonably, and the bad outcome is the aggregate. The distinction removes blame without removing the problem.',
    concept:
      'A writer who supplies a gloss immediately after a striking phrase has told you what the phrase is for. Read the gloss.',
    whyWrong: {
      a: 'Marking quality is never in issue; the criticism concerns what examinations can measure at all.',
      c: 'The passage ends by saying pretending the two claims are the same "guarantees it will not be solved", implying it otherwise might be.',
      d: 'No other public service is mentioned.',
      e: 'Nothing is withdrawn. The mechanism is restated, only without attributing bad faith to anyone.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },

  // ------------------------------------------------------------------ p-rent
  {
    id: 'q-rent-1',
    passageId: 'p-rent',
    section: 'section-a',
    domain: 'argument',
    skillId: 'reasoning-flaw',
    difficulty: 3,
    prompt: 'According to the writer, journalists who treat the economic consensus as settling the policy question go wrong because they:',
    choices: [
      { id: 'a', text: 'rely on surveys with small and unrepresentative samples' },
      { id: 'b', text: 'take a finding about one effect to answer a question about competing aims' },
      { id: 'c', text: 'misunderstand the mechanism by which caps reduce supply' },
      { id: 'd', text: 'assume economists agree when in fact the profession is divided' },
      { id: 'e', text: 'ignore evidence from jurisdictions that have never used rent control' },
    ],
    answer: 'b',
    explanation:
      'The final paragraph states it: the consensus "is about a supply effect", while the dispute concerns "a distributional aim, over a timescale the supply studies mostly do not cover, using instruments the surveys did not ask about". The economists answered accurately; it was not the question in dispute.',
    concept:
      'Before accepting that a finding settles a debate, establish which question the finding is about. Most misuse of evidence is a mismatch of questions.',
    whyWrong: {
      a: 'The passage treats the surveys as sound and the majorities as striking; it does not attack their sampling.',
      c: 'The writer accepts the mechanism as "not mysterious" with "decent" evidence.',
      d: 'The passage emphasises the unusual strength of the agreement, not its absence.',
      e: 'Comparison jurisdictions are raised only in relation to eviction rules, and not as evidence journalists ignore.',
    },
    estimatedSeconds: 80,
    source: 'local-original',
  },
  {
    id: 'q-rent-2',
    passageId: 'p-rent',
    section: 'section-a',
    domain: 'comprehension',
    skillId: 'literal-meaning',
    difficulty: 3,
    prompt: 'The passage states that displacement can be reduced without any control on rents by:',
    choices: [
      { id: 'a', text: 'subsidising tenants directly through housing allowances' },
      { id: 'b', text: 'regulating the grounds on which a landlord may evict' },
      { id: 'c', text: 'requiring landlords to justify above-inflation increases' },
      { id: 'd', text: 'increasing the supply of newly built rented housing' },
      { id: 'e', text: 'lengthening the period over which a cap is phased in' },
    ],
    answer: 'b',
    explanation:
      'Paragraph four is explicit: "A jurisdiction can leave rents entirely free and still eliminate most displacement by regulating the grounds for eviction, and several have."',
    concept:
      'Where a stem asks what the passage states, the answer is a sentence you can point to. Options that describe sensible policies the passage never names are out.',
    whyWrong: {
      a: 'Housing allowances are never mentioned.',
      c: 'Justifying increases is still a control on rents, which the stem excludes.',
      d: 'Supply appears only as the effect a cap has on it, not as an alternative instrument proposed.',
      e: 'Phasing is not discussed anywhere in the passage.',
    },
    estimatedSeconds: 70,
    source: 'local-original',
  },
  {
    id: 'q-rent-3',
    passageId: 'p-rent',
    section: 'section-a',
    domain: 'argument',
    skillId: 'argument-structure',
    difficulty: 3,
    prompt: 'The second paragraph, which states the supply finding "at its strongest", serves to:',
    choices: [
      { id: 'a', text: 'introduce the writer\'s own conclusion about rent control' },
      { id: 'b', text: 'grant the opposing evidence in full so that the later objection cannot be dismissed as denial' },
      { id: 'c', text: 'provide the statistical basis for the claim about eviction rules' },
      { id: 'd', text: 'illustrate the kind of question surveys of economists are unsuited to answer' },
      { id: 'e', text: 'show that advocates of rent control are usually arguing in bad faith' },
    ],
    answer: 'b',
    explanation:
      'The paragraph accepts the mechanism and the evidence without reservation and closes by saying anyone who denies it "is arguing in bad faith or has not looked". Having conceded everything, the writer\'s later point about the wrong question cannot be read as a refusal to face the finding.',
    concept:
      'A concession stated at full strength buys credibility for the objection that follows. Its role is defined by what it protects, not by what it asserts.',
    whyWrong: {
      a: 'The writer\'s conclusion, stated in the final paragraph, is about the misuse of the finding rather than about the finding itself.',
      c: 'The eviction point is introduced later and rests on jurisdictional practice, not on the supply studies.',
      d: 'The paragraph presents this as a question surveys answer well; the unsuitability claim concerns the distributional question instead.',
      e: 'The bad-faith remark is aimed at anyone denying the finding, which is a narrow charge, not a characterisation of advocates generally.',
    },
    estimatedSeconds: 80,
    source: 'local-original',
  },

  // ---------------------------------------------------------------- p-byline
  {
    id: 'q-byline-1',
    passageId: 'p-byline',
    section: 'section-a',
    domain: 'rhetoric',
    skillId: 'authorial-attitude',
    difficulty: 3,
    prompt: 'The writer\'s attitude towards other defenders of pseudonymity is:',
    choices: [
      { id: 'a', text: 'wholly supportive, since the evidence vindicates their position' },
      { id: 'b', text: 'critical of a narrowness in their argument while sharing their conclusion' },
      { id: 'c', text: 'dismissive, on the ground that their case has been overtaken by events' },
      { id: 'd', text: 'sympathetic but doubtful that the evidence supports them' },
      { id: 'e', text: 'neutral, since the writer takes no position in the dispute' },
    ],
    answer: 'b',
    explanation:
      'The writer includes themselves — "those of us who defend pseudonymity" — and then says they "have been too quick to talk as though the only relevant question were deterrence". The criticism is of a framing error, not of the conclusion, which the writer continues to hold.',
    concept:
      'Self-inclusive criticism ("those of us who…") signals disagreement within a shared position. Read for which part is being criticised.',
    whyWrong: {
      a: 'The explicit "too quick" is a criticism, so support is not wholly unqualified.',
      c: 'The writer sustains the defence throughout and closes by proposing how it could be improved.',
      d: 'The writer thinks the evidence does support the empirical claim; the shortcoming is in what question was asked.',
      e: 'A position is taken in every paragraph, including on where the burden of justification falls.',
    },
    estimatedSeconds: 80,
    source: 'local-original',
  },
  {
    id: 'q-byline-2',
    passageId: 'p-byline',
    section: 'section-a',
    domain: 'interpretation',
    skillId: 'application',
    difficulty: 3,
    prompt: 'Which of the following arrangements would best satisfy the concern the writer raises in the final paragraph?',
    choices: [
      { id: 'a', text: 'a platform that requires legal names on all public posts' },
      { id: 'b', text: 'a platform that allows pseudonyms but verifies identity to itself, disclosable only on a court order' },
      { id: 'c', text: 'a platform that deletes abusive posts within an hour of a complaint' },
      { id: 'd', text: 'a platform that publishes the country and age range of every account holder' },
      { id: 'e', text: 'a platform that bans accounts found to have harassed another user' },
    ],
    answer: 'b',
    explanation:
      'The closing paragraph asks "whether identity can be held by someone — a platform, a court on application — without being published to everyone". Verified but undisclosed identity, released only on a court order, is that arrangement precisely: remedies become available while the protection the vulnerable rely on survives.',
    concept:
      'Apply the principle, not the writer\'s general sympathies. The test is whether the option satisfies the specific condition the passage set.',
    whyWrong: {
      a: 'This is the real-name policy whose costs the writer says fall on exactly the people anonymity was meant to protect.',
      c: 'Rapid deletion addresses the content but leaves the victim unable to identify who harmed them, which is the gap the writer names.',
      d: 'Partial public disclosure erodes protection without providing an identifiable person against whom a remedy could be sought.',
      e: 'Banning is a platform sanction, not a route to the remedies the writer says identification enables.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },
  {
    id: 'q-byline-3',
    passageId: 'p-byline',
    section: 'section-a',
    domain: 'rhetoric',
    skillId: 'rhetorical-purpose',
    difficulty: 4,
    prompt: 'The comparison with insulting a stranger in a queue is introduced chiefly to:',
    choices: [
      { id: 'a', text: 'suggest that online cruelty is no worse than its offline equivalent' },
      { id: 'b', text: 'isolate audience as the variable that distinguishes the two cases' },
      { id: 'c', text: 'show that anonymity operates offline as well as online' },
      { id: 'd', text: 'argue that platforms should be treated like public spaces' },
      { id: 'e', text: 'illustrate how quickly ordinary disputes escalate' },
    ],
    answer: 'b',
    explanation:
      'The two cases are constructed to differ in one respect. The same insult is delivered in both; only the audience changes, and the paragraph concludes that "the incentive structure is not anonymity\'s; it is the crowd\'s". The comparison exists to hold everything else constant.',
    concept:
      'A controlled comparison is built so that one variable moves. Identify the variable and you have identified the purpose.',
    whyWrong: {
      a: 'The passage implies the online case is worse precisely because the audience rewards it.',
      c: 'Anonymity is absent from the comparison altogether, which is the point.',
      d: 'No claim about the legal or regulatory status of platforms is made here.',
      e: 'Escalation is not discussed; the contrast is about incentive, not about how disputes develop.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },

  // ---------------------------------------------------------------- p-desert
  {
    id: 'q-desert-1',
    passageId: 'p-desert',
    section: 'section-a',
    domain: 'argument',
    skillId: 'assumption',
    difficulty: 4,
    prompt: 'The writer\'s criticism of the consequentialist reply to the framing case assumes that:',
    choices: [
      { id: 'a', text: 'framing an innocent person would in fact prevent a riot' },
      { id: 'b', text: 'a moral objection that depends on the practice being discovered is not an objection to the practice itself' },
      { id: 'c', text: 'consequentialists are indifferent to the suffering of the innocent' },
      { id: 'd', text: 'deterrence is a less important goal than desert' },
      { id: 'e', text: 'riots are rare enough that the case is merely hypothetical' },
    ],
    answer: 'b',
    explanation:
      'The consequentialist answers that framing would be found out and the deterrent effect would collapse. The writer replies that "a theory that condemns framing the innocent only because it is likely to be discovered has not condemned it at all". That reply works only if a contingent, discovery-dependent condemnation is not a real one.',
    concept:
      'When a writer rejects an opponent\'s answer rather than their conclusion, the assumption is usually a standard the answer is being held to.',
    whyWrong: {
      a: 'The passage stipulates this as part of the hypothetical, so it is given rather than assumed by the criticism.',
      c: 'The writer never attributes indifference; the objection is about the structure of the theory\'s reasons.',
      d: 'The passage explicitly declines to settle the priority question, calling it "the point at issue".',
      e: 'The frequency of riots plays no part; hard cases are used precisely because they are rare.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },
  {
    id: 'q-desert-2',
    passageId: 'p-desert',
    section: 'section-a',
    domain: 'interpretation',
    skillId: 'inference',
    difficulty: 4,
    prompt: 'It follows from the passage that the hybrid theory:',
    choices: [
      { id: 'a', text: 'is less attractive than either of the theories it combines' },
      { id: 'b', text: 'resolves the framing case but not the case of the dying offender' },
      { id: 'c', text: 'takes a side in the underlying dispute without acknowledging that it has done so' },
      { id: 'd', text: 'has been adopted because it produces more lenient sentences' },
      { id: 'e', text: 'is inconsistent, since desert and consequences cannot both constrain a sentence' },
    ],
    answer: 'c',
    explanation:
      'The passage says the hybrid "works by simply asserting the priority of one at the point where they conflict, which is precisely the point at issue" and that, "presented as a compromise, it settles the dispute by taking a side and not saying so".',
    concept:
      'An inference must be forced by the text. Here the writer states both halves — a side is taken, and its being taken is unacknowledged.',
    whyWrong: {
      a: 'The passage calls it "more attractive than either parent theory".',
      b: 'The desert ceiling addresses both hard cases; the writer\'s complaint concerns the justification of the ranking, not its coverage.',
      d: 'Leniency is never mentioned, and a ceiling constrains severity rather than explaining adoption.',
      e: 'The passage describes the combination as workable, with desert setting a ceiling and consequences operating beneath it.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },
  {
    id: 'q-desert-3',
    passageId: 'p-desert',
    section: 'section-a',
    domain: 'comprehension',
    skillId: 'word-in-context',
    difficulty: 3,
    prompt: 'The writer says the desert theorist\'s reply that "morality is not a popularity contest" is "formally correct". By "formally correct" the writer means that the reply:',
    choices: [
      { id: 'a', text: 'is expressed in appropriately technical philosophical language' },
      { id: 'b', text: 'is valid as far as it goes but does not meet the difficulty raised' },
      { id: 'c', text: 'has been endorsed by most writers in the field' },
      { id: 'd', text: 'follows necessarily from the desert theorist\'s premises' },
      { id: 'e', text: 'is correct about morality but wrong about punishment' },
    ],
    answer: 'b',
    explanation:
      'The clause that follows settles it — "while formally correct, is not much of a reply". The writer concedes the general principle that widespread revulsion does not refute a moral claim, and observes that conceding it does nothing to answer the specific objection about the dying offender.',
    concept:
      'A concessive construction ("while X, Y") tells you the writer accepts X in a limited sense in order to press Y. The limitation is the meaning.',
    whyWrong: {
      a: 'The remark is about the reply\'s adequacy, not its diction, and the phrase quoted is conversational rather than technical.',
      c: 'No claim about how widely the reply is endorsed appears.',
      d: 'Derivability from the theorist\'s own premises would not make the reply inadequate, which is what the writer goes on to say it is.',
      e: 'The writer does not split morality from punishment here; the objection is that the reply is unresponsive.',
    },
    estimatedSeconds: 80,
    source: 'local-original',
  },

  // -------------------------------------------------------------- p-language
  {
    id: 'q-language-1',
    passageId: 'p-language',
    section: 'section-a',
    domain: 'comprehension',
    skillId: 'word-in-context',
    difficulty: 4,
    prompt: 'In the final paragraph, the writer uses "arbitrary" to mean:',
    choices: [
      { id: 'a', text: 'imposed by an authority without consultation' },
      { id: 'b', text: 'having no basis in natural necessity, though still binding as a shared practice' },
      { id: 'c', text: 'applied inconsistently from one case to the next' },
      { id: 'd', text: 'chosen at random and therefore not worth defending' },
      { id: 'e', text: 'unsupported by historical evidence' },
    ],
    answer: 'b',
    explanation:
      'The sentence supplies its own gloss: "Arbitrariness is the normal condition of a convention; that is what distinguishes a convention from a law of nature." The driving-on-the-left example then confirms it — arbitrary in origin, and nonetheless something no one proposes abandoning.',
    concept:
      'Where a writer defines a word in the next clause, the definition beats the dictionary. Substitute and read the whole sentence back.',
    whyWrong: {
      a: 'The passage locates convention in accumulated correction rather than in an authority, and the driving example involves no imposition of the kind described.',
      c: 'Inconsistency is not in issue; the writer\'s worry is that conventions be stable enough to be relied on.',
      d: 'This is exactly the inference the paragraph exists to block — the writer says arbitrariness does not make a rule dispensable.',
      e: 'The historical point is made about the correspondents\' particular rules earlier; here the writer is generalising about conventions as such.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },
  {
    id: 'q-language-2',
    passageId: 'p-language',
    section: 'section-a',
    domain: 'interpretation',
    skillId: 'fact-vs-opinion',
    difficulty: 4,
    prompt: 'Which of the following claims in the passage is presented as a matter of fact rather than of judgement?',
    choices: [
      { id: 'a', text: 'that the correspondents are wrong about which rules matter' },
      { id: 'b', text: 'that nobody should police the grammar of a private message' },
      { id: 'c', text: 'that the split infinitive was identified as an error by a schoolmaster in 1864' },
      { id: 'd', text: 'that the linguists\' position on spontaneous conventions is not coherent' },
      { id: 'e', text: 'that some documents require conventions to be reasonably stable' },
    ],
    answer: 'c',
    explanation:
      'A dated claim about when a proscription was first recorded is checkable against the historical record, whether or not the date is accurate. The other four all embed standards — of which rules matter, of what should be policed, of coherence, of what a document requires.',
    concept:
      'Factual and true are different properties. A claim is factual if evidence could in principle settle it, regardless of whether the passage has supplied that evidence.',
    whyWrong: {
      a: 'A verdict requiring a standard of what makes a rule matter.',
      b: 'A normative claim about what should happen, marked by "should".',
      d: 'An evaluation of an argument, which no measurement settles.',
      e: 'It rests on a judgement about what recovery of meaning requires, which the passage argues for rather than reports.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },
  {
    id: 'q-language-3',
    passageId: 'p-language',
    section: 'section-a',
    domain: 'argument',
    skillId: 'strengthen-weaken',
    difficulty: 4,
    prompt: 'Which of the following would most strengthen the writer\'s case against the linguists?',
    choices: [
      { id: 'a', text: 'evidence that the rules objected to by newspaper correspondents are of recent invention' },
      { id: 'b', text: 'evidence that communities which stopped correcting usage developed conventions unstable enough to cause misreadings of documents' },
      { id: 'c', text: 'evidence that most speakers can identify a grammatical error when shown one' },
      { id: 'd', text: 'evidence that legal drafting conventions differ substantially between jurisdictions' },
      { id: 'e', text: 'evidence that the meaning of "decimate" has changed more than once' },
    ],
    answer: 'b',
    explanation:
      'The writer\'s claim against the linguists has two parts: some contexts need stable conventions, and stable conventions are produced by correction rather than arising unaided. Evidence that withdrawing correction produces instability in exactly those contexts supports both parts at once.',
    concept:
      'Strengthen the specific step. Ask what the writer\'s opponent would have to concede, and choose the option that forces the concession.',
    whyWrong: {
      a: 'The writer already accepts this and uses it against the correspondents, not against the linguists.',
      c: 'Recognition of errors says nothing about whether conventions arise spontaneously or through correction.',
      d: 'Variation between jurisdictions is consistent with each having stable local conventions, which is what the writer requires.',
      e: 'Another item of the history the writer concedes to the linguists at the outset.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },

  // ---------------------------------------------------------- p-machine-court
  {
    id: 'q-machine-1',
    passageId: 'p-machine-court',
    section: 'section-a',
    domain: 'comprehension',
    skillId: 'attribution',
    difficulty: 3,
    prompt: 'Which of the following does Reisner accept?',
    choices: [
      { id: 'a', text: 'that the instruments are less biased than the human decisions they replace' },
      { id: 'b', text: 'that reducing variance between decision-makers is a benchmark worth having' },
      { id: 'c', text: 'that the disagreement between critics and developers could be settled by better data' },
      { id: 'd', text: 'that consistency and accuracy amount to the same thing in practice' },
      { id: 'e', text: 'that risk instruments should be withdrawn from use in bail decisions' },
    ],
    answer: 'b',
    explanation:
      'Reisner writes: "The developers report this as an improvement because their benchmark is variance between decision-makers. That is a benchmark worth having." Her objection is that it is not the benchmark the critics are using, not that it is worthless.',
    concept:
      'Track concessions as carefully as objections. A witness who grants a point in one sentence and limits it in the next has still granted it.',
    whyWrong: {
      a: 'This is the developers\' claim, which the Review reports as often true and Reisner opens by disputing.',
      c: 'The Review says the disagreement is not at bottom empirical; Reisner nowhere contradicts this and her own argument reinforces it.',
      d: 'She states the opposite in terms: "Consistency is not accuracy."',
      e: 'She calls for a different benchmark and stronger language about answerability; withdrawal is never proposed.',
    },
    estimatedSeconds: 80,
    source: 'local-original',
  },
  {
    id: 'q-machine-2',
    passageId: 'p-machine-court',
    section: 'section-a',
    domain: 'comprehension',
    skillId: 'attribution',
    difficulty: 4,
    prompt: 'On the question of answerability, Reisner differs from the Review in that she:',
    choices: [
      { id: 'a', text: 'denies that human decision-makers can be asked to explain themselves' },
      { id: 'b', text: 'treats the loss of answerability as disqualifying rather than as one side of a trade-off' },
      { id: 'c', text: 'argues that answerability matters less than the reduction in bias' },
      { id: 'd', text: 'holds that answerability can be restored by publishing the instruments\' code' },
      { id: 'e', text: 'regards answerability as a question that validation studies could settle' },
    ],
    answer: 'b',
    explanation:
      'The Review frames it as a trade-off — whether a lower error rate "is worth the loss of an answerable decision". Reisner agrees answerability matters and then goes further: "In a court, it is not a decision at all." That converts a cost to be weighed into a bar.',
    concept:
      'Where two voices agree on a value, the examinable difference is usually in how much weight each gives it. Read for the escalation.',
    whyWrong: {
      a: 'She relies on the contrast with human decisions, which the Review draws and she does not dispute.',
      c: 'The reverse: she strengthens the answerability point and challenges the bias claim.',
      d: 'Publication of code is never mentioned by either voice.',
      e: 'The Review says validation studies cannot settle it, and Reisner\'s stronger position is even further from that view.',
    },
    estimatedSeconds: 85,
    source: 'local-original',
  },
  {
    id: 'q-machine-3',
    passageId: 'p-machine-court',
    section: 'section-a',
    domain: 'interpretation',
    skillId: 'application',
    difficulty: 4,
    prompt: 'Based on Reisner\'s reasoning, which of the following results would she regard as least reassuring about an instrument?',
    choices: [
      { id: 'a', text: 'it produces the same score for the same case whichever official runs it' },
      { id: 'b', text: 'its scores diverge from historic decisions in a substantial minority of cases' },
      { id: 'c', text: 'it has been validated against outcomes in three separate jurisdictions' },
      { id: 'd', text: 'it flags cases where its confidence in the score is low' },
      { id: 'e', text: 'its error rate is lower than that of the officials it advises' },
    ],
    answer: 'a',
    explanation:
      'Reisner\'s central warning is that consistency is what these instruments actually deliver, and that an instrument trained on skewed decisions will reproduce the skew "in the same way every time rather than sometimes". Perfect inter-operator consistency is therefore exactly the finding she says is being mistaken for accuracy.',
    concept:
      'Applying a critic\'s principle means asking what their argument predicts, not what sounds like bad news. A result that looks impressive can be the one their objection targets.',
    whyWrong: {
      b: 'Divergence from historic decisions cuts against her worry that the instrument merely reproduces them.',
      c: 'Multi-jurisdiction validation speaks to generalisation, which is not the target of her objection.',
      d: 'Flagging low confidence moves towards answerability, which she values most highly.',
      e: 'A lower error rate is the developers\' claim; her complaint is about consistency being reported as accuracy, and an error-rate comparison is at least the right quantity.',
    },
    estimatedSeconds: 90,
    source: 'local-original',
  },
]

export const questionById = new Map(questionBank.map((question) => [question.id, question]))

export const questionsForPassage = (passageId: string) =>
  questionBank.filter((question) => question.passageId === passageId)
