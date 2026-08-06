# Decision log

Append-only. Newest at the top. The rejected alternatives are the point — without them, every future session relitigates the same choice.

## Open
<A staging area, not a home. Things noticed mid-slice that were deliberately not acted on. `/track` turns each into a GitHub issue and removes it from here. An item that is a *decision* rather than a *todo* belongs below as an entry, not in an issue.>

(none — both prior items became [#16](https://github.com/The-Running-Dev/SubZeroDev.com/issues/16)
and [#17](https://github.com/The-Running-Dev/SubZeroDev.com/issues/17) on 2026-08-06)

---

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
