import type { Passage, PassageExtract, PassageRegister, PassageTheme } from '../types'

/**
 * Twelve original passages, written for this app.
 *
 * They are calibrated against the *shape* of published LNAT practice material —
 * roughly 350 to 500 words, argumentative rather than expository, no specialist
 * knowledge required, and every question answerable from the passage alone. No
 * sentence is taken from, or paraphrased from, any past or live LNAT paper.
 */

const countWords = (value: string) => value.trim().split(/\s+/).filter(Boolean).length

/** Careful first reading at roughly 155 words a minute, floored so short pieces are not rushed. */
const readingBudget = (words: number) => Math.max(90, Math.round((words / 155) * 60))

interface PassageSeed {
  id: string
  title: string
  theme: PassageTheme
  register: PassageRegister
  body?: string
  extracts?: PassageExtract[]
}

const buildPassage = (seed: PassageSeed): Passage => {
  const text = seed.extracts?.length
    ? seed.extracts.map((extract) => extract.body).join('\n\n')
    : seed.body ?? ''
  const wordCount = countWords(text)
  return {
    id: seed.id,
    title: seed.title,
    theme: seed.theme,
    register: seed.register,
    body: seed.extracts?.length ? '' : (seed.body ?? ''),
    ...(seed.extracts?.length ? { extracts: seed.extracts } : {}),
    wordCount,
    readingSeconds: readingBudget(wordCount),
    source: 'local-original',
  }
}

const seeds: PassageSeed[] = [
  {
    id: 'p-jury',
    title: 'Twelve Amateurs',
    theme: 'law-and-ethics',
    register: 'argumentative-essay',
    body: `Whenever the jury is defended, it is defended for its inexperience. The twelve are praised precisely because they know nothing: no accumulated cynicism about defendants, no professional stake in the throughput of the courts, no theory of criminality picked up in a lecture hall. They arrive, decide, and disperse. The argument has an attractive symmetry, and it has survived two centuries of complaint from people who would rather the whole business were conducted by specialists.

The complaint is not frivolous. Modern trials increasingly turn on material that no amount of civic virtue equips a person to assess. Statistical evidence about the frequency of a genetic profile, the reliability of an identification made in poor light, the significance of a pattern of financial transfers — these are technical questions, and there is no reason to think a random group of adults will handle them well. Studies of mock juries suggest they often do not. Reformers conclude that the technical cases, at least, should go to a judge sitting with expert assessors.

But the conclusion moves faster than the evidence. What the mock-jury research shows is that jurors reason badly about probability. It does not show that judges reason well about it, and the studies that have looked have not found much difference. If the objection is that human beings are poor statisticians, the remedy is better expert presentation, not a change in who listens.

There is a deeper reason to be careful. A verdict is not only a finding about what happened; it is a statement about what a community will not tolerate. That second function is not technical at all, and it is one that professional decision-makers are structurally unsuited to perform. A judge who tries four hundred cases develops, unavoidably, a sense of the ordinary — a working expectation of what defendants are like. The jury's great advantage is that it has no such expectation, because it has no experience to build one from. Its ignorance is not a regrettable side effect of the institution. It is the institution.

None of this settles the question of scope. There are trials so long, or so dependent on documents, that asking twelve people to abandon their lives for eight months is a real cost, and it is a cost paid by them rather than by the state that imposes it. A serious defence of jury trial has to say where the line falls, and defenders have generally preferred not to. What it does not have to concede is that the amateurism of the jury is a defect to be minimised. It is what the institution is for.`,
  },
  {
    id: 'p-consent',
    title: 'The Fiction of Consent',
    theme: 'science-and-technology',
    register: 'opinion-column',
    body: `We are told that the modern data economy rests on consent. Nobody is compelled to hand over their movements, their purchases, or their pulse. They agree, and the agreement is recorded, and that record is what makes everything downstream legitimate. The word doing the work here is "agree", and it has been quietly emptied.

Consider what agreement requires elsewhere. To consent to surgery you must be told what will be done, what may go wrong, and what the alternatives are; the surgeon who omits any of these has not obtained consent but a signature. The law is unembarrassed about this distinction. It insists that consent is a state of understanding, evidenced by a decision, and not the decision alone.

Now apply that standard to a privacy notice. The average adult would need something in the region of thirty working days a year to read the notices they are asked to accept. They cannot be told what will go wrong, because the notice does not know: the data is licensed onward to parties unnamed at the moment of agreement, for purposes described so broadly that almost nothing is excluded. There is no meaningful alternative, because the service is a condition of ordinary participation in employment, banking, or education. Every element the surgical analogy requires is absent.

Defenders of the arrangement reply that people simply do not care very much, and that treating a click as consent respects their revealed indifference. This is the strongest argument on the other side and it deserves better than dismissal. If a person genuinely does not mind, insisting on elaborate disclosure is paternalism dressed as protection. But revealed indifference is only revealing where refusal is available at a bearable cost. When the alternative to clicking is not participating, the click reveals the cost of refusal and nothing about preference at all.

The temptation, having established this, is to demand better notices — shorter, clearer, in plainer language. It will not work, and the reason it will not work is the reason the surgical analogy is instructive. Disclosure is adequate when the person disclosing knows what they are disclosing. The data broker does not, and cannot, because the value of the holding lies in uses not yet invented. That is not a failure of drafting. It is the business.

If consent cannot do the work, something else must, and the obvious candidate is a set of limits that apply whether or not anyone has clicked. We regulate what may be sold in a pharmacy without asking each customer to negotiate. There is nothing radical in the suggestion. There is only the awkwardness of admitting that the permission slips we have been collecting for twenty years were never permissions.`,
  },
  {
    id: 'p-canon',
    title: 'What Makes a Classic',
    theme: 'arts-and-culture',
    register: 'multi-extract',
    extracts: [
      {
        label: 'Extract 1',
        attribution: 'Marguerite Havel, critic',
        body: `A classic is a book that survives the loss of the audience it was written for. That is the whole of the definition, and it is deliberately mechanical. It says nothing about beauty, or moral seriousness, or the depth of the author's insight into the human condition, because those are judgements made by particular readers at particular moments, and the whole point of the category is that it outlasts them. When we say a novel is a classic we are reporting a fact about its durability, not awarding it a prize.

The obvious objection is that survival is manufactured. Books remain in print because they are set for examinations, and they are set for examinations because they remained in print. I accept the circle exists. I deny that it explains much. Every generation sets a syllabus; almost none of the books on any given syllabus survive three of them.`,
      },
      {
        label: 'Extract 2',
        attribution: 'Peter Oyelaran, novelist',
        body: `Havel's definition has the virtue of being testable and the defect of being useless. It tells us that we cannot know whether a book is a classic until everyone who might have told us is dead. A critic who can only pronounce retrospectively is a historian.

What she calls the circle is not a minor complication. Consider how a book enters the pool from which examiners select. It must have been reviewed, and reviewed by people whose reviews were noticed, and it must have been published by a house whose catalogue reached the reviewers. At each stage a judgement of quality is being made by someone, and Havel's account records the outcome of those judgements while pretending to have no view about them. Durability is not an alternative to critical judgement. It is critical judgement, accumulated and then forgotten.`,
      },
      {
        label: 'Extract 3',
        attribution: 'Ines Fabre, literary historian',
        body: `Both my colleagues assume that the category has a single function. It does not.

When a publisher prints "a classic" on a cover, the word is doing commercial work: it promises that the reader will not be wasting an evening. When a syllabus committee uses it, the word is doing institutional work: it justifies a choice to people who will complain about any choice. When Havel uses it, the word is doing descriptive work. These are three different words that happen to be spelled alike, and the disagreement between Havel and Oyelaran is largely the result of each having a different one in mind. Oyelaran is right that judgements of quality are buried inside the record of survival. Havel is right that, once buried, they are no longer available for inspection, and that a term describing the sediment need not describe the process that laid it down.`,
      },
    ],
  },
  {
    id: 'p-improvement',
    title: 'On the Improvement of the Labouring Classes',
    theme: 'history',
    register: 'historical-source',
    body: `It has been urged against the reading rooms now established in several of our manufacturing towns that they will unsettle the men who use them. The argument, put plainly, is that a labourer who has spent an evening with a newspaper will return to his loom the following morning less content with it than he was before, and that the discontent so produced is a mischief for which the promoters of these institutions must answer.

I do not think the objection can be dismissed, and I have observed that those who dismiss it most briskly are seldom those who employ any considerable number of men. There is no doubt that a man who reads becomes aware of conditions elsewhere, and that awareness of conditions elsewhere is the beginning of dissatisfaction with conditions here. Those who wish the labouring man to be tranquil should certainly not encourage him to read.

But I confess I do not wish him to be tranquil. The tranquillity which is purchased by ignorance is not a public good, and the peace of a district in which nobody knows anything is a peace of a very poor sort. What is called the "settled" state of the agricultural counties, so much admired by gentlemen who visit them in August, is not settlement but stupor, and I have never yet heard it defended by anybody obliged to live in it.

The promoters of these institutions have, I think, made one error, and it is an error of prospectus rather than of principle. They have promised that instruction will make the working man a better workman. It may do so; there is some evidence of it in the trades where a man must read a specification. But that is not the reason for the thing, and to advance it as the reason is to invite the reply that a man who reads Shakespeare will not weave any faster, which is perfectly true and entirely beside the point. The reason for the thing is that a man is not a machine for weaving, and that the hours in which he is not weaving are his own, and that what he does with them is a matter in which his employer has no legitimate interest whatever.

I would add one word to those who fear the consequences. The men are going to read. The question before us is not whether they shall read but whether they shall read in a room provided for the purpose, with such books as sensible persons have selected, or in a public house, from whatever a hawker has brought in. Those who obstruct the reading room are not preventing the education of the labouring man. They are choosing his instructor.`,
  },
  {
    id: 'p-nudge',
    title: 'The Quiet Hand',
    theme: 'politics-and-society',
    register: 'argumentative-essay',
    body: `The great attraction of behavioural policy is that it appears to cost nothing. Change the default on a pension scheme and enrolment rises by forty points. Put the fruit at eye level and the fruit sells. No one is compelled, no one is taxed, and the outcome the government wanted arrives anyway. Ministers who would blush at a prohibition are entirely comfortable with an architecture.

Critics call this manipulation, and the word has stuck without ever being examined. Manipulation, properly understood, involves bypassing a person's rational agency — exploiting a weakness in order to produce a decision they would not endorse on reflection. Some nudges plainly do this. Many do not. A person automatically enrolled in a pension can leave with a phone call, and the overwhelming majority, asked afterwards, say they are glad they were enrolled. It is difficult to see whose agency has been violated.

The more serious objection is not about the individual at all. It is about what a government is doing when it chooses which way to tilt the floor. Every default embodies a judgement about how people ought to live, and defaults are peculiarly effective at concealing that judgement, because they present themselves as the absence of a choice rather than as one. A tax on sugar announces itself. A supermarket layout does not. When the state legislates, it must say what it is doing and submit the saying to argument; when it nudges, it need not, and the practice grows in exactly the space where scrutiny does not reach.

Defenders answer that a default is unavoidable — forms must be printed one way or another, and shelves must be stocked in some order, so there is no neutral option to fall back on. This is correct and it is also the beginning of the problem rather than the end of it. That a choice cannot be avoided does not mean it need not be justified. Judges must decide cases and are for that reason required to give reasons; the inevitability of the decision is what generates the duty, not what discharges it.

So the interesting question is not whether nudging is permissible. Plainly some of it is, and the pension example is about as clean a case as public policy offers. The question is what it would take to make the practice accountable: published statements of the behavioural objective, perhaps, or an obligation to report the size of the effect achieved, so that a technique which works by not being noticed is at least noticed by somebody. That is a modest programme. It is also, so far, an unmet one.`,
  },
  {
    id: 'p-rewilding',
    title: 'Letting Go',
    theme: 'environment',
    register: 'opinion-column',
    body: `The word "rewilding" promises a return, and the promise is doing a great deal of unacknowledged work. Return to what? The landscape the enthusiasts have in mind — closed canopy, large herbivores, predators at the top — existed in these islands for a period that ended some six thousand years ago, and it was not a stable state then. Choosing it as the baseline is a choice, and choices of baseline are arguments, not measurements.

That said, the movement's critics have been unusually careless. It is regularly asserted that rewilding is a hobby of the rich, that it removes land from food production, and that it is imposed on rural communities by people who do not live in them. The first is an observation about who owns land in Britain and would be equally true of any change in land use whatever. The second is measurable, and where it has been measured the areas involved are marginal ground of very low yield. The third is a real complaint and deserves a real answer, but it is a complaint about process, and processes can be fixed without abandoning the project.

Where the critics land a genuine blow is on the question of endings. A conventional conservation scheme has an objective: this many breeding pairs, this extent of habitat, reviewed in five years. Rewilding, in its purer forms, refuses objectives on principle. The point is to withdraw management and see what happens. But a project without an objective cannot fail, and a project that cannot fail cannot be evaluated, and public money is not usually given to undertakings of that description.

The reply from within the movement is that the refusal of objectives is precisely the innovation — that our targets have always encoded our preferences, and that a century of managing for particular species produced landscapes as artificial as farmland, only less useful. There is force in this. It is also, I think, an argument for humility about which species we favour, not an argument against knowing what we are trying to achieve. One can decline to specify the outcome while specifying the process: land withdrawn from management for a stated period, monitored, with the results published whatever they are.

That would be a discipline, and disciplines are unglamorous. The rhetoric of letting go sits awkwardly beside a monitoring protocol. But the alternative is a movement that asks to be judged by its intentions, and intentions are the one thing in environmental policy that have never been in short supply.`,
  },
  {
    id: 'p-exams',
    title: 'What the Examination Cannot See',
    theme: 'education',
    register: 'argumentative-essay',
    body: `Every few years someone proposes that public examinations be abolished, and every few years the proposal collapses under the same question: replaced with what? Teacher assessment is the usual answer, and its weaknesses are well documented. Predictions correlate with the social background of the pupil in ways that examination results, for all their faults, do not. An unseen paper marked by a stranger is a crude instrument, but it is crude in a direction that happens to help the pupils with the least to fall back on.

The defenders of examinations generally stop there, and by stopping there they concede more than they realise. They have shown that examinations are fairer than the proposed alternative. They have not shown that examinations measure what we care about, and the two claims are entirely separate.

Consider what a three-hour paper can register. It can register recall, which is worth something. It can register the ability to organise an answer under time pressure, which is worth something in a small number of occupations and nothing in most. It can register a particular kind of composure. What it cannot register is anything that takes longer than three hours to do: the ability to sustain a project, to change your mind in the light of evidence gathered over weeks, to work with people who irritate you, to notice that the question you were given is the wrong question. These are not soft additions to the curriculum. They are most of what education is for.

An objection presents itself immediately. Everything I have listed is difficult to assess reliably, and an unreliable measure of an important thing may be worse than a reliable measure of a trivial one, because it invites arbitrary decisions dressed as findings. This is the strongest case for the examination and I think it is nearly right. Nearly, because it assumes the only purpose of assessment is selection. If the purpose is also to tell a school what it should be doing, then measuring the trivial thing reliably is exactly how you get a system that teaches the trivial thing.

That is the trap, and it is a trap rather than a scandal: no one designed it, and everyone in it is behaving sensibly. The examination is defended because the alternatives are unfair; the curriculum is shaped by the examination because that is what is measured; and the things the examination cannot see quietly cease to be taught, not because anyone decided they did not matter but because nothing in the system asks after them. Abolishing examinations would not solve this. Pretending that fairness in selection is the same as adequacy in measurement guarantees it will not be solved either.`,
  },
  {
    id: 'p-rent',
    title: 'The Price of a Room',
    theme: 'economics',
    register: 'opinion-column',
    body: `There is a rare and slightly embarrassing agreement among economists that rent control reduces the supply of rented housing. Surveys of the profession return majorities of the kind normally reserved for questions about arithmetic. Journalists reporting this agreement usually treat it as settling the policy question. It does not settle it, and the reason is instructive about what economic consensus can and cannot deliver.

Take the finding at its strongest. Cap rents below the market rate and, over time, fewer properties are offered for rent: some are sold, some are converted, some are simply not built. The mechanism is not mysterious and the evidence for it is decent. Anyone advocating a cap who denies this is arguing in bad faith or has not looked.

But a policy is not refuted by naming one of its costs. The relevant comparison is between a world with the cap and a world without it, judged against whatever the policy was for. Suppose the aim is to prevent the displacement of existing tenants from a neighbourhood during a period of rapid price growth. A cap does that. It also, over a decade, shrinks the stock. Both are true, they operate on different timescales, and which matters more depends on a judgement about whose interests count and over what period — a judgement no survey of economists can supply, because it is not an economic question.

Notice, too, what the consensus is silent about. It concerns rents. Displacement is not only a function of rent; it is a function of security of tenure, of the notice period, of whether a landlord may evict in order to re-let at a higher price. A jurisdiction can leave rents entirely free and still eliminate most displacement by regulating the grounds for eviction, and several have. The debate has been conducted as though "control the price" and "do nothing" exhausted the options, which suits both sides and describes no serious policy proposal of the last twenty years.

None of this is an argument for rent control. It is an argument against the way the finding is deployed. When a consensus is invoked to close a discussion, the first thing to establish is which question the consensus is about. Here it is about a supply effect. The dispute is about a distributional aim, over a timescale the supply studies mostly do not cover, using instruments the surveys did not ask about. The economists have answered their question accurately. It was not the question being argued over.`,
  },
  {
    id: 'p-byline',
    title: 'The Byline and the Mob',
    theme: 'media',
    register: 'argumentative-essay',
    body: `The case for anonymity online has always rested on the vulnerable: the whistleblower, the dissident, the teenager working out who they are somewhere their family cannot see. The case against it rests on the mob. Remove the mask, the argument goes, and the cruelty stops, because cruelty depends on not being answerable for it.

The evidence has been unkind to this argument for some years now. The most sustained campaigns of online harassment documented in the past decade were conducted under real names, by people with photographs and employers and follower counts, several of whom were pleased to be recognised. Studies that compared platforms requiring real names with those permitting pseudonyms found differences too small to build a policy on. Whatever licenses cruelty, concealment is not it.

What appears to matter is audience. A person who insults a stranger in a queue receives, at most, the embarrassment of onlookers. The same insult delivered to an account with a large following is performed in front of an audience that has assembled specifically to watch such performances and that rewards the better ones. The incentive structure is not anonymity's; it is the crowd's, and abolishing pseudonyms leaves the crowd exactly where it was.

Here the argument is usually taken to have finished, and it should not be. Granting that real-name policies do not reduce cruelty, they may still do other things, and one of them is not obviously bad. A platform on which everyone is identifiable is a platform on which a person harmed can find out who harmed them, which matters for remedies even if it does not prevent the harm. That is a real gain, and those of us who defend pseudonymity have been too quick to talk as though the only relevant question were deterrence.

The gain, though, is purchased from a particular group. Requiring identification does not affect the confident columnist and does not much affect the ordinary user. It falls almost entirely on the people the original case for anonymity was about, and it falls on them at exactly the moment they most need the protection. A policy whose benefits are diffuse and whose costs land on an identifiable minority is not automatically wrong, but it carries a burden of justification that "it might help with remedies" does not discharge.

There is a version of the debate in which both sides notice this. The question would then be whether identity can be held by someone — a platform, a court on application — without being published to everyone, which is how anonymity has worked in the offline institutions we already trust. That the debate has instead spent a decade on whether masks make people cruel is a small tragedy of everyone's making.`,
  },
  {
    id: 'p-desert',
    title: 'Desert and Deterrence',
    theme: 'philosophy',
    register: 'argumentative-essay',
    body: `Two accounts of punishment have divided the field for two centuries. On the first, we punish because the offender deserves it: the wrong has created a debt, and the sentence discharges it. On the second, we punish because punishing produces good consequences — fewer future offences, chiefly, through deterrence and incapacitation. The accounts often recommend the same sentence, which has allowed the dispute to remain theoretical for a remarkably long time.

They come apart in the hard cases, and the hard cases are where each looks worst. A consequentialist has no principled objection to punishing a person known to be innocent, if doing so would credibly prevent a riot. The theory has an answer — the practice would be found out and the deterrent effect would collapse — but the answer is contingent, and a theory that condemns framing the innocent only because it is likely to be discovered has not condemned it at all. Meanwhile a pure desert theorist must insist that an offender be punished even where the punishment does no good whatever: where the offender is dying, poses no risk, and the victim's family asks for nothing. Most people find that conclusion inhuman, and the theorist's reply that morality is not a popularity contest, while formally correct, is not much of a reply.

The standard escape is to combine them. Desert sets the ceiling; consequences decide where beneath it the sentence falls. You may not punish more than the wrong deserves, but within that limit you may punish as much or as little as does most good. This is the position most modern systems occupy, and it is more attractive than either parent theory.

It is not, however, a reconciliation. It is a ranking, and the ranking has to be argued for. Why should desert cap consequences rather than the other way about? The hybrid works by simply asserting the priority of one at the point where they conflict, which is precisely the point at issue. Presented as a compromise, it settles the dispute by taking a side and not saying so.

That may still be the right side to take. There are decent arguments for treating the desert constraint as prior — that it protects the individual against being used as an instrument of general policy, which is the objection to the framing case and is a serious one. What the hybrid cannot claim is that it has dissolved the disagreement. It has relocated it into a single sentence about which principle yields, and the fact that the sentence is rarely written down is not evidence that it is uncontroversial.`,
  },
  {
    id: 'p-language',
    title: 'Right and Wrong Language',
    theme: 'arts-and-culture',
    register: 'argumentative-essay',
    body: `The people who write to newspapers about the decline of English are, without exception, wrong about the particulars. The split infinitive was invented as an error by a schoolmaster in 1864. "Hopefully" as a sentence adverb is exactly as old and exactly as respectable as "frankly", which nobody objects to. "Decimate" has meant "destroy a large part of" for four hundred years, and the Roman sense the correspondents prefer was never the English one. Every generation believes it inherited the language at its peak and is watching it collapse, and every generation is describing the ordinary process by which the thing stays alive.

Having established this, linguists tend to conclude that judgements of correctness are simply mistaken, and here I part company with them. It is one thing to show that a particular rule has no historical warrant. It is quite another to show that the impulse to have rules is itself an error, and the second does not follow from the first.

Consider what happens when the rules are genuinely absent. Nobody polices the grammar of a private message and nobody should. But a contract, a statute, a set of instructions for a machine that can injure someone — these are documents where a reader must be able to recover the writer's meaning without the writer present, and that recovery depends on shared conventions being reasonably stable. The conventions do not have to be the ones the correspondents want. They do have to be conventions, which is to say that somebody has to be able to say that a usage is wrong.

The linguists' reply is that such conventions arise spontaneously within any community that needs them, and that no external authority is required. Largely true. But "spontaneously" is doing a lot of work: what actually happens is that some usages are corrected and others are not, by people with the standing to correct, and the aggregate of those corrections is the convention. Describing the outcome as spontaneous, while deploring the corrections that produce it, is not a coherent position.

What we are left with is less satisfying than either camp would like. The correspondents are wrong about which rules matter and right that some do. The linguists are right about the history and mistaken in supposing that a rule shown to be arbitrary is thereby shown to be dispensable. Arbitrariness is the normal condition of a convention; that is what distinguishes a convention from a law of nature. Driving on the left is arbitrary too, and no one proposes we stop.`,
  },
  {
    id: 'p-machine-court',
    title: 'Machines in the Courtroom',
    theme: 'science-and-technology',
    register: 'multi-extract',
    extracts: [
      {
        label: 'Extract 1',
        attribution: 'Report of the Sentencing Technology Review',
        body: `Algorithmic risk assessment is now used at some stage of the criminal process in a majority of comparable jurisdictions. The instruments produce a score, and the score informs decisions about bail, supervision, and in some places sentence length.

The central finding of this review is that the debate has been conducted at the wrong level of generality. Critics object that the instruments are biased. Developers reply that they are less biased than the human decisions they replace, and on the evidence available this is often true. Both statements can hold simultaneously, and the disagreement between them cannot be resolved by better data because it is not, at bottom, empirical. A human decision-maker who is wrong can be asked why. An instrument that is wrong less often cannot. Whether a reduction in the rate of error is worth the loss of an answerable decision is a question about what a court is for, and it is not one that a validation study can settle.`,
      },
      {
        label: 'Extract 2',
        attribution: 'Dr Ana Reisner, in evidence to the Review',
        body: `I want to press the Review on one point, because I think it concedes too much to the developers.

It is said the instruments are less biased than human decisions. What is actually shown, in every study I have examined, is that the instruments reproduce the pattern of past decisions with greater consistency. Consistency is not accuracy. If historic decisions were skewed against a group, an instrument trained on them will be skewed against that group too, and it will be skewed in the same way every time rather than sometimes. The developers report this as an improvement because their benchmark is variance between decision-makers. That is a benchmark worth having. It is not the one the critics are using, and the two sides have been reporting different quantities under the same word for a decade.

Where I agree with the Review is on answerability. But I would put it more strongly. A decision no one can be asked to explain is not merely a worse decision. In a court, it is not a decision at all.`,
      },
    ],
  },
]

export const passages: Passage[] = seeds.map(buildPassage)
export const passageById = new Map(passages.map((passage) => [passage.id, passage]))

export const passageText = (passage: Passage) =>
  passage.extracts?.length ? passage.extracts.map((extract) => extract.body).join('\n\n') : passage.body

export const passageParagraphs = (passage: Passage) =>
  passageText(passage).split('\n\n').map((paragraph) => paragraph.trim()).filter(Boolean)
