# Agent — lessons learned

Retrospective notes for whoever (human or agent) works this repo next. Standing
*instructions* live in [`AGENTS.md`](AGENTS.md); *decisions* live in
`design/90-decisions.md`. This file is what was learned the hard way.

Keep it short — it loads into context, so length is a recurring cost. **Add a lesson only
when it would have changed a decision.** A lesson with no cost attached is a preference,
and preferences belong in `AGENTS.md`.

> **Everything below is inherited, not earned here.** It was harvested from ten existing
> projects because these are the failures most likely to repeat, not because they have
> already bitten in this repo. Delete any that turn out not to apply; add the ones that
> actually cost something. A lesson kept past its usefulness is context you pay for on
> every session.

---

## Drift

- **Editing from a diff accumulates drift that only a full read catches.** After many small
  edits, or at a phase boundary, reread the complete affected document set. One full-read
  pass over a spec set found twelve inconsistencies, including a functional bug where a
  derived-path list omitted a field, making one section's behaviour impossible under
  another's rules.
- **A note recording a divergence is closed by the edit it names, in the same commit.** A contract
  entry flagged that a design clause contradicted it and handed the fix to the next reconciliation.
  The clause was fixed; the note was not, so it went on asserting a conflict that no longer existed.
  The next pass paid a full re-read of the design's module boundaries plus git archaeology to
  establish that. A note about another file is a claim nothing re-checks — it survives its own
  resolution unless the edit and the note land together.
- **Search the concept, not the phrasing you just edited.** Striking a requirement from
  seven places, a grep for the exact removed phrase returned clean — it could not match the
  same requirement worded differently, and six stale statements survived a check reported as
  thorough. A pattern built from the text you changed confirms your edits instead of finding
  your misses. **Removals are where this bites**: a bad edit contradicts something visibly,
  a missed removal is silent.
- **When a document states a number, count the list.** "All eight operations" against a
  nine-row table survived two full review passes; the same defect occurred three times in
  one project, and four documents once carried four different counts of the same thing, all
  written from memory. Re-count; never increment.
- **When a type or public behaviour changes, audit everything downstream of it** — the prose
  description, every example, the projection or serialised form, the generated
  representation, command help, the test list, and the troubleshooting page. The pair of
  documents where one is an implementation-of the other is where drift concentrates.
- **An amendment made after its slice has merged has no carrier, and nothing goes red.** One
  adjudication produced six rulings; three of them belonged to slices that had already shipped, so no
  slice picked them up and no issue was opened. They survived two further slices and a merge to the
  default branch. The suite still reported the identical test and file counts the decision entry
  itself had recorded *before* the amendments — proof that no test was added and therefore that
  nothing could have failed. Two of the three were then defects live on both published targets, and
  one test actively asserted the wrong side of one. The entry was honest at the time ("none of which
  has an implementation yet"); **honesty in the log is not a carrier.** An amendment landing outside
  an open slice needs a tracked item in the same commit, or it is invisible from the moment it is
  written.
- **A ride-along named in prose is not a carrier either.** The entry above is about an amendment with
  *no* carrier; this is the same failure with one assigned. `assertSelfContained`'s new parameter was
  ruled to ride with `S16` — in a `## Next` paragraph that also noted `S16.5` "is written against the
  unamended form". `S16` merged with that criterion unchanged, so no test could go red, and `S17`
  through `S20` merged on top. **Cost: the contract declared a two-parameter signature and `V13`
  asserted the per-route check had landed, for five slices, while the tree applied the apex's ceiling
  to all four routes — found only by diffing declared exports against the tree.** A carrier is a
  changed criterion or a `Done when` checkbox. A sentence naming a slice is a hope.
- **A universally-quantified clause beside a hand-enumerated set is false the moment the set gains an
  input it does not know about.** `C17` read *"every outbound URL any route renders"* while
  `checkedLinks` enumerated three sources; `X8` had added a fourth the day before, and nothing
  compared them. **Cost: an invariant false from the day it was written, one live outbound link
  outside every gate on both published targets, five more queued behind it, and a reconciliation to
  discover it.** The CV route got the subset assertion that catches this (`S16.8`); the apex, being
  older, never did. When a rule says *every*, something must enumerate the *every* — or the rule must
  name what it excludes.
- **A constraint gets quietly reworded on its way into a slice criterion, and the test is
  written from the criterion.** The contract required every primitive selector to *begin
  with* its own class; `S4.4` restated that as *contains*, the test asserted `toContain`,
  and both shipped green. Ten days later a primitive was added whose nav rules match
  elements carrying no such class — the exact failure the anchoring rule names — under a
  test still named for it. **Cost: an invariant believed enforced since S4, unenforced for
  the primitive that needed it, live on both published targets, found only by a full
  re-read.** When a criterion restates a contract constraint, quote it; a paraphrase in a
  test name is where a rule stops being the rule.
- **A slice merges when its pull request merges; nothing else notices.** Two slices shipped
  and stayed under `## Outstanding` with every tracker checkbox unticked. The next planning
  pass then wrote a run order for work already in the tree — naming both in future tense —
  and the tracker sync opened issues for criteria the suite already covered. **Cost: a
  planning pass and a tracker sync both written against a stale picture, found only by a
  full document-versus-tree read.** A merged slice needs its landed row and its issue closed
  in the session that merges it, not at the next reconciliation.
- **A stale cross-reference is invisible.** Section numbers cited across documents rot
  silently when a document is restructured. Positional numbering makes this worse: inserting
  a document between existing ones means renumbering everything after it and rewriting every
  link. **Prefer appending.**

## Verification

- **Check documentation against the tree, not against other documentation.** A page once
  described a file that had never existed in git history, and a threshold table drifted the
  same way — both had been checked against neighbouring docs, which agreed with them.
- **Pull the real artifact before reasoning about it.** Merging two build outputs raised one
  real question — do their asset folders collide? Guessing wrong would have silently
  overwritten one build's output with the other's. Pulling the image and running the actual
  build answered it in two commands.
- **Running the code beats recalling it.** A golden-test vector written from memory was
  wrong; executing the reference implementation caught it before it became the expected
  value everything else was checked against.
- **Several confident recollections were wrong.** Every claim about an external contract
  should be checked against the published spec, not remembered.

## Token economy

- **Skill and command prompts inject their whole instruction file** on invocation. Only
  invoke one you will actually use.
- **Prefer targeted search and offset reads for routine work**; a large spec can cost 30K
  tokens per full read. Full reads are for the drift pass, not for lookups.
- **Start a fresh session at phase boundaries.** `AGENTS.md`, this file, and the design docs
  re-prime a new session cheaply — which is the reason for keeping all three tight.
- **Knowledge-graph tooling is cheap on code and expensive on prose.** Code extracts
  structurally via AST with no model call; prose does not, and a full rebuild on a small
  prose corpus cost ~200K tokens and found fewer issues than reading the documents did.

## Git, CI, and delivery

- **A broad `git add` has already nearly cost real work.** An ignore pattern would have made
  installer-generated scripts invisible to `git add -A` — present locally, green locally,
  missing in CI, with nothing saying why.
- **`prettier --check` reports false failures on a Windows working tree.** `core.autocrlf=true`
  gives CRLF locally while the committed blob is LF, which is what CI checks out. Check the
  blob before "fixing" formatting CI never complained about.
- **After a squash merge, `git branch -d` reports the branch unmerged** because the squash
  commit shares no history with it. Confirm with `git diff <branch> main` returning empty,
  then delete.
- **A required status check that never runs blocks the pull request permanently.** The
  saving on a skipped run is not worth a check that silently never reports — think twice
  before adding a `paths:` filter to a required workflow.
- **A CI job can never be granted more permission than its workflow declares.** Splitting a
  read-only gate from a deploy that needs write credentials is what keeps the gate from
  holding credentials it never uses.
- **Verify a regression test by reverting the fix.** A test that passes either way guards
  nothing.
- **An import-boundary check built on named clauses reports a clean graph while three other
  forms reach the same symbol.** A check enforcing "only these files may import `projects`"
  shipped green while `import * as ns`, `export * from` and `await import()` each reached it
  unflagged. Two were found by review, the third only while verifying that report. **Cost: an
  invariant believed enforced for one import form and unenforced for three, merged.** Decide
  reachability, not naming, and fail closed on a clause shape the check does not recognise.
- **A networked CI job triggered by `pull_request` reaches hosts the pull request controls.**
  A link-check job read hostnames from a source file and requested each from a hosted runner,
  on forks included. **Cost: caught in review and fixed in a follow-up commit on the same
  branch.** Any job that turns repository content into outbound requests needs its fork-PR
  behaviour decided when it is written.
- **A fix that only changed the odds is not a fix.** An intermittent failure went away when
  test parallelism was disabled — three consecutive clean runs — and came back on the fourth.
  The real cause was connection pooling handing out a stale schema snapshot, found by a tight
  single-threaded loop that reproduced it on iteration zero. **Cost: a wrong diagnosis that
  looked right, plus the repro loop to overturn it.** When a fix is "it stopped failing",
  suspect the odds moved rather than the cause, and say over how many runs.

## Rendering and encoding

- **A diff cannot show a rendering bug.** Documents shipped for months with metadata fields
  merged into one run-on paragraph, because Markdown joins consecutive lines — correct
  Markdown, wrong intent. A metadata field or blockquote label needs a **blank line** after
  it, never trailing double-spaces (`git diff --check` rejects those). Render before merging
  a document change.
- **Imported Markdown arrives CP1252 often enough to check for it** — mojibake em-dashes and
  arrows. Rewrite to UTF-8 on import.

## Naming and scope

- **Name things after structure, not flavour.** A kind was nearly named for its genre, which
  would have licensed a new one per theme. Theme words smuggle in decisions.
- **When a document starts describing how something *works* rather than what it *contains*,
  stop and check the contract it depends on.** An eight-document draft accidentally wrote a
  parallel engine — its own state envelope, its own API, its own status union. Six of its
  eight operations already existed upstream under different names. Every individual
  paragraph read like reasonable design; it was only visible when each claim was checked
  against the actual contract.
- **A shortcut taken in the reference implementation gets copied.** The next author reads
  the working example before reading the contract.
