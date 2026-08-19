import type { EssayPrompt } from '../types'

/**
 * Original Section B prompts. The live LNAT offers three, drawn from a wide
 * civic range and phrased so that a candidate with no specialist knowledge can
 * argue either side. `pressurePoint` is the app's own addition: the term or
 * hidden move a strong answer has to handle, surfaced after the essay is written
 * so it teaches rather than prompts.
 */
export const essayPrompts: EssayPrompt[] = [
  {
    id: 'e-compulsory-voting',
    text: 'Should voting be compulsory in a democracy?',
    pressurePoint:
      'Compulsion admits of degrees — a small civil penalty with a formal abstention option is a different proposition from a criminal sanction. Fix the sense you are defending in your opening or the essay will appear to contradict itself.',
    theme: 'politics-and-society',
    source: 'local-original',
  },
  {
    id: 'e-unjust-law',
    text: 'Is it ever right to break an unjust law?',
    pressurePoint:
      '"Is it ever" asks for an existence claim. A "yes" needs one well-defended case; a "no" needs a universal one. Recognising that asymmetry lets you choose the burden you can actually discharge.',
    theme: 'law-and-ethics',
    source: 'local-original',
  },
  {
    id: 'e-offence',
    text: '"Free speech must include the freedom to offend." How do you respond to this statement?',
    pressurePoint:
      'The statement conflates freedom from legal penalty with freedom from social consequence. The strongest answers separate the two and say which one they are defending.',
    theme: 'law-and-ethics',
    source: 'local-original',
  },
  {
    id: 'e-university-selection',
    text: 'Should universities select students on academic potential alone?',
    pressurePoint:
      'Everything turns on whether potential is measured by raw attainment or by attainment relative to opportunity. An essay that never distinguishes them is arguing about a word.',
    theme: 'education',
    source: 'local-original',
  },
  {
    id: 'e-inheritance',
    text: 'Would a society be fairer if large inheritances were taxed away?',
    pressurePoint:
      'Fairness to whom — the recipient, the deceased who earned the money, or those with no inheritance at all? Name the conception of fairness you are using before you apply it.',
    theme: 'economics',
    source: 'local-original',
  },
  {
    id: 'e-expert-rule',
    text: 'Are important decisions better made by experts than by elected representatives?',
    pressurePoint:
      '"Better" hides two criteria — competence and legitimacy — that can point in opposite directions. Say which you are ranking, and why, rather than sliding between them.',
    theme: 'politics-and-society',
    source: 'local-original',
  },
  {
    id: 'e-art-artist',
    text: 'Should we judge a work of art independently of the conduct of the person who made it?',
    pressurePoint:
      'Distinguish aesthetic judgement from decisions about patronage and display. One can hold that the work is undiminished and still argue about whether it should be exhibited.',
    theme: 'arts-and-culture',
    source: 'local-original',
  },
  {
    id: 'e-privacy-security',
    text: 'How much privacy should a citizen be expected to surrender for the sake of public safety?',
    pressurePoint:
      'A "how much" question demands criteria, not a verdict. Supply a test — necessity, proportionality, reversibility — and apply it to a hard case.',
    theme: 'law-and-ethics',
    source: 'local-original',
  },
  {
    id: 'e-future-generations',
    text: 'Do we owe anything to people who do not yet exist?',
    pressurePoint:
      'The non-identity problem lurks here: our choices determine who exists, so it is difficult to say a future person was made worse off. A strong essay either faces this or explicitly sets it aside.',
    theme: 'philosophy',
    source: 'local-original',
  },
  {
    id: 'e-charity-obligation',
    text: '"Giving to charity is a duty, not a kindness." Discuss.',
    pressurePoint:
      'The claim is about the moral category, not the amount. Arguing that people should give more does not establish that giving is owed.',
    theme: 'philosophy',
    source: 'local-original',
  },
  {
    id: 'e-national-history',
    text: 'Should a country teach its children a version of its history that they can be proud of?',
    pressurePoint:
      'Notice the question does not ask whether the history should be true. Refusing that framing is legitimate, but you must say that you are refusing it.',
    theme: 'history',
    source: 'local-original',
  },
  {
    id: 'e-animal-standing',
    text: 'Is there any good reason to give animals legal rights rather than legal protection?',
    pressurePoint:
      'Rights and protection differ in who may enforce them and on whose behalf. An essay that treats them as synonyms has not engaged the question.',
    theme: 'law-and-ethics',
    source: 'local-original',
  },
  {
    id: 'e-science-limits',
    text: 'Are there lines of scientific research that should not be pursued?',
    pressurePoint:
      'Separate the knowledge from its applications, and separate a prohibition on inquiry from a prohibition on funding it. These attract different objections.',
    theme: 'science-and-technology',
    source: 'local-original',
  },
  {
    id: 'e-press-freedom',
    text: 'Should journalists ever be compelled to reveal their sources?',
    pressurePoint:
      '"Ever" again sets the burden. The interesting essays specify the conditions rather than defending an absolute in either direction.',
    theme: 'media',
    source: 'local-original',
  },
  {
    id: 'e-climate-cost',
    text: 'Is it fair to ask today\'s poorest countries to bear any part of the cost of reducing emissions?',
    pressurePoint:
      'Historical responsibility and present capacity give different answers. Name which principle of fairness you are applying and defend the choice.',
    theme: 'environment',
    source: 'local-original',
  },
]

export const essayPromptById = new Map(essayPrompts.map((prompt) => [prompt.id, prompt]))
