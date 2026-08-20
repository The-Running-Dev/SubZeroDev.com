# Decision log

Append-only. Newest at the top. The rejected alternatives are the point — without them, every future session relitigates the same choice.

## Open
<A staging area, not a home. Things noticed mid-slice that were deliberately not acted on. `/track` turns each into a GitHub issue and removes it from here. An item that is a *decision* rather than a *todo* belongs below as an entry, not in an issue.>

- **`V16`'s `assertImportGraph` is declared in the contract and has no implementation.** The import
  graph is checked instead by `tests/content/import-graph.test.ts` against a test-local AST helper,
  which is the arrangement `assertImportGraph` was written to replace. `20-contract.md` now says so
  rather than implying the function exists. Pre-existing and unrelated to either 2026-08-11 item;
  noticed while re-aiming `C14`. Either implement it or withdraw the declaration — both are decisions,
  neither is `/reconcile`'s.

(the S11/S12 item staged here on 2026-08-20 was adjudicated by `/slices` the same day — both slices
were ruled landed and retired to `30-slices.md`'s new `## Landed` index, and the entry of that date
below is its carrier, since issues are disabled on this repository;

the two items staged 2026-08-11 — the JSON migration's contract consequences and the route-fold
drift — were adjudicated and applied by `/reconcile` on 2026-08-20; issues are disabled on this
repository, so the carrier is the decision entry of that date rather than a tracked issue, and every
edit it names landed in the same commit as the entry;

the two items found 2026-08-08 while adding S11's C16 import check and while adjudicating the
testimonialsPath fix — the SKIP_DIRS/tests/build/ exclusion and the untethered footer back-link —
became [#68](https://github.com/The-Running-Dev/SubZeroDev.com/issues/68) and
[#69](https://github.com/The-Running-Dev/SubZeroDev.com/issues/69) on 2026-08-08;
the three items `/reconcile` staged on 2026-08-08 became
[#54](https://github.com/The-Running-Dev/SubZeroDev.com/issues/54),
[#55](https://github.com/The-Running-Dev/SubZeroDev.com/issues/55) and
[#56](https://github.com/The-Running-Dev/SubZeroDev.com/issues/56) on 2026-08-08; the five code items
`/reconcile` staged on 2026-08-07 became
[#48](https://github.com/The-Running-Dev/SubZeroDev.com/issues/48),
[#49](https://github.com/The-Running-Dev/SubZeroDev.com/issues/49),
[#50](https://github.com/The-Running-Dev/SubZeroDev.com/issues/50),
[#51](https://github.com/The-Running-Dev/SubZeroDev.com/issues/51) and
[#52](https://github.com/The-Running-Dev/SubZeroDev.com/issues/52) on 2026-08-07; the inventory/brief
subdomain-count item became [#37](https://github.com/The-Running-Dev/SubZeroDev.com/issues/37) on
2026-08-07; the two before it became
[#16](https://github.com/The-Running-Dev/SubZeroDev.com/issues/16) and
[#17](https://github.com/The-Running-Dev/SubZeroDev.com/issues/17) on 2026-08-06)

---

### 2026-08-20 — S11 and S12 are landed, not re-sliced; the twelve bodies stay under a `## Landed` index

Context: `## Open` staged S11 and S12 as `/slices`' — *"a re-slice of S11/S12 against the merged
two-route shape, or a ruling that both are landed and should be marked so."* The tree answers the
factual half outright: both merged ([#66](https://github.com/The-Running-Dev/SubZeroDev.com/pull/66),
[#73](https://github.com/The-Running-Dev/SubZeroDev.com/pull/73),
[#76](https://github.com/The-Running-Dev/SubZeroDev.com/pull/76)) and were partly withdrawn afterwards
by [#77](https://github.com/The-Running-Dev/SubZeroDev.com/pull/77) and
[#79](https://github.com/The-Running-Dev/SubZeroDev.com/pull/79). Nothing from either is outstanding.
What was actually decided here is what the document should say about work that landed and was then
superseded.

**Chosen: both are landed, and `30-slices.md` gains the `## Landed` / `## Outstanding` split it never
had.** The document predates that shape — `.claude/commands/track.md` and `tools/Test-DesignDrift.ps1`
both cite a *"How this document is kept"* section and a `## Landed` index this file did not contain,
so the drift tool read all twelve shipped slices as outstanding specification. `S1`–`S12` move under
`## Landed` behind an index table naming each slice's pull request and **what has changed underneath it
since**; `## Outstanding` carries `S13` alone. Verified after the edit: the tool's parser now reports
`Landed: 1..12` and one outstanding slice with eight criteria.

Rejected — **re-cutting S11 and S12 against the two-route shape**, the first half of the staged fork.
The work merged and the withdrawal is complete in the tree, so the re-cut slices would have had nothing
to implement; they would have been a description of current code, which § *Single ownership* forbids a
document to carry. Rejected — **annotating S11 and S12 in place and leaving the twelve as full
sections.** The smallest edit, and it keeps every criterion verbatim, which is why it was put second
rather than dismissed. Declined because the tooling would still read twelve shipped slices as live
specification, and because a reader meets `S11.15` as a criterion several lines before meeting the note
that kills it.

**Chosen, and not dictated by the ruling: the landed criteria bodies are kept, against the kit's own
default.** `.claude/commands/track.md` says a landed slice's body is retired once its issue closes.
Retiring them here would have broken **211 citations across 63 files** — measured, not estimated:
`tests/verification/style-agreement.test.ts` cites `S4.11` and `S4.12`, `src/presentation/types.ts`
cites `S4.14`, `.github/workflows/ci.yml` cites `S10.5`–`S10.10`, and every `vitest.*.config.ts` names
the criterion its shard runs. That is 109 distinct ids, each the stated reason a file exists, and
`agent.md` § *Drift* records a stale cross-reference as the failure that is invisible. The bodies
therefore stay, demoted to `###` so the index table is what a tracker parses; every one of the 109 was
confirmed to resolve after the edit. Rejected — **retiring the bodies and re-pointing all 211
citations at index rows**, which loses the per-criterion precision the citations carry and is a
63-file edit outside this command's scope. Rejected — **retiring them and accepting the orphans**,
which is the kit shape exactly, at the price of 211 dangling references.

**Also chosen: no criterion is edited, including the one the tree now contradicts.** `S11.15` requires
`RoutePath` pinned to a three-member union; `tests/types/route-path.type-check.ts` pins it to two. It
keeps its id and its wording, and the contradiction is recorded against it in the index. Editing it
would rewrite what an existing citation refers to, which is the one failure the never-renumber rule
exists to prevent — and it was true when it was accepted, which is all a landed criterion claims.

Reversibility: cheap. This pass changed no code and git carries the prior text; the split is a
restructure of one document, and every criterion id survives it unchanged.

---

### 2026-08-20 — `S13` is allocated for the apex's placeholder copy, which is live on both targets

Context: found while surveying the tree for outstanding work. `site/landing.config.ts` and
`src/composition/apex.ts` carry **six** placeholder strings — the apex's `title`, `description`, Open
Graph title and description, and the `Organization` block's `name` and `description` — each reading
"replace before publication". The 2026-08-06 entry *"S6's route titles and descriptions start as
placeholder copy"* authorised exactly this, on the owner's instruction, "with the real copy to replace
it in a follow-up once written". **That follow-up was never opened**, and the site has since published
on both targets, so a search result, a shared link and the machine-readable `Organization` summary all
currently say the copy is a placeholder.

This is verbatim the failure `agent.md` § *Drift* names — *"an amendment made after its slice has
merged has no carrier, and nothing goes red"*. Nothing was wrong with the deferral; it had no carrier,
and issues are disabled here, so fourteen days passed with the placeholder on the front page.

Chosen: allocate `S13 — The apex's real title and description`, the sole entry under
`## Outstanding`. It is vertical — six strings through route metadata and the JSON-LD block to the
emitted document — and its criteria assert against **built HTML** rather than the declared
configuration, on `S6.12`'s rule. `S13.3` requires that neither module still contains the string
`placeholder`, so the two `PLACEHOLDER COPY` comments instructing a reader to leave the copy alone go
with the copy they guard.

Rejected — **treating it as a copy edit needing no slice.** It is six strings, and the temptation is
real. Declined because that is precisely what the 2026-08-06 deferral did: something too small to
track went untracked and survived fourteen days and a publication. A slice is the only carrier this
repository has while issues are disabled. Rejected — **folding it into `S6`'s criteria**, which would
edit a landed slice's body and reopen a shipped slice.

Reversibility: cheap, and it stays blocked on the owner either way — the six strings are brand
material a slice transcribes and never invents.

---

### 2026-08-20 — The citation ruling lands in `20-contract.md`; `Testimonial.url` stays unbranded

Context: the entry below sequenced the ruling's second half to `/contract` over `20-contract.md`
§ *Types*, § *Error semantics* and `X8`, and closed **"Still owed"**. This is that run. The ruling
itself was not re-decided; it was transcribed against the tree rather than against the ruling's
summary of it, which is what surfaced the one thing here that the ruling did not settle.

Chosen, and dictated by the ruling: `Testimonial` gains `readonly url?: string`;
`ContentErrorCode` gains `TestimonialUrlInvalid` and its table row; the testimonial codes become six
and the field-level ones five; the stale **"no `source` field"** sentence goes, while the `avatar`
rejection stays on its own reasoning; `X8` gains the `Source`-line clause.

**Chosen, and not dictated by the ruling: `url` is declared `string`, not `AbsoluteUrl`.** The tree has
declared it unbranded since 5f1bd16 and validates it with the same predicate `Home.own.url` uses, so
the contract had a genuine choice about which to write down. Written as `string`, because that is what
the tree declares and a contract that says otherwise is false about the surface it exists to
constrain — and the tree's arrangement is coherent rather than an oversight: `Testimonial` carries no
branded field at all, a brand here gates a value into a derivation, and no derivation reads a
testimonial. `TestimonialUrlInvalid` earns the property at the same point every other testimonial
guarantee is earned. Rejected: **writing `AbsoluteUrl` and treating the tree as the stale half.** It
buys symmetry with `Home.own.url` and a guarantee carried in the type rather than in a validator, which
is this document's usual preference. Declined because nothing downstream demands it and it would make
`Testimonial` the one half-branded record shape in the repository, which is harder to reason about
than either end — and because it is a public-interface change, so it would have escalated rather than
being written here.

**Also recorded: two statements elsewhere in `20-contract.md` were falsified by the field itself and
corrected in the same commit.** § *Public signatures*' "no author, quote, role or organization appears
in Composition's source" omitted `url`, and `X5`'s "a `ResolvedHome.url` carried in an `href` is the
case the apex composition has" was no longer the only attribute-position case. Both are transcription
errors under `AGENTS.md` § *Hard rules*, corrected where found; neither is a decision. The rule the
first states is unchanged.

**Not applied, and not this command's:** `src/composition/testimonials.ts` cites `(C16)` for the
content-agnostic rule. `C16` is an `S11` acceptance-criterion id, not a contract invariant — the
contract's `C` series stops at `C15` — so the comment reads as a contract citation that does not
resolve. It is a code comment, `/contract` writes no code, and `S11` is already staged in `## Open`
as `/slices`' to re-cut. Recorded here so it is not rediscovered as a contract defect.

Reversibility: cheap. The field, the code and the `X8` clause revert with the tree; the branding
choice is a one-line change if a derivation ever reads a testimonial, which is the condition that
would make it worth having.

---

### 2026-08-20 — The citation ruling lands in the brief and the design; open question 5 closes with it

Context: the entry below ruled that `design/` is the stale half on `Testimonial.url` and closed with
**"Not applied here"**, sequencing the work as `00-brief.md` and `10-design.md` first — `/design`,
`opus`/`high`, fresh session — then `/contract` over § *Types*, § *Error semantics* and `X8`. This is
that `/design` run. Nothing below was re-decided; the ruling was transcribed. One thing was closed
that the ruling did not name, and it is the reason this entry exists rather than a commit message.

Chosen, in `00-brief.md`: § *Definition of done* drops "fabricated" from the collection and states
instead that the quotes are fabricated **save where one is genuinely citable and carries its
citation**; § *Source material* item 4 keeps every existing sentence and gains a closing paragraph
stating the narrowing as **"the exception is that no fabricated quote is labelled, not that every
quote is fabricated"**. Item 3 is untouched and stays true — none of `Idea.md`'s three drafts was
chosen. In `10-design.md`: § *Testimonial* gains the `url` row, the combined avatar/source paragraph
splits so the `avatar` rejection survives intact on its own reasoning, and the citation rejection is
retained as the record of what it was an argument about — fabricated attributions — rather than
deleted. The tell is written up as an accepted cost under its own heading, in the form this document
already uses for `stage`-versus-liveness.

**Chosen, and not dictated by the ruling: open question 5 is marked answered.** *"Does Effortless
Action go on the page, and in which draft?"* had stood open since 2026-08-05 while both halves were
already settled — the page half by `00-brief.md` § *Definition of done*, which names Effortless Action
as one of the apex document's four sections, and the draft half by this log's own 2026-08-07 entry,
*"The manifesto supersedes the Idea.md draft"*, where the owner ruled the manifesto prose is
owner-supplied final copy superseding the transcript outright. `.claude/commands/design.md`'s re-run
rule is explicit that a question the brief now answers must not reappear, so leaving it open was a
defect in this document rather than a live uncertainty. It keeps its number and says so, per the
stable-numbering rule the section opens with.

Rejected: **regenerating `10-design.md`'s prose in full**, which is the literal reading of the re-run
instruction. Declined because the same instruction binds the output to this log — a logged decision is
re-expressed, not re-made — so a faithful regeneration reproduces the current document everywhere the
brief and this log have not moved, and re-typing 1158 lines of reconciled prose to reach that same
artifact risks silently dropping a load-bearing clause for no gain. `AGENTS.md` § *What not to do*
forbids improving prose while editing something else, which is what a cosmetic rewrite would be.
Rejected: **leaving question 5 open and letting `/contract` or the next `/reconcile` find it** — it
would be found as drift a third time, and the run that can see it settled is the one that should close
it.

Reversibility: cheap in `10-design.md`, expensive in `00-brief.md`, unchanged from the entry below —
item 4's carve-out is load-bearing for the section, and the narrowing is the kind of clause that is
re-argued rather than reverted. Question 5's closure is cheap and citation-safe: the number is
retained.

**Still owed:** `/contract` over `20-contract.md` § *Types*, § *Error semantics* and `X8` — the
`url` field, `TestimonialUrlInvalid`, the testimonial codes becoming six, and the `Source`-line clause.
That half is unchanged by this run and is not `/design`'s.

---

### 2026-08-20 — A testimonial may carry a citation URL; `design/` is the stale half

Context: `/contract` compared `20-contract.md` against the tree and found a contradiction neither
document nor `## Open` had recorded. `10-design.md` § *Testimonial* declares four fields and rejects a
citation link by name — *"`source` was considered as an outbound citation link, but every candidate
rendering either duplicates `organization` as inert text or turns a fabricated attribution into a
clickable claim, which the *testimonials* carve-out in `00-brief.md` § *Source material* does not
extend to"* — and `20-contract.md` carries the same four fields, the same sentence, an eighteen-member
`ContentErrorCode` and the phrase "the five testimonial codes". The tree has carried a fifth field
since 5f1bd16 ([#75](https://github.com/The-Running-Dev/SubZeroDev.com/pull/75), 2026-08-10): an
optional `url`, validated as an absolute `https:` URL, rendered as a `Source` link in the card's
attribution, and used by exactly one entry — a real quote from a real issue in
`SubZeroDev.GameEngine`. This is a **public interface**, so it escalated rather than being corrected in
place (`AGENTS.md`, *Hard rules*).

The design's rejection is entirely an argument about **fabricated** attributions, and the one entry
using the field is not one. That is why this is a stale document rather than a defect in the tree: the
reasoning was sound and simply never contemplated a quote that could be cited.

Chosen, **on the owner's ruling**: `design/` moves and the code does not. `Testimonial` gains the
optional `url`; `ContentErrorCode` gains `TestimonialUrlInvalid`; the testimonial codes become six;
`X8` gains the `Source`-line clause alongside the existing metadata-line rule. The brief moves too, in
two clauses that the real quote makes false — § *Definition of done*'s "a fixed collection of
**fabricated** testimonials" and § *Source material* item 4's "**every** quote in it is fabricated".
The bounded exception itself is unchanged: the page still labels nothing on it as fictional.

Rejected: **remove `url` from the tree**, restoring the documents as written and leaving the brief
untouched. It is the cheaper edit and it keeps one property the chosen option gives up — a `Source`
link on one card among fifteen is a **tell**, inviting a reader to notice which quotes can be checked
and which cannot, which is a cost to the joke the section exists for. Declined because the house rule
that nothing may be funnier than it is true favours the citation where one exists, and because the
quote is genuinely checkable evidence about a SubZeroDev repository, which is the site's own subject.
Rejected: **keep the field and render nothing** — an inert declaration, which this design refuses
elsewhere by name.

Reversibility: cheap in code, expensive in the brief. Item 4's carve-out is load-bearing for the
section, and narrowing "every quote is fabricated" to "every fabricated quote is unlabelled" is the
kind of clause that is re-argued rather than reverted.

**Not applied here.** `/contract` may not write a signature `10-design.md` determines the opposite of,
so the sequence is `00-brief.md` and `10-design.md` first — `/design`, `opus`/`high`, fresh session —
then `/contract` again over § *Types*, § *Error semantics* and `X8`. The single descriptive drift this
pass did correct on the spot is in 7d83b99 and is unrelated.


### 2026-08-20 — `design/` is reconciled to the two-route tree and to the JSON content documents

Context: the two items staged in `## Open` on 2026-08-11, adjudicated together because they overlap in
`§ Adapter`, which both rewrite. The fold's removal was already decided (2026-08-10); the JSON
migration's contract consequences were deferred by
[#83](https://github.com/The-Running-Dev/SubZeroDev.com/pull/83) rather than overlooked. Neither was
re-litigated here — what was decided is how much the documents should say afterwards.

Chosen, **the fold**: delete it from `10-design.md` and `20-contract.md` outright, and record it in
`10-design.md` § *Alternatives considered* as an alternative that shipped and was withdrawn, pointing at
the 2026-08-10 entry for the detail. Roughly fifteen clauses go — § *Route*'s "Three, not two", the
fold sentences in § *Module boundaries*, § *Control flow* 1 and the whole of 3a, the "fold envelope
drifts" failure mode, `FoldedRoutes`, `foldRoutes`, `composeTestimonials`, `testimonialsPath`,
`stylesheetFor`'s `data-view`/`default-*` blocks, and the fold clauses in `A4`, `A6`, `X6`, `X8`, `X9`,
`X10`, `V2`, `V11`, `V13`, `P6`, `Primitive.rules` and § *Error semantics*. `composeApex` gains its
`testimonials` parameter and `X9` is re-aimed at the `view` primitive's `:target` switch, which is the
fold's idea applied within one document rather than across two.

Rejected — **marking each clause superseded in place.** It keeps the history visible in the document
that carried it, and it is what a cautious pass would do. Declined because `agent.md` § *Drift* already
carries the cost: a note recording a divergence survives its own resolution unless the edit and the
note land together, and this would create fifteen of them at once, in a contract that would then
describe two architectures. Rejected — **deleting with no alternatives note.** § *Single ownership*
argues for it, since `90-decisions.md` holds the why in more detail. Declined because § *Alternatives
considered* is where a future session looks before proposing a route per section again, and it will not
think to search a dated log entry for a shape nobody mentioned to it.

Chosen, **the JSON migration**: `C14` and `C16` merge into one invariant over the two **document
validators** — only Adapter and the validator tests may reach `projectsDocumentValidator` or
`testimonialsDocumentValidator` — which is what `tests/content/import-graph.test.ts` already asserts,
including against the four non-naming reach forms. `UnauthorizedInventoryImport` becomes
`UnauthorizedValidatorImport`. `§ Content` loses `projects` and `testimonials` and gains the two
validators, with the structural/semantic split written out; a new `§ The content documents` states what
`site/sources.public.yml` and the two JSON files cannot state about themselves — strict envelopes, a
`version` that fails rather than degrades, `at: build`, `cache: manual` — and points at the tree for
everything it can. `§ Adapter` is rewritten around `defineLandingPageData`: the default export is a
`LandingPageDataConfig`, not a `LandingPageConfig`, and `A5` becomes a property of the build rather
than a call Adapter makes. `A3`'s import list and `V16`'s citations follow.

**What that invariant does and does not buy is written down, because they are not the same guarantee.**
The old rule kept unvalidated records from reaching a derivation. That failure mode is now closed **by
construction** — the records are JSON outside the module graph, and `Inventory` and `Testimonials` are
constructible only by a validator — so the surviving rule protects something narrower: that there stays
one validation entry point per document. Rejected — **dropping `C14` entirely** on the § *Single
ownership* argument that an invariant restating a type-system guarantee is a second copy. Declined
because `V16` and the test file both cite the id, and deleting it would leave the test's reason for
existing written down nowhere in `design/`.

Also settled: **the package pin's fifteen `0.3.0` references.** Every behavioural claim among them was
**re-verified against the installed `0.4.1`** in this session rather than re-dated from memory —
`config.styles` is still read nowhere, `hydrate` is read only as a type check during data validation,
`LandingPageBodyRoute`'s shape is unchanged, `noScript` is still appended inside a body route's body,
and `socialImageUrl`/`openGraph.imageUrl`/`twitter` are still omitted when absent. Bare pins move to
`0.4.1`; dated answers in the `U*` blocks keep their original version and gain the supersession.
Rejected — **find-and-replacing the numeral**, which would have re-asserted a verification nobody
performed; rejected — **staging it for `/contract`**, since `## Open` is where the last two items sat
for twelve days.

Also settled: **`row` is retained with no call site**, and the contract now says so rather than
describing it as a live layout. Its last user went with the section stack on 2026-08-10. It stays
because `stylesheetFor` derives emission from the body, so an unused primitive reaches no document and
costs nothing — which is what distinguishes it from the "permission with no user" `10-design.md`
§ *Alternatives considered* refuses, where an unexercised permission widens what a document may
contain. Rejected — **deleting it**, which is the stricter reading and stays cheap to do later; it is a
code change, and this was a documentation pass whose only gates were `tsc --noEmit` and
`check-design-counts`. The same paragraph's claim that `row` is the *only* primitive sizing a child it
does not name is corrected: `grid`'s `break-inside` rule made that untrue on 2026-08-08.

**Not resolved here, and deliberately:** `design/30-slices.md`'s S11 and S12 still specify the fold.
`.claude/commands/reconcile.md` puts that document out of scope and forbids editing an unlanded slice's
criteria in this pass — landing slice N and rewriting slice N+1's criteria is the churn loop this
command owns the first link of. It goes to `/slices` (`opus`, `high`). `V16`'s `assertImportGraph` is
still declared with no implementation; the contract now says so instead of implying otherwise.

Reversibility: cheap for every edit here — this pass changed no code, and git carries the prior text.
The two things it describes are not cheap to reverse and were not decided here: the fold's removal is
recorded as expensive in the 2026-08-10 entry, and the JSON migration as moderate in the 2026-08-13
one.

---

### 2026-08-20 — The apex is a tab switch after all; the brief's "all at once" clause is the stale half

Context: `/reconcile` found the deployed apex hiding three of its four sections while
`00-brief.md` § *Definition of done* required all four to render at once, "not hidden behind a tab",
and while the 2026-08-10 entry below recorded that as an explicit owner instruction.
[#79](https://github.com/The-Running-Dev/SubZeroDev.com/pull/79) reversed it thirteen hours after that
entry was written, restoring the switch as a new `view` primitive with
`tests/build/section-layout.test.ts` guarding it from a browser. That pull request's own body named the
two contract statements it was leaving stale and said they needed sign-off; **the sign-off was never
asked for and no entry was written**, so nothing went red and nothing was staged in `## Open`. The
contradiction survived eight merges, a `/reconcile` staging pass on 2026-08-08 and PR #83's deferral
note — both of which read this area — because the restored switch shares no vocabulary with the fold it
replaced: every search for `foldRoutes`, `data-view` or `/testimonials/` returned clean while
`:target`-based section hiding was live under a new name.

Chosen: **the brief moves and the code does not.** #79 is the later decision and the better one on its
own evidence — with every section visible, each nav link scrolled to its section instead of selecting
it, no tab ever read as current, and the imported prototype (`SubZeroDev Landing.dc.html`) puts each
section behind its own `sc-if` and shows exactly one. `00-brief.md` § *Definition of done* loses "not
hidden behind a tab" and "all render on the same document at once", keeping the clause's real point,
which is that testimonials is a **section of the apex rather than a route** — that half is unchanged by
this entry and is what the 2026-08-10 merge actually bought. § *Source material* item 4 drops
"always-visible" for the same reason. `20-contract.md`'s `PrimitiveName` opens from ten to twelve and
declares `view` and `link-current` in the union rather than carrying one of them in prose alone; `view`
gets the paragraph describing why a primitive naming one document's anchor ids is accepted here.

Rejected — **reverting #79 and holding the brief.** The brief outranks the code and this was the
default reading, put first when the fork was raised. Declined on the owner's ruling: the switch is the
intended design, the four-sections-at-once instruction was given before its geometry had been seen
rendered, and #78's single-column stack — which is independent and stays either way — is what exposed
that. The cost of this direction is stated plainly: **the brief has now been amended twice in eleven
days on the same clause**, which is the pattern *Working with me* asks to be told about rather than
absorbed quietly.

Rejected — **leaving both and staging the contradiction in `## Open` again.** It was already there in
substance for ten days without being seen. A second deferral of a Definition-of-done contradiction that
is live on both published targets is not a lighter-weight decision, it is the same decision taken by
not taking it.

Reversibility: cheap in code, expensive in intent. Deleting the `view` primitive, its class at
`src/composition/apex.ts:128` and `tests/build/section-layout.test.ts` restores the all-visible page in
one patch; what does not come back cheaply is a brief clause that has stopped being trusted as settled.

---

### 2026-08-13 — `PrimitiveName` gains `link-current`, for apex/blog outbound navigation parity

Context: a reconciliation session rooted in `SubZeroDev.Blog` found the apex's outbound nav group
(header and footer bars) missing a self-referencing "SubZeroDev.com" entry that the blog's own masthead
already carries for its own site, with the active member visually distinguished. Bringing the apex in
line means one more outbound `NavTarget` and a way to mark it current. `design/20-contract.md` states
`PrimitiveName` is closed and that a further member is a contract amendment (§ *Presentation's token set
and primitives*), not a class composed markup adds unilaterally — this entry is that amendment, written
in the same implementing session rather than a preceding `/contract` pass, on the owner's explicit
instruction to proceed and record it here.

Chosen: a twelfth primitive, `link-current` (`.link-current { color: var(--fg); }`), applied alongside
`link`'s own class — `class="link link-current"` — on the one outbound entry naming the current site,
plus `aria-current="page"` on that same anchor. `outboundTargets` prepends a `NavTarget` labelled
`SubZeroDev.com`, its URL the passed-in `origin` with a trailing slash appended and `current: true` set,
built directly rather than through the existing `target()` helper, since `target()` exists to drop an
*optional* inventory lookup and this entry is always present. The trailing slash mirrors the blog's own
literal in
`docs/docusaurus.config.ts`; every other use of `origin` in this codebase (the JSON-LD block) stays
bare — this is the one deliberately slashed instance, because it names a navigable link rather than an
identifier.

Rejected — folding the current-state rule into `link` itself. The miss route's body carries `.link`
with no current entry, and `assertStyleAgreement`'s `SelectorWithoutUser` check would then reject the
unreachable half of a combined rule; two primitives keep each one's selectors matched to a body that
actually uses them. Rejected — a data attribute or inline style instead of a class, since every other
current-vs-inactive distinction in this codebase (the fold's `view` primitive) is expressed as a
primitive class, and a one-off mechanism here would be a second pattern for the same kind of state.

Reversibility: cheap. One primitive entry, one `NavTarget` field, and the test-suite extensions that
pin both; nothing downstream depends on `link-current` existing.

---

### 2026-08-13 — Local versioned JSON documents use Data.Json and Zod

Chosen: projects and testimonials are owned by two strict, versioned JSON documents loaded only at
build time through `subzerodev-data-json@0.2.0`; `zod@4.4.3` decodes their envelopes and record
shapes, while the existing Content validators keep semantic policy. The site pins the corrected
`subzerodev-platform-ui-landing-page@0.4.1` exactly, since `0.4.0` was superseded before this
migration began.

Rejected — retaining TypeScript-owned arrays. It couples content edits to source modules and makes the
adapter own raw records instead of validated sources. Rejected — a network or fallback source. Local
files are the complete site input and preserve the build's no-network policy. Rejected — handwritten
structural checks. Zod already supplies the strict decoder and aggregated document diagnostics.

Reversibility: moderate. The JSON documents can be re-encoded into TypeScript, but that would restore
the old ownership boundary and remove the reusable build-time source contract.

---

### 2026-08-10 — Testimonials merges into the apex as an always-visible section; the fold and the tab-hiding view switch are removed
Context: the owner supplied a second Claude Design handoff bundle (`Landing page UI extraction-handoff.zip`,
carrying the same `SubZeroDev Landing.dc.html`/`support.js` prototype the 2026-08-08 fold decision and the
same day's enhancement-script decision below were both built from) with two explicit instructions: adapt
the prototype's visual design and copy verbatim, but (1) all four of its `view`-switched sections —
Effortless Action, The Echo System, Contamination, Testimonials — stay visible on one page at once rather
than hiding all but one, and (2) testimonials no longer needs its own route or the brief's "one route that
breaks character" carve-out — the content stays, folded into the apex as a normal section, and the framing
that required it to be an isolated page is dropped. Confirmed with the owner before touching code (this
session's transcript), since the standing `00-brief.md` Definition of Done named a `/testimonials/` route
by contract, not as an implementation detail free to change without sign-off.

This reverses two pieces of prior, deliberate work: S11 (the testimonials route) and half of S12/the
2026-08-08 fold (the CSS `:target`/`:has()` view switch and the JS tab-activation layer built on top of it).
Both were correct given the requirements they were built against; the requirement itself changed.

Chosen: `composeApex(inventory, testimonials, origin)` gains a fourth section — Testimonials — rendered by
`renderTestimonials` (`src/composition/testimonials.ts`, formerly `composeTestimonials`, no longer a
route composer). The header nav's four links (`#effortless-action`, `#echo-system`, `#contamination`,
`#testimonials`) are now plain same-document anchors with no click interception: nothing hides a section
once the document has rendered it, with or without the enhancement script running. `foldRoutes`,
`FoldedRoutes`, `composeTestimonials`, `testimonialsPath` and the `/testimonials/` route are deleted
outright, along with `stylesheetFor`'s fold-specific `data-view`/`default-apex`/`default-testimonials` CSS
rules. Adapter (`site/landing.config.ts`) now declares exactly two routes — apex and miss — and
`RoutePath` narrows to `"/" | "/404/"`. The enhancement script keeps everything from S12 that was never
about hiding sections: the heading-above-label reorder (now applied to all four sections, including
Testimonials), the manifesto's numbered layout, the ecosystem search box and stage chips, and the
keyboard-accessible detail overlay. `00-brief.md`'s Definition of Done and *Source material* item 4 are
amended in the same commit to describe testimonials as a section rather than a route — the exception to
the "nothing funnier than true" house rule is unchanged in substance, just no longer tied to a route.

Rejected — leaving `/testimonials/` as a route reachable by URL but dropping it from the nav. Cheaper and
fully reversible, but it does not honour "testimonials is gone" as a tab/page — the owner explicitly chose
the merge over this when asked.

Rejected — stripping the enhancement script back to plain server-rendered HTML while merging testimonials.
The owner explicitly asked to keep the filter, the overlay and the manifesto layout; only the view-switch
half of S12 was in scope for removal.

Rejected — keeping `foldRoutes` and just widening its `defaultView` union to a permanent no-op. The fold's
entire reason to exist was reconciling *two* routes into shared-view documents; with one route there is
nothing left to fold, and keeping the module would be dead structure pretending to still do work.

Reversibility: expensive. Reintroducing `/testimonials/` as a separate route, or the tab-hiding view
switch, means re-deriving the CSS `:target`/`:has()` fold and the JS tab-activation layer this entry
removes — both are recoverable from git history, but neither is a small patch on top of the merged shape.

**Known debt, mostly closed on 2026-08-20.** This entry left `design/10-design.md` and
`design/20-contract.md` describing the three-route fold architecture in detail, and
`design/30-slices.md`'s S11/S12 acceptance criteria reading as if it ships — deliberately, because the
surface area was large and session boundaries put doc-reconciliation after implementation on purpose
(`AGENTS.md` § *Session boundaries*). The `/reconcile` pass ran on 2026-08-20 at `opus`/`high` and
**removed the fold from both documents**; see that date's entry for what changed and what was rejected.
**S11 and S12 are still outstanding** — `30-slices.md` is out of `/reconcile`'s scope by that command's
own rule, and correcting an unlanded slice's criteria belongs to `/slices`.

---

### 2026-08-10 — One inline enhancement script is admitted; the brief's non-goals are untouched
Context: the owner imported a Claude Design prototype — `SubZeroDev Landing.dc.html`, `support.js`,
`github.md` — carrying an interactive layer the shipped site does not have: view tabs, a project
search box, stage filter chips, a project detail modal and scroll reveal. Read rather than assumed:
`support.js` bundles no runtime. It injects React 18.3.1, ReactDOM 18.3.1 and Babel standalone from
`unpkg.com` at load, and draws every project, manifesto line and testimonial from arrays held inside
a `<script type="text/x-dc">` block. Shipping it as imported breaches two **binding** `00-brief.md`
non-goals outright — *"no third-party script"* and *"No load-triggered network request after the
initial document request"* — and leaves the apex blank for a crawler, a JS-off visitor, or anyone
whose network does not reach `unpkg.com`. That blank page is verbatim the condition `00-brief.md`
§ *Problem* exists to fix: *"The apex is where that belongs and it is empty."*
Chosen: **the contract moves and the brief does not.** A new `X10` admits **at most one** additional
script element per content-route body: inline, no `src`, no `</script` sequence, initiating no request
of any kind. It is constrained to be *strictly additive* — it may reveal, hide, filter, reorder or
overlay content already in the DOM, and may never be the only source of any content. `X6` gives up its
closing "no document contains a second script element" to `X10`; `X9` records that the fold emits it;
`V13` admits exactly two script elements on a content route and none on the miss document, keeping the
`src` ban whole; `ScriptElementPresent`'s raising conditions widen to match. **`V2` and `V3` are
untouched, and they are what make this safe rather than merely bounded** — `V2` still asserts zero
requests beyond the navigation document with a real browser, and `V3` still asserts every manifesto
sentence and project name is in the built HTML *with scripting never executed*. An enhancement script
that became load-bearing for content would turn `V3` red, so the constraint is enforced by a gate that
already exists rather than by review. `P3` and `P4` bind the script as they bind the primitives: no
motion under `prefers-reduced-motion: reduce`, and the modal must not trap focus or break visual order.
The CSS-only `:target`/`:has()` fold from the 2026-08-08 entry **stays** and becomes the no-script
baseline the script enhances, rather than being replaced by it.
Rejected: **amending `00-brief.md`'s two non-goals and shipping the prototype runtime as imported** —
the owner's first ruling, reversed by the owner on this entry's evidence. It costs the zero-request
guarantee, the built-HTML content assertions, ~1 MB of third-party runtime per document, and a CDN
this repository does not own sitting in front of whether the apex renders at all. **Precompiling React
and inlining it with hydration** — the shape the owner approved, and abandoned on two facts found
after: `LandingPageRoute.hydrate` is read by nothing at `0.3.0` (`U1`, verified against the published
source), so the package cannot hydrate a route and the script must travel in the body regardless; and
React plus a bundler is ~140 KB inline and two new dependencies, which *Hard rules* requires its own
entry for, to deliver behaviour that is DOM manipulation over markup the server already rendered.
**Porting the prototype's behaviour to vanilla over the existing server-rendered DOM** is what was
built instead: ~4 KB inline, no new dependency, no runtime compilation. **Staying CSS-only and
declining the import** — offered first and declined by the owner; retained as the cheap reversal.
**Adding a Verification code for "content present only after script execution"** — declined as
duplication: `V3` already asserts exactly that, against built HTML, and a second code would give the
rule two homes.
Reversibility: cheap. `X10` is one invariant, three amended clauses and one widened error row; the
script is one Composition module and one fold call. Reverting drops back to the CSS-only fold with no
change to `composeApex`, `composeTestimonials` or any Content module. Expensive only if the additive
constraint is later relaxed — content that exists solely in script is what `V3` is holding shut, and
reopening it reopens the empty-apex failure this entry declined.

### 2026-08-10 — the fold's stylesheet rules are a bounded `P6` extension, not primitives
Context: `/reconcile` found one contract contradiction after the testimonials fold was written back.
`stylesheetFor` appends fixed `[data-view]`, `default-apex` and `default-testimonials` rules when their
body markers occur, while `P6` still said a stylesheet contained the token block and referenced
primitive rules "and nothing else". The same pass found stale prose counting Adapter's Content imports
as four and testimonial error codes as three, a "script-free" description of a shell that carries inert
JSON-LD, and source/test commentary still counting the closed primitive set at six or eight rather than
ten.
Chosen: **the contract and stale descriptions move; runtime behaviour does not.** The `stylesheetFor`
signature paragraph is the canonical rule: token block, referenced primitive rules in declaration
order, then only the fixed fold base and matching default-view blocks when their body markers occur.
`P6` references that bounded extension. Fold rules remain Composition wiring rather than reusable
Presentation primitives, so `PrimitiveName` stays closed at ten. The stale import and error-code prose,
the inaccurate script wording, and primitive-count comments and tests are corrected to the implemented
and already-contracted values.
Rejected: **adding the fold rules as new primitives** — that would widen a closed public set and
misclassify route-specific Composition wiring as reusable layout. **Removing the fold rules or reverting
the fold** — that would reverse the owner-approved 2026-08-08 behaviour merely to preserve stale prose.
**Leaving `P6` broad and relying on `X4` passing** — `X4` checks selector/body agreement, not the closed
shape of stylesheet assembly, so it cannot make the contradictory contract true.
Reversibility: cheap for the documents, comments and test fixtures; changing the rule ownership later
is a public-contract amendment. No runtime behaviour changed.

### 2026-08-10 — the testimonials fold is written back into Design and Contract
Context: `/reconcile` compared the implementation from #70 and #71 with the design sources after the
owner's 2026-08-08 fold decision. `10-design.md` still described `/testimonials/` as an independent page
with one back-link, while `20-contract.md` exposed only the three raw composers and said no contracted
function throws. The implementation instead exports `foldRoutes`, gives both route documents the same
apex and testimonials views with shared fragment navigation, and throws when a raw composition loses a
structural hook required by that fold.
Chosen: **the documents were stale, and the owner approved changing them.** `10-design.md` now owns the
fold's route behaviour, Composition and Adapter responsibilities, control flow and structural-drift
failure mode. `20-contract.md` now declares `FoldedRoutes` and `foldRoutes`, assigns the folded pair to
Adapter's two content routes, distinguishes raw from folded bodies in `X6`, records the fold invariant in
`X9`, and names its bare structural exceptions. The resolved fold item was removed from `## Open`.
Rejected: **changing the code back to two separately navigated pages** — that would reverse the signed
2026-08-08 owner decision and discard the already-shipped fold merely to make stale prose true.
**Treating `foldRoutes` as an Adapter-private detail** — it is already a public Composition export and its
structural guards are observable build-failure semantics, so omitting it would leave the public contract
knowingly incomplete. **Reporting the drift without choosing a side** — reconciliation requires the
owner-approved resolution to be written into the owning documents.
Reversibility: cheap in the documents, but reverting these edits alone would recreate known drift;
reversing the behaviour remains the cheap code change recorded in the 2026-08-08 decision and was not
chosen here.

---

### 2026-08-08 — the testimonials fold: one shared nav, switched by `:target`/`:has()`, not a second route load
Context: the owner asked, directly, for `/testimonials/` to carry the apex's nav and for switching between
it and the apex to replace the visible root content in place rather than navigate — explicitly overriding
the conflict this session raised first: `10-design.md`'s *Route* section (narrowed 2026-08-08) states
`/testimonials/` carries "a single back-link... not a persistent nav bar," and the whole design caps the
site at exactly one script element anywhere (`X6`, `V13`) with zero requests beyond the navigation document
(`V2`). A client-side router needs a script and/or a fetch; neither is available here.
Chosen: **a CSS-only fold.** `src/composition/fold.ts` takes `composeApex`'s and `composeTestimonials`'s
already-composed, untouched output and re-wraps both into one shared body per route: the apex's own
`<nav>`, reused verbatim in both views, and two `[data-view]` blocks toggled with `:target`/`:has()` — no
script, no fetch. `/` and `/testimonials/` now emit the *same two views*, differing only in which one is
visible with no fragment present (`default-apex`/`default-testimonials`), so both remain independently
loadable and crawlable with CSS absent. `composeApex`/`composeTestimonials` themselves are unchanged —
every S5/S11 test still asserts their real, unfolded output — so the fold is strictly additive at the
Adapter-wiring layer (`site/landing.config.ts` now calls `foldRoutes` instead of the two composers
directly). Verified against the real emitted documents, not just fixtures: `assertSelfContained` and
`assertStyleAgreement` both return `{ ok: true }` for the built `/` and `/testimonials/` documents
(exactly one script element survives — the apex's JSON-LD block), and a real-browser check confirmed
clicking the nav's Testimonials link from `/` updates `location.hash` to `#testimonials` and swaps the
visible view with zero navigation and zero additional requests, and the reverse from `/testimonials/`.
`tests/composition/fold.test.ts` covers this at the unit level. Not run: the image-gate and deploy-candidate
gates (S9/S10) — they require a running Docker image / deployed environment this session didn't stand up.
Rejected: **a script-driven router** (the literal reading of "fold... no page switching," done with
`fetch`/`history.pushState` and a click handler) — flatly incompatible with `X6`/`V13`'s hard cap of one
script element anywhere, enforced by `assertSelfContained` as a build-failing gate, not a convention.
Weakening that gate to permit a second, non-JSON-LD script is a real contract change (`X6`, `V13`) this
session did not make. **Leaving `/testimonials/` a plain separate page with a real-path nav link** — the
minimal, zero-conflict option this session offered first — was rejected by the owner in favor of the fold.
This entry narrows `10-design.md`'s *Route* § "narrowed again on 2026-08-08" passage a second time: that
passage rejected *persistent nav-bar chrome requiring a second document load*; a same-document, CSS-only
view toggle sharing one nav is not that, but `10-design.md` itself is not rewritten in this pass — flagged
here for `/reconcile` to fold back in properly rather than silently updated by an implementation session.
Reversibility: cheap — `foldRoutes` is one new module and one wiring change; reverting drops back to the
two independent routes with zero change to `composeApex`/`composeTestimonials`.

---

### 2026-08-08 — `role` and `organization` get dedicated empty-field codes, not `EmptyField`
Context: `20-contract.md` § *Testimonial* says `role` and `organization` are "never empty, on the same
convention as `Project.question`", but `validateTestimonials` checked only `quote` and `author`. Verified
by execution, not reading: a record carrying `role: ""` validated clean and `composeTestimonials` then
emitted `<p class="meta"></p>` — the empty metadata element `X8` forbids. Contract and code disagreed.
Chosen: **the code was wrong.** Unlike the invariant narrowed in the entry below, the contract here names
a concrete convention that the sibling validator already implements at `validate.ts`, so there is no
reading under which the looser behaviour was intended. Added `TestimonialRoleEmpty` and
`TestimonialOrganizationEmpty` to `ContentErrorCode`, the two present-but-empty checks, two error-table
rows, and `S11.1` negative cases — verified by reverting the checks and confirming both new cases fail.
Rejected: **reusing the existing `EmptyField` code**, which needs no contract amendment and follows the
`Project.question` precedent the contract literally names — but `validateTestimonials` had already
established per-field codes with `TestimonialQuoteEmpty`/`TestimonialAuthorEmpty`, and internal
consistency within that function beats consistency with a different validator. The amendment was the
cheaper of the two inconsistencies to accept.
Reversibility: cheap, though the two codes are now published in `ContentErrorCode` and removing them later
would be a breaking contract change rather than an edit.

---

### 2026-08-08 — `composeTestimonials`'s content-agnostic invariant narrowed to testimonial content
Context: a cloud review found the module emits `Back to SubZeroDev` at `src/composition/testimonials.ts`,
contradicting the "carries no SubZeroDev-specific string" invariant stated identically in this
contract, in `S11.7`, and in the module header. Code and contract disagreed, so one of them was wrong.
Chosen: **the wording was wrong, not the code.** The module already carried site-specific copy one line
above the offending link — its `heading` is unmistakably this site's voice and merely happens not to
contain the token — and `composeApex`, the sibling the contract compares it against, is saturated with
such copy. So Composition as a layer plainly may carry site words; what the design actually wants is
agnosticism about *the quoted people*, which is what `C16` and `S11.7`'s fixture-only test already
enforce. Narrowed all three statements to "carries no testimonial content of its own".
Rejected: **parameterising the back-link** as `backLink: { href, label }` on `composeTestimonials`.
It is the more faithful reading of the invariant as written, and it would genuinely let a second
consumer reuse the route — but it changes a signature this contract publishes, which is a contract
amendment rather than a review fix, and the invariant it defends is one the heading already breaches.
Retained as known: the route is therefore not reusable verbatim by a consumer wanting different chrome.
Rejected: **leaving the wording and letting `S11.7`'s test stay weaker than the criterion above it** —
that is the drift `AGENTS.md` § *Verification* exists to prevent.
Reversibility: cheap — three prose edits, and the parameterisation stays open if a second consumer appears.

---

### 2026-08-08 — Two new primitives, `grid` and `card`, close `PrimitiveName` at ten
Context: the testimonials route (`S11`) needs a responsive multi-column layout and a bordered quote
container, and neither is expressible with the existing eight primitives without breaking `S4.4`'s
rule that every selector in a primitive's `rules` is rooted at that primitive's own `className`.
Chosen: **`grid`**, a `columns`-based responsive flow with `break-inside: avoid` on its direct
children — the same "reaches a child it does not name" shape `row` already has precedent for — and
**`card`**, a bordered/padded container reusable outside a grid. Neither references `--font-mono`;
`P7` still names `meta` as the one primitive that does.
Rejected: **CSS Grid instead of `columns`** for the `grid` primitive — declined because a card's
height is its own content, and CSS Grid forces every row to the tallest cell unless every card is
independently placed, which is more machinery for the same visual result. **A `.grid > .card` selector
instead of a standalone `card` primitive** — declined because a card is meaningful alone (a future
single-testimonial consumer), and `S4.4`'s rule already requires every primitive's own selectors to be
self-rooted, which a compound selector spanning two primitives cannot satisfy cleanly.
Reversibility: cheap. Two primitive entries and their test-suite extension; nothing downstream depends
on the internal layout mechanism, only on the class names.

---

### 2026-08-08 — A third route, `/testimonials/`, overturning `A4`'s "exactly two"
Context: the owner requested a reusable testimonial component and a SubZeroDev testimonials page. The
apex's "one document" argument in `10-design.md` § *One document, rather than routes per section* is
about the *manifesto* staying undivided, not about the site staying at two routes — the rejected
alternative it names (`/manifesto`, `/projects`, `/philosophy`) is specifically about slicing the
manifesto. A testimonial collection is not a manifesto section: different heading, different layout,
different content shape, and inlining it would contaminate the apex's genre ("no genre — the plain
document").
Chosen: a third `RoutePath` member, `/testimonials/`, with its own `composeTestimonials` entry point,
own head metadata, and no navigation chrome added to the apex beyond the single link row already there
— the testimonials page itself carries one back-link, the same footing the miss route's link already
has, not a persistent nav bar.
Rejected: **a fourth apex section**, per the *One document* argument above, and because escalating
absurdity reads better as its own page than as a section competing with the manifesto's tone.
**A separate subdomain or repository** — rejected outright: the brief's non-goals forbid a new
cross-repo contract, and a single-purpose page does not need its own deployment target.
Reversibility: expensive to fully reverse — `A4`, `RoutePath`, and every downstream signature that
enumerates routes would need to shrink back to two — but cheap to leave dormant: the route can be
removed without touching `Content`'s `Testimonial` type or `Composition`'s `composeTestimonials`,
since both are already generic and carry no cost if unused.

---

### 2026-08-08 — Testimonials are exempted from "nothing may be funnier than it is true," scoped to one route
Context: `00-brief.md` § *Source material* item 2 states the house rule behind the ecosystem list's
true-status labelling, and `Idea.md` § *Writing Style* ("Never exaggerate. Reality already did.") and
§ *Company Personality* ("never corporate") describe the same voice everywhere else on the site. A
testimonials page built as instructed — eighteen fabricated, mostly adversarial quotes attributed to
everyone from a disappointed customer to God, presented with complete corporate seriousness and no
"fake"/"satire" label — contradicts all three as written.
Chosen: a fourth item in `00-brief.md` § *Source material*, naming `/testimonials/` as a bounded
exception to item 2 rather than a repeal of it. The house rule stays true of the ecosystem list and
everything else on the apex; the testimonials route is the one place the site is built to say something
it does not mean, on purpose, without saying so.
Rejected: **leaving the brief unedited and logging only the conflict** — cheaper, but leaves a brief
that the shipped page directly contradicts, which `agent.md` § *Drift* names as the exact class of
defect a `/reconcile` pass exists to catch, manufactured here on purpose rather than found by accident.
**Arguing the rule already permits it** — that no reader could mistake attribution to Yoda or Lucifer
for a truth claim, so nothing is "funnier than true" in the relevant sense. Rejected because it is an
argument, not a decision: it resolves nothing in the document itself, and the next `/reconcile` pass
would reopen exactly this question with no entry to point to.
Reversibility: cheap. One list item in `00-brief.md`, reversed by deleting it; nothing downstream reads
the carve-out's wording, only its existence.

---

### 2026-08-08 — The two publication branches never converge: the release does not wait for the Pages read-back
Context: a `/reconcile` pass found `.github/workflows/ci.yml`'s `attestation` job declaring
`needs: [image-gate, link-check]` and nothing else, while five statements across three documents
required the Pages read-back to complete first — `10-design.md` § *Control flow* ("the release still
waits for the Pages read-back so `V11` has proved byte identity"), § *Concurrency and ordering* ("the
branches converge before truth attestation"), `20-contract.md` `V7` ("both branches complete before
truth attestation"), and `30-slices.md`'s publication-CI graph and S10.11. The workflow's own comment
asserted a third thing, that the branches "converge only at `publish-release`", which is not what any
document said and is not true of the workflow either, since `publish-release` needs only `attestation`.
Nothing could go red: S10.11 is discharged by a human watching one run, the only acceptance criterion
in the set with no assertion behind it. Measured rather than assumed — `tsc --noEmit` clean and 310
tests across 31 files green, the same counts the 2026-08-07 pass recorded.
Chosen, on the owner's ruling: **the documents are the defect and the workflow stands.** The
convergence bought a schedule, not a proof. `V11`'s two halves each compare a served response against
**the emitted apex document**, never against each other, so the in-CI image gate establishes the
release's byte identity on its own and the Pages read-back adds nothing the release needs. Making the
release wait would stall it behind a publisher this repository does not run, for a proof it already
has. `10-design.md` § *Control flow* and § *Concurrency and ordering*, `V7`, the `30-slices.md` graph
and S10.11 all now state that the branches never join, and the design records the cost.
The cost, kept and stated rather than dropped: a release can be attested and pushed while the Pages
read-back is still running or after it has failed, leaving an unproven preview beside a proven release.
`V8` is what stops that becoming a false claim — each read-back licenses a claim about its own target
and about nothing else.
Rejected: **changing the workflow to match the documents** — add `publish-preview` to `attestation`'s
`needs`, one line, restoring the property as written. Declined because the property is redundant
against the image gate and its price is a release path that a Pages outage can stall indefinitely, held
inside a concurrency group. **Tracking it and changing neither side** — cheapest now, and it leaves
three documents describing a pipeline that does not exist, which is the drift class this pass exists to
catch.
Reversibility: cheap on both sides. The documents are five passages; the workflow would be one `needs`
entry.

---

### 2026-08-08 — The token block declares the whole scale, and `--font-mono` is a register rather than a prohibition
Context: the same `/reconcile` pass. Three annotations in `20-contract.md`'s token table and in `P2`
described users that the primitive set does not have. `--font-mono` was reserved to "`year`, `stage`,
`ProjectId` and `escapedFrom` edges — never prose", while its one declaring primitive, `meta`, also
carries the header tagline, the derived counts, the empty-group sentence, the section indices and both
link rows. `--space-1` was annotated "record separation" and `P2`(a)'s exemption of `--rule` from
contrast rested on that, while `entry` separates records with its own `clamp()` padding and a
`--rule` border. `P2`(a)'s 3:1 relaxation was scoped to "`--step-2` and above", a token no rule
references. Six of the eighteen block properties — `--step-1`, `--step-2`, `--step-3`, `--space-3`,
`--space-4`, `--measure` — are emitted into every document with no user at all, which `X4`'s
`SelectorWithoutUser` half cannot see, since it is over class selectors and the block carries none.
Chosen, on the owner's ruling: **the documents are the defect.** The `--font-mono` row now names the
`meta` register it actually is and excludes the manifesto and a project's `line` rather than "prose"
generally. `P2`(a) states its threshold as `1.563rem` — the WCAG large-text size, which is what
`--step-2` was standing in for — and rests `--rule`'s exemption on record separation existing rather
than on which value expresses it. A new paragraph states that the block declares the authored ratio
whole and that a primitive draws on as much of it as it needs, so a step with no user is declaration
rather than drift.
Rejected: **changing the composition to match the annotations** — move the tagline, counts, indices
and link rows off `meta` onto some other class. Declined because what class they should carry instead
is authored visual identity, which is the owner's and not derivable, so the fix could not be applied
in this pass anyway; and because the register `meta` expresses is coherent as it stands.
**Deleting the six unused tokens** — makes every declaration load-bearing, and re-derives the ratio's
endpoints the moment anything needs a step back. **Tracking it and changing neither side** — leaves an
invariant whose stated premise is false, which is worse than an imprecise invariant.
Reversibility: cheap. Three table annotations, one invariant clause and one added paragraph; no source
file moves.

---

### 2026-08-08 — `row` is the only primitive that *sizes* an unnamed child, not the only one that reaches one
Context: the same `/reconcile` pass. `20-contract.md` § *Presentation* stated that `row` "is also the
only primitive whose rules reach elements it does not name", and the `bar` paragraph closed on the same
claim. It was never true of the set: `page` carries typography and spacing rules for `header`,
`h1`–`h4`, `p`, `section`, `article`, `footer` and `.stack`, and `entry` carries rules for a nested
`.stack`. Every one of them satisfies the `Primitive.rules` anchoring constraint, so nothing is wrong
with them.
Chosen, on the owner's ruling: **the document is the defect**, narrowed to the verb the paragraph was
actually arguing — `row` is the only primitive that **sizes** a child it does not name, through the
child combinator on the universal selector. That is the property distinguishing it from `bar`, and the
contrast the paragraph exists to draw survives intact. A stale count in the same sentence went with it:
"the other six" predated `row` and `bar` closing the set at eight.
Rejected: **changing the primitives to make the absolute claim true** — strip every descendant and
child selector from `page` and `entry` and move that typography into the token block. Declined as a
substantial rewrite of authored visual identity, and because the token block would then carry
unanchored rules, which `Primitive.rules` forbids by design. **Tracking it and changing neither side** —
leaves a factual claim the tree contradicts with nothing checking it.
Reversibility: cheap. Two sentences.

---

### 2026-08-08 — `sourceUrl`'s module-load guard is the one bare exception this repository owns
Context: the same `/reconcile` pass. `src/content/links.ts` validates `sourceUrl` at import — parsed
through `URL`, required `https:` — and throws a bare `Error` on failure, while `20-contract.md`
§ *Types* stated "No function in this contract throws" and § *Error semantics* opened "Bare exceptions
exist in the system and none of them is ours", enumerating four, all the external package's. The guard
is not incidental: the contract already records that `sourceUrl` produces no `ResolvedHome` and sits
outside `V4`, making it the one outbound link on the page that no gate checks.
Chosen, on the owner's ruling: **the document is the defect**, and the guard is written into the
contract as a named single exception rather than left as an unexplained branch in one file. *Public
signatures* § *Content* now carries it with its consequence stated plainly — a malformed `sourceUrl`
fails the build through an uncaught exception during Adapter's module evaluation, **not** through
`A5`'s report-every-error-then-exit path, so it is the one content fault that does not arrive
alongside the others. § *Types* and § *Error semantics* point at that one copy rather than restating it.
Rejected: **removing the throw** — restores the contract exactly as written, and leaves `sourceUrl`
wholly unchecked, so a malformed or `http:` literal would reach the rendered page with nothing
noticing. **Moving the check into a `Result`-returning parse reported through `A5`** — keeps the check,
keeps the no-throw rule and puts the failure where `A5` already promises it. Genuinely better shaped,
and declined here because it widens `A3`'s enumerated Adapter imports and adds a `ContentErrorCode`,
making it a contract amendment rather than the wording fix this divergence is. It stays available.
Reversibility: cheap for the document — one added paragraph and two pointers. The rejected third option
remains open at the cost of an `A3` amendment.

---

### 2026-08-07 — `/reconcile`: five documented rules have no implementation, and in each the tree is the defect
Context: a full `/reconcile` pass over the tree against `10-design.md` and `20-contract.md`. Five
divergences, and four of them share one cause: the 2026-08-07 red-team adjudication amended the
contract, the design and `30-slices.md` for `X6`, `R2`'s removal, `assertImportGraph`/`V16` and `X7`,
but the slices those amendments belong to — S5, S6 and S7 — had already merged. No slice carried the
work and no issue was opened, so the amendments went into S9, S10 and a merge to `main` unimplemented.
The pass measured rather than assumed it: `tsc --noEmit` clean and **310 tests across 31 files green,
the identical counts the amending entry itself recorded before those amendments**, which is proof no
test was added and therefore that nothing could have failed. Two of the five are defects live on both
published targets.
Chosen, on the owner's ruling, each divergence put separately: **the documents stand in all five, and
the tree is the defect in each.** No clause of `10-design.md` or `20-contract.md` moved. The five are
staged in `## Open` above for `/track`, since none is a slice. One consequential edit followed from
keeping `R2`: `MissEntryStillPresent` was documented in *Error semantics* but **missing from the
`VerificationErrorCode` union** — a defect inside the contract, independent of the code and surviving
either resolution — and it is added.
Recorded rather than assumed: `V16`'s rules are not unchecked today. `tests/helpers/import-graph.ts`
covers `C1`, `C14`, `X2`, `A3`, Presentation's `Branded`-only import, Artifact's three names and
no-imports-into-Verification, each with a teeth test. What is missing is the contract surface, not the
enforcement — which is why this was the one item where the code had a defensible claim, and why the
ruling is recorded rather than treated as obvious.
Rejected, one per divergence, each declined for the same underlying reason — **relitigating a
2026-08-07 owner ruling with no new evidence**, which *Budget discipline* forbids: **striking `R2`'s
removal** and accepting a soft 404 at the one path the unknown-path checks never request; **deleting
`X6` and reverting `V13`** to the blanket ban, which that day's entry declined as the recommended
option and which gives up the one machine-readable statement of what this organisation is; **deleting
`assertImportGraph` and `V16`**, which would return Presentation's `Branded`-only rule, Artifact's
three names and no-imports-into-Verification to having no invariant id — the exact gap `V16` closed;
**striking `X7`**, which that day's entry rejected as "rendering every stage including empty ones";
**striking `RoutePath`**, leaving `A4`'s two-value narrowing as prose with nothing enforcing it. Also
rejected across the board: **tracking all five and changing neither side**, which is cheapest now and
leaves a documented lie in the tree plus two live defects.
Reversibility: cheap for the documents — one union member added and nothing else moved. The tree's
side is five separate changes across Composition, Artifact and Verification, each independently
reversible; `R2`'s and `X7`'s are the two that change what is published.

---

### 2026-08-07 — `V13` exempts the document's own canonical link, which `A1` requires on every route
Context: the same `/reconcile` pass, and the one finding that was not a missing implementation.
`assertSelfContained` skips `<link rel="canonical">` before its data-URI check, and the carve-out
appears in no design clause, no contract row and no entry in this log. It is load-bearing rather than
incidental: `A1` requires `metadata.canonicalUrl` on every route and the brief's *Definition of done*
requires a canonical URL on the page, so without the exemption `S6.9` fails on both emitted documents
— `V13` and `A1` would contradict each other on everything this design emits.
Chosen: **the exemption is written into the contract** rather than left as an unexplained branch in
one file. `ExternalAssetReference`'s row now names both things that are not asset references — an
outbound link, and the document's own canonical link — and states why the second is forced rather than
granted: it names the address of the document already loaded, so no browser fetches it. The rule keeps
one home; nothing is copied into `V13`'s wording, which defines itself by reference to that row.
Rejected: **appending this entry and leaving `V13`'s wording alone** — cheaper, and it leaves the
contract's `ExternalAssetReference` row describing a check the code does not perform, which is the
drift class this whole pass exists to catch. **Removing the carve-out as a defect** — it turns `S6.9`
red on both documents and is only coherent alongside striking `canonicalUrl`, which the brief
requires. **Treating a self-address as an asset reference and exempting it in `V13` instead** — puts
the rule in two places and guarantees they diverge.
Reversibility: cheap. One table row, and no source file moves.

---

### 2026-08-07 — Pages is ungated preview/development publishing; truth attestation governs release only
Context: `/redteam` found a higher-precedence conflict. `00-brief.md` required every displayed project
status to be attested for the exact commit on the day it was "deployed", without distinguishing the
two publication targets. `10-design.md` deliberately published Pages before attestation and said the
requirement held for the release site but not the preview. The brief outranks the design, so that
distinction had to become the owner's policy or the workflow had to put a human gate in front of every
Pages publish.
Chosen, on the owner's explicit ruling: **GitHub Pages is preview/development publishing, not a
release, and no release gate belongs in front of it.** It publishes every main-branch commit after the
shared build without waiting for the image gate, outbound-link gate or truth attestation. Its
post-publication marker, byte and unknown-path read-back remains: those checks prove what the preview
serves and discharge byte identity, but they are not approval gates and do not license a release
claim. The container path alone is the release. It still waits for the image gate, outbound-link check,
commit-bound truth attestation, registry push, redeploy trigger and endpoint read-back.
The brief is amended to make the release scope explicit. The design and contract's already-chosen
release-only attestation are retained, their remaining ambiguous "deploy" wording is narrowed, and
`30-slices.md`'s stale S10 single-job criteria are brought into line with its own publication-CI graph.
That graph now forks immediately after the shared build: Pages can publish while release preparation
runs, and the branches converge only before the release attestation.
Rejected: **Putting truth attestation before Pages** — satisfies the brief's former unqualified wording
and makes every preview commit spend a human approval, which defeats the preview/development target.
**Keeping image-gate and link-check as prerequisites for Pages while removing only the human gate** —
less change to the previous graph, and it still makes development publishing wait on release-only
concerns. **Removing Pages read-back as well** — the strongest reading of "no gates", rejected because
then neither a preview claim nor byte identity is verified; a check after publication does not block
publication and is not the gate being removed.
Reversibility: cheap in the documents while S10 is unimplemented; expensive after workflow delivery,
because the job graph, concurrency checks and meaning of the two public URLs depend on the split.

---

### 2026-08-07 — The design and contract are extended past the registry push; the deployment artifact's network attachment and image reference are settled
Context: `/redteam`, fresh `opus` session — the weak form of the vendor rule, and recorded as such,
since a different vendor was not available. The pass returned nineteen findings; three were `BLOCKING`
and all three were the same seam. **The brief's 2026-08-07 amendment put the redeploy step and the
endpoint it is verified against in this repository, and neither `10-design.md` nor `20-contract.md`
followed it there.** § *Control flow* 2 still read "What happens after the push is outside this
design"; `V7`'s ordering ended at the Pages read-back; the contract's closing note to *Invariants*
still said "nothing here observes a delivery environment, and no invariant claims to". Two further
findings were that the artifact the brief now demands **cannot be written as specified**: a Compose
service that publishes no port and joins no network is not a deployment, while the brief said the
artifact "declares nothing about the network in front of it"; and the image reference had no
non-degenerate answer, since a commit pin is self-referential and `latest` contradicts "there is
exactly one answer to what is deployed".
Chosen, on the owner's ruling, three decisions in one seam. **(1) The design and contract are the
defect, not the brief.** `10-design.md` gains the redeploy trigger and endpoint read-back in
§ *Control flow* 2, a *Failure modes* entry for a redeploy that does not happen or an endpoint serving
the previous commit, an extended ordering invariant, and a third mutable location in § *Concurrency* —
the deployed stack, since a stale run's trigger pulls whatever `latest` then names. `20-contract.md`
gains `V15`, extends `V7`, and narrows `V8` so a read-back on one target licenses no claim about the
other. **(2) The stack attaches to `proxy-net` by name**, restoring the `blog-mcp` shape, and
`00-brief.md`'s artifact clause is amended to admit exactly that: this repository declares the one
already-existing network its container attaches to, and nothing else about it — not what else is on
it, not what terminates TLS, not the configuration of the thing that does. **Q7 stays foreclosed and
the amended clause says so in the same breath**, because this is the third time this clause has been
litigated and the second time a network answer has had to be separated from a TLS answer. **(3) The
Compose file pulls `latest` with `pull_policy: always`**; deployed identity comes from the endpoint
read-back, never from reading the file.
Recorded rather than assumed: the redeploy **trigger** gets no contract surface — no signature, no
error code — because the registry push is the same kind of step and has none either. The read-back
reuses `pollForCommit` and `assertUnknownPathResponse` unchanged. An earlier draft of this ruling
proposed new `RedeployFailed` codes and was corrected against that precedent before anything was
written.
Verified rather than asserted, because the contract is parsed by tests: `tsc --noEmit` clean and 310
tests across 31 files green after the edits, the same counts as before them. Not run and not claimed —
`check-links`, `image-gate`, `attestation-gate`, `deployment-candidate-gate`, `publish-gate`, and
every gate the new `V15` names, none of which has an implementation yet.
Rejected: **Narrowing the brief back to exclude the redeploy step and endpoint** — no design or
contract change needed and the compose-networking problem dissolves with it; declined, because nothing
in this repository would then ever verify that `subzerodev.com` serves the release. **Recording the
gap as accepted and dated** — cheapest, and it leaves a brief obligation nothing discharges.
**Publishing a host port instead of joining a network** — the recommended option, and the one that
names no infrastructure this repository does not own; declined by the owner in favour of matching the
existing `blog-mcp` precedent. **Numbering the compose networking as a fresh open question and
blocking the slice** — leaves the in-scope artifact unwritable. **Pinning the Compose file to the
commit tag, rewritten and committed per release** — exact identity readable from the file, at the cost
of an extra commit per release, a permanent one-commit lag, and a CI job writing to the default
branch. **Passing the commit tag to the stack as a variable** — exact identity with no repository
commit, rejected because it depends on the stack platform's variable substitution, which is delivery
configuration this repository does not own and cannot test in CI.
Reversibility: cheap for the brief clause and the document edits — one non-goal paragraph, one
contract invariant, four design sections. Expensive for what it authorizes and unchanged from the
entry it builds on: a `proxy-net` attachment, a redeploy trigger holding a secret, and a critical
section now held across a network round trip into an environment this repository does not run.

---

### 2026-08-07 — Three remaining red-team findings: the typed count, `schemas`, empty stage groups, and a size budget declined
Context: the tail of the same `/redteam` pass. Three findings too small to sit in the entry above, and
one of them was already half-tracked as [#37](https://github.com/The-Running-Dev/SubZeroDev.com/issues/37).
Chosen. **(1) `10-design.md` stops typing a project count.** § *Data model* defined `Home.Own` as "an
absolute URL to its own subdomain. Twelve projects." — a figure the inventory owns, restated in the
document that forbids exactly that restatement on the page (`X1`). The bullet now says the count is the
inventory's to state. **(2) `schemas.subzerodev.com` is ruled out of the inventory**, explicitly rather
than by silence. The brief verifies it does not exist while the ecosystem's docs reference it; a
referenced name has no repository, no authored stage and no originating question, and a `Home.None`
record would put a row on the page asserting a project that is not one — which the house rule against
being funnier than is true forbids outright. The dangling reference is a defect in the documents
carrying it. **(3) An empty `Stage` group renders as an absence, not a heading** — `X7`. `C11` keeps
every stage in the derivation so counts and ordering stay total; the composition renders only groups
with members. The design's "never a silently empty section" rule was written about an empty *inventory*
and had been read as covering both cases, which is why this was unwritten.
Declined: **a byte-size assertion over the emitted apex.** Everything this design ships is inline by
construction, so page weight is the one property that could degrade with nothing noticing — but it
cannot degrade *quietly*: the icon is one small SVG letterform, the inventory is hand-authored, and
every byte is added by someone typing it. The absence of a budget is now recorded in `10-design.md`
§ *Data model* so it is not rediscovered as a finding, with the condition that would reopen it — either
the icon set or the inventory ceasing to be author-scale.
Not resolved here, and flagged: **#37 looks stale.** It reports `S2.2` and `S2.3` red against a
thirteen-`own` inventory, and both pass now — AgentKit moved to `home.kind: none` in #40, restoring
twelve. Whether to close it is the owner's, and this pass changed nothing about it.
Rejected: **Giving `schemas` a `home: none` record** — it would state the thing the brief verified
rather than staying silent, at the cost of a page row for what may simply be another repository's
documentation error. **Folding the typed count and `schemas` into #37** — that issue awaits an owner
ruling on a different question, the inventory-versus-brief count, and neither of these needed to wait
on it. **Rendering every stage including empty ones** — arguably on-voice for a page about a method,
and it produces the headings-with-nothing-beneath shape the design calls looking deliberate.
**Leaving the empty-group case to the composition slice** — unstated cases are what this design
elsewhere insists on naming.
Reversibility: cheap, all four. One bullet, one paragraph, one invariant, one recorded absence.

---

### 2026-08-07 — Six red-team findings resolved: byte identity, import graph, attestation scope, the publish split, `/404/`, and one inert script element
Context: the same `/redteam` pass as the entry above, adjudicated one finding at a time. Six were
sustained beyond the deployment seam, and two of them turned out to be one change.
Chosen, each on the owner's ruling. **(1) Byte identity covers Pages as well as the image.** `V11`
asserted it image-side only; the Pages apex was checked by `V3` for content presence and never
compared, so the brief's "asserted rather than assumed" held for one side of a pair. Both are now
compared against the emitted apex document. The endpoint deliberately is **not** — a byte match across
a proxy this repository does not own would fail on transport differences that are not divergence, so
`V15` covers it with the marker and unknown-path pair instead. **(2) The import graph gets a
Verification surface**, `assertImportGraph` and `V16`, with three new error codes. It takes the edges
as **data**, in `assertDeploymentCandidateCurrent`'s shape, because reading imports off disk means
choosing a scanner and that is a new dependency owing its own entry — the caller observes, the function
compares, and no scanner is named here. Writing it also found that three of the seven import rules had
**no invariant id at all**, living only as prose in *Public signatures*: Presentation's `Branded`-only
import, Artifact's three names, and that nothing imports Verification. `V16` is their home. **(3) The
truth attestation gates the release only.** It stood in front of both targets, which made the
preview's every-commit cadence untrue and spent the one gate that cannot be re-run cheaply on commits
changing no project statement. **(4) Publication is therefore two jobs, not one** — a CI environment
approval gates a job, not a step, so an attestation between the Pages read-back and the registry push
cannot sit inside a single job. The two share one concurrency group, which makes an interleaving
across runs reachable, and **the branch-head re-check is what makes the split sound**: the head is now
checked twice, because a check taken before a human gate of unbounded duration proves nothing after
it. (3), (4) and the re-check are one change and are reversed together or not at all. **(5) Artifact
removes `404/index.html` after copying it to `404.html`.** A directory index is served with a 200, so
the miss composition sat at a fixed, discoverable, self-declared-canonical URL — a soft 404 by this
design's own definition, at the one path the unknown-path checks never request, since they ask for a
*unique unknown* path. `R2` and `R5` are reworded around the removal and `MissEntryStillPresent` and
`RemoveFailed` are added. **(6) `V13` narrows from "no script element" to "no executable script
element"**, admitting exactly one `application/ld+json` block on the apex (`X6`). The blanket rule
forbade a non-executing element on the ground that it forbids execution; JSON-LD runs nothing and
fetches nothing, so it satisfied the runtime non-goal entirely and was excluded by the shape of the
check rather than by the rule behind it.
Two consequences that were not obvious and are recorded because a later reader will ask. The block
sits in the **body**: the package owns the head and its metadata set is closed, which is the same fact
that made the build marker Artifact's, and `<script>` is conforming flow content in `<body>`. And it
forced an exception to `X5` — HTML-escaping a value inside JSON corrupts it, `&amp;` in a URL being a
different URL — so values there are JSON-string-escaped and `X6`'s `</script` guard is what makes that
safe. `composeApex` gained an `origin` parameter for the block's `url`, passed rather than imported
because `X2` confines Composition to Content and Presentation and the origin is Adapter's.
Recorded and **not** fixed: the deployment read-back proves what is served, not that this run put it
there. A re-run on an already-deployed commit satisfies the marker on its first poll, so a publication
step that silently did nothing reports success. The fix would be a per-run value inside the artifact,
and the two targets would then carry different bytes, which `V11` forbids. The narrower claim is the
true one.
Verified rather than asserted: `tsc --noEmit` clean and 310 tests across 31 files green after the
edits. Not run and not claimed — every gate these invariants name, none of which has an
implementation yet, including the two new call sites `V11` now requires and `assertImportGraph`
itself.
Rejected: **Comparing bytes at all three read-backs** — the most rigorous, declined because the
endpoint sits behind a proxy whose transport this repository does not control. **Leaving the Pages side
argued from shared construction** — the state found. **Numbering the import graph as a fresh
`U11`** — the recommended option, consistent with how `U9` handled the identical shape; declined by
the owner in favour of writing the surface now, which the data-shaped signature made possible without
choosing a scanner. **Leaving the import rules review-enforced.** **Gating the attestation on whether
the commit touched Content** — cheapest in human attention and it gates on the wrong thing, since the
statuses are claims about other people's sites and go stale with no commit at all. **Keeping one
`publish` job and putting the attestation back in front of both** — reverses (3) rather than the job
constraint. **Pages deploying from an ungrouped job** — simplest graph, abandons the claim that the
preview is protected from an older run. **Keeping `/404/` and asserting it answers 404 on both
targets** — Pages may not permit a file it emits to answer 404, so it may not be achievable there.
**Keeping `/404/` and accepting the soft 404.** **Leaving `V13` blanket and shipping no structured
data** — the recommended option, on the ground that a narrower rule is one an author argues around;
declined. **Narrowing `V13` and emitting nothing yet** — a permission with no user.
Reversibility: cheap for (1), (5) and (6) — one invariant each, no source file moved. Expensive for
(3) and (4) together: the job split, the shared group and the second head check are load-bearing on
each other, and unpicking one without the others reintroduces either the reflex-approval problem or an
unsound interleaving.

---

### 2026-08-07 — The `U5` and `U10` brief conflicts are closed in the contract, and the design's stale `<noscript>` paragraph with them
Context: The entry below closed four brief-versus-design conflicts and named its own loose end:
"`20-contract.md`'s `U5` and `U10` both still read 'pending an owner edit to the brief' and are stale
as of this entry", deferred because `## Unresolved` is `/contract`'s section. A `/redteam` pass found
the staleness had spread further than that note recorded — four statements, not two.
`10-design.md` § *Route* still said the brief "still requires" `<noscript>` and that "the brief and
this design disagree on a released requirement"; the `P3` invariant row still said the brief "states
the broader form and outranks this document; the disagreement is known and unreconciled". Both were
false the moment the brief was amended.
Chosen: close all four in place. `U5` and `U10` keep their original headings verbatim — including the
now-inaccurate "pending an owner edit to the brief" — and gain an **Answered** paragraph in the
`U1`/`U3`/`U7` pattern, because three documents cite those anchors and a retitle would rot every one
of them silently. `30-slices.md`'s forward reference to the stale text is corrected in the same pass.
Rejected: **Retitling `U5` and `U10` to read as answered** — more honest at the heading level, and it
breaks `#u5--noscript-is-withdrawn-pending-an-owner-edit-to-the-brief` in three places; the contract's
own rule that numbers are stable exists for this reason and headings are what the anchors are built
from. **Leaving it for a separate `/contract` run** — the deferral the entry below chose; declined
because the same deferral had already let two stale statements become four.
Reversibility: cheap. No invariant, signature or source file moved.

---

### 2026-08-07 — Four brief clauses the design contradicted are amended; `U5` and `U10` close
Context: `/design`, in the same session as the hosting-non-goal amendment below and on the authority
that entry records. With the brief's authorship notice overridden, the standing pile of brief-versus-
design conflicts could be closed for the first time. Four clauses, in two classes. **Already
adjudicated, unedited only because a model could not touch the file:** `<noscript>`, ruled the brief's
defect on 2026-08-05 (`U5`), and the broad "animates nothing under `prefers-reduced-motion: reduce`"
form, narrowed to motion in the contract on 2026-08-07 (`U10`). **Never ruled on at all, flagged only
in `10-design.md`'s preamble since 2026-08-05:** § *Environment*'s "No server, no application runtime"
against a container release, and § *Definition of done*'s single-target framing against two targets.
The second class is the one that had gone longest without a decision, precisely because a preamble is
not a list anyone checks — the reasoning `U10`'s own entry gives.
Chosen, on the owner's ruling, all four: **the brief moves in every case; neither the design nor the
contract does.** (1) The `<noscript>` requirement is struck and the bullet now states why the element
has no role on a document that needs no scripting — the exact edit `U5` named as remaining. (2) The
motion bullet is rewritten in `P3`'s narrowed wording, naming transform, translation, scale, rotation,
position change and scroll behaviour, and permitting a transition of a non-positional property. (3)
§ *Environment* carries the delivery-wrapper distinction `10-design.md` had been arguing unaided: the
container serves a read-only tree, executes nothing per request, holds no state, adds nothing to the
bytes, and a static file server inside it is not an application. (4) § *Definition of done* gains a
bullet naming two publication targets with byte identity asserted between them, and states which
verification governs which. `U5` and `U10` are answered by (1) and (2); `10-design.md`'s known-
disagreement box is closed; `30-slices.md`'s `U5` *Blocked* entry is released.
Verified rather than asserted, because four brief edits could plausibly have moved a gate: `tsc
--noEmit` clean and 310 tests across 31 files green afterwards. Not run and not claimed —
`check-links`, `image-gate`, `attestation-gate`, `deployment-candidate-gate`, `publish-gate`, all of
which need the network or a built tree.
Rejected: **Numbering the two unruled clauses `U11`/`U12` and leaving the brief alone** — the
recommended-in-the-alternative option and the more conservative one, on `U10`'s reasoning that a
conflict in a checked list beats one in a preamble; declined by the owner in favour of closing them
outright, which makes the checklist position unnecessary rather than better-placed. **Editing only
`U5`'s clause and leaving `U10`'s** — offered on the grounds that `P3`'s narrowing was the more
contestable of the two rulings and ratifying it into the brief forecloses revisiting it; declined.
**Leaving all four as recorded conflicts** — the state that had held for two days, and the one where
`S6` knowingly ships against a *Definition of done* bullet it fails.
Left undone deliberately, and it is the one loose end: `20-contract.md`'s `U5` and `U10` both still
read "pending an owner edit to the brief" and are stale as of this entry. `## Unresolved` is that
document's section and the numbering is `/contract`'s to apply — the precedent `U10`'s own entry set —
so this command reports them rather than closing them.
Reversibility: cheap — four clauses in one file, one design-doc box, one slices entry. Nothing was
built against any of the four, and no test or source file moved.

---

### 2026-08-07 — The brief's hosting non-goal is amended to draw its boundary at the deployment artifact
Context: `/design`. The Q7 walk-back entry below established that no agent and no decision-log entry
may narrow a binding non-goal by writing past it, and applied that to the TLS half only — it stated
"Q8 is unaffected and stands" without testing Q8 against the same clause. Tested here, Q8 fails it
harder than Q7 did. Q7's answer was a *statement about* where TLS terminates; Q8's answer authorizes
agents to **write** hosting configuration — a root `docker-compose.yml` Portainer imports as a stack,
a redeploy-webhook step in `ci.yml`'s `publish` job, and a health endpoint to poll — against a
non-goal whose second sentence reads *"No agent touches them and no acceptance criterion requires
changing them."* Verified before raising it, and it is what made either resolution cheap: nothing had
been built against Q8. No `docker-compose.yml` exists in the tree and `.github/workflows/` contains no
webhook or Portainer reference, the same position Q7 was in when it was walked back.
Chosen, on the owner's ruling and at the owner's explicit direction to make the edit: **the brief
moves, not Q8.** `00-brief.md`'s non-goal is amended so the boundary falls at the artifact this
repository publishes rather than around the whole of hosting. In scope and this repository's to own:
the Compose file that runs the published image, the CI step that triggers its redeploy, and the
endpoint that redeploy is verified against. Still out, and still binding on every agent: the domain,
its DNS records, TLS termination, and any reverse proxy or host the deployment sits behind — the
amended clause names TLS explicitly, so **Q7 is unaffected and stays foreclosed**. `10-design.md`'s
Q8 is updated to record that its footing changed: it now rests on the brief rather than in tension
with it. `30-slices.md` needs no edit — S9 and S10 already read Q8 as standing and neither builds a
compose file.
Recorded with it, because the brief says a model may not author it: the owner overrode that notice
directly in session, and the decision is the owner's. The brief's own provenance notice already
states *"The wording throughout is a model's; the decisions and the source material are mine"*, which
is the condition this edit meets — a model's wording carrying the owner's decision.
Rejected: **Walking Q8 back to undecided** — the recommended resolution, and the consistent one: it
is what Q7 got, on the same reasoning, hours earlier, and it cost nothing because nothing was built;
declined by the owner, who wants this repository to own its Portainer deployment and chose to change
the rule openly rather than park the work. **Ruling that "hosting configuration" never covered a
Compose file this repository ships** — no brief edit needed, and defensible on the words; rejected
because it resolves a conflict by reinterpreting a clause rather than by changing it, which leaves
the next reviewer free to reinterpret it back, and this is the second time this exact clause has been
litigated. **Leaving Q8 standing with the conflict merely recorded** — the state found, and the one
this command exists to end.
Reversibility: cheap for the brief edit itself — one non-goal bullet and two design-doc paragraphs.
Expensive for what it now authorizes, unchanged from the entry below: a root Compose file, a
`publish`-job CI step, a redeploy-verification script and a health endpoint, none of which exist yet.

---

### 2026-08-07 — The Q7 answer below is walked back: TLS termination stays undecided
Context: The entry immediately below ("The deployment Compose file and Portainer GitOps redeploy are
in scope for this repository") answered `10-design.md`'s *Open questions* 7 and 8 together and merged
as PR #42. An automated review of that PR flagged that the Q7 half — naming Nginx Proxy Manager as the
TLS termination point, on a shared Docker network — answers exactly what `00-brief.md`'s non-goal
excludes: *"Domain, DNS, TLS and hosting configuration are out of scope... permanently... until this
file changes."* No agent, and no decision-log entry, may narrow a binding non-goal by simply writing
past it.
Chosen, on the owner's ruling: the earlier Q7 answer was the defect, not the brief. **Q7 reverts to
undecided.** This entry does not edit the one below — the log is append-only and that entry already
merged — it supersedes the Q7 half of it going forward. **Q8 is unaffected and stands**: the compose
file lives in this repository and is the deployment itself, per the entry below. The redeploy-webhook
mechanism recorded there also stands unchanged — it names a webhook and a health poll, not an ingress,
a certificate or a proxy, so it never depended on Q7's answer.
Corrected with it, two inaccuracies the same review caught in the entry below, left uncorrected there
because the log does not edit merged entries: (1) `ghcr.io/the-running-dev/...` is a placeholder: the
image `ci.yml`'s `publish` job actually pushes is `ghcr.io/the-running-dev/subzerodev-com`, confirmed
against `.github/workflows/ci.yml`'s `Push the gated image to GHCR` step, and any future Compose file
should pull that name, not the ellipsis. (2) `10-design.md`'s Q7 citation named `SubZeroDev.Blog`'s
"`blog-bot`" service; checked directly against that repository, no `blog-bot` exists there — only
`tools/blog-mcp`, which is what this entry and the one below both otherwise cite correctly.
`10-design.md`'s *Open questions* 7 and 8 are updated in place to reflect this walk-back — that
document is not append-only, and the citation must point somewhere current.
Rejected: **Narrowing the brief's non-goal to admit the NPM/TLS answer instead** — the alternative
resolution, and the more permissive one; declined by the owner, who judged the Q7 answer the thing
that was wrong rather than the four-month-old non-goal it was asked to override on the strength of one
decision-log sentence.
Reversibility: cheap — this entry and two design-doc corrections; nothing built against the withdrawn
Q7 answer, since S9 and S10 need neither question answered (`30-slices.md` § *Blocked*).

---

### 2026-08-07 — The deployment Compose file and Portainer GitOps redeploy are in scope for this repository
Context: `10-design.md`'s *Open questions* 7 and 8 had stood unanswered since the S9/S10 design pass —
whether this repository owns the compose stack that runs the published GHCR image, and where it
terminates TLS — deliberately left open because the container was new to the brief and its DNS/TLS
non-goal predates it. The owner asked how to deploy via Portainer Compose GitOps, pointing at
`SubZeroDev.Blog`'s `blog-mcp` tool as the existing pattern to follow.
Chosen, on the owner's ruling, both questions together: **Q8 — yes**, the compose file lives in this
repository, and it is the deployment itself rather than documentation of one, mirroring
`SubZeroDev.Blog`'s split — `docker-compose.yml` at the repository root pulls the published
`ghcr.io/the-running-dev/...` image (`pull_policy: always`) for Portainer to import as a stack, while
`site/` or an equivalent local-build form (not yet written) stays separate, the way
`tools/blog-mcp/docker-compose.yml` does there. **Q7 — Nginx Proxy Manager**, on a shared Docker
network (`proxy-net` in the blog-mcp precedent), the stack's service forwarding to NPM by container
name and port; this repository does not configure NPM itself, only joins its network, the same
boundary `blog-mcp`'s README draws.
Recorded with it, as the concrete mechanism this ruling implies but does not yet implement: CI calls a
Portainer stack **redeploy webhook** (a secret URL) after a successful GHCR push, then verifies the
redeploy actually landed — polling a health endpoint for the expected commit SHA rather than trusting
the webhook's 200 as proof — the same two-step `blog-mcp-image.yml` uses (`Redeploy blog-mcp stack` +
`Verify deployed build and MCP catalog` steps). Nothing per this entry is implemented: no root
`docker-compose.yml` exists yet, `ci.yml`'s `publish` job calls no webhook, and there is no
`/healthz`-equivalent endpoint this static nginx image serves to poll against — that last gap is new
work this entry surfaces rather than resolves.
Rejected: **A separate homelab/infra repository owning the stack** — the closer analogue to how some
of the owner's other Docker services are run, and it would have kept this repository's non-goal
narrower; declined by the owner in favour of following the `blog-mcp` precedent directly. **Leaving
both questions open and implementing ad hoc** — the process this repository's `AGENTS.md` forbids:
non-goals are binding and a design fork gets asked, not assumed, before code follows it.
Reversibility: cheap for the ruling itself — two sentences and a citation. Expensive for what it now
authorizes once written: a new root Compose file, a `publish`-job CI step, a redeploy-verification
script and endpoint, and `30-slices.md`'s S9/S10 out-of-scope clauses narrowing to match, none of which
exist yet.

---

### 2026-08-07 — The default branch is renamed `master` → `main`
Context: The owner asked to change `master` to `main` everywhere. The rename touches shared,
hard-to-reverse state — GitHub's default branch, its branch protection, and `.github/workflows/ci.yml`'s
publish/attestation gates, which read `refs/heads/master` literally (`design/30-slices.md` § S10.5) — so
scope was confirmed with the owner before anything moved: a full rename (GitHub branch + every current
reference), not a code-only relabelling that would leave the actual branch name inconsistent with the
docs.
Chosen: `gh api -X POST repos/.../branches/master/rename -f new_name=main`, GitHub's supported rename
path — it moves the default-branch setting, branch protection, and any open pull requests' base ref in
one step (no PRs were open against `master` at the time; #38 and #40 had already been merged). Local
`master` and the now-stale `fix/agentkit-home-none` branch (already squash-merged, verified with
`git diff` showing no remaining content) were deleted locally; `origin/HEAD` was repointed to `main`.
`.github/workflows/ci.yml`'s four `refs/heads/master` / `commits/master` references and
`design/30-slices.md`'s S10.5 clause and CI table (two "master push" cells) were updated to `main`.
Two other hits for "master" survive untouched, correctly: `design/90-decisions.md`'s own historical
entries (this document is append-only — a past entry's mention of the branch state at the time it was
written is not rewritten) and `apex.ts` / `emitted-document.test.ts`'s "There was no master plan." —
manifesto prose, not a branch reference, and owner-authored copy this session does not edit.
Rejected: **Code/doc references only, branch left as `master`** — offered as the narrower option;
declined by the owner as leaving the two permanently inconsistent.
Reversibility: expensive to fully undo (renaming back is symmetric, but every collaborator's local
clone and any external link or CI badge pointing at `master` would need to catch up a second time);
cheap for the two doc/workflow edits alone.

---

### 2026-08-07 — `AgentKit`'s `home.kind` moves to `"none"` until the subdomain serves real content
Context: PR #38's S3.7 live link check (`tests/verification/live/link-check.test.ts`) failed on
`agentkit.subzerodev.com` — the previous entry below already recorded this as a deliberate deferral
when the domain did not resolve at all (`getaddrinfo ENOTFOUND`, checked 2026-08-07). The owner then
fixed DNS; re-checked the same day, `agentkit.subzerodev.com` resolves against public DNS (8.8.8.8) and
answers over HTTPS, but with a bare `404` — `checkLinks` (`src/verification/check-links.ts:58-59`)
requires status 200–399, so S3.7 stays red on `isOkStatus`, no longer on `LinkUnreachable`. Separately,
the local dev machine's own resolver (Pi-hole) had not yet picked up the record at check time, which
is unrelated to CI (GitHub's runners use their own DNS) and not the reason for this change.
Chosen, on the owner's ruling: `home.kind: "own"` becomes `home.kind: "none"` for `AgentKit` in
`src/content/projects.ts`, the same shape every other project without a live home already uses. This
was the second rejected alternative in the entry below, now taken up because the DNS half of the
original blocker is resolved and only the "nothing is served there yet" half remains.
`tests/content/inventory.test.ts`'s S2.3 moves with it — `agentkit.subzerodev.com` drops out of
`VERIFIED_SUBDOMAINS` and the own-home count returns to twelve, reversing the thirteen the entry below
recorded the same day.
Rejected: **Waiting for content to be deployed to `agentkit.subzerodev.com` before touching the
inventory** — leaves PR #38 blocked on infrastructure work outside this repository with no committed
fallback; declined by the owner in favour of unblocking now. **Overriding branch protection to merge
PR #38 with S3.7 red** — bypasses the gate rather than satisfying it, and leaves a live inventory entry
claiming a home that returns 404.
Reversibility: cheap — one project record's `home` field; reverts to `kind: "own"` with the URL restored
once the subdomain actually serves content.

---

### 2026-08-07 — `inventory.test.ts` follows the code's `AgentKit` over `Idea.md`/`30-slices.md`'s `Automation`, unreconciled
Context: `8be5903` (PR #38's base commit, nominally "Header and footer navigation") also rewrote most of
`src/content/projects.ts`, removing the `Automation` project (`home.kind: "own"`,
`build-agent.subzerodev.com`) and adding `AgentKit` (`home.kind: "own"`, `agentkit.subzerodev.com`)
without updating `Idea.md`'s *Product Ecosystem* list or `design/30-slices.md`'s S2.2/S2.3 criteria,
both of which still name `Automation` and "twelve" verified subdomains. `tests/content/inventory.test.ts`
was touched in the same commit but its S2.2 `NAMED` array and S2.3 `VERIFIED_SUBDOMAINS` list were not,
leaving three assertions red and blocking CI on PR #38. Separately, `agentkit.subzerodev.com` does not
currently resolve (`getaddrinfo ENOTFOUND`, checked directly 2026-08-07), which S2.3's own wording
("every project with a live subdomain") already contradicts, independent of the naming question.
Chosen, on the owner's ruling: update only `inventory.test.ts` to match the current code — `NAMED` now
reads `AgentKit`, `VERIFIED_SUBDOMAINS` gains `agentkit.subzerodev.com` and the expected count moves to
thirteen. `Idea.md`, `30-slices.md`, and the `agentkit.subzerodev.com` DNS state are left exactly as they
are; this is a recorded, deliberate deferral, not an oversight.
Rejected: **Reverting `Automation`** — restores agreement with `Idea.md`/`30-slices.md` with no doc
edits, but was not what the owner chose. **Recording `AgentKit` as the deliberate rebrand** — would have
required also editing `Idea.md`'s ecosystem list and `30-slices.md`'s S2.2/S2.3 wording, and setting
`AgentKit`'s `home.kind` to `"none"` until its subdomain actually resolves; not chosen either.
Open, not filed as an issue because it is a decision already made, not a todo: `Idea.md` and
`30-slices.md` still say `Automation`/twelve while the inventory and its test now say `AgentKit`/thirteen,
and `agentkit.subzerodev.com` is in the inventory as an `own` home that does not resolve.
Reversibility: cheap — the test-file edit is one array element and one integer; whichever of the two
rejected alternatives is picked up later touches the same handful of files.

---

### 2026-08-07 — The manifesto supersedes the Idea.md draft
Context: the manifesto prose in `apex.ts` (`manifestoParagraphs`) reads differently from the "Effortless
Action" draft at `Idea.md` lines 552-573, which `tests/build/emitted-document.test.ts`'s
`manifestoSentences` fixture and the code's own comment still cited. Found by running the `build` CI
job's assertions locally (`npm run build` + `vitest run --config vitest.build.config.ts`): the emitted
document failed `assertContentPresent` with ten `ManifestoAbsent` errors, because the fixture had gone
stale against the working tree with no record of when or why.
Chosen, on the owner's ruling: the new manifesto ("SubZeroDev was always meant to be a business... The
absence of a plan is the plan.") is the final copy and supersedes the `Idea.md` transcript outright —
it is owner-supplied prose, not a transcription of one of the three drafts `Idea.md` lines 540-604
records, so no line citation is made for it. The stale `Idea.md lines 556-579` comment in `apex.ts` is
replaced with a pointer to this entry instead. `tests/build/emitted-document.test.ts`'s
`manifestoSentences` fixture is updated to match.
Recorded because the drift had no entry to begin with: whichever session changed the paragraphs did so
without writing one, which is what let a build-breaking change sit uncommitted and undetected until
`/verify` actually ran the `build` job's assertions rather than only `npm test`.
Rejected: **Reverting to the `Idea.md` first draft** — matches the transcript, the prior commit and the
stale fixture with no further edits needed; this was this session's own recollection of the owner's
earlier choice and was raised as the recommended option, but the owner overrode it in favour of the new
text when asked directly.
Reversibility: cheap — one array literal, one test fixture, one comment.

---

### 2026-08-07 — `10-design.md`'s navigation-chrome clause narrows; a link row on the one document is in scope
Context: the owner asked for a header and footer carrying links — in-page anchors on the left, outbound
destinations on the right. `10-design.md` § *Alternatives considered* → *One document, rather than
routes per section* closed with "It would also add navigation chrome that the visual identity rules
out", which is a design statement that the requested feature is forbidden. `AGENTS.md` requires naming
which side is the defect rather than reconciling, so the work stopped there before any edit.
Chosen, on the owner's ruling: **the design clause is the defect and it narrows.** It now rejects the
chrome a *multi-route* site requires — a persistent bar carrying route state, a current-page
affordance, a path back — and says explicitly that a single row of links on the one document is in
scope. The evidence for the clause being an over-claim, each checked against the tree rather than
recalled: the visual identity ruling it appeals to (2026-08-06, "`U2` answered") enumerates its
constraints and **names no rule about navigation**; `00-brief.md` states the opposite obligation, the
apex "routes to them" and a visitor with "no route to the work" being the stated problem; and
`10-design.md`'s own *Data model* already calls a project `id` "the anchor fragment", which anticipates
the mechanism. The clause was a supporting sentence inside a rejected alternative about *routes*, and
nothing downstream cites it.
Recorded because it bounds what was ruled: the multi-route rejection itself is **untouched**. `A4` still
declares exactly two routes and the apex is still one document. What changed is a claim about the
visual identity that the visual identity never made.
Rejected: **Keeping the clause and dropping the feature** — the reading that makes the document true as
written, and defensible on the grounds that the ecosystem section already links every project, so the
routing obligation is arguably met; declined by the owner. **Keeping the clause and shipping only the
outbound half** — the in-page anchors are the part that reads as chrome, and the brief's routing
language covers outbound links squarely; declined, and it would have left the clause asserting a
visual-identity rule that still does not exist. **Editing nothing and implementing anyway** — the
silent reconciliation `AGENTS.md` forbids, and it would leave the next `/redteam` session reading a
design that contradicts the shipped page.
Reversibility: cheap — one clause in one document, and no code depends on the wording.

---

### 2026-08-07 — `PrimitiveName` gains an eighth member, `bar`, for edge-justified layout
Context: the header and footer above need a group of links at each end of the width. `row`, added
earlier the same day, is `.row > * { flex: 1 1 0 }` — equal columns — so its second child begins at the
midpoint and leaves roughly 300px dead at the right edge of the 1120px `page`. None of the seven
expresses edge-justified placement, which is the same gap the `row` entry below records for
side-by-side placement against the original six. The `row` amendment closed the set at seven and named
an eighth a further contract amendment, so this is that amendment, one day later.
Chosen, on the owner's ruling: `PrimitiveName` closes at **eight**. `bar` is a flex container laying
its direct children left-to-right with `justify-content: space-between`, leaving them at their content
width, wrapping to a single column at the same `720px` breakpoint `page` and `row` already use. It
carries one spacing rule — a gap that is a floor in the unwrapped state — and no colour rule and no
type rule.
Recorded because it is the distinction that stops a ninth being argued for later: `bar` and `row` are
not variants of one primitive. `row` divides a width and gives each child an equal share; `bar` leaves
children at content width and puts the free space between them. Neither expresses the other — `row`
cannot right-align a child without abandoning the equal share that is its purpose. Recorded with it:
`bar` needs **no** rule reaching a child it does not name, since content sizing is the flex default,
which leaves `row` the only primitive whose rules do.
Rejected: **A single inline line of all six links** with the `·` separator idiom `renderProjectEntry`
already uses — needs no amendment at all, keeps the set at seven, and is arguably the most
typography-first answer available; declined by the owner because it is not the left/right split asked
for. **Using `row` as-is and accepting 50/50 columns** — also no amendment; rejected because the right
group would float at the midpoint with a third of the width dead beside it, which reads as a layout
mistake rather than a restraint. **Adding `justify-content: space-between` to `row`** — no new
primitive; rejected because it is inert while `.row > *` is `flex: 1 1 0`, and changing that child rule
would break the manifesto/ecosystem layout `row` exists for. **Naming it `nav`** — it is a layout
primitive and takes its name from structure, not from the one element that first used it, per
`agent.md`'s "name things after structure, not flavour".
Reversibility: expensive — `types.ts`, `primitives.ts`, `apex.ts`, `primitives.test.ts` and
`stylesheet.test.ts` are all written against it, and it reopens a set closed the previous day.

---

### 2026-08-07 — `sourceUrl` enters Content as a constant, and is knowingly outside `V4`
Context: the right-hand nav group carries Blog, Projects and Portfolio. Blog and Portfolio already
exist as inventory records with resolvable homes, so both derive through `resolvedHomes` and no URL is
written twice. **Projects had no representation anywhere** — no Content export addresses the account
the repositories live in, and Composition may not invent data.
Chosen, on the owner's ruling: one Content constant, `sourceUrl: AbsoluteUrl`, valued
`https://github.com/The-Running-Dev?tab=repositories`. The org was confirmed against the remote rather
than assumed — `origin` is `github.com/The-Running-Dev/SubZeroDev.com`, and there is no `SubZeroDev`
organisation — and the URL was verified to answer `200` directly, with no redirect, on 2026-08-07.
Recorded plainly because it is a real cost the contract now states: **this is the one outbound link on
the page that no gate checks.** `checkLinks` runs over `resolvedHomes(inventory)` and `sourceUrl`
produces no `ResolvedHome`. It sits outside `V4` rather than violating it — `00-brief.md` requires every
outbound **project** link to resolve, and a code-forge account page is not one. `10-design.md`'s open
question 4 ("which repositories are public?") does not block it: a profile page is public regardless of
any individual repository's visibility.
Recorded with it, as the fragility a future session will otherwise rediscover: Blog and Portfolio are
found by the `ProjectId` strings `publishing` and `portfolio` written in `apex.ts`. Renaming either
record makes its nav link vanish silently, because Composition is total and cannot fail. That is
covered by an assertion in `tests/composition/` rather than by a type, and the test is what goes red.
Rejected: **Widening `checkLinks` to accept a bare URL** so CI checks it uniformly — it closes the gap,
and it was the middle option; declined by the owner because it is a Verification signature change and
`LinkCheckResult.target` widens with it, which three of S3's acceptance criteria turn on. **A full
`SiteLink` type with project-reference resolution** — the rigorous answer: a nav entry either names a
`ProjectId` resolved through `resolvedHomes` or carries its own URL, so no URL is written twice and CI
gets one list to check; declined as a slice rather than an amendment, needing a new type, a new
derivation, new `ContentError` codes and a new `C` invariant to serve exactly one link. **Adding GitHub
to the inventory as a `Project`** — never put to the owner: it would place a row in the ecosystem list
for something that is not a project, and force a `stage`, a `line` and a `question` onto it.
Reversibility: cheap — one constant, one export line and one contract paragraph.

---

### 2026-08-07 — `PrimitiveName` gains a seventh member, `row`, for side-by-side layout
Context: the owner asked for the apex layout to put the manifesto and ecosystem sections side by side.
All six existing primitives (`page`, `stack`, `entry`, `meta`, `rule`, `link`) are full-width vertical
layouts; none expresses side-by-side placement, and the 2026-08-06 `U2` ruling closed `PrimitiveName`
at six, naming an addition a contract amendment rather than a class someone adds to markup. The
mechanical work was done first and the amendment was written as a **draft** at `sonnet`/medium, which
routed it here; this entry supersedes that draft in place — it was never committed, so nothing in the
log's history is rewritten.
Chosen, on the owner's ruling at `/contract`: `PrimitiveName` closes at **seven**. `row` is a flex
container laying its direct children left-to-right, each an equal share of the available width
(`flex: 1 1 0; min-width: 0`), wrapping to a single column at the same `720px` breakpoint `.page`
already uses. It carries exactly **one** spacing rule — the gap between columns — and no colour rule,
no type rule and no spacing inside a column.
Corrected with it: the draft claimed `row` "carries no colour, type or spacing rule of its own", while
the implementation declares `gap: clamp(1.1rem, 2.4vw, var(--space-2))`. The **draft was the wrong
side** — a flex row with no gap butts its columns together, and `page`, `stack` and `entry` each
declare their own gap. `20-contract.md` now names the gap as the single exception.
Recorded because it is new to the set: `row` is the only primitive whose rules reach elements it does
not name, through `.row > *`. That is what makes the equal share a property of the row rather than of
its contents — a child needs no cooperating class — and it is why `Primitive.rules` had to be restated
(see the entry below).
Rejected: **CSS Grid** (`repeat(auto-fit, minmax(…, 1fr))`) — genuinely wraps without a media query,
which would be one fewer `@media` block; rejected because every other primitive is flex, the `720px`
breakpoint is already `page`'s, and `auto-fit` stops giving equal columns between the wrap point and
full width, which is the one property the row exists to provide. **A modifier class on `stack`** —
smaller surface; rejected because `PrimitiveName` is the only class vocabulary Composition may
reference, and a modifier would be a second, informal one beside it. **Naming it `columns`** — `row`
names the flex-direction directly and matches how the ask was phrased. **Rejecting it outright and
keeping the set at six** — the side-by-side layout would not ship.
Reversibility: expensive now. `types.ts`, `primitives.ts`, `apex.ts`, `stylesheet.test.ts` and
`primitives.test.ts` are all written against it, and `30-slices.md` § `S4.3`/`S4.7`/`S4.8` still say
"the six" and are drift `/slices` owns.

---

### 2026-08-07 — `--link` moves to `#6FD3FF`, and the contract's `P2` figure was stale
Context: `palette.ts` and `20-contract.md`'s token table both carried `--link: #6FD3FF`, uncommitted
and with **no log entry**, hours after the 2026-08-07 ruling above reverted a palette swap and recorded
`#5B7CFF` as retained. Changing it again the same day with nothing written down relitigates a
signed-off decision, which is the failure `AGENTS.md` § *Budget discipline* names. Found by `/contract`
re-deriving `P2` against the tree.
Chosen, on the owner's ruling: `#6FD3FF` stands, and this entry is the record it never got. Contrast
recomputed rather than remembered — `--link`/`--bg` improves from **5.18:1 to 11.17:1** against
`P2`(a)'s 4.5:1 threshold, and `--link`/`--fg` moves from **3.22:1 to 1.50:1**, which strengthens
`P2`(b)'s hue-independence argument rather than weakening it: the link is now even less separable from
body text by luminance alone, so the `text-decoration: underline` the primitive declares is doing more
work, not less.
Corrected with it: `P2` stated `--link` against `--fg` as **3.22:1**, computed for `#5B7CFF` and false
of the tree since the swap. It now reads 1.50:1 and names the 11.17:1 margin against `--bg`, so the
row cannot be read as claiming (b) follows from (a).
Recorded because a future reader will hit it: the 2026-08-07 palette entry above rejects WCAG AAA on
the evidence that "`--fg-muted` (6.62:1) and `--link` (5.19:1) both still miss 7:1". Against `#6FD3FF`
only `--fg-muted` misses; `--link` clears AAA at 11.17:1. That entry is not edited — the log is
append-only — and the AAA rejection still stands on `--fg-muted` alone.
Rejected: **Reverting to `#5B7CFF`** — restores the state the earlier ruling signed off and makes
`P2`'s original figure true again with no new entry; declined by the owner, and it would have cost more
than half the contrast margin against `--bg`. **Keeping `#6FD3FF` and writing no entry** — cheapest,
and it leaves a token that changed twice in one day with one ruling recorded against it, so the next
session re-derives the argument from scratch.
Reversibility: cheap — one hex literal, one table cell, one invariant figure.

---

### 2026-08-07 — `X5` covers attribute position, and `Primitive.rules` is restated by its anchor
Context: `/contract`. Two invariants were narrower than both the design and the committed code, one of
them since before this session's work.
Chosen: **`X5` widens.** It read "`name`, `line`, a present `question` … is HTML-escaped **in text
position**". `apex.ts` interpolates `id`, `stage` and `escapedFrom` as well, and now writes a
`ResolvedHome.url` into an `href` — an attribute, which the invariant did not reach at all. The
**contract was the defect**: `escapeHtml` already escapes `"` and `'`, so the code was correct and
unasserted. `X5` is now over every interpolated Content value, in attribute position as well as text,
and states why the halves are not redundant — `"` and `'` are inert in text and are exactly what closes
an attribute early. The field enumeration is dropped rather than extended, because it is what went
stale.
Chosen: **`Primitive.rules` is restated by its anchor.** It permitted "a pseudo-class, a pseudo-element
or a descendant combinator", while `.page > .stack`, `.entry + .entry` and
`.page section > p, .page article > p` have been committed since the editorial pass and `.row > *` adds
a universal selector. The **contract was the defect, and predates this session.** The clause now
requires only that every selector *begins with* the primitive's class selector, each selector in a list
anchored independently, because the anchor alone establishes the property the clause exists for — no
rule matching an element the class is absent from. Verified by inspection: all seven primitives satisfy
it.
Rejected: **Extending each enumeration** — `X5` gaining `id`, `stage`, `escapedFrom` and `url`;
`Primitive.rules` gaining child, sibling and universal selectors. Rejected because both lists have now
gone stale once by the ordinary act of writing correct code against them, and a list that must be
revisited on every composition change is a drift generator. Stating the rule by its reason is the same
move `R4` made when "adds no header of its own" proved unsatisfiable. **Leaving both and filing them
for `/track`** — they are contract text, and `/contract` is the command that owns it.
Reversibility: cheap — two table rows.

---

### 2026-08-07 — The `P3` brief conflict is numbered `U10`
Context: the 2026-08-07 `P3` entry narrowed the invariant to motion and recorded that this puts the
contract in conflict with `00-brief.md` § *Definition of done*, explicitly leaving "whether it earns
its own `Unresolved` number" to the owner. `## Unresolved` is `20-contract.md`'s section, so the
numbering is `/contract`'s to apply once ruled.
Chosen, on the owner's ruling: add `U10`, in `U5`'s shape — the brief clause, the contract clause, the
adjudication, and the remaining action named as an owner edit to `00-brief.md`. The reasoning for the
number is that a live brief conflict recorded only in an append-only log is one nobody re-reads;
`## Unresolved` is the list that gets checked. `U10` blocks nothing, and `U9` still owns the separate
question of what would verify `P3`.
Rejected: **`U10` plus a `U11` for the inventory-versus-brief conflict** — `00-brief.md` § *Environment*
records "Verified 2026-08-05 … twelve project subdomains" while the inventory now carries thirteen own
homes, with three failing assertions in `tests/content/inventory.test.ts` as the evidence; declined,
and it is a content-versus-brief question rather than an interface gap, so it does not belong in this
contract's `Unresolved`. It is reported and left for the owner. **No number at all** — the conflict is
already in the log and in `P3`'s own row, so nothing would be lost but the checklist position.
Reversibility: cheap — one `Unresolved` entry, and numbers are never reused.

---

### 2026-08-07 — The GameEngine colour palette is not adopted; the editorial-pass palette stands
Context: `/reconcile`. An uncommitted change swapped all five palette tokens a second time — from the
2026-08-06 editorial-pass values to `SubZeroDev.GameEngine`'s own landing tokens, read out of
`site/src/site.css` (`--landing-bg` #090a0d, `--landing-text` #f4f5f7, `--landing-muted` #a2a9b4,
`--landing-accent` #82d8ff), with `--rule` #242528 as the opaque flattening of that page's
`rgba(255, 255, 255, 0.11)` decorative border against the new `--bg`. The transcription was verified
correct against the sibling file and the flattening is exact (36.06 / 36.95 / 39.62 → #242528).
Recomputed contrast improved on every pair: `--fg`/`--bg` 18.15:1, `--fg-muted`/`--bg` 8.36:1,
`--link`/`--bg` 12.46:1, `--rule`/`--bg` 1.29:1 (exempt), `--link`/`--fg` 1.46:1. `20-contract.md`'s
token table was **not** updated with it, and the suite stayed green at 275 tests — see the
`palette.test.ts` entry below for why nothing caught that.
Chosen, on the owner's ruling: the code reverts. `palette.ts` and `tests/presentation/palette.test.ts`
return to the editorial-pass values — #111113 / #F3F1EC / #9A989F / #2B2B31 / #5B7CFF — which the
contract's token table already records, so no design document moves. The font stack does **not** revert
with it; that is the entry below, and the sibling-site alignment is therefore deliberately partial.
Recorded with it, because it is the evidence anyone reopening this would need: against the rejected
palette the whole set clears **WCAG AAA**, which would have falsified the 2026-08-06 `P2` entry's
rejection of AAA ("`--fg-muted` (5.71:1) and `--link` (6.03:1) both miss"). Against the retained
palette that rejection stands unchanged — 6.62:1 and 5.19:1 both still miss 7:1.
Recorded with it, because it sent this pass looking in the wrong places: the 2026-08-06 entry's
`Divergence:` note says `10-design.md`'s *visual identity* / *Copy* sections and `30-slices.md`'s
`S4`/`S5` acceptance text "may still describe the U2 values verbatim (hex codes, the 4rem–8.5rem `h1`
range)". Neither document contains a six-digit hex or that range. `S4.1` *references* the contract's
table rather than copying it, so single ownership held and there was nothing there to reconcile. The
note is left standing, this log being append-only. That entry also cites `site/src/landing.css` as the
palette's source; the colour tokens live in `site/src/site.css`, and `landing.css` carries the scale
and spacing it was in fact matched against.
Rejected: Moving the contract to the new values — the recommended resolution, on the grounds that the
change was owner-directed, the transcription verified and every contrast margin better; declined by
the owner. Keeping the swap and leaving the contract stale — the state the working tree was in, and
the one this command exists to end.
Reversibility: cheap — five hex literals in one file, and the contract never moved

### 2026-08-07 — `--font-sans` leads with Inter, and the contract stops calling the stack a system stack
Context: `/reconcile`. The same uncommitted change also moved `--font-sans` from
`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` to
`Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
transcribed from `SubZeroDev.GameEngine`'s `site/src/index.css`. `Inter` is not a system face on
Windows, macOS or mainstream Linux, while `20-contract.md`'s token table described `--font-sans` as
"a system sans stack".
Chosen, on the owner's ruling: the code stands and the contract moves. The table cell becomes "a sans
stack of locally-resolved faces", and the paragraph below it gains the reason — naming a face is a
preference the browser resolves locally, not a load, so an absent face falls through to the next
entry. `P1` is untouched, and was verified rather than assumed: nothing here declares an `@font-face`
or a `url(`, and neither does the sibling — GameEngine names `Inter` the same way and loads no webfont
anywhere in that repository. `S4.8`'s implemented check tests for `url(` and `@font-face`, which is
the right reading of `P1` and needed no change.
Rejected: Reverting the stack alongside the palette — the recommended resolution, since keeping one
half of a sibling-site alignment leaves the apex carrying GameEngine's typeface without its colours,
and it would have left the working tree clean against `master` with no document edit at all; declined
by the owner. Keeping the code and leaving the cell saying "a system sans stack" — cheapest, and it
would have been a known-and-retained inaccuracy rather than a silent one; rejected because the
contract would describe something the code does not do. Self-hosting `Inter` so the face actually
resolves — never on the table: that is a webfont, which `P1` forbids outright.
Reversibility: cheap — one token value and two sentences

### 2026-08-07 — `P3` narrows to motion; a colour transition is not animation, and the brief now disagrees
Context: `/reconcile`. The `link` primitive has declared `transition: color 120ms ease` since the
2026-08-06 editorial pass, and no `@media (prefers-reduced-motion: reduce)` rule exists anywhere in
`src/`. `P3` as written — "Nothing animates under `prefers-reduced-motion: reduce`" — was therefore
false of the tree, and had been since that pass. It survived because `U9` leaves `P3` with no
verification surface: an invariant with nothing callable behind it cannot fail. `20-contract.md`'s
`Primitive.rules` row had already reserved the mechanism ("`P3`'s `prefers-reduced-motion` rules are
the case that needs one"), so this was an unused affordance rather than an unforeseen gap.
Chosen, on the owner's ruling: `P3` narrows rather than the code changing. The invariant now says
nothing **moves** — no transform, translation, scale, rotation, position change or scroll behaviour
animated or transitioned — and states that a transition of a non-positional property is permitted, the
hover colour change being the case in the primitive set. The reasoning is that the preference
addresses vestibular motion rather than change as such, which is WCAG 2.3.3's subject. The tree is
compliant with no code change.
**This puts the contract in conflict with the brief, and the conflict is recorded rather than
resolved.** `00-brief.md` § *Definition of done* states the broad form — "animates nothing under
`prefers-reduced-motion: reduce`" — and the brief outranks the contract. A model may interrogate that
file but not author it, so the edit is not made here. Until the owner strikes or narrows that clause,
the brief and the contract disagree on a released requirement. That is the same shape as `U5`, and
whether it earns its own `Unresolved` number is the owner's call, not this entry's.
Rejected: Adding the reduced-motion block to the `link` primitive and staging the checker for `/track`
— the recommended resolution: four lines, the mechanism already reserved, the inner selector still
rooted at `.link` so `S4.4` and `X4` were unaffected, and it would have made `P3` true rather than
merely unchecked; declined by the owner. Reporting only and staging the whole thing for `/track` — the
strictest reading of this command's remit, and it would have left a known invariant violation in the
tree for as long as the issue sat. Leaving `P3` broad and the code untouched — the state found, and
the one this command exists to end.
Reversibility: cheap for the wording — one invariant row. The brief conflict is the owner's to close
and is not this document's to assume closed.

### 2026-08-07 — `palette.test.ts` parses the contract's token table instead of transcribing it
Context: `/reconcile`. The test's own comment claimed it was the drift check between
`20-contract.md`'s token-block table and `palette.ts` — "transcribed once here so a drift between the
table and `palette` fails a test rather than going unnoticed". It could not be. It held a **second
copy** of the table in an `EXPECTED` constant, so it proved only that the file agreed with itself: the
palette swap above edited `palette.ts` and `EXPECTED` together, and the whole suite stayed green at
275 tests while the contract went stale. The mechanism written to catch exactly this drift was
defeated by the ordinary way the drift is introduced.
Chosen, on the owner's ruling, a code change rather than a tracker item: the test **reads the five
colour rows out of `design/20-contract.md`** at run time and compares `palette` against them. The
contract is now a party to the check rather than the subject of a claim about one. An arity assertion
requires the parse to find exactly five rows, so a table reflow fails loudly instead of yielding an
empty expectation and passing vacuously — which is the new failure mode a parsing check introduces and
the transcription did not have.
Verified in both directions rather than asserted. Positive: 10 of 10 pass against the tree as it
stands. Negative: changing `--bg` in the contract alone to `#111114` fails **2** assertions naming
both values, and stripping the value backticks to simulate a reflow fails **8**, the arity guard among
them. The contract was restored from a copy after each, and `git diff` confirmed it clean.
Rejected: Staging the defective guard under `## Open` for `/track` and correcting only the comment —
the recommended resolution, on `AGENTS.md`'s "defer work to the tracker rather than processing it
inline", and it avoids a test that depends on a document's formatting; declined by the owner in favour
of closing the hole now. Proposing the `agent.md` lesson and changing nothing — it would have left a
check in the suite whose comment overstates what it guarantees, which is how this drift got through
once already. Moving the hex values out of the contract so the table cites `palette.ts` and there is
nothing to keep in sync — the other way to give one value one home; not put to the owner, because it
would strip the contract of the values a `P2` checker and every reviewer read that table for.
Reversibility: cheap — one test file, and the row shape it depends on is documented in it

### 2026-08-06 — Visual identity revised: an editorial pass over the U2 palette, type scale and spacing
Context: The owner judged the U2 apex identity (`90-decisions.md`, "`U2` answered: Presentation's token
set, primitives and stylesheet assembly") too large and too spacious in practice — display-scale `h1`
at up to 8.5rem, section gaps up to 7rem — and wanted an editorial pass toward the smaller, tighter
scale already in production on `SubZeroDev.GameEngine`'s landing page (`site/src/landing.css`), plus a
numbered `01 / 02 / 03` section-index label ahead of each top-level section, read from that same
sibling site's `section-index` convention (`App.tsx`), reusing the existing `meta` primitive rather
than adding a seventh.
Chosen: Palette — `--bg` #111113, `--fg` #F3F1EC, `--fg-muted` #9A989F, `--rule` #2B2B31, `--link`
#5B7CFF, replacing the U2 values. Recomputed contrast: `--fg` vs `--bg` 16.71:1, `--fg-muted` vs `--bg`
6.62:1, `--link` vs `--bg` 5.19:1 (all clear WCAG AA's 4.5:1), `--rule` vs `--bg` 1.34:1 (exempt, as
before). `--link` vs `--fg` (the pairing `P2`(b) cites) is 3.22:1, below the 4.5:1 body-text threshold
— still below what luminance alone could carry, so the `text-decoration` `P2`(b) requires stays load-
bearing exactly as it did at the old 2.60:1. `20-contract.md`'s token table and `P2`(b)'s prose, and
`tests/presentation/palette.test.ts`'s `EXPECTED` transcription, were updated in the same change so
none of the three drift from one another. Heading scale and spacing in `primitives.ts` (`page`,
`stack`, `entry`) were cut roughly in half throughout — `h1` clamp(4rem,12vw,8.5rem) →
clamp(1.9rem,3.6vw,2.75rem), `h2` clamp(2.5rem,6vw,5rem) → clamp(1.3rem,1.7vw,1.75rem), the
`.page > .stack` section gap 7rem → 2.5rem — matched against `GameEngine`'s landing scale rather than
re-derived from the `--step`/`--space` ratio. `apex.ts` gained a `meta`-styled `NN / Title` label ahead
of each of the three top-level sections' `h2` (Effortless Action, The Ecosystem, Contamination); the
numbers are structural ordinals, not a Content-derived figure, so `X1` does not apply to them.
Rejected: Re-deriving the tighter scale from the existing `--step`/`--space` 1.25-ratio tokens instead
of matching `GameEngine`'s literal values — rejected by the owner in favour of visual consistency with
the sibling site's already-shipped scale over strict adherence to U2's single-ratio principle; noted
here as a real tension for whoever reconciles this against `10-design.md`'s ratio language. A literal
left/right alternating section layout, also requested — abandoned once neither `landing.css` nor
`App.tsx` in `GameEngine` was found to contain one; sections there are uniformly `margin-inline: auto`
and centred, so there was nothing concrete to port.
Reversibility: expensive — same as U2, this is the visual identity; cheap for the section-index labels
alone, which are three literal strings in `apex.ts` with no contract surface of their own.
Divergence: `10-design.md`'s *visual identity* / *Copy* sections and `30-slices.md`'s `S4`/`S5`
acceptance text may still describe the U2 values verbatim (hex codes, the 4rem–8.5rem `h1` range) —
not reconciled in this change; owner intends to run `/reconcile` once the revision is complete.

### 2026-08-06 — Local dev preview reuses S8's static-server harness rather than a second server
Context: No way existed to preview `site/dist` locally without either running the full Docker/nginx
path (S9) or hand-serving the tree with an ad hoc script.
Chosen: `tools/preview.mjs` builds via the landing-page package's CLI, then serves the result with
`tests/build/static-server.ts` — the same server S8's browser-capture harness already drives — rather
than a second implementation, so the dev preview observes the same `try_files $uri $uri/ =404`
semantics `serverConfig()` gives nginx rather than a third, possibly-divergent set. It rebuilds on
every change under `src/` or `site/landing.config.ts` (debounced 150ms) and never needs restarting,
since it reads `site/dist` fresh off disk per request. `GITHUB_SHA` defaults to the current commit when
unset, a dev-only convenience the package's own build (which refuses to run without a real 40-hex
commit id) does not extend to CI.
Rejected: A second minimal HTTP server written for preview alone — rejected for duplicating semantics
the S8 harness already has right, with no guarantee the two would stay in sync. `vite preview` or an
equivalent bundler dev server — rejected because the emitted tree is static output from an external
package's CLI, not a bundler graph this repo owns; a bundler-native dev server has no route into it.
Reversibility: cheap — dev-only tooling, referenced by nothing else in the repository

### 2026-08-06 — S9's image build and push mechanism confirmed, scoped: this slice pushes nothing
Context: S9.1 requires a decision-log entry naming the image build and push mechanism, with the
registry write scoped to the publication job alone, before any S9 code is written. `30-slices.md`
still listed this as open even though the S1-reconciliation entry below ("Image identity is commit
identity: GHCR, tagged by full commit id", 2026-08-05) already names the mechanism and its rejected
alternatives — that entry predates S9's explicit call-out and never states which job performs the
push.
Chosen: The existing mechanism stands — build over `nginx:alpine`, tag with the full commit id, push
to GHCR — and is confirmed here as answering S9.1's dependency. S9 builds the image, runs it, and
gates it (`assertImageIdentity`, `assertServedBytesMatchEmitted`, `assertUnknownPathResponse`, header
assertions); it authenticates to no registry and pushes nothing. The registry push is S10's `publish`
job alone, carrying the image S9 already gated rather than rebuilding it (S10.7). Confirmed by the
owner on 2026-08-06.
Rejected: Writing a new mechanism from scratch — rejected because the S1-era decision already answers
the "what mechanism" question and rejected its alternatives (semver tags, Docker Hub, `latest`-only);
redoing that work would relitigate a settled choice with no new evidence. Leaving `30-slices.md`'s
"still open" note unaddressed and proceeding without logging anything — rejected because S9.1 is an
explicit stop condition for an implementing agent, and silently treating stale prose as resolved is
exactly the drift *Verification* exists to prevent.
Reversibility: cheap — this entry states scope, not a new mechanism

### 2026-08-06 — S6's route titles and descriptions start as placeholder copy
Context: S6 requires each route's `title`, `description` and Open Graph title/description as
owner-supplied copy, transcribed rather than invented (`20-contract.md`). Final copy was not ready
when `/slice S6` was scheduled to start.
Chosen: `/slice S6` proceeds using placeholder copy for both routes' titles and descriptions, on the
owner's explicit instruction, with the real copy to replace it in a follow-up once written.
Rejected: Waiting for final copy before starting S6 — the recommended default, declined by the owner
to avoid blocking the slice on content that is independent of the render-path work S6 actually
exercises.
Reversibility: cheap — a copy swap, not a structural change

### 2026-08-06 — U6 answered: no social image asset
Context: `U6` in `20-contract.md` was unblocked but unanswered — whether a social image exists,
which decides if `socialImageUrl`, `openGraph.imageUrl` and the `twitter` block are declared at all.
S6 cannot transcribe metadata it does not know the shape of.
Chosen: No social image asset exists. `socialImageUrl` and `openGraph.imageUrl` are both omitted, and
the whole `twitter` block is omitted with them. Written into `20-contract.md`'s `U6` entry and its two
forward references.
Rejected: n/a — this is an owner content decision, not a design fork; the contract already described
both branches, so answering only means picking the branch that is now true.
Reversibility: cheap — adding an image later is additive, not a rewrite

---

### 2026-08-06 — Two module edges the design denied: Presentation → Content, Adapter → Presentation
Context: `/reconcile`. Writing `U2` into the contract added `A7` and widened `A3`, leaving
`10-design.md` saying Adapter "reads nothing from Presentation" — the divergence the `U2` entry below
flags and hands here. Reading the same section against the contract's types found a **second**, older
one that no note anywhere records: `10-design.md` says Presentation "Depends on **nothing**" and calls
it a sink, while every type Presentation exports is `Branded<…>` and `Branded` lives in Content by the
2026-08-05 ruling — which rejected exempting type-only imports **by name**. That was already true when
`StylesheetText` was first written, and it survived two `/reconcile` passes that each reported no
drift, because both compared implemented imports against the design and Presentation has no
implementation to compare.
Chosen, on the owner's ruling: the design moves for both, and the contract gains one sentence.
`10-design.md`'s Presentation clause names `Branded` from Content; its Adapter clause names
`themeColor` and `iconDataUri` from Presentation and keeps the one-path-from-data-to-markup sentence
by saying nothing *renderable* comes from Presentation; the dependency block gains both edges; and the
sinks sentence becomes "Content is the only sink". The contract's § *Presentation* states the `Branded`
import and settles an ownership the `U2` write-up left unstated — `StylesheetText` and `BodyHtml` are
Presentation's, `ComposedRoute` is Composition's. That direction is forced rather than preferred:
`stylesheetFor` takes a `BodyHtml`, so Composition owning it would put Presentation above Composition
and cycle the graph.
Rejected: Adapter writing `themeColor` and the icon as literals so `A3` and the design survive
verbatim — already rejected on 2026-08-06 for two uncompared copies of the visual identity, and
relitigating it needs new evidence there is none of. Presentation declaring its own `Branded` so the
"depends on nothing" claim holds — the duplicate *Single ownership* forbids, and the 2026-08-05 entry
rejected the identical move for `Result`. Reading Presentation's edge as exempt because the import is
type-only and erased — the exact exemption that entry rejected as unwritten and unbounded. Leaving the
sinks sentence and calling it approximately true — a dependency-direction block whose one job is to be
read literally.
Reversibility: cheap — four clauses in the design and one paragraph in the contract; the edges
themselves were fixed by earlier rulings

### 2026-08-06 — `X4`'s selector half is over class selectors; the token block sits outside it
Context: `/reconcile`. `P6` requires every route's stylesheet to be the token block followed by the
referenced primitives' rules. The token block is `:root` rules and nothing else. `X4` requires that
**every** selector in the stylesheet have a user in `bodyHtml`, and `bodyHtml` is body *content* —
there is no `:root` in it. As written, `assertStyleAgreement` reports `SelectorWithoutUser` on every
route, forever, for the two token-block rules. The contract's own claim that the `SelectorWithoutUser`
half "becomes structurally true" holds for primitive rules, which `Primitive.rules` roots at their own
`className`, and is false for the block sitting beside them. Introduced by the `U2` write-up and
caught before any Composition code exists.
Chosen: `X4` and the `SelectorWithoutUser` row narrow to **class** selectors. No exemption clause is
needed: the token block carries no class selector, and `Primitive.rules` already constrains every
other rule to be rooted at its own `className`, so the two halves partition cleanly. The
`stylesheetFor` paragraph is corrected to say the structural argument covers the primitives and not
the block.
Rejected: Exempting the token block by name, the way `P2` exempts `--rule` — same behaviour, and it
was the closer precedent; rejected because it creates a second place to keep in sync when the block
changes, where narrowing to class selectors follows from `Primitive.rules` and needs no maintenance.
Leaving it and letting the `assertStyleAgreement` implementer decide — the first Composition slice
would either go red for a reason nobody intended or quietly narrow the invariant in code and justify
it in a comment, which is precisely the "Nothing imports Verification" failure the 2026-08-05 entry
exists to prevent. Dropping the token block into a primitive so every rule is class-rooted — rejected
by the `U2` write-up already, for the light viewport gutter a dark-first page gets when its background
is set inside a primitive.
Reversibility: cheap — one invariant row, one error row and one paragraph

### 2026-08-06 — `U2` being answered closes three stale blocks and one recurring count
Context: `/reconcile`. Answering `U2` and writing it into the contract falsified prose in three
documents at once, none of it reachable from the code. `10-design.md`'s *Failure modes* still said
"What remains unbuildable is blocked by Presentation's token set"; its closing paragraph still counted
"Three further unresolved items" and listed `U2` among them; and `30-slices.md` still said the render
path is blocked by `U2` in seven places, including a CI table whose blocked-by column named it for
three of five jobs. The tree itself showed **no** contract drift — Content and Verification match
`20-contract.md` code-for-code, `npm run typecheck` is clean and `npm test` is green at 81 tests over
7 files.
Chosen, on the owner's ruling, prose edits in three documents and no code change: (1) the design's
failure mode says nothing is blocked by the package or by the token set, and names what is genuinely
unwritten — owner-supplied copy and `U9`'s Verification surface; (2) its closing paragraph drops the
numeral entirely rather than correcting it, names `U6` and `U9`, and moves `U2` into the answered list
beside `U3` and `U7`; (3) `30-slices.md` is corrected in place — the render-path headnote, the
`Blocked` heading and its Presentation bullet, the "what the list now means" note, the publication-CI
heading, its blocked-by column and its released-by paragraph. `P1`–`P5` becomes `P1`–`P7` and
`A1`–`A2` becomes `A1`–`A7`, since the `U2` write-up added those rows.
Recorded with it: the numeral in (2) is the second failure of the same sentence. The 2026-08-06 entry
below replaced a count in it with named items for exactly this reason, and the count returned with the
next edit. Staged under `## Open` for `/track` rather than fixed by hand a third time.
Rejected: Correcting "three" to "two" — the edit that already failed here once. Leaving `30-slices.md`
to `/slices`, the narrower reading of this command's remit — rejected because it is the document a
`/slice` session reads to choose work, and it currently says the render path is blocked when it is
not; `U9` named `/reconcile` as an owner of one such correction and two entries below set the
precedent for correcting that document's factual claims in place without re-slicing. Deciding what
slice the released work becomes while in there — that is `/slices`', and no number is allocated.
Reversibility: cheap — prose in three files, no signature and no code touched

### 2026-08-06 — The mono/`X1` candidate is declined; `P7` takes its checkable half
Context: The `## Open` item above proposed "no mono-styled text originates outside a Content
derivation" as an invariant and assigned the ruling to `/contract`. The appeal is real — the `U2`
ruling reserves `--font-mono` for `year`, `stage`, `ProjectId` and `escapedFrom` edges, which is
exactly the set `X1` already governs, so the typeface would become a visible assertion.
Chosen: Decline the invariant as put, and add `P7` — exactly one primitive's rules reference
`--font-mono`, and no other primitive and no token-block rule does. That is the half that is
mechanically true of `ComposedRoute` alone. The other half — that what appears in mono is a Content
derivation rather than a typed literal — is `X1` verbatim with a typeface attached, and *Single
ownership* forbids the second copy: the day one is relaxed, nothing says which governs.
Rejected: Adopting it as written — checking it needs the `Inventory` as well as the `ComposedRoute`,
because "is this string a derivation" is only answerable against the records; that is a new
Verification signature and a new error code the design determines nothing about, which is the same
gap `U9` exists to hold rather than to fill. Adopting it as a Composition invariant with no checker —
it would join `P2`–`P4` as an invariant with nothing callable behind it, and adding a fourth to a list
`U9` was raised to complain about is the wrong direction. Naming `meta` as the mono primitive in `P7`
— the obvious candidate by name, and the ruling does not say which primitive carries mono, so naming
one would be invention for no gain: "exactly one" is the property that matters.
Reversibility: cheap — one invariant row

### 2026-08-06 — Writing `U2` into the contract settled three things the ruling underdetermined
Context: The `## Open` item handing the `U2` ruling to `/contract` read as transcription. Three
questions in it had no answer in the ruling, and each moved a module boundary or changed how much
force an invariant has, so each was put to the owner rather than chosen: whether the palette is
exported as values or lives only as text inside the token block; how `stylesheetFor` learns which
primitives a route referenced; and where `themeColor` and the icon come from, given that Adapter
declares both while `A3` and `10-design.md` say Adapter reads nothing from Presentation.
Chosen, on the owner's answers, all three as recommended:

1. **`palette` is exported as typed `HexColor` values**, and the token block is emitted from it rather
   than authored beside it. Two consumers want values and not CSS — `themeColor`, which the ruling
   *derives from* `--bg` rather than choosing separately, and any checker for `P2`(a) — so
   `AGENTS.md`'s "would a second consumer face this question" test answers yes.
2. **`stylesheetFor(body: BodyHtml): StylesheetText`**, so the referenced set is observed out of the
   composed body rather than declared by the caller. `X4`'s `SelectorWithoutUser` half becomes
   structurally true, while its `ClassWithoutRule` half keeps its teeth against a class Composition
   wrote by hand — which is the sense in which the ruling said `X4` would verify a property rather
   than enforce one. New invariant `P6`; the module-level `stylesheet: StylesheetText` constant is
   gone, since one constant cannot be per-route.
3. **Adapter imports `themeColor` and `iconDataUri` from Presentation**, enumerated the way its four
   Content imports already are, with `A7` forbidding a colour literal or a data URI written in
   Adapter. Neither value is renderable and neither derives from Content, so the property the
   design's clause protects — exactly one path from data to markup, through Composition — is
   untouched.

Recorded with it: the token block's step indices are not a free choice. `--step-0` is `1rem` because
the ruling puts the 34rem measure at "roughly 65 characters at `--step-0`", and `--step-2` is
`1.563rem` because `P2` requires 3:1 "at `--step-2` and above" and 1.563rem is 25px at a 16px root —
WCAG's large-text threshold. The `0.8rem` step therefore takes `--step--1`. The spacing indices run
from 0 over the five listed values by analogy, which the ruling does not state; `--space-1` is then
the record separation `P2` cites. Also re-derived rather than taken on trust: the entry's contrast
figures are correct — `--fg` on `--bg` is 15.65:1, `--link` on `--bg` 6.03:1, `--link` on `--fg`
2.60:1.
Rejected: **Palette as text only** — the smaller surface, and the token block is authored CSS either
way; rejected because `themeColor` then becomes a second written copy of `#0F0F10` with nothing
comparing the two, and a `P2` checker would have to parse CSS to find anything to compute over.
**`stylesheetFor(referenced: readonly PrimitiveName[])`** — more explicit, and it keeps Presentation
from reading markup; rejected because a declared list can disagree with the body, which puts `X4` back
to enforcing the property instead of verifying one that already holds. **Adapter writing both values
as literals** — `A3` and the design survive verbatim, which is its whole appeal; rejected for two
copies of the visual identity in the fields least likely to be looked at, with nothing checking
either. **Composition re-exporting them**, since Adapter already depends on Composition — no new edge
and `A3` untouched; rejected because it costs Composition's "it exposes nothing else", which is the
sentence keeping exactly one module turning data into markup. **Writing `P2`'s Verification surface
now that the palette exists** — part (a) is a static computation over `palette` and could be written
today; rejected because part (b) is a claim about rendered link affordance and sits on the same
static-versus-browser fork as `P3`, and discharging one invariant through two mechanisms in two states
is worse than leaving both in `U9`.
Reversibility: cheap for (1); expensive for (2) and (3) — (2) fixes how Composition obtains a
stylesheet and what `X4` is worth, and (3) fixes a module edge
Divergence: `10-design.md` § *Module boundaries* has Adapter depending on "**Composition**, the
**external package**, and **Content** for four named things only", and its dependency-direction block
omits Presentation. Two clauses, `/reconcile`'s.

---

### 2026-08-06 — `P2` is a contrast check plus a hue-independence rule, and `rule` is exempt by name
Context: Answering `U2` required saying what "the rendered page is legible in greyscale" is measured
as, which [`U9`](20-contract.md#u9--accessibility-has-no-verification-surface) names as blocked on the
token set. Computing it first showed the invariant's name is misleading: WCAG's relative-luminance
formula is already hue-independent, so desaturating the palette barely moves a contrast ratio. A
contrast-only check would be a contrast invariant wearing a greyscale name.
Chosen: Two parts. (1) Every resolved foreground/background pair meets WCAG AA — 4.5:1 for body text,
3:1 at `--step-2` and above. (2) No meaning is carried by hue alone, which obliges the `link` primitive
to declare a `text-decoration` or a font-weight distinct from body. Part 2 is what makes the invariant
say greyscale. Measurement is what justified it: the chosen `--link` #6E92C8 against `--fg` #E8E8E9 is
**2.60:1**, so in greyscale a link is not separable from body text at all, and the underline is the
only thing carrying link affordance. `--rule` #252527 sits at **1.25:1** against `--bg` and is
**exempt**, named explicitly in the checker rather than skipped by omission — record separation is
carried by `--space-1`, so a divider reinforces and never signals, and WCAG's 3:1 applies to non-text
content required to understand the page.
Rejected: WCAG AAA (7:1 body, 4.5:1 large) with the same two-part shape — measured against this
palette, `--fg` clears it at 15.65:1 but `--fg-muted` (5.71:1) and `--link` (6.03:1) both miss, so
adopting it would force `--fg-muted` toward `--fg` and take the meta row's visual recession with it;
rejected as trading typographic hierarchy for a standards tier. Contrast-only at AA — simplest and
fully automatable with no judgement calls; rejected because the one real greyscale failure this
palette can produce is the 2.60:1 link, and contrast-only is precisely the check that misses it.
Brightening `--rule` to roughly #4A4A4E to clear 3:1 with no exemptions — rejected because visible
rules at that contrast pull the page toward a ruled table and away from the whitespace-carried
minimalism the primitive set was chosen for. Dropping the `rule` primitive so the question disappears
— rejected because it reopens the closed six-primitive set and long record lists lose their one
visual anchor.
Reversibility: cheap for the threshold and the exemption — both are the checker's constants and this
entry. Expensive for part 2, which the `link` primitive's rules now depend on.

### 2026-08-06 — `U2` answered: Presentation's token set, primitives and stylesheet assembly
Context: `U2` was the last unwritten interface on the render path. Composition depends on
Presentation and Adapter on Composition, so nothing that emits a document could be sliced until it
was authored, and the contract held it as brand material needing the owner rather than a model.
`Idea.md` fixes the direction — minimal, dark, typography-first, large whitespace, no gradient, no
illustration, no webfont — and `00-brief.md` settles that the apex has *no* genre, being "the parent
voice unstyled". Neither names a token, a scale step or a primitive.
Chosen: Authored whole, values and structure together, so each was chosen against the others.

- **Typefaces.** System sans for prose; system mono reserved for data — year, stage, project id and
  `escapedFrom` edges. Prose is never mono.
- **Type scale.** Ratio 1.25, five steps and no more: `0.8 / 1 / 1.25 / 1.563 / 1.953rem`.
- **Spacing.** The same 1.25 ratio, with a spacing token advancing *two* steps of it — so the
  effective ratio is 1.25² = 1.5625, and the design has exactly one ratio. Five steps:
  `0.75 / 1.17 / 1.83 / 2.86 / 4.47rem`.
- **Palette.** Four neutrals and one accent: `--bg` #0F0F10, `--fg` #E8E8E9, `--fg-muted` #8C8C8F,
  `--rule` #252527, `--link` #6E92C8. The six lifecycle stages carry **no** colour; the label is the
  signal.
- **Primitives.** A closed set of six — `page`, `stack`, `entry`, `meta`, `rule`, `link` — each a
  class name exported as a typed constant paired with the CSS rules it requires. Composition
  references primitives by name and cannot invent a class. Adding a seventh is a contract amendment.
- **Stylesheet assembly.** Each primitive carries its own CSS text; a route's `stylesheet` is the
  token block plus the rules of exactly the primitives that route referenced. `X4` therefore verifies
  a property that is already structurally true rather than enforcing one.
- **Measure.** `--measure: 34rem`, roughly 65 characters at `--step-0`.
- **`themeColor`.** `#0F0F10`, derived from `--bg` rather than chosen separately.
- **Icon.** An inline SVG letterform — the glyph `0`, for sub-*zero* — in `--fg` on `--bg`, embedded
  as a data URI in `icons[].href` per `A2`. Roughly 180 bytes, legible at 16px.

Rejected: **System mono throughout** — the strongest reading of "the engineering should carry the
design", rejected because mono-everything *is* a genre, the terminal, and that genre is Platform's;
the apex taking one would make the parent read as one of its own children. **System serif for prose**
— closest to a written record and a strong match for the deadpan voice, rejected on the same ground,
the essay being a genre the brief reserves for the children. **Sans alone with no mono** — rejected
because reserving mono for data makes the typeface mark exactly the set `X1` governs, which is worth
more than the simplicity of one stack. **A 1.333 type scale** — more dramatic and the conventional
reading of typography-first, rejected because the top step starts to read as a marketing hero.
**A 1.2 scale over six steps** — the most restrained, rejected because hierarchy stops being visible
at a glance and the page reads flat rather than deliberate. **A colour per lifecycle stage** —
genuinely useful information design, rejected for six more contrast pairs to verify and for edging
toward the status-page genre. **A palette with no accent at all** — makes `P2` trivially true, rejected
because link affordance would rest entirely on underline and the site would have no colour to build on.
**Warm graphite with a rust accent, and true neutral with amber** — both carried more character;
rejected because a chosen warmth or a phosphor amber is a *style*, and the apex's whole claim is that
it has none. **Two primitives with the rest as element selectors** — the plainest option and legible as
HTML with no stylesheet at all, rejected because `X4`'s class half goes nearly vacuous and the check
would have to be extended to element selectors to still mean anything. **Primitives as functions
returning markup** — would make `X4` true by construction, rejected because it moves page structure out
of Composition, which the design gives Composition ownership of. **One full stylesheet with unused
selectors stripped per route** — simpler to author, rejected because correctness would then depend on
the stripping step and `X4` becomes the only thing between a bug there and a wrong page.
**Hand-maintained per-route stylesheets** — rejected because `X4` failures become routine maintenance
noise rather than a signal. **An `SZ` or `szd` wordmark** — more conventionally identifiable, rejected
because two or three glyphs turn to mush at 16px and both read as a logo, a register the apex avoids.
**Inline PNG icons at two sizes** — guaranteed identical rendering and consistent with the house raster
rule, rejected for several KB inlined into every document and a mark that is a binary rather than
readable in source. **Declaring no icon at all** — `A2` would stay vacuously true, rejected on the
`V2` favicon reasoning now staged under `## Open` for verification.

Also rejected, at the outset: **splitting `U2` into a contract-authored structural half and an
owner-supplied values half**, which would have unblocked Composition immediately and left the hexes to
be transcribed like S2's `line` and `stage`. Rejected by the owner in favour of authoring it whole, so
that the scale ratio, the palette and the primitive set were chosen against one another rather than
one being fitted to the others afterwards.

Recorded with it, because it was a defect in the options as put: the spacing scale was first offered
as "the same 1.25 ratio, five steps" over the range `0.75–5.86rem`. Those numbers are not a 1.25
scale — they run at ×2.0, ×1.60, ×1.563, ×1.563 — and the arithmetic rules the label out entirely:
five steps at 1.25 span 2.44×, where that range is 7.81× and would need about nine. The
two-steps-per-token resolution above is what preserves the single ratio the option was chosen for.
Rejected with it: nine single-step tokens reaching the same endpoints, rejected because most would
never be referenced and an unused token is the drift a closed primitive set exists to prevent; two
ratios, 1.25 for type and 1.5 for space, rejected as the thing the single-ratio choice was made to
avoid; and keeping the previewed numbers as an admittedly hand-tuned scale, rejected because there
would be no principle to appeal to when a sixth value is wanted.
Reversibility: expensive — this is the visual identity, and Composition, Adapter's metadata, `X4`'s
assembly mechanism and `P2`'s checker are all written against it.

---

### 2026-08-06 — `checkLinks` requests `GET`, not `HEAD`
Context: `/reconcile`. `check-links.ts` issues `method: "GET"` and destroys the response without
reading it. No design or contract text names a request method, and the three existing `checkLinks`
entries cover `fetch`-versus-`node:http`, redirects and the `http:` branch — not this. `HEAD` is the
conventional choice for a reachability check and is the obvious optimisation for a future author to
reach for.
Chosen: Keep `GET` and record why. A host that answers `405` to a `HEAD` is a live site, and the gate
would report `LinkNotOk` against it — a red build naming a working project page, which is a false
result rather than a slow one. The gate's whole claim is that the address answers; `GET` is what
establishes that for every server, and the body is discarded unread, so the cost is one response's
headers and a destroyed socket.
Rejected: `HEAD` — cheaper, conventional, and it transfers no body at all, which is the reason it was
worth checking; rejected because `HEAD` support is optional in practice and a `405` from an otherwise
healthy host produces exactly the false red this gate must not produce. Sending `HEAD` and falling back
to `GET` on a `405` — it recovers the saving and keeps correctness; rejected because it doubles the
request count on the failing path and adds a branch to the one function whose per-target semantics
three acceptance criteria already turn on, to save bytes nobody is paying for on fourteen targets once
per push. Leaving it unrecorded — the reason would then live in the absence of a comment, and a
future author switching to `HEAD` would find nothing to argue with.
Reversibility: cheap — one option object and this entry

### 2026-08-06 — `InvalidYear` takes precedence over `YearAfterBuild`
Context: `/reconcile`. The *Error semantics* rows are not mutually exclusive as written: a `year` of
`99999` is both outside 1000–9999 and greater than `BuildContext.utcYear`, and so is `2026.5`.
`validate.ts` reports only `InvalidYear`, through an `else if`. The contract also says
`validateInventory` reports **all** failures in one `Result`, which reads as requiring both.
Chosen: The contract moves. The `YearAfterBuild` row gains "where `year` is otherwise a valid
four-digit integer", making the precedence explicit. The code is right: both errors would carry the
same `projectId`, the same `field` and no additional diagnosis, and the report exists to tell the
author what to fix. "All failures" means every faulty *value*, not every row a single faulty value can
be made to match.
Rejected: Changing the `else if` to an `if` so both are reported — the literal reading of "all
failures", and the option that needs no document edit; rejected because it produces a strictly worse
error report for one fault and would need a new assertion in S1.8's fixtures to pin behaviour nobody
wants. Leaving both untouched — the table's rows would stay non-exclusive while the implementation
treats them as exclusive, so the next author writing a validator from the table produces different
behaviour and no test catches it, since S1.8 filters by code and does not forbid a second.
Reversibility: cheap — one table cell

### 2026-08-06 — Four stale prose claims close: `R4`'s superseded wording, two counts, and one range
Context: `/reconcile`. The tree showed **no** drift between the implemented modules and the contract —
Content and Verification match `20-contract.md` code-for-code, and `npm run typecheck` and `npm test`
(81 tests, 7 files) are green — but four prose claims across three documents were falsified by
decisions already taken, none of them reachable from the code. `10-design.md` still required the
container's server to add "no header or body of its own", which the `U7` entry had quoted **verbatim**
as unsatisfiable when it reworded `R4` the day before. `10-design.md`'s closing sentence still counted
"two" contract-owned unresolved items with `U9` raised. `20-contract.md` § *Unresolved* still bounded
its stability note to "`U1`–`U6`" while `30-slices.md` cites `U7`. And `30-slices.md` still listed
`P1`–`P5` as blocked by "`U2` alone", the correction `U9` explicitly assigned to this command.
Chosen, on the owner's ruling, four prose edits and no code change: (1) the design's delivery-wrapper
clause names what the server must not choose to send and points at `R4` as the canonical statement,
saying why the absolute version cannot hold; (2) its closing sentence names three items and adds `U9`;
(3) the contract's stability note drops the range and matches `10-design.md`'s own formulation —
numbers are stable and never reused, with no bound to rot; (4) `30-slices.md` splits the bullet, since
`P1` and `P5` are blocked by `U2` alone while `P2`–`P4` need `U9` as well.
Recorded with it: the `U9` entry below asserted that every other item in the design's
Verification-ownership list has a named function. Counting the eleven items against *Public signatures*
found **two** counterexamples — content invariants and derived-value correctness — so the sentence was
narrowed in both the contract and that entry, which was still uncommitted. The gap is unchanged; the
reason for it is now true. The `U9` entry's own forward-pointing note is closed in this same commit,
per `agent.md`'s lesson that a note about another file survives its own resolution.
Rejected: Restoring `R4` to the design's absolute wording so the two agree — it makes the documents
consistent by making the invariant unpassable, which the `U7` entry rejected on the same evidence, and
it relitigates a signed-off decision with nothing new. Marking the design's clause as a known
disagreement and changing no wording — cheaper and it makes the conflict visible; rejected because it
leaves a third statement of one rule to keep in sync, which *Single ownership* forbids, and leaves the
impossible sentence in the document a fresh `/design` or `/redteam` session reads first. Widening the
contract's range to "`U1`–`U7`" — correct today and stale at the next citation, which is the failure
this instance already is. Leaving `30-slices.md` to `/slices` — the narrower reading of this command's
remit; rejected because `U9` named `/reconcile` as an owner of the correction and the 2026-08-05 and
2026-08-06 entries already set the precedent for correcting that document's factual claims in place
without re-slicing.
Reversibility: cheap — prose in four files, no signature and no code touched

### 2026-08-06 — `U9`: accessibility is a contract gap, not a loose word in the design
Context: `/contract` re-derivation. `10-design.md` § *Module boundaries* enumerates what Verification
owns, and **accessibility** is the only item in that list with nothing callable behind it at all. Two
others — content invariants and derived-value correctness — also have no function in `20-contract.md`
§ *Public signatures*, and need none, because each is discharged by a test calling Content's own total
functions. `P2` (greyscale legibility), `P3` (`prefers-reduced-motion`) and `P4`
(focus order and keyboard reachability) are invariants with nothing callable behind them and no
`VerificationErrorCode`. All three are `00-brief.md` *Definition of done* bullets. This is the same
shape as the four orphan codes closed on 2026-08-06, and it survived that pass because that pass
counted error codes against the signature list and these three have no code to count.
Chosen, on the owner's ruling: the contract is short, and the gap is recorded as `U9` rather than
resolved. No signature is written — the design assigns the check to Verification and determines
nothing about its shape, so writing one would be invention. Each of the three is separated by what
would settle it: `P3` is a fork between a static `StylesheetText` check and a computed-style check in
a browser, on the design's own "both are required" precedent for `V13` and `V2`; `P2` needs `U2`,
because there is no palette to compute over and the legibility threshold is authored visual identity;
`P4` needs the browser driver `30-slices.md` already lists as an open decision.
Recorded with it: `30-slices.md` § *Blocked* said `P1`–`P5` were "blocked by `U2` alone", which `U9`
narrows. `/contract` does not edit that document — reported, not corrected; `/reconcile` corrected it
the same day, per the entry above.
Rejected: Striking "accessibility" from the design's Verification list and adding a fourth bullet to
the contract's "deliberately does not encode as build-time checks" list — it is the cheaper
resolution, it costs one word, and it is defensible on the brief's own wording, since the
accessibility bullet is the only *Definition of done* item that does not say how it is asserted while
the two around it do; rejected because the three properties would then never be machine-checked and a
regression in any of them is invisible until someone looks at the page, which is the class of silent
failure `X4` was written to prevent for styling. Writing the three signatures now — it closes the gap
in one pass; rejected because two of the three are underdetermined and the third would embed a
contrast threshold that is `U2`'s to author. Leaving it unrecorded on the grounds that nothing on the
render path is blocked — the exact shape of gap a re-derivation exists to find.
Reversibility: cheap — one Unresolved entry and one headnote clause

### 2026-08-06 — `checkLinks` speaks `http:` so the gate can be tested against a local stub
Context: `/reconcile`. `check-links.ts` selects `node:https` or `node:http` on the target's protocol,
while `AbsoluteUrl` is https-only by contract, so the `http:` branch is unreachable from any real
`ResolvedHome`. It exists because S3.3–S3.6 assert against a stub on `127.0.0.1`, and a TLS stub would
need a certificate the test would then have to trust. Nothing recorded that, so the widening read as
either deliberate or an oversight with no way to tell which.
Chosen: Keep the branch and record it. The https guarantee is `AbsoluteUrl`'s and is earned by
`validateInventory`; `checkLinks` is total on whatever `ResolvedHome` it is handed and asserts nothing
about the scheme. Recorded with it: if the brand is ever dropped or relaxed, this function is the one
that will accept a plaintext URL without complaining, and the compensating control is the type, not
the checker.
Rejected: Rejecting non-https inside `checkLinks` — it makes the module self-defending, which is the
more rigorous option; rejected because it duplicates the `AbsoluteUrl` constraint in a second module,
which *Single ownership* forbids, and it would need a new `VerificationErrorCode` for a condition the
type already prevents. A TLS stub so the branch could be deleted — a self-signed certificate and a
trust override in the test process, to remove three lines. Leaving it unrecorded — the exact shape of
gap this reconciliation exists to close.
Reversibility: cheap — one conditional and this entry

### 2026-08-06 — Two vitest configs are what keep the build network-free
Context: `/reconcile`. `vitest.config.ts` excludes `tests/verification/live/**` and
`vitest.link-check.config.ts` includes only it. That split, not a naming convention or a runtime
guard, is the mechanism enforcing the brief's non-goal that the build reaches no other site: a plain
`vitest run` cannot pick up a networked test, and the networked job cannot pick up anything else. The
rationale lived only in the two file headers.
Chosen: Keep the split and record it, on the same argument the `node:http` entry below makes — a
reason that lives only in a comment dies with the file that carries it, and this one enforces a
binding non-goal rather than an implementation preference. A future consolidation into a single config
with a tag filter or an environment guard has to argue with this entry rather than read the split as
tidying that was never finished.
Rejected: One config with a `--exclude` flag or a test-name filter in the CI job — fewer files, and it
is the conventional shape; rejected because the guarantee then lives in a workflow argument, where
running `npm test` locally would reach the network and nothing would say so. A runtime guard inside the
live test that skips unless an environment variable is set — it keeps one config and one command;
rejected because a check that silently skips is the failure mode `/verify` exists to prevent, and a
green run would prove nothing about whether the gate ran. Leaving it in the file headers only — the
node:http precedent already decided this class.
Reversibility: cheap — two config files and this entry

### 2026-08-06 — The design docs are reconciled against `0.3.0`; four stale blocks and two dead divergence notes close
Context: `/reconcile`. Between them, `U1`, `U3`, `U4` and `U7` being answered on 2026-08-06 falsified
prose in three documents at once, and none of it is reachable from the code — a reader would find it
only by reading each document against the others. `10-design.md` still required two capabilities
"`0.2.0` does not provide", still recorded its *Failure modes* entry as **true today**, and still
listed *Open question 2* as unanswerable. `30-slices.md` still headed two sections "Blocked by `U1`"
and "Blocked by `U3`" and still footnoted that `V3` and `V6` had no callable surface. Separately, two
`Divergence:` notes in `20-contract.md` described design clauses that had already been corrected — one
by the previous `/reconcile`, one by an edit made in this pass.
Chosen, on the owner's ruling, four edits and no code change: (1) the design's package ask and failure
mode state that `0.3.0` delivers all three capabilities, with the `0.2.0` requirement list retained as
the record of what was asked and the failure mode retained because a pin can move; *Open question 2*
is marked answered in the `OQ1` style. (2) The design's closing sentence names the two items still
contract-owned — `U2` and `U6` — rather than a count; the `## Open` item asking for "three" is removed,
since two of the three it would have counted are answered. (3) The attestation clause distinguishes
what the CI provider records (approver, run, instant) from what this repository reads back (commit,
approver), which is what `U3` verified. (4) `30-slices.md` is corrected in place: `U2` is named as the
sole remaining block on the render path, the CI table's blocked-by column and the `V3`/`V6` footnote
are updated, and what the released work becomes is left to `/slices`.
Recorded with it: the verification behind (1) was re-run rather than taken from `U1` — `npm` lists
`0.1.0`, `0.2.0`, `0.3.0` and `gitHead` is `ab44435e3bc1af90509dd0364856a84aa7d932e8`, matching what
that entry claims. The tree itself showed **no** contract drift: every implemented surface in Content
and Verification matches `20-contract.md` code-for-code, and `npm run typecheck` and `npm test` (81
tests, 7 files) are green.
Rejected: Leaving the design alone on the grounds that the contract already carries `0.3.0` with
evidence — cheapest, and the design outranks nothing here; rejected because the design is the document
a fresh `/design` or `/redteam` session reads first, and its *Failure modes* section is exactly where a
reader looks for what blocks the work. Correcting the closing sentence's count to three as the `##
Open` item literally asked — it was written before `U3` and `U7` were answered, so it would have landed
wrong on the day it landed. Leaving `30-slices.md` to `/slices` — defensible, since this command names
only the design and the contract; rejected because it is the document a `/slice` session reads to
choose work, and the 2026-08-05 entry below already set the precedent that `/reconcile` corrects its
factual claims in place without re-slicing. Deleting the superseded `0.2.0` text rather than retaining
it — it is the record of what was asked for and why, and every *Alternatives considered* argument in
the design was written against it.
Reversibility: cheap — prose in three files, no signature and no code touched

### 2026-08-06 — `Attestation` carries no timestamp, because the provider exposes none
Context: `/contract` writing `U3`'s retrieval path. That entry required the API shape to be verified
rather than assumed, and the verification overturned an assumption the type already encoded.
`GET /repos/{owner}/{repo}/actions/runs/{run_id}/approvals` returns `state`, `user`, `comment` and an
`environments` array; the approval object carries **no timestamp**, and the `created_at` and
`updated_at` inside `environments[]` belong to the environment resource, not to the approval. Read
access to the repository is the whole permission requirement, so the `publish` job needs no scope it
does not have.
Chosen, on the owner's ruling: drop `attestedAtUtc`. `Attestation` is `commit` — the run's `head_sha`
— and `approver` — `user.login`. Both are read from the record without inference. GitHub still
records the approval instant in the run and the audit log, which is what the design asks of the
*gate*; it does not require this type to carry all three.
Rejected: Redefining the field as the instant the `publish` job observed the approval — true and
recordable, and it keeps the type shape; rejected because it reads as the approval time and is not,
the gap being however long the run waited to be approved, and a record that invites a wrong reading is
worse than one that omits the fact. Sourcing it from `GET /deployments/{id}/statuses`, which does
carry `created_at` and `creator.login` — the only option that keeps all three fields; rejected because
that status's creator is the run's actor rather than the approver, so the timestamp and the approver
would come from different objects and describe different people. Keeping the field and populating it
from `environments[].updated_at` — the shape fits and the value is wrong, which is the fabricated fact
*Verification* forbids.
Reversibility: cheap — one field, and `V5` never depended on it
Divergence: `10-design.md` says the attestation "records approver, commit and timestamp". The provider
records all three; the type carries two. One clause, `/reconcile`'s.

### 2026-08-06 — Four orphan error codes get producers; `assertAttestation` takes `Attestation | null`
Context: `/contract`. The `## Open` item above reported three `VerificationErrorCode` values with no
producing function. Counting the table against the signature list rather than re-reading the item
found **four**: `AttestationAbsent` was missed because `assertAttestation` exists, and it was not
noticed that a parameter typed `Attestation` can never observe an absent one. `V3`, `V5` and `V6` were
therefore invariants with nothing callable behind them, and the publication CI table in
`30-slices.md` already carried a footnote saying two of its jobs could not run.
Chosen: `assertContentPresent(documentHtml, manifestoSentences, inventory)` for `V3`;
`assertDeploymentCandidateCurrent(commit, branchHead)` for `V6`; and `assertAttestation`'s first
parameter widens to `Attestation | null`, where `null` is `AttestationAbsent`. Two shapes are
deliberate. `assertContentPresent` takes the whole `Inventory`, not a name list, so a caller cannot
discharge `V3` with three names of fourteen, and `manifestoSentences` is a non-empty tuple so an empty
list cannot pass vacuously. `assertDeploymentCandidateCurrent` compares two values and reads nothing,
in the same shape as `assertImageIdentity` — the workflow observes the branch head and passes it in,
which is what lets `V6` be tested with no repository, token or network.
Recorded with it: `assertContentPresent` compares literal text, so a manifesto sentence or project
`name` containing `&`, `<` or `>` will have been escaped by `X5` and will not match. Accepted, because
the failure is a red build naming the value rather than a silent pass.
Rejected: Two functions for `V3`, one per code — it reads tidier and it splits one document read into
two passes over the same string for two faults with one cause and one fix. A `readAttestation` that
performs the API call and returns `Result<Attestation, VerificationError>` — it would produce
`AttestationAbsent` from a real absence rather than from a `null` argument, which is more honest;
rejected because it puts a network call and a token inside the only Verification surface that is
otherwise pure, and `U3` shows the retrieval is not yet fully determined. A branch-head function that
shells out to git or calls the API — same objection, and it makes `V6` untestable without a fixture
repository.
Reversibility: cheap — three signatures, one of which is a widened parameter

### 2026-08-06 — Presentation's stylesheet travels per route, not in `LandingPageConfig.styles`
Context: `U1`'s answer recorded that `0.3.0` carries both a config-level `styles?: readonly string[]`
and a per-route `stylesheet?: string`, and that which one carries Presentation's output was an unmade
contract decision. It was treated as a preference; it is not.
Chosen: the per-route `stylesheet`. `config.styles` is **read by nothing** in the package at `0.3.0` —
verified across every source file at the published commit, the same state `hydrate` is in. Declaring
it would emit no element. The per-route field is also what keeps `X4` a per-document check: a route's
stylesheet is the rules that route's body requires, which is the property the invariant was written
for.
Recorded with it, from the same reading: the package inserts both `body` and `stylesheet` into the
document **unescaped**, and throws a bare `Error` on a stylesheet containing `</style`. Those became
`X5` and `P5` rather than notes, because a build that dies inside `defineLandingPage` reports an error
this contract's semantics cannot reach.
Rejected: `config.styles` — it is the field whose name suggests it, and a single site-wide stylesheet
is one string rather than two; rejected because it is inert, and an inert declaration is worse than an
absent one since it reads as a fact about the emitted document. Declaring both — two copies of the
same rules, and only one of them reaching the page.
Reversibility: cheap for this repository; a package release that wires `styles` does not change it

### 2026-08-06 — The server configuration is emitted beside the output tree, never inside it
Context: `U7` settled the server and left the emitted file's shape to `/contract`. Writing it forced a
question that entry did not anticipate: where the file goes. `ArtifactReport`'s existing fields are
positions inside the emitted tree, so the obvious reading put the configuration there too.
Chosen: outside. `ArtifactInput` gains `serverConfigDir`, `ArtifactReport` gains `serverConfigPath`,
and `R6` asserts the separation. A file the server reads must not also be a file it serves: in-tree,
the instruction that copies documents into the container's web root copies the configuration with
them, and Pages publishes it at the apex. `serverConfig()` takes no argument and is pure, so the text
is assertable before any image exists — which is what makes `R4` checkable rather than only observable
through `V12` once a container is running.
Rejected: Emitting into the output tree — one destination, one report field, no new input; rejected on
the two consequences above, neither of which any existing gate would catch, since byte identity covers
`/` and the unknown-path check covers a path that does not exist. Committing a static configuration
file to the repository instead of emitting it — it needs no Artifact duty at all; rejected because the
file must name `missRootEntry`, which Artifact owns, and the design already refused to split that pair
across modules on the grounds that they drift silently. A `serverConfig(missRootEntry)` taking its own
constant as a parameter — ceremony that lets a caller pass the wrong value.
Reversibility: cheap — one input field, one report field and one invariant

### 2026-08-06 — `U1` verified closed at `0.3.0`; pin it, and `U6` becomes an owner question
Context: The owner reported `U1` done. `AGENTS.md` forbids treating a published artifact as real
before it reports success, and this repository's whole blocked list rests on the claim, so it was
checked rather than accepted.
Chosen: Record `U1` answered and `U4` answered at `0.3.0`. Evidence, in the order it decides the
question: `npm` carries `0.3.0`; its `gitHead` is `ab44435e3bc1af90509dd0364856a84aa7d932e8`, the
release commit, which is what makes the inspected working tree the published source rather than a
guess about it; `LandingPageRoute` is a union whose `LandingPageBodyRoute` carries `body` and an
optional `stylesheet` and has no `entry`; the adapter's `<script type="module">` sits on the
entry-route branch alone; the stylesheet is emitted as `<style>` inside `<head>`. That is all three
requirements, the third of which was only preferred, so `<style>` has a conforming home and the
fallback of carrying it inside the body string is not needed.
Consequences recorded rather than acted on: `U6` is no longer blocked but is not thereby answered —
`socialImageUrl`, `openGraph.imageUrl` and `twitter.imageUrl` are all optional, so whether a social
image asset exists is an owner content decision that now has nothing in front of it. `U5` still holds,
since `noScript` remained optional. `LandingPageConfig` carries a config-level `styles?: readonly
string[]` distinct from the per-route `stylesheet`, and which one carries Presentation's output is an
unmade contract decision.
Rejected: Accepting the report and marking `U1` closed without checking — it is the whole gate on the
publication work, and *Verification* forbids asserting what a command could confirm. Reading only the
type declarations — the shape permits a body route without proving the emitter omits the script, which
is the requirement that actually matters. Trusting the local working tree alone — it sits one commit
past the release, so the `gitHead` comparison is what closes the gap between inspected and published.
Reversibility: cheap to re-verify; the pin is one lockfile entry

### 2026-08-06 — `U7` answered: nginx on alpine, and `R4`'s header clause is reworded to be passable
Context: `U7` blocked Artifact's third duty — the emitted server configuration — because the file's
format belongs to whichever server serves the tree. Settling it also forced a second question: `R4` as
written required the server to add "no header of its own", which nothing can satisfy, since HTTP
requires headers and every server sends an identifier. An invariant nothing can pass is not an
invariant.
Chosen: `nginx:alpine`. `try_files $uri $uri/ =404` with `error_page 404 /404.html` expresses the whole
requirement in two lines, and the config format is the one most likely to be read correctly by whoever
reviews the file Artifact emits. `R4` becomes "adds no response header beyond those the protocol and
the file's content type require", which keeps the intent — no cookie, no tracking header, no rewriting
— without naming a header set that rots at the next base-image bump.
Rejected: Caddy — a shorter config that is harder to get wrong, and header removal is a first-class
directive, which would have made the `R4` question easier; rejected because the Caddyfile is less
widely read than an nginx config and auto-HTTPS has to be explicitly disabled for this use. A minimal
static binary on distroless — the smallest surface and the fewest default headers, fitting "delivery
wrapper and nothing more" most literally; rejected because it adds a less-scrutinised dependency in a
bespoke format nobody reviewing this repository would recognise. For `R4`: an explicit allowlist of
permitted response headers asserted in the image gate — more rigorous, and the gate already runs the
container so the check is cheap; rejected because the list must be revisited on every server bump and
would go red for reasons that are not defects. Keeping `R4` as unasserted intent — byte identity
covers the body only, so an added caching or tracking header would pass every gate.
Reversibility: cheap for the wording; moderate for the server, which fixes the emitted config's format

### 2026-08-06 — `U3` answered: a protected GitHub Environment is the attestation record
Context: `U3` blocked `assertAttestation`'s CI wiring. The `Attestation` type and `V5` were written;
where the record lives, and how the function obtains one, were not.
Chosen: The `publish` job targets an environment with required reviewers. A human approves, and the
provider records approver and timestamp; `assertAttestation` reads the run's approval record and takes
the commit from the run's `head_sha`. It is the only candidate that both **gates** and **records** —
an approval cannot be replayed onto another run, which is `V5` natively rather than by assertion.
Recorded with it: the record binds to a run rather than to a commit, so the commit is derived rather
than stored, and the exact API shape must be verified when `/contract` writes the retrieval path
rather than assumed from this entry.
Rejected: A signed `attestations/<commit>.json` committed per release — auditable forever and
verifiable offline, which was its appeal; rejected on a flaw that is fatal rather than awkward,
because attesting commit X creates commit X+1, so the deployed commit is never the attested one unless
the deploy deliberately runs one behind. It also introduces persisted state into a design whose
*Persisted schemas* section is deliberately "None". A `workflow_dispatch` naming the commit as an
input — the commit binding is explicit rather than derived, which is the one thing it does better;
rejected because it records without gating, so anyone able to dispatch can attest, and making it
actually block publication means adding the environment anyway.
Reversibility: expensive — it fixes where the release gate lives and what `assertAttestation` reads

### 2026-08-05 — `V14`: the image tag gets its own announcement invariant, separate from `V8`
Context: `/contract` re-derivation. `10-design.md`'s *Failure modes* § *The registry push fails* states
"**No image tag is announced**, on the same rule that governs the live URL", and the contract encoded
only the live-URL half — `V8` and the `PollExhausted` row. `V9` covers not *pushing* an ungated image,
which is a different rule: it governs the push, not what is claimed after one fails. The gap is the
only place a full re-derivation found the contract short of what the design determines.
Chosen: A new `V14` — no image tag is stated or implied until the push for that tag has succeeded and
the tag resolves in the registry. Owned by Verification, alongside `V8`.
Rejected: Widening `V8` to name both the live URL and the image tag — fewer rows, and it reads as one
rule because the design derives one from the other; rejected because the two are gated by different
events, `V8` by `pollForCommit`'s exact-marker read-back and this one by the push's exit status, so a
merged row cannot become a single assertion. Leaving the contract unchanged and relying on the design's
failure mode — the rule is written there either way; rejected because the release workflow will be
written from the invariant table, which is where the rule would have been absent.
Reversibility: cheap — one table row

### 2026-08-05 — `checkLinks` uses `node:http`/`node:https`, not `fetch`
Context: `/reconcile`. S3 chose the raw request modules over `fetch` and recorded the reason only in a
comment at the top of `check-links.ts`. The reason is load-bearing: `fetch` with
`redirect: "manual"` yields an opaque, statusless response, so a 301 cannot be told from a 200 by
status code — and S3.4 requires observing the 3xx as a 3xx without following it anywhere.
Chosen: Keep `node:http`/`node:https`, and record it here so a rewrite has to argue with a decision
rather than delete a comment along with the code it explains. The whole 2xx/3xx branch and S3.4 rest
on the raw status being visible.
Rejected: `fetch` with `redirect: "follow"` — it makes the status readable again by resolving the
redirect, and it was the option that would have kept the dependency-free modern API; rejected because
following the redirect changes what the gate asserts, from *this address answers* to *something
answers eventually*, which is a different check that S3.4 was not written for. `fetch` with
`redirect: "manual"` — the opaque response cannot be distinguished from success. Leaving the reason in
the comment only — the comment lives inside the function most likely to be replaced wholesale.
Reversibility: cheap — one module, one test file

### 2026-08-05 — The link check does not run on fork pull requests
Context: `/reconcile`. S3's networked job reads hostnames from `src/content/projects.ts` and requests
each one from a GitHub-hosted runner. On a `pull_request` event from a fork, those hostnames are the
pull request author's to choose — an SSRF-shaped abuse vector. Review on PR #10 caught it and the
follow-up commit added the `if:` guard; no decision was recorded, so the rationale existed only in a
YAML comment and a commit message.
Chosen: Skip `link-check` when the event is a `pull_request` whose head repository is not this one.
It still runs on push and on same-repo pull requests, which is where the deployment gate actually
sits. Recorded with it: the accepted cost is that `V4` does not run for a fork's pull request, so a
fork contribution's link correctness is proved only once it is merged and pushed.
Rejected: Running it on every pull request — the state before review, and it hands an arbitrary
requester a runner that will fetch a host they named. Requiring an environment approval for the job on
fork PRs — it keeps the coverage and costs a human decision on every external contribution, for a
repository that has none. Dropping the job's `pull_request` trigger entirely — it would also stop
gating same-repo branches, which is every branch that exists.
Reversibility: cheap — one workflow condition
Accepted cost: a fork pull request is never link-checked; `AGENTS.md` warns that a check which never
runs can block a pull request permanently, and this one is deliberately not required

### 2026-08-05 — Inventory copy attested: Ogre's Kitchen answered, every year is 2026
Context: `/reconcile` found two claims in the tree that the design had reserved to the owner.
`10-design.md`'s *Open question 3* said Ogre's Kitchen needed a `line` and a `stage` that a model must
not author, and S2 committed both. Separately, `projects.ts` defines one `FOUNDED = 2026` constant and
assigns it to all fourteen projects, so `sinceYear` — the displayed "since" year — has exactly one
possible answer and its derivation is currently nominal.
Chosen, on the owner's confirmation: both stand. The Ogre's Kitchen copy is owner-supplied, so *Open
question 3* is marked answered in the `OQ1` style and retained so its citations resolve. Every
project's recorded year is 2026 and is a fact, not a placeholder, so no code changes and the release
attestation has one less thing to reconcile.
Rejected: Treating the Ogre's Kitchen entry as an S2 defect and reverting it — the correct response if
a model had authored it, and the reason the question was asked before the edit was made. Replacing
`FOUNDED` with per-project literals to make the derivation non-trivial — it is the same fourteen
values written fourteen times, and the design's requirement is that the year be *derived* rather than
typed into copy, which it is.
Reversibility: cheap for the design edit; the years are content and change with the inventory

### 2026-08-05 — `checkLinks` returns no per-target result on failure, and does not follow redirects
Context: `/reconcile`. Two limits of the link gate were real in the code and absent from the contract.
First: `Result`'s error branch carries errors only, so a run with any failing target returns no
`LinkCheckResult` at all — `status` and `attempts` are unreadable exactly where they diagnose
something. S3.5 and S3.6 name `attempts` for a failing target and are met against the stub's own
request and connection counts instead. Second: a 3xx is a pass and the redirect is never followed, so
a subdomain redirecting to a parked page or a registrar hold satisfies `V4`.
Chosen: State both in `20-contract.md` and change no code. The failing target's attempt count and
observed status travel in that target's `VerificationError.detail` and `observed`. `30-slices.md`
gains a note that S3.5 and S3.6 are checkable only from the stub's end.
Rejected: A both-branches return type carrying results alongside errors — it makes the two acceptance
criteria directly assertable, which is the more rigorous option and the one that removes the proxy;
rejected because `Result` is the single error shape every module in this contract returns, and a
bespoke type for one function's diagnostics is paid for at every call site that has to unwrap
something different. Widening `Result` itself to carry partial values — the same cost, spread across
every module rather than one. Following redirects and checking the final status — it would make the
gate detect a redirected-away site, and it costs a hop budget, loop handling, and a changed meaning
for S3.4, for a failure the release attestation already covers.
Reversibility: cheap — two contract paragraphs and one slice note

### 2026-08-05 — `C14`'s importer set names the call-site role, not Adapter specifically
Context: `/reconcile`. `C14` closed the set of `projects` importers to "Adapter … and Verification's
inventory assertion", and Adapter is blocked behind `U1` indefinitely. The implemented set is two test
files, and `tests/content/inventory.test.ts` described itself as "C14's designated call site" while
being neither Adapter nor Verification. The invariant as written was satisfied by neither of its named
importers.
Chosen: `C14` becomes "the `validateInventory` call site — Adapter once it exists, and until then the
committed-inventory assertion — and Verification's assertions over the inventory". The comment in
`inventory.test.ts` is corrected to say it stands in for the call site rather than being it. The
enforcing check is unchanged; when Adapter lands, its expected-importer list gains one entry.
Rejected: Moving `tests/content/inventory.test.ts` under `tests/verification/` so it is a Verification
assertion by location as well as by role — tidier, and it would have made the code compliant with the
sentence as written; rejected because the file asserts S2.1–S2.7, which are content criteria, and
relocating a test to satisfy an invariant's phrasing puts it where nobody looks for it. Leaving `C14`
alone and treating the interim importer as an unwritten exception — the exact shape of gap this
reconciliation exists to close.
Reversibility: cheap — one invariant row and one comment

### 2026-08-05 — "Nothing imports Verification" means no repository module, not no file
Context: `/reconcile`. `20-contract.md` and `10-design.md` both stated the rule absolutely, while
three test files import `src/verification` — they must, to test it. The enforcing check silently
narrowed itself to `src` and justified the narrowing in a code comment, so the invariant that shipped
was not the invariant written down.
Chosen: Both documents state the rule as "no repository module imports Verification; its own tests
necessarily do", and name `src` as the enforcement boundary. The check is unchanged and its
justifying comment shrinks to a pointer, because the rule now says what the code does.
Rejected: Keeping the absolute wording and adding a named list of excepted test files — more rigorous,
and it makes each exception visible; rejected because the list grows with every test file and its only
function would be to re-permit what the rule should never have forbidden. Changing the code to satisfy
the sentence — there is no way to test a module nothing may import.
Reversibility: cheap — two sentences and a comment

### 2026-08-05 — `.claude/session-costs.tsv` is untracked
Context: PR #8 (S2) and PR #9 (the reconcile pass) both touched this file — the `SessionEnd`
hook appends a row per session — and merging #9 into #8's branch produced a real conflict: both
sides had appended disjoint rows since the file's initial commit. Resolved as the union, sorted
by `started`, 7 + 8 overlapping down to 12 rows, none lost. The next two parallel branches would
hit the identical conflict, for the identical reason, forever — the file is local telemetry, not
project content, and nothing reads it back through git.
Chosen: Remove it from tracking (`git rm --cached`) and add `.claude/session-costs.tsv` to
`.gitignore`. The `SessionEnd` hook keeps writing to the same path; only git stops
version-controlling it, and each contributor's local history stays intact.
Rejected: Leaving it tracked and resolving the conflict each time it recurs — cheap once,
compounding every time two branches run a session and merge; the mechanical-conflict cost this
document exists to name. Making the hook append to a per-branch or per-date file instead — solves
the merge conflict but turns one small history into a directory of fragments for a metric nobody
diffs. Deleting the file outright — discards the nine rows already recorded for no reason; the
data is fine, only its presence in git history was the problem.
Reversibility: cheap — re-tracking is one `git add -f` and a `.gitignore` line removed

### 2026-08-05 — `Result` and `Branded` live in Content; `Shared` is a grouping, not a module
Context: `/reconcile`. The contract groups both under a `### Shared` heading that names none of the six
modules the document declares, so neither had a module home. S1 put them in `src/content/types.ts` and
re-exported them, which makes Content's implemented public surface carry two exports the contract's
Content section does not list — and makes "Artifact imports `CommitId` and `parseCommitId` from Content
and nothing else" false the day Artifact is written, since `finalizeArtifact` and `injectBuildMarker`
both return a `Result`. The same applies to every `assert*` in Verification.
Chosen: Content owns both. `Shared` stays a reading aid in the contract with a line saying so. The
import sentences widen: Artifact imports `CommitId`, `parseCommitId` and `Result`; `10-design.md`'s
"Depends on **Content** for the commit-id type only" and the dependency-direction block change to
match. `C1` needs no exception, because a module that owns these types imports nothing to obtain them.
`A3` is deliberately **not** widened — Adapter destructures a returned `Result` and needs no import of
the type name.
Rejected: A seventh `Shared` module — the tidier boundary, and it would keep Content's surface to
Content concepts; rejected because it buys a boundary around two type aliases that carry no behaviour
and that nothing can misuse, at the cost of a carve-out in `C1`, and `AGENTS.md` holds that a rule with
one carve-out is a rule the next author finds a second one in. Reading "and nothing else" as governing
only value imports, since both types are erased at compile time — cheapest, and rejected because the
exemption would be unwritten and unbounded, silently licensing any type-shaped import from Content into
Artifact, which is the door `C14` and `A3` were narrowed to close.
Reversibility: cheap — three sentences, and S1 is small enough that extracting a real `Shared` module
later costs a file move

### 2026-08-05 — `HomeWithinOriginEscape` covers root-relativity, not only origin change
Context: `/reconcile` found the one genuine code-versus-contract divergence in S1. `validate.ts`
rejects a `home.path` that does not begin with `/`, reporting `HomeWithinOriginEscape`. A path of
`lucifer` resolves *within* the parent origin, so it satisfies `C7` and that error row as written and
the code rejects it anyway. The three-clause definition was present in the `RootRelativePath` type row
all along; the error row and the invariant had each kept only one clause.
Chosen: The documents move. The error row becomes "`home.path` is not root-relative, or resolving it
against the parent origin changes the origin"; `C7` regains the two structural clauses. The code keeps
its behaviour, and its `detail` string is corrected — it had asserted that a path "does not resolve
within the parent origin" about paths that do resolve within it.
Rejected: A separate `HomeWithinPathNotRootRelative` code, following the `UnknownPathNotHandled` split
recorded below — the more rigorous option, and rejected because that split separated faults with
different causes and different fixes, whereas these two share both, and it would make S1.3's committed
"twelve remaining `ContentErrorCode` values" a stale count in a merged acceptance criterion. Narrowing
the code to match `C7` exactly — it makes the documents agree by making the code wrong: `home.path:
"lucifer"` would validate and resolve against an undefined base.
Reversibility: cheap — one table row, one invariant clause and one string

### 2026-08-05 — S1's tooling: vitest, the TypeScript compiler API, and strict flags as enforcement
Context: `/reconcile`. S1 added `vitest`, `typescript` and `@types/node` with no decision-log entry,
which `AGENTS.md`'s dependency hard rule requires. Two distinct choices were buried in that: the test
runner, and the mechanism enforcing `C1` — `tests/helpers/import-graph.ts` walks the TypeScript AST, so
`typescript` is a test-time library and not only the compiler. Neither the design nor the contract names
a runner, and every acceptance criterion in all three slices is expressed as a test one runs.
Chosen: Keep both, and record them. vitest is the runner; the TypeScript compiler API is the
enforcement mechanism for `C1` and, per S1.10, S2.8 and S3.7, for `C14` and Verification's boundary
too. Recorded with it: vitest brings **vite** into the dependency tree as test infrastructure — the
design's "this repository owns no build system" is about the site build and is not breached, and this
entry exists so nobody rediscovers the lockfile entry as a design breach. Also recorded: `tsconfig`'s
strict flags are contract enforcement, not style. `exactOptionalPropertyTypes` is the sole mechanism
behind the contract's "absent, never `undefined`-valued", so
`tests/types/optional-properties.type-check.ts` now asserts it — verified by setting the flag to
`false` and confirming three `TS2578` failures, one per optional field, then restoring it.
Rejected: `node:test` — it would keep vite and vitest out of the tree entirely, which reads better
against a design that owns no build system, and it was the serious alternative; rejected because it
means rewriting three merged, green test files for tooling that works, and its thinner assertion
ergonomics would be felt most by the fixture-heavy S1.3 table. An eslint `no-restricted-imports` rule
or dependency-cruiser for the import boundary — either is the conventional choice; rejected because the
AST walk needs no additional dependency beyond the compiler already present, and the "has teeth" cases
in `import-graph.test.ts` show a text-based rule would have flagged specifiers inside comments and
strings. Three separate entries instead of one — more precise per-item reversibility; rejected as a
long log for one slice's scaffolding. Enforcing the optional-property rule inside `validateInventory` —
runtime defence against a fault that cannot reach runtime, since these values come only from
hand-authored source the compiler sees.
Reversibility: cheap for the runner; expensive for the AST mechanism, which three acceptance criteria
ride on

### 2026-08-05 — `30-slices.md`'s staleness is annotated in place, not re-sliced
Context: `/reconcile`. The revision that moved rendering into this repository left `30-slices.md`
committed against the superseded contract. It cited "the four requirements" of `U1` where there are now
three, two of them required; its opening paragraph named the root `404.html`, the build marker and
Composition's route entries as unwritten when the contract writes all three; and its *Blocked* list
still blocks the marker format on `U1`. `parseCommitId` and `C15` belong to no slice at all.
Chosen: Correct the factual claims — the count, and the opening paragraph — and add one note under
*Blocked* naming what the contract has since released. Stating what the contract now covers is
reconciliation; deciding what slice that becomes is not, and this pass does not make it.
Rejected: Fixing the stale count only — the conservative reading of `/reconcile`'s remit, and rejected
because the *Blocked* list is the more consequential half: a miscounted package ask misleads nobody,
while a list that hides contract-ready work stops a session picking it up. Leaving the document
untouched with this report as the record — rejected because `AGENTS.md` names prose in a conversation
as where work goes to be forgotten. Re-slicing the released work here — not this command's, and
`AGENTS.md` reserves to the owner the decision of when a phase repeats.
Reversibility: cheap — one paragraph, one count and one note

### 2026-08-05 — Adapter is the `validateInventory` call site and owns the build's non-zero exit
Context: Answers the `U8` the entry two below left open. The package CLI loads Adapter, Adapter needs
an `Inventory`, and only Adapter or Composition can supply one — a module above Adapter has no channel
to pass a value into a module the CLI imports, so a seventh orchestration module would have to
validate a second time and was not a real third option. Either answer amends the design, because the
design forbids Adapter reading Content *and* says Composition exposes nothing but its two route
entries.
Chosen, on the owner's ruling: Adapter. It constructs `BuildContext` from the environment, calls
`validateInventory(projects, context)`, and on failure reports every `ContentError` and exits
non-zero, rendering nothing (`A5`). `A3` narrows from "reads nothing from Content" to an enumerated
import list — `projects`, `validateInventory`, `BuildContext`, `parseCommitId` — which is checkable at
the import level, where the original prose was not, and preserves the property the design actually
wanted: exactly one path from data to markup. `C14` now names Adapter as the call site. The exit is a
process exit, not a throw, so *Error semantics* holds where a `Result` returned from module evaluation
would have had no caller.
Rejected: Composition holding it — it leaves `A3` untouched, which was the argument for it; rejected
because what gives instead is Composition's "exposes nothing else", and it puts a process exit inside
the one module that is otherwise pure, DOM-free and testable without stubbing anything. A seventh
`Build` module — the tidiest boundary on paper and the option that changes no existing invariant;
rejected because it cannot reach the CLI-loaded module graph, so it buys a module and still leaves the
call site question unanswered. Leaving `U8` open until `U1` releases — the previous position, declined
by the owner; it would have handed a cheaper model an unresolved architectural question at the moment
the package finally moved.
Reversibility: expensive — it fixes where the build reads its environment and where it refuses to build
Divergence: `10-design.md` § *Module boundaries* still says Adapter reads nothing from Content
directly. One clause, `/reconcile`'s to edit; recorded in `20-contract.md` § `U8`.

### 2026-08-05 — The build marker is an HTML comment, injected after the root miss document is copied
Context: `/contract` re-run. The design moved the marker from the package's closed metadata set to
Artifact, which owns the format outright and had no format written down. The requirements are fixed:
the full commit id, non-visual, machine-readable, and extractable from a raw response body with
nothing parsed and nothing executed.
Chosen: `<!-- build-commit: <40 hex> -->`, injected immediately before the first `</head>` of every
emitted document and nowhere else, exactly once. `finalizeArtifact` copies `404/index.html` to
`404.html` **before** injecting, so both documents are marked in the same pass and stay byte-identical
(`R2`). The prefix and suffix are Artifact constants; `readBuildMarker` imports them rather than
restating the pattern.
Rejected: `<meta name="build-commit" content="…">` — it is inspectable in devtools and reads as
conventional; rejected because an unregistered `meta` name is flagged by a conforming HTML validator,
and this design already refused once to ship output it would have to except from validation, when it
kept `<style>` out of `<body>`. Injecting before copying — it also works today and breaks silently the
day a second post-build rewrite lands, since the copy would then miss it. Leaving the format
unresolved — it was blocked only while the package owned it, and leaving it open now would block
`readBuildMarker`, `V1` and the whole read-back for no reason.
Reversibility: cheap — two constants and one insertion rule, with a single reader

### 2026-08-05 — Composition exposes two total functions; the validation call site is left open
Context: The design gives Composition a public surface of "per route, the prerendered body HTML, plus
the stylesheet that body requires" and says it exposes nothing else. It does not say where the
`Inventory` comes from, and it forbids Adapter reading Content — so the `validateInventory` call site
has no named home.
Chosen: `composeApex(inventory: Inventory): ComposedRoute` and `composeMiss(): ComposedRoute`, both
total and neither returning an error. `ComposedRoute.stylesheet` is the route's own stylesheet, not
the union of Presentation's rules, which is what makes the markup/stylesheet agreement check (`X4`)
per document. `BodyHtml` and `StylesheetText` are branded, because both are handed to an external
package as bare strings. Where the `Inventory` is produced is recorded as `U8` rather than answered —
taking it as a parameter means no signature depends on the answer.
Rejected: `composeApex` performing validation itself and returning `Result<ComposedRoute,
ContentError>` — it is the only module that may hold the call under the design's dependency direction,
and it was the leading candidate for that reason; rejected because Composition is evaluated by the
package CLI during a build, where a returned `Result` has no caller, so the choice silently forces
either a throw or a process exit — a decision that belongs with Adapter's entry point, not smuggled
into a render signature. `composeMiss(inventory)` for symmetry — an unused parameter is an invitation
to use it, and `X1` already makes any figure on the miss page a contract amendment. Unbranded
`string` for both values — the package would accept any string at all, including a fragment that was
never composed.
Reversibility: cheap for the brands; `U8` is the expensive half and is deliberately still open

### 2026-08-05 — Content gains `parseCommitId`; Artifact validates the environment's commit through it
Context: Artifact takes the commit from the build environment as a raw string and the design says it
depends on Content for the commit-id type only. Without a shared parser the 40-hex rule would have one
implementation in whatever constructs `BuildContext` and a second inside Artifact.
Chosen: `parseCommitId(value: string): CommitId | null` in Content, named in `C15` as the only
implementation of the pattern. Artifact turns a `null` into `CommitIdMalformed`.
Rejected: Artifact validating the string itself — two copies of one regex, which *Single ownership*
forbids, and the copies would be in the two modules furthest apart in the dependency graph. A
`Result`-returning parser — a second error vocabulary for a single-condition parse, with one caller
that immediately re-wraps it. Adding a matching `parseYear` for symmetry — no second consumer exists,
and the budget rule says not to manufacture one.
Reversibility: cheap

### 2026-08-05 — Verification's new assertions compare exactly, and Artifact gets its own error type
Context: The re-run design added four checks with no contract surface: markup/stylesheet agreement,
built-output self-containment, byte identity between what the image serves and what was emitted, and
an unknown path that must carry both a 404 status and the miss composition. The previous contract
carried one `UnknownPathNotHandled` code for the last of those.
Chosen: Pure `assert*` functions returning `Result<null, VerificationError>` and reporting every fault
in one result, matching the surface already established. `UnknownPathNotHandled` splits into
`UnknownPathStatusWrong` and `UnknownPathBodyWrong`, because a soft 404 and a wrong body are different
defects with different causes. `assertUnknownPathResponse` requires body **equality** with the emitted
miss document, and `assertServedBytesMatchEmitted` compares bytes rather than parsed documents.
Artifact gets its own `ArtifactError`, none of it retryable, including `WriteFailed`.
Rejected: Substring containment for the miss body — it passes on a host that wraps the right
composition in its own error chrome, which is a different page from the one that was verified.
Comparing parsed documents for byte identity — the failure being caught is a transform on one
publication path, and a transform that preserves the parse tree still changes what a crawler receives.
Reusing `VerificationError` for Artifact — Artifact is a build step, not an assertion, and its faults
are answered by fixing the build rather than by failing a gate. Retryable `WriteFailed` — a build that
cannot write its own output directory has an environment fault, and retrying inside the step hides it.
Reversibility: cheap

### 2026-08-05 — Two publication targets: Pages as permanent preview, a container image as the release
Context: The owner stated mid-`/design` that the site is delivered through a docker compose stack and
a container this repository publishes — a requirement absent from `00-brief.md`, which describes a
static site with no server and frames *Definition of done* around a single deployed target. Verified
while assessing it: GitHub Pages is already enabled on this repository (`build_type: workflow`,
source `master`, public, never deployed), and the landing-page package already ships a reusable
Pages deploy workflow.
Chosen: Both targets publish the same emitted tree. Pages is the permanent preview, deployed every
commit; the container image is the release. Byte identity between them is asserted rather than
assumed. The container's server is a delivery wrapper — read-only tree, nothing executed per request,
no state, no added headers — which preserves the intent of the brief's *Environment* sentence while
contradicting its letter. The conflict is recorded in `10-design.md` as a known disagreement; the
brief is the owner's to edit.
Rejected: Pages as scaffolding removed once the container works — cheaper, one gate, no identity
assertion; rejected because a per-commit URL costs almost nothing here and a preview you delete was
never load-bearing. Pages as the release with the container as an extra distribution — the original
single-target design with a container bolted on; rejected on the owner's ruling, and because it leaves
two answers to which target the attestation governs. Treating the container as packaging outside the
design — rejected because the 404 story, the release gate and image identity are all design concerns,
not build details.
Reversibility: expensive — it adds a publication path, a server configuration this repository owns,
and an identity assertion that exists only because there are two targets
Accepted cost: if the preview is ever allowed to drift from the release it is worse than no preview,
because it will be trusted

### 2026-08-05 — The image is gated in CI before publication, never after deployment
Context: The design's release gate — marker read-back and unknown-path check — was written for one
target. A container introduces a second, and the question is where it is proved correct.
Chosen: CI runs the image it just built, polls until the served marker equals the commit, requires a
unique unknown path to return a 404 **status** carrying the miss composition, and compares served
bytes for `/` against the emitted file. Only a passing gate licenses the registry push, so no compose
stack can pull an image that was never run. The gate sits before the human attestation, because it is
hermetic and a failure there means the artifact is wrong — spending the one gate that cannot be re-run
cheaply on an artifact a machine can already prove broken is waste.
Rejected: Gating against the deployed compose instance — proves the actually delivered thing, and was
seriously considered for that; rejected because it needs a network path from CI into the delivery
environment, couples the gate to infrastructure the brief puts out of scope, and publishes the broken
image before anything notices. Both gates — the most rigorous option and it closes the real gap
between *the image is correct* and *the site is serving it*; deferred rather than dismissed, and
nothing here forecloses adding it if the stack becomes reachable from CI. Publishing on a green build
with no image gate — the convention, and it makes the compose stack the first thing to run the image.
Reversibility: cheap — the gate is a CI job

### 2026-08-05 — Image identity is commit identity: GHCR, tagged by full commit id
Context: The design binds the build marker, the attestation and the deployment read-back to the full
commit id. An image carries its own digest and tag, so the two identities have to be related or there
are two answers to what is deployed.
Chosen: Publish to GHCR, tagged with the full commit id — the same value the build marker carries —
plus a moving `latest` for the compose stack's convenience that is never treated as an identity. The
marker inside a served document is therefore checkable against the tag of the image serving it.
Rejected: Semantic version tags — they read better in a compose file, which is a genuine benefit to
whoever maintains one; rejected because it introduces a second identity with a mapping nothing
maintains, and this repository has no release process to produce a version. Docker Hub — credentials
outside the repository's own permission model for no capability GHCR lacks. Tagging only `latest` —
one less thing to think about, and it makes rollback inexpressible and the read-back impossible to
bind to a commit.
Reversibility: cheap — additional tags can be added later; the commit tag is the one that must exist

### 2026-08-05 — Artifact owns the container's server configuration alongside root `404.html`
Context: GitHub Pages serves root `404.html` by host convention. A container has no such convention
and needs explicit configuration to resolve an unknown path to that file with a 404 status. The two
targets reach the same document by different mechanisms.
Chosen: Both belong to **Artifact**. One concern in two files: the first puts the miss document where
a host convention expects it, the second tells a host with no such convention where it is. The image
build and registry push are packaging, not a module — they consume Artifact's tree, import nothing and
are imported by nothing.
Rejected: A separate module for the server configuration — a seventh module for one static file, and
split across modules the two would drift with a silent failure, since a container answering every
unknown path with 200 looks fine until a crawler indexes it. Leaving the configuration to the
deployment environment — it makes correctness depend on something outside this repository that no gate
here can check.
Reversibility: cheap

### 2026-08-05 — The site renders here; the package accepts a body rather than learning to render
Context: `/design` re-run. The earlier design required the external package to emit prerendered
documents, decided before anyone had read the package. Verified against
`subzerodev-platform-ui-landing-page@0.2.0` at `be67a11`: it composes a fixed `<head>`, emits a shell
body of `<div id="root"></div>` plus a module script, and hands that to Vite. No render path, no
React dependency, no server-render step. The route entry it bundles is already consumer-owned code,
so the content is generated here either way. Requiring the package to render means requiring it to
execute consumer entry modules — a rendering framework grafted onto a bundler.
Chosen: This repository renders its composition to HTML and to a stylesheet, and hands both to the
package. The package's obligation narrows to two capabilities: emit a caller-supplied body instead of
the fixed shell, and omit the entry script when one is supplied. It keeps Vite, the shell, the head
and the output tree. Composition's public surface becomes body HTML plus a stylesheet rather than
route entries; Adapter now depends on Composition.
Rejected: Requiring the package to render — the earlier position, rejected because it is a large
feature every consumer pays for, to buy what two optional fields buy. Abandoning the package and
owning emission here — the only option that ships without another repository moving, and the reason
it was seriously considered; rejected because it puts a bundler and an HTML pipeline into the
repository with the least reason to own one, and the duplication is paid forever while the wait is
paid once. Client rendering with a `noScript` line — free for a joke status page, not for the
company's only public statement. Duplicating the manifesto into `<noscript>` — a second copy of every
sentence, which *Single ownership* forbids and `agent.md` records as silently drifting.
Reversibility: expensive — it sets the module boundaries and what the package is asked for
Note: the package declares a per-route `hydrate` flag that nothing reads. Whether it is wired to this
mechanism or removed is that repository's call.

### 2026-08-05 — A post-build Artifact step is owned here, cutting the package ask from four to two
Context: The design's four package requirements included a root `404.html` and injection of the
commit build marker. Neither needs any knowledge of the package: the first copies one emitted file,
the second rewrites a string in the others. The package's head metadata is a closed set with no
element for a marker, so it cannot be route metadata.
Chosen: A new **Artifact** module in this repository performs both over the emitted output, after the
package build and before any verification read. It compiles nothing, bundles nothing and resolves no
module — the moment it needs to, it has become a build system and belongs back in the package. The
package build, Artifact and the offline assertions run sequentially in one CI job over one working
directory, because a job boundary is where a stale or partial output tree becomes invisible.
Rejected: Keeping both in the package ask — tidier on paper, and it leaves this repository owning
nothing after the build; rejected because it doubles the ask and blocks two trivially-solvable
requirements behind another repository's release schedule. Treating the marker as head metadata — the
metadata set is closed, so this collapses into the previous option. Deriving the served commit from
page content instead of a marker — two commits can emit identical copy and a CDN can serve either.
Reversibility: cheap — the step is small and could move into the package later

### 2026-08-05 — The stylesheet is a head element; icons are data URIs in the existing field
Context: Two smaller shape questions fell out of the passthrough decision. The stylesheet has to
reach the document somehow, and the brief requires an icon set with no additional request.
Chosen: The stylesheet is supplied separately and emitted as a `<style>` element in the head. Icons
are embedded as data URIs in the icon `href` the package already emits — no package change, since the
field is a string and a data URI is a URL.
Rejected: Carrying `<style>` inside the prerendered body string — it reduces the package ask to a
single field and keeps markup and stylesheet travelling together, which is where the drift risk is;
rejected because `<style>` is metadata content and is not conforming in `<body>`, and a design that
asserts its own output shape should not ship output it must except from validation. Asking the
package for an icon-embedding mechanism — a third requirement on an awaited release, to buy nothing.
Reversibility: cheap

### 2026-08-05 — Markup/stylesheet agreement is a build-time assertion, not a review habit
Context: Splitting the document into a body string and a stylesheet string, produced by two modules
and reassembled by a third, creates a drift risk this design did not previously have: a class with no
rule, or a rule with no user, and no compiler to notice. A page that silently loses its styling is
indistinguishable from a page that never had any.
Chosen: An assertion that every class referenced in the emitted body has a matching selector in the
emitted stylesheet, and every selector has a user. Failure is a build failure.
Rejected: Reporting it as a warning — an unstyled apex is the failure the whole design exists to
prevent, and a warning in a log nobody reads is how it would ship. Relying on visual review — it
catches the missing rule and never catches the dead one, and it does not run in CI.
Reversibility: cheap

### 2026-08-05 — `40-site.md` citations removed; the rule they quoted lives in this repo's brief
Context: `10-design.md` twice cited `40-site.md` as governing authority. That file does not exist in
this repository. The rule quoted at one site — *nothing may be funnier than it is true* — is in
`design/00-brief.md`. The other, about a parser returning zero slices, describes a markdown parser
this repository does not have and has no local home at all. Both were imported from a sibling
repository's design set, which `AGENTS.md` *What not to do* forbids.
Chosen: Re-attribute the first to the brief, and restate the second on its own terms — an inventory
that reduces to nothing is a fault in the inventory, not a page with no projects on it.
Rejected: Copying `40-site.md`'s text into this repository so the citation resolves — two copies of a
rule is the divergence *Single ownership* exists to prevent. Leaving the citations and adding the
missing file — this repository has no `40-site.md` to write and no reason for one.
Reversibility: cheap

### 2026-08-05 — Content exports the raw `projects` array, guarded by an import rule
Context: `/slices` found that `validateInventory` takes `readonly Project[]` and is described as the
sole entry point into Content's data, while no public signature produces that array. S2 cannot commit
an inventory that CI validates, and Verification cannot read one, without it. The gap blocked S2,
since a slice may not introduce a signature the contract lacks.
Chosen: `export const projects: readonly Project[]` in Content, named as the only unvalidated export
in the contract, plus invariant `C14` restricting its importers to the `validateInventory` call site
and Verification. `validateInventory` stays the sole *validating* entry point. The note also records
that field brands are applied at the authoring site rather than earned there, so the next author does
not read the casts as a defect.
Rejected: Exporting a pre-validated `Inventory` and validating at module load — it makes malformed
content throw at import time, which *Error semantics* forbids outright and which reports the first
failure rather than all of them. Keeping the array module-private and having Content self-validate —
Verification could then not read the inventory the design's dependency direction entitles it to read,
and the S2.1 assertion would have nothing to assert against. Leaving the gap open and letting the
implementing slice invent the export — that is the decision this log exists to take away from a
cheaper model.
Reversibility: cheap — one export and one invariant row

### 2026-08-05 — `<noscript>` is dropped; the brief's Definition of done is the defect
Context: `/contract` found the brief requiring `<noscript>` content asserted against the built HTML
while the design requires a document with no script at all. `<noscript>` renders when scripting is
off, so on a page that needs no scripting there is no fallback for it to describe, and the sentence
`SubZeroDev.Platform` ships would be false here.
Chosen: The owner ruled the brief wrong. The requirement is vestigial — inherited from a
client-rendered status page where it was load-bearing. The contract declares no `noScript` metadata
and asserts nothing about it. The brief edit is the owner's; `00-brief.md` reserves authorship and no
model made it.
Rejected: Changing the design instead and keeping the requirement — `AGENTS.md` gives the brief
precedence, so this was the recommendation, and it was declined because it preserves an element that
exists only to satisfy a checklist. Leaving the conflict standing as unresolved — it is blocked
behind the package gap either way, and an unadjudicated conflict is rediscovered rather than decided.
Reversibility: cheap — one bullet in the brief and one metadata field
Open until done: the `<noscript>` clause is still in `00-brief.md`'s Definition of done

### 2026-08-05 — Content validates once, through a branded `Inventory`, and returns a `Result`
Context: `/contract` forbids bare exceptions and string errors, while the design requires malformed
content to fail the build rather than degrade. Without a type-level gate, every derivation function
would have to re-check the same invariants, and a cheaper implementing model would eventually skip
one.
Chosen: Branded primitives (`ProjectId`, `Year`, `AbsoluteUrl`, `RootRelativePath`, `CommitId`), an
`Inventory` that only `validateInventory` can produce, and a `Result<T, E>` carrying a non-empty
error list. Every other Content function is total on `Inventory` and cannot fail. Build-time inputs
that are not content — the commit id and the build's UTC year — are named once as `BuildContext`.
Rejected: Plain type aliases with the constraints written only as prose — the compiler then permits
an empty string as an id, and the invariant lives nowhere enforceable. Throwing on malformed content
— the idiomatic build-script choice, rejected because the command forbids it and because a thrown
error reports the first failure rather than all of them, which makes fixing an inventory a loop.
Passing the build year as a loose parameter — it would be re-threaded through every call site and
drift from the commit id it is collected alongside.
Reversibility: cheap

### 2026-08-05 — `Genre` is a closed union of `Idea.md`'s seven values
Context: The design types `genre` as "string or absent — from `Idea.md`'s genre table", and declined
to enumerate because inventing genres for the projects the table does not cover would be authoring
brand material.
Chosen: Transcribe the table's seven right-hand values as a closed union. Which project gets which
genre, and whether a project gets one at all, stays authored and unconstrained.
Rejected: An open `string` — it permits a typo and a newly invented genre with equal ease, and the
design's actual concern was invention of *assignments*, not the closure of the set. Enumerating the
table's left-hand column as well — three of its seven rows name a route or a section rather than a
project, so mapping it to `Project` needs judgement this document must not make.
Reversibility: cheap — widening a union costs nothing

### 2026-08-05 — The ecosystem tree carries every stage, including empty ones
Context: The design says the tree is "grouped in `Stage` enum order" and does not say whether a stage
with no projects appears.
Chosen: Exactly one group per `Stage`, in `stageOrder` order, groups may be empty. Whether an empty
group renders is Composition's call.
Rejected: Omitting empty groups — it moves a presentation decision into Content, and it makes the
derivation's length depend on the inventory, so the test for "one group per stage" cannot be written
without restating the filter.
Reversibility: cheap

### 2026-08-05 — Concrete retry bounds for the link check and the deployment poll
Context: The design states that the link checker and the deployment poll use "bounded retry policies
defined in the contract" and gives no values, so the contract must supply them or the gate is
unimplementable.
Chosen: Link check — 3 attempts, exponential 1000 ms to 8000 ms, 10 s per attempt. Deployment poll —
60 attempts, fixed 5000 ms, 10 s per attempt, a five-minute ceiling. A link check is diagnosing a
dead host, where more attempts only delay a true red; a deployment poll is waiting for a publish and
a cache, where the expected outcome is success after a delay.
Rejected: Unbounded polling — the design requires exhaustion to fail the gate. One shared policy for
both — they are waiting on different things, and a single number is wrong for one of them. Leaving
the values to the implementing slice — that is the decision this document exists to remove from a
cheaper model.
Reversibility: cheap — these are two constants and the acceptance criteria do not name the numbers

### 2026-08-05 — The "own subdomain" constraint is attested, not asserted in Content
Context: The design describes `Home.Own` as "an absolute URL to its own subdomain". Checking that at
build time requires Content to know the apex origin, which the design assigns to Adapter, and states
that Adapter and Content do not reach through each other.
Chosen: Content asserts only that the URL is absolute and `https:`. That the host is the project's
own site is covered by the release attestation and by the link check.
Rejected: Duplicating the apex origin into Content so the host can be checked — two copies of the
origin is the drift `AGENTS.md` *Single ownership* forbids, for a check the attestation already
makes. Having Adapter export the origin to Content — it inverts the design's dependency direction.
Dropping the constraint entirely — it is a real rule and belongs written down, just not as a compiler
check.
Reversibility: cheap

### 2026-08-05 — Route documents are self-contained and runtime requests are browser-verified
Context: The brief said both "zero network requests at runtime" and no cross-origin image, while the
design left same-origin styles, scripts and icons unspecified. Built-output inspection also cannot
prove that executable content makes no request.
Chosen: Exclude the navigation document itself and user-initiated navigation, then require zero
additional load-triggered requests. Route HTML contains prerendered content, inline CSS and embedded
icons, with no hydration script or linked runtime asset. A browser network capture is the authority.
Rejected: Allowing same-origin build assets — contradicts the literal zero-additional-request goal.
Static source inspection alone — cannot prove runtime behaviour. Counting outbound-link navigation —
that is a user action, not a request triggered by page load.
Reversibility: expensive — the landing-page package must support the artifact shape

### 2026-08-05 — Deployment identity is embedded; publication atomicity is not assumed
Context: Reading a served page cannot identify its commit when content is unchanged or cached, and a
concurrency group that covers only publication allows a later deployment to race the read-back. The
design also claimed, without a publisher contract, that static publication replaces a whole artifact.
Chosen: Embed the full commit id in every emitted document. One deployment critical section covers a
current-branch-head check, publication and exact-marker read-back; it also verifies a unique unknown
path serves the emitted 404 composition. Until those checks pass, live publication state is unknown
and no atomicity claim is made.
Rejected: Trusting the deploy job result — does not prove what is served. Matching page copy — two
commits can emit the same copy and caches can retain it. Assuming atomic promotion — hosting is out
of scope and no evidence here licenses that guarantee.
Reversibility: expensive — it shapes the artifact and deployment workflow

### 2026-08-05 — Project truth is attested at release, not promised perpetually
Context: A static artifact cannot guarantee that every project statement remains true on every later
day while runtime observation and content derived from sibling repositories are both non-goals. The
earlier brief wording demanded that impossible perpetual guarantee, while the design checked only URL
reachability.
Chosen: For the exact commit being deployed, the author attests every displayed stage and statement
against the current project sites and source material; a separate networked CI stage checks link
reachability. The build remains network-free and does not derive content from those checks.
Rejected: Retaining the day-of-read guarantee — unverifiable after publication. Deriving statuses
from sibling repositories or sites — a binding non-goal. Treating a successful link check as semantic
verification — an HTTP response cannot establish that prose and lifecycle claims agree.
Reversibility: expensive — it defines what the release gate can truthfully guarantee

### 2026-08-05 — The brief was drafted by a model from decisions given in session
Context: `design/00-brief.md` was the unmodified template, and `/design` cannot proceed without one. Five gating decisions were given in conversation, plus `Idea.md` as brand source material. `AGENTS.md` and the brief's own header reserve authorship of the brief to the repository owner.
Chosen: A model transcribed the owner's decisions and the verified facts into `00-brief.md`, drafted the sections the owner had not spoken to, and marked the whole file with a provenance notice naming it as not-yet-authored.
Rejected: Leaving the brief empty and designing from the conversation — rejected because `AGENTS.md` holds that the artifact is the handoff, not the conversation, and a design resting on chat answers no file records is the exact failure the phase order prevents. Also rejected: refusing to write anything and asking the owner to author it first — defensible, and it would have discarded five answered questions to a chat log.
Reversibility: cheap — the notice names what to rewrite, and nothing downstream has been built on it yet

### 2026-08-05 — Prerendered HTML is required; client rendering is treated as a package gap
Context: The apex's substance is prose for people and crawlers. The landing-page package as `SubZeroDev.Platform` consumes it renders client-side — its adapter declares `noScript: "This site needs JavaScript to render the status page."` For a status page that is invisible; for the company's only public statement of what it is, addressed to recruiters and clients, it means the substance is absent from the served HTML.
Chosen: Require prerendered output. If the package cannot produce it, state the requirement and stop, following the precedent set by Platform's L2 — *"L2 states what this consumer requires and stops until a released version provides it."*
Rejected: Client rendering with a `noScript` line, as Platform ships — the trade that is free for a joke status page is not free here. Duplicating the manifesto into `<noscript>` — it works and creates a second copy of every sentence, which `AGENTS.md` *Single ownership* forbids and `agent.md` records as silently drifting. Abandoning the package and hand-writing HTML — re-creates the integration the package exists to own.
Reversibility: expensive — it decides whether a package slice is needed before this site can ship

### 2026-08-05 — Project status is an authored lifecycle stage, never observed liveness
Context: The ecosystem list keeps every entry from `Idea.md` and labels each with a true status. The verified live states are excellent material — `portfolio.subzerodev.com` returns 200 reading *"No Portfolio Data Found."*, `build-agent.subzerodev.com` serves the unmodified Docusaurus template — and the house rule is that nothing may be funnier than it is true.
Chosen: `stage` is a position in `Idea.md`'s own lifecycle — Curiosity, Prototype, Architecture, Infrastructure, Reusable, Escaped. Liveness is handled separately as a CI link check, so the page never makes a claim about a host.
Rejected: A liveness or health field — the funnier option, rejected because a hand-authored liveness claim becomes a lie the day the thing is fixed and nothing in a static site with no build-time network can notice; a joke with an expiry date nobody watches is the defect that rule names. Deriving status from the sibling repositories — stays true, and is a brief non-goal: it makes the build depend on twelve repositories' formats or on the network. Inventing a status vocabulary — rejected because the brand document already contains one, and two vocabularies for one idea is the drift `AGENTS.md` *Single ownership* exists to stop.
Reversibility: expensive — it is the shape of the page's central data and every rendered count derives from it
Accepted cost: the funniest true sentences available today do not appear on the site

### 2026-08-05 — A project's home is a three-case union, not a URL
Context: `Idea.md`'s product list includes entries that do not have a site. Verified: Lucifer Chronicles is a series on `blog.subzerodev.com`; Ogre's Kitchen has no repository and no subdomain.
Chosen: `home` is one of *own subdomain*, *within a parent project at a path*, or *none*.
Rejected: A nullable URL — collapses "lives inside the blog" into "has no home", which is false for Lucifer Chronicles. Dropping the homeless entries — loses the two most characterful names, and the decision to keep the full list was already taken. Giving them placeholder URLs — a link that 404s is worse than an honest absence.
Reversibility: cheap

### 2026-08-05 — The apex's genre is "no genre" — the plain document
Context: `Idea.md`'s *Every Product Has A Genre* assigns a genre to seven products and leaves SubZeroDev itself blank. The page composition hangs off this.
Chosen: The apex is the parent voice unstyled — typography, whitespace, the words. Every child takes a genre from it; it takes none.
Rejected: A containment log ("experiments that repeatedly escape containment") — strong material and the phrase is the owner's, rejected as too close to Platform's incident register, which would make the two read as one voice in two fonts. A deadpan company prospectus — parody of a genre is a louder joke than *"never exaggerate, reality already did"*. A museum specimen catalogue — needs an illustration language the visual identity rules out.
Reversibility: expensive — it determines the visual language and the page composition

### 2026-08-05 — Consume the landing-page package rather than Docusaurus or hand-written HTML
Context: This repository needs a static build. Twelve project sites already run Docusaurus; `SubZeroDev.Platform` proved consumption of the reusable package end to end in its L2 slice.
Chosen: The package, through its custom `defineLandingPage` adapter — not its generic README renderer.
Rejected: Docusaurus — it is what the twelve children run, and the apex would arrive looking like a thirteenth documentation site with a sidebar and navbar chrome; fighting a docs shell to reach a plain document is more work than not using one, and it makes the parent resemble its own children. Hand-written static HTML with no build — no tests, and every derived count becomes a typed number the brief forbids; it also re-creates the integration the package was extracted to own.
Reversibility: expensive

### 2026-08-05 — One document plus a 404, not a route per section
Context: The apex's genre is the plain document, and the content divides naturally into manifesto, philosophy, principles and ecosystem.
Chosen: Two routes — `/` and `/404`.
Rejected: Separate `/manifesto`, `/projects` and `/philosophy` routes — a document is one thing, and splitting it produces a small site, which is what every child already is; it would also add navigation chrome the visual identity rules out. No 404 route at all — the one page guaranteed to be seen by someone who mistyped, and off-voice by default.
Reversibility: cheap

### 2026-08-05 — One fixed slogan and one footer quote, not rotation
Context: `Idea.md` enumerates fourteen slogans and four footer quotes, and designates a primary of each.
Chosen: The designated primary slogan and the SubZeroDev footer quote, each a single named constant.
Rejected: Rotating per load — very on-brand, and it makes the page non-deterministic so built-output assertions cannot name the tagline; a slogan seen one time in fourteen is not a brand statement, and randomness would be the only client-side computation in the design.
Reversibility: cheap

### 2026-08-05 — Domain, DNS, TLS and hosting are out of scope
Context: Verification found the apex answering nothing while every subdomain served. The owner ruled the whole area out of scope mid-design.
Chosen: Removed as a failure mode, an ordering constraint and an open question. The design assumes only a publishable target, and no acceptance criterion depends on how an address reaches it.
Rejected: Carrying it as a precondition with the fix reserved to the owner — the earlier draft's position, rejected on the owner's instruction. Recorded rather than dropped silently, per `AGENTS.md`, so a future reader does not rediscover the apex's state as a design gap.
Reversibility: cheap

### 2026-08-05 — agent.md seed kept in full, no lessons pruned
Context: INSTALL.md directs pruning the seeded agent.md at install time, proposing deletions for lessons that demonstrably do not apply. This repo's actual stack, beyond consuming `SubZeroDev.Platform.UI.LandingPage`, is not yet decided.
Chosen: Kept every seeded lesson; none could be ruled out with the site's tooling still undecided.
Rejected: Pruning speculatively — rejected per `AGENTS.md`'s own budget-discipline rule against manufacturing findings; a lesson that turns out inapplicable is easy to delete once the stack is real.
Reversibility: cheap

### 2026-08-05 — Installed SessionEnd/UserPromptSubmit hooks for Measure-Session.ps1
Context: Fresh install into an empty repo; `INSTALL.md` permits installing these two hooks when `settings.json` is absent and `pwsh` 7 is on `PATH`.
Chosen: Wrote `.claude/settings.json` containing only the `SessionEnd` and `UserPromptSubmit` hook keys, running `tools/Measure-Session.ps1 -Hook` and `-Watch` respectively.
Rejected: Skipping the hooks and installing the script only, to add hooks later once a real workflow exists to measure — rejected because there was no conflicting `settings.json` to worry about and the reporting helper is low-cost from day one.
Reversibility: cheap

### 2026-08-05 — AGENTS.md holds the contract, CLAUDE.md is a pointer
Context: Neither file existed in this new repo. `INSTALL.md`'s default for that case is `AGENTS.md`-as-content, `CLAUDE.md`-as-pointer, with a project-identity section describing what the repo owns.
Chosen: Installed the kit's `AGENTS.md` with a Project identity section stating this repo hosts `SubZeroDev.com`, consumes the `SubZeroDev.Platform.UI.LandingPage` package for UI, and carries its own site-level configuration on top of it. `CLAUDE.md` is the `@AGENTS.md` pointer.
Rejected: Inverting the direction (`CLAUDE.md` as content) — no reason favoured it in a fresh repo with no prior convention.
Reversibility: expensive once other files reference the pointer; cheap right now

### 2026-08-06 — Browser driver and load mechanism for S8's request capture
Context: `S8.1` requires this decision logged before any code is written. `V2` needs a real browser to
prove a route document triggers zero requests beyond the navigation document itself — source
inspection (`assertSelfContained`, S6) cannot prove runtime behaviour on its own.
Chosen: Playwright, driving Chromium headless, loading the built tree from a local static HTTP server
(not `file://`). The server is minimal CI-only test scaffolding — no new runtime dependency — that
mirrors the `try_files $uri $uri/ =404` shape `serverConfig()` already writes for the container, so the
capture observes the document under roughly the same serving semantics it will actually be published
under. `page.on("request")` records every load-triggered request; the navigation itself is recorded
separately with `initiatedByTester: true`.
Rejected: Puppeteer — Chrome-only, no material advantage over Playwright for a single-browser capture,
and a less direct request-list API for this shape of check. `@vitest/browser-playwright` (already an
optional peer of the installed `vitest` per `package-lock.json`) — built for in-browser
component/unit testing, not a standalone navigation-and-capture check against a finalized static tree;
using it here would mean fighting a test-runner integration for a job a plain Playwright script does
directly. `file://` — its origin semantics differ from http(s) (no real same-origin model, some
relative-path and MIME behaviour differs), which risks the capture not matching what the container and
Pages actually serve.
Reversibility: expensive — `V2`'s only authority is this capture, and every later slice that reads a
browser-verified fact (`P4`, `V13`'s browser half) inherits the same driver.

### 2026-08-06 — A document with no declared icon does not trigger an auto-favicon request
Context: `S8.5` (closing [issue #16](https://github.com/The-Running-Dev/SubZeroDev.com/issues/16) —
`30-slices.md`'s own text at `S8.5` misnames it `#17`, which is a different, unrelated issue; noted as
a drift for `/reconcile`, not corrected here). `U2` relied on the declared data-URI icon to suppress a
browser's automatic `/favicon.ico` request, but that reasoning was unverified.
Chosen: Verified against Chromium headless (this slice's driver, `90-decisions.md` above) with a
served document carrying no `<link rel="icon">` at all: the browser issued no `/favicon.ico` request —
only the one navigation request appeared in the capture. The declared icon is therefore a brand
choice, not a `V2` requirement.
Rejected: n/a — this is a verified fact about browser behaviour, not a choice between alternatives.
Reversibility: cheap — a future browser or driver change could alter this, and it would be re-verified
the same way

### 2026-08-06 — S8.6 demonstrated: both self-contained halves go red together
Context: `S8.6` requires demonstrating, verifying and reverting a temporary external-stylesheet route
change before merge — not a committed test.
Chosen: Added `<link rel="stylesheet" href="https://example.com/style.css">` to the built
`site/dist/index.html` after a fresh `npm run build`, then ran `vitest.build.config.ts`. Both halves
went red on the same change: `assertSelfContained` (S6.9's apex case) returned `LinkedStylesheetPresent`,
and S8.2's browser capture picked up the extra request and failed its `toHaveLength(1)` assertion. The
change was reverted by discarding `site/dist` and rebuilding; the full build-config suite (33 tests, 6
files) passed clean afterward.
Rejected: n/a — a demonstration, not a choice.
Reversibility: cheap

### 2026-08-05 — Kit install into a new, empty repository
Context: `/install SubZeroDev.com` was run before the repository existed. It was created and git-initialized as an empty repo, so every kit artifact classified as Absent — no reconciliation was needed.
Chosen: Installed `AGENTS.md`, `CLAUDE.md`, `agent.md` (seed kept in full, see below), all `.claude/commands/*.md`, `tools/Measure-Session.ps1` and `tools/Wait-PullRequestCheck.ps1` (with their `.Tests.ps1` companions), `design/` seeded from `templates/design/`, `.github/ISSUE_TEMPLATE/{bug,story}.md`. `codex/PROFILES.md` skipped — no evidence of Codex use.
Rejected: n/a — nothing diverged, nothing was occupied.
Reversibility: cheap

### 2026-08-13 — Kit upgrade from 3624e16 to 6bdd8dc
Context: `/install SubZeroDev.com` re-run to bring the target current with the kit. Since the 2026-08-05 install the kit added the core/companion split for command files, the design-freeze mechanism, `/done`, `/kit-sync`, vendor model aliases, and several `AGENTS.md` clarifications.
Chosen: Took every core command file and `.claude/COMPANIONS.md` outright per `Sync-Kit.ps1`'s report. Merged `AGENTS.md` additively — every kit addition since `3624e16` was new content; none conflicted with the target's existing project-specific rules, so nothing was dropped or overridden.
Rejected: n/a — no target rule conflicted with a kit update; this was a clean upgrade, not a fork.
Reversibility: cheap
