# LNATLAS

LNATLAS is a private, desktop-first preparation environment for the **National
Admissions Test for Law (LNAT)**. It contains an expanded original passage and
question bank, a passage-led adaptive practice runner, first-class process-of-
elimination tracking, a complete 42-question timed mock with Section B essay,
a post-mock training report, a spaced-repetition skill model, and an optional
evidence-bound AI analyst.

It is not affiliated with, endorsed by, or approved by LNAT Consortium Ltd,
Pearson VUE, or any university.

## What it models

- **Section A** — 42 multiple-choice questions on 12 passages in 95 minutes,
  with free navigation and flagging across the whole section. One mark per
  correct answer, nothing deducted for a wrong one.
- **Section B** — one essay chosen from three prompts in 40 minutes, guidance of
  500–600 words against a 750-word ceiling.

The mock uses that published format as its specification and reports a raw mark
out of 42, which is exactly what the LNAT reports. No scaled score, percentile,
or conversion is published by the test, so none is invented here. The app adds
clearly labelled practice bands over that same 0–42 scale, then converts the
sitting into skill, pacing, blank-question, flagging, and process-of-elimination
training actions. Section B carries no official mark at all — it is sent to
universities as written.

## Run locally

Requires Node 22+.

```bash
npm install
cp .env.example .env.local
npm run check
npm start
```

Open <http://127.0.0.1:4177>.

`npm run dev` runs Vite on port 4176 with the API proxied to 4177, if you want
hot reload while editing.

## The content map

Fifteen Section A skills across four families, plus six Section B craft lessons —
21 lessons in all, each with core ideas, a method, pattern tells, traps, an
easier and a harder worked example, and cross-references to the skills candidates
genuinely conflate it with.

| Family | Skills |
| --- | --- |
| Close comprehension | literal meaning, meaning in context, attribution |
| Interpretation and inference | supported inference, fact vs judgement, application |
| Argument analysis | main conclusion, argument role, assumption, strengthen/weaken, reasoning flaw |
| Style, tone, and rhetorical purpose | authorial attitude, rhetorical purpose, emphasis signals, passage purpose |
| Section B essay craft | question interrogation, thesis, development, counterargument, structure and economy, precision and register |

The map is built backwards from what the official practice material and its
published commentary actually reward. `emphasis-signals` — reading italics and
inverted commas as argument — is an unusually LNAT-specific family that two
separate items in the official commentary turn on.

## Reference bank and fidelity

The practice pool now has **18 passages and 62 Section A questions** while the
frozen mock continues to select the exact public blueprint: 12 passages, sets of
3 or 4, and 42 questions. Every item remains original and passage-bound. The
official-reference layer checks the published structure, five-option format, no
negative marking, and measured 2010 practice-passage shape (454–942 words,
median 508). Fresh AI passages are constrained to 380–680 words, with near-miss
distractor guidance drawn from the Consortium's own advice on elimination.

## Learning intelligence

- Practice is **passage-led**. A passage arrives with its whole question set, so
  the reading cost is paid once and amortised across three or four questions,
  exactly as on the day. Reading time is charged separately from answering time,
  which is the only way to tell a candidate who cannot reason from one who cannot
  finish.
- Every saved answer updates a per-skill state (ability, uncertainty, spaced
  repetition interval, ease). Selection targets roughly 74% expected success and
  penalises repeated skills within one passage.
- Each completed set receives an evidence-bound report and an updated learner
  model. Every claim cites the attempt IDs behind it, and a claim with no
  evidence is dropped at the boundary rather than shown.
- A **reasoning review** runs only when you ask for it: you say why you chose an
  option, and the analyst judges the reasoning separately from whether the answer
  was right.
- Essay feedback is explicitly formative against five criteria, quoting your own
  lines. Quoted lines that do not appear in your essay are discarded, so the
  feedback cannot fabricate what you wrote.
- The score estimate is an expected-score model over a representative form,
  floored by what a five-option guess returns, with a confidence band that
  narrows as evidence and skill coverage grow. `null` means "not enough evidence
  yet" and is shown as such.
- Process of elimination is tracked with each answer. Mock scoring compares
  accuracy with and without eliminations, detects blanks after flagging, measures
  decision time, and produces the next training sequence rather than only a mark.

## AI providers

The app is fully usable with `AI_PROVIDER=none`; only the commentary is missing.
To enable one provider, configure `.env.local`:

```bash
# Claude Code subscription (recommended where the local `claude` CLI is signed in).
# Uses the existing Claude Code OAuth session; no API key is stored here.
AI_PROVIDER=claude-code
CLAUDE_CODE_CLI=claude
CLAUDE_CODE_MODEL=sonnet
```

```bash
# Google Antigravity (recommended where `agy` is installed and signed in).
# Uses your existing local Google OAuth session; no API key is stored here.
AI_PROVIDER=antigravity
ANTIGRAVITY_CLI=/Users/your-name/.local/bin/agy
ANTIGRAVITY_MODEL=gemini-3.7-flash-high
```

Or an API-key provider:

```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=your-pinned-model-id

# or
AI_PROVIDER=claude
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=your-pinned-model-id
```

Generated passages are written, then every question on them is **independently
solved by a second pass** before anything is persisted. If any requested question
fails that check, the complete passage set is discarded rather than weakened or
padded. Raw evidence is always written to disk before any analysis runs, and a
failed analysis never loses an answer.

## Project-owned memory

Everything lives in `data/`, which is git-ignored:

```
data/
  profile/    settings, skill state, learner model
  events/     attempts, sessions, essays, analyses, mock assessments (append-only JSONL)
  content/    accepted generated passages and questions
  reports/    readable markdown plus the JSON behind it
  active/     a paused mock checkpoint
```

No browser database, no account, and no key embedded in the app. You can back the
folder up, read it, or hand it to another tool without this app's cooperation.

## Verification

```bash
npm run check
```

97 tests assert the things that matter: that the expanded pool can supply a
complete 42-question form across 12 passages; that every question has exactly
five options labelled (a) to (e), one defensible answer, and a diagnosis for each
of the four wrong ones; that every Section A skill is exercised and none
dominates; that the mock reproduces the 95/40-minute blueprint with contiguous
passage sets and correct scoring; that retry/duplicate attempts are canonicalized;
that calibration survives corrupt stored values without producing `NaN`; and that
the score model never leaves the 42-mark scale or projects beyond it.

## Content and rights boundary

Every passage, question, explanation, essay prompt, and interface string in this
repository is original, written for this app. Nothing is taken or paraphrased
from any past or live LNAT paper. The local PDFs of the publicly published 2010
practice tests are git-ignored, never served, never committed, and never sent to
a model; they were read once to calibrate passage length, question phrasing, and
the shape of the skill map, which is all a specification needs.

Use the canonical sources for the test itself:

- [About the LNAT](https://lnat.ac.uk/)
- [Practice tests](https://lnat.ac.uk/how-to-prepare/practice-test/)
- [Hints and tips](https://lnat.ac.uk/how-to-prepare/hints-and-tips/)
- [Sample essays](https://lnat.ac.uk/how-to-prepare/sample-essays/)
