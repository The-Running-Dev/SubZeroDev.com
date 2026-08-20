# Slices — SubZeroDev.com

Derived from [`10-design.md`](10-design.md) and [`20-contract.md`](20-contract.md). Where this
document and the contract disagree, one of them is a defect; say which rather than reconciling.

## How this document is kept

Two sections carry slices, and the difference between them is what a reader may assume.

**[`## Outstanding`](#outstanding) is specification.** A slice there has not shipped. Its `Acceptance:`
criteria are live claims, an implementing agent works against them, and `/track` syncs only these.

**[`## Landed`](#landed) is record.** A slice there shipped, and its criteria state what was accepted
**at merge** — not what is true today. Later work has withdrawn parts of several of them; the index
below names every such supersession, so a reader meets the correction before the criterion.
**Nothing under `## Landed` is re-derived, re-run, or reported as drift.**

**The criteria bodies are kept rather than retired, and that is a departure from the kit's default.**
That default is that a landed slice's body goes once its issue closes
([`.claude/commands/track.md`](../.claude/commands/track.md)). Here the bodies stay, because **211
citations across 63 files** name an individual criterion id as the reason that file exists —
`tests/verification/style-agreement.test.ts` cites `S4.11` and `S4.12`, `src/presentation/types.ts`
cites `S4.14`, `.github/workflows/ci.yml` cites `S10.5` through `S10.10`, and every `vitest.*.config.ts`
names the criterion its shard runs. Retiring the bodies would turn all 211 into references to ids this
document no longer contains, which [`agent.md`](../agent.md) § *Drift* records as the failure that is
invisible. Landed sections are demoted to `###` instead, so what a tracker parses as the slice set is
the index table and the `## Outstanding` entries alone.

**Ids are never reused and never renumbered.** Removing `S3.2` leaves a gap; the next criterion is
`S3.4`. A criterion later work has falsified — `S11.15` is the one that has — **keeps its id and its
wording**, and the supersession is recorded against it rather than by editing it. Renumbering silently
rewrites what an existing citation refers to, which is the one failure this scheme exists to prevent.

**A re-run appends.** New slices go under `## Outstanding` at the next free number. `## Landed` is not
rewritten and no retired id is reused, even for a slice that never got an issue.

Two rules bind a new slice, and they are why the landed set is shaped as it is:

- **Slices are vertical.** Each goes from entry point to persistence and leaves the system runnable. A
  slice that only adds a layer cannot be run, so it cannot be verified, so it accumulates undetected
  error. A static site with no runtime has two observable ends — a served document and a CI outcome —
  and both count as an end.
- **The riskiest assumption is exercised earliest.** `S6` carried this set's largest bet — that a
  bundler hands back a self-contained document — and `S4` and `S5` were the shortest path to running
  that bet rather than arguing it. `S6` could not move earlier: the package cannot be handed a body
  until there is a body, and `A4` requires both routes declared at once.

**Issues are disabled on this repository**, so no slice here has a tracker item and `/track` has
nothing to sync. Deferred work stays in [`90-decisions.md`](90-decisions.md) § *Open* instead. That is
a standing condition, not a gap this document can close.

---

## Landed

Twelve slices have landed. Each row names the pull request that merged it and what has changed
underneath it since; an em dash means the slice's criteria still describe the tree.

| Id | Name | Merged | Superseded since |
|---|---|---|---|
| **S1** | Repository scaffold and the content gate | [#7](https://github.com/The-Running-Dev/SubZeroDev.com/pull/7) | `ContentErrorCode` has grown from the thirteen `S1.3` counts against to nineteen — five testimonial codes with `S11`, and `TestimonialUrlInvalid` with the 2026-08-20 citation ruling |
| **S2** | The project inventory | [#8](https://github.com/The-Running-Dev/SubZeroDev.com/pull/8) | The `projects` export this slice's `Touches` names is **gone**: the records moved to `site/projects.json`, reachable only through `projectsDocumentValidator` (2026-08-11, [#83](https://github.com/The-Running-Dev/SubZeroDev.com/pull/83)). `S2.8`'s import check is now over the two document validators, which is `C14` as rewritten 2026-08-20 |
| **S3** | Outbound link verification | [#10](https://github.com/The-Running-Dev/SubZeroDev.com/pull/10) | — |
| **S4** | The visual language and the miss page | [#27](https://github.com/The-Running-Dev/SubZeroDev.com/pull/27) | `PrimitiveName` is closed at **twelve**, not the six `S4.3` counts: `row` and `bar` (2026-08-07), `grid` and `card` (2026-08-08, `S11.3`), `view` (2026-08-10) and `link-current` (2026-08-13). `S4.9`'s single `--font-mono` user is unchanged and is still `meta` |
| **S5** | The apex composition | [#28](https://github.com/The-Running-Dev/SubZeroDev.com/pull/28) | `composeApex` takes `(inventory, testimonials, origin)` since 2026-08-10; `S5.5`–`S5.10` name the two-parameter form. The apex carries four sections rather than the three this slice composed |
| **S6** | The emitted document | [#30](https://github.com/The-Running-Dev/SubZeroDev.com/pull/30) | The pin `S6.1` names is **`0.4.1`**, not `0.3.0` (2026-08-11), and the default export is a `LandingPageDataConfig` built by `defineLandingPageData`, so `A5`'s refusal is the package loader's rather than Adapter's. `S6.7`'s `projects` import is now the two document validators. `S6.3`'s two-route count went to three under `S11` and is two again. **Its route copy is still placeholder text — that is [`S13`](#s13--the-apexs-real-title-and-description)** |
| **S7** | The publishable tree | [#31](https://github.com/The-Running-Dev/SubZeroDev.com/pull/31) | — |
| **S8** | The browser request capture | [#32](https://github.com/The-Running-Dev/SubZeroDev.com/pull/32) | `S8.5` names issue #17; the issue it actually closed is [#16](https://github.com/The-Running-Dev/SubZeroDev.com/issues/16), recorded 2026-08-06. The finding it reports — no automatic `/favicon.ico` request — is unaffected |
| **S9** | The container image and its in-CI gate | [#34](https://github.com/The-Running-Dev/SubZeroDev.com/pull/34) | — |
| **S10** | Publication | [#35](https://github.com/The-Running-Dev/SubZeroDev.com/pull/35), [#45](https://github.com/The-Running-Dev/SubZeroDev.com/pull/45) | — |
| **S11** | The testimonials route | [#66](https://github.com/The-Running-Dev/SubZeroDev.com/pull/66), [#73](https://github.com/The-Running-Dev/SubZeroDev.com/pull/73) | **The route is withdrawn** (2026-08-10, [#77](https://github.com/The-Running-Dev/SubZeroDev.com/pull/77)). `composeTestimonials` is now `renderTestimonials`, composing one section of the apex; `testimonialsPath` and the third route are deleted. `S11.11`'s three route entries are two, and **`S11.15` asserts the opposite of the tree** — `tests/types/route-path.type-check.ts` pins `RoutePath` to two members. `S11.3`'s ten primitives are twelve. Its `Touches` line counts three new error codes where `S11.1` names five. What survives untouched: the collection, `validateTestimonials`, `testimonialTotal`, `grid`, `card`, the escaping and the content-agnosticism suite |
| **S12** | The inline enhancement script | [#76](https://github.com/The-Running-Dev/SubZeroDev.com/pull/76) | **The fold went with the route** (2026-08-10, [#77](https://github.com/The-Running-Dev/SubZeroDev.com/pull/77)): `foldRoutes` is deleted and `enhancementScript()` is emitted into one apex body, not two folded ones, so `S12.3`'s three emitted documents are two. The view switch `S12.6` names was removed with it and then **restored** as the `view` primitive's `:target` rules ([#79](https://github.com/The-Running-Dev/SubZeroDev.com/pull/79), adjudicated 2026-08-20), guarded by `tests/build/section-layout.test.ts` rather than by `:has()`. The search box, stage chips, detail overlay, manifesto layout and every criterion from `S12.7` to `S12.10` survive as written |


The twelve bodies follow, verbatim as merged. **Read the index above first** — several criteria below
were true when they were accepted and are not true now, and none of them has been edited to hide that.

---

### S1 — Repository scaffold and the content gate

Delivers: The repository becomes a real TypeScript project that typechecks, tests and reports in CI
for the first time, and it gains the one thing everything else depends on — a single validator that
reads a set of project records and either hands back a checked inventory or refuses it, listing every
problem it found rather than stopping at the first. From here on, malformed content stops the build
instead of quietly producing a wrong page.

Touches: Content — `Branded`, `Result`, `ProjectId`, `Year`, `AbsoluteUrl`, `RootRelativePath`,
`CommitId`, `Stage`, `Genre`, `Home`, `Project`, `Inventory`, `BuildContext`, `ContentErrorCode`,
`ContentError`, `stageOrder`, `validateInventory`. Repository scaffold — `package.json`,
`tsconfig.json`, test runner configuration. CI — one workflow running typecheck and tests.

Depends on: none.

Acceptance:
  - S1.1 `stageOrder` has length 6 and equals `["Curiosity", "Prototype", "Architecture", "Infrastructure", "Reusable", "Escaped"]`, and a test asserts every `Stage` member appears in it exactly once.
  - S1.2 `validateInventory([], context)` returns `{ ok: false }` carrying exactly one error, with `code: "EmptyInventory"`, `projectId: null` and `field: null`.
  - S1.3 Each of the twelve remaining `ContentErrorCode` values has a fixture that provokes it and a test asserting the returned error's `code`, `projectId` and `field` equal that code's row in the contract's *Error semantics* table.
  - S1.4 A fixture carrying three distinct faults returns three errors in one `Result`; no test observes only the first failure.
  - S1.5 A valid fixture returns `{ ok: true }`, and a type-level test fails typecheck if a raw `readonly Project[]` is passed where `Inventory` is required — so the brand cannot be dropped without CI noticing.
  - S1.6 A fixture whose `escapedFrom` edges form `a → b → c → a` returns `EscapedFromCycle` with one error per project on the cycle.
  - S1.7 A `within` home with path `/blog/lucifer` against parent origin `https://blog.subzerodev.com` validates; the same home with path `//example.com/x` returns `HomeWithinOriginEscape`; a `within` home whose parent's own `home.kind` is `"within"` returns `HomeWithinParentNotOwn`.
  - S1.8 `year` equal to `BuildContext.utcYear` validates; `utcYear + 1` returns `YearAfterBuild`; `999` and `2026.5` each return `InvalidYear`.
  - S1.9 A CI workflow runs typecheck and the test suite on push and on pull request, is green on this slice's head commit, and is demonstrated red by a temporary commit that breaks one assertion — verified and reverted before merge.
  - S1.10 Content imports no other repository module, asserted by a check over Content's import graph that fails when such an import is added.

Out of scope: The real project inventory — S1 ships fixtures only. Every derivation function
(`projectTotal`, `countByStage`, `ecosystemTree`, `contaminationForest`, `sinceYear`,
`resolvedHomes`). Presentation, Composition and Adapter. Adding
`SubZeroDev.Platform.UI.LandingPage` as a dependency — Content depends on nothing, so this slice does
not touch the version question `U4` leaves open. Anything that emits HTML.

---

### S2 — The project inventory

Delivers: The real list of projects lands in the repository — every product named in `Idea.md`'s
ecosystem, plus the subdomains that actually serve, each carrying the year it began, where it sits in
the lifecycle, where a visitor goes, and which project it escaped out of. This is the record this
repository keeps about repositories it does not own, which makes it the highest-stakes content on the
site; from this slice on it is checked by the validator on every commit rather than by eye.

Touches: Content — the inventory source and its `projects` export. CI — the existing job now validates
the committed inventory, not only fixtures.

Depends on: S1, and on owner-supplied copy. Each project's `line`, `question`, `stage` and `genre` are
brand material the design's *Open questions* 3 and 5 reserve to the owner. An implementing agent that
reaches a project with no supplied `line` or `stage` stops and asks; it does not invent one.

Acceptance:
  - S2.1 `validateInventory(inventory, { commit, utcYear })` over the committed inventory returns `{ ok: true }`, asserted by a test that CI runs on every push.
  - S2.2 Every product named in `Idea.md`'s *Product Ecosystem* block — Game Engine, Platform, Publishing, Automation, Documentation, Lucifer Chronicles, Ogre's Kitchen — appears in the inventory exactly once, asserted by name.
  - S2.3 Every project with a live subdomain carries `home.kind === "own"` with an `https:` URL, and the twelve verified subdomains each appear exactly once across the inventory's `own` homes.
  - S2.4 Lucifer Chronicles carries `home.kind === "within"`, its `parent` names the blog project, and the blog project's own `home.kind` is `"own"`.
  - S2.5 Ogre's Kitchen carries `home.kind === "none"`.
  - S2.6 No `home.url` in the inventory has host `schemas.subzerodev.com`, which does not resolve.
  - S2.7 At least one project's `escapedFrom` names a project that itself carries an `escapedFrom`, so *Cross Contamination* is a chain in the data rather than a single edge.
  - S2.8 The import-graph check S1.10 introduced is extended to `C14` and fails when any module other than the `validateInventory` call site or Verification imports `projects`, demonstrated by a temporary import that turns it red — verified and reverted before merge.

Out of scope: `line`, `question`, `stage` and `genre` values — transcribed from what the owner
supplies, never authored by the implementing agent. Any liveness claim: `stage` is a lifecycle
position and the inventory says nothing about whether a host answers. Every derivation function.
Rendering. Checking that any URL responds — that is S3.

---

### S3 — Outbound link verification

Delivers: Every address the release will send a visitor to is checked by CI before the release can be
published, and the check goes red when one of them stops answering. It runs on the network, after the
network-free build, so the build never reaches another site and no content the site shows is derived
from what a check found. The Pages preview is development output and does not wait on this gate.

Touches: Content — `ResolvedHome`, `resolvedHomes`. Verification — `RetryPolicy`, `linkCheckRetry`,
`LinkCheckResult`, `checkLinks`, `VerificationError`, and the `LinkUnreachable` and `LinkNotOk` codes.
CI — a networked job, separate from the network-free build job.

Depends on: S2.

Acceptance:
  - S3.1 `resolvedHomes(inventory)` returns one entry per `own` home and one per `within` home and none for a `none` home; for a `within` home the returned `url` is the parent's origin with the path applied, so Lucifer Chronicles resolves to `https://blog.subzerodev.com` plus its path.
  - S3.2 `linkCheckRetry` equals `{ attempts: 3, backoff: "exponential", initialDelayMs: 1000, maxDelayMs: 8000, attemptTimeoutMs: 10000 }`, asserted field by field.
  - S3.3 Against a local stub answering 200, `checkLinks` returns `{ ok: true }` with one `LinkCheckResult` per target, each carrying `status: 200` and `attempts: 1`.
  - S3.4 Against a local stub answering 301, `checkLinks` returns `{ ok: true }` for that target.
  - S3.5 Against a local stub answering 500, `checkLinks` returns `{ ok: false }` with a `LinkNotOk` error naming that target, and that target's `attempts` is 1 — the code is not retryable.
  - S3.6 Against a local address that refuses connection, `checkLinks` returns `{ ok: false }` with `LinkUnreachable`, and that target's `LinkCheckResult` carries `status: null` and `attempts: 3`.

> **S3.5 and S3.6 name a value the contract does not return — reported by `/reconcile`, not
> re-sliced.** `Result`'s error branch carries errors only, so a failing run yields no
> `LinkCheckResult` and neither criterion's `attempts` is readable through `checkLinks`. Both are met
> against the stub that answered — a request count for S3.5, a connection count for S3.6 — which
> observes the same fact from the other end. [`20-contract.md`](20-contract.md) § *Public signatures*
> now states the loss. Whether the criteria are reworded to match is a slicing decision this note
> does not make.
  - S3.7 The link check runs as a CI job distinct from the typecheck-and-test job, over `resolvedHomes` of the committed inventory; no Content or Composition source imports Verification, asserted by the same import-graph check S1.10 introduced.
  - S3.8 A temporary inventory entry addressing a host known not to resolve turns the networked job red and leaves the build job green — verified and reverted before merge.

Out of scope: The deployment poll (`pollForCommit`), the build marker (`readBuildMarker`), the browser
request capture (`assertNoAdditionalRequests`) and the attestation gate (`assertAttestation`) — each is
blocked below. A scheduled or post-deploy re-check, which is the design's *Open question* 6 and
undecided. Publishing anything, or stating any live URL.

---

### S4 — The visual language and the miss page

Delivers: The site gets its look — a dark, typographic token set and six layout primitives — and its
first complete page, the one a visitor sees when they ask for something that is not there. Each page
from here on carries only the style rules its own markup actually uses, worked out from the markup
rather than declared alongside it, so a page can neither silently lose its styling nor accumulate
rules for markup it no longer has.

Touches: Presentation — `HexColor`, `DataUri`, `ClassName`, `ColorToken`, `Palette`, `PrimitiveName`,
`Primitive`, `PrimitiveSet`, `StylesheetText`, `BodyHtml`, `palette`, `primitives`, `themeColor`,
`iconDataUri`, `stylesheetFor`. Composition — `ComposedRoute`, `composeMiss`. Verification —
`assertStyleAgreement`, and the `ClassWithoutRule` and `SelectorWithoutUser` codes. CI — the existing
typecheck-and-test job now covers two new modules.

Depends on: S1, and on owner-supplied copy for the miss page. The brief requires it be on-voice and
the non-goals rule out the excuse generator named in `Idea.md`; what it actually says is brand
material. An implementing agent that reaches a sentence the owner has not supplied stops and asks.

Acceptance:
  - S4.1 `palette` has exactly the five `ColorToken` keys, each value matches `/^#[0-9A-F]{6}$/`, and each equals the value the contract's token-block table records for it — asserted key by key.
  - S4.2 `themeColor === palette.bg`, and Presentation's source carries no six-digit hex literal outside the `palette` declaration, so one colour has exactly one spelling.
  - S4.3 `primitives` has exactly the six `PrimitiveName` keys; every `className` matches `/^[a-z][a-z0-9-]*$/`, and no two primitives share one.
  - S4.4 Every selector in every primitive's `rules` contains that primitive's own `className`, asserted by a check demonstrated red by a temporary rule whose selector omits it — verified and reverted before merge.
  - S4.5 `stylesheetFor` on a body carrying no primitive class returns the token block alone: each custom property named in the contract's token-block table declared on `:root` and no others, plus one further `:root` rule applying `--bg` and `--fg`. Its five colour values are emitted from `palette` rather than written a second time, asserted by changing a `palette` value in a fixture and observing the block change with it.
  - S4.6 `stylesheetFor` on a body carrying two primitives' class names returns the token block followed by exactly those two primitives' `rules` in `PrimitiveName` declaration order; a body carrying a class that belongs to no primitive contributes nothing (`P6`).
  - S4.7 No `StylesheetText` returned by any of these functions contains `</style` in any case, asserted over `composeMiss()`'s stylesheet and over a fixture body referencing all six primitives (`P5`).
  - S4.8 The stylesheet for a body referencing all six primitives contains no `@font-face`, no gradient function, no illustration asset and no `url(` naming a scheme other than `data:`, and neither `--font-sans` nor `--font-mono` names a webfont (`P1`).
  - S4.9 Exactly one primitive's `rules` reference `--font-mono`, and no token-block rule does (`P7`).
  - S4.10 `iconDataUri` begins with `data:` and decodes to SVG whose only colour literals are `palette.fg` and `palette.bg`, by interpolation rather than transcription.
  - S4.11 `assertStyleAgreement` returns `{ ok: true }` for `composeMiss()`; a fixture body carrying a class with no rule returns `ClassWithoutRule` naming that class; a fixture stylesheet carrying a class selector with no user returns `SelectorWithoutUser`; a fixture with four unmatched classes returns four errors in one `Result`.
  - S4.12 `assertStyleAgreement` returns `{ ok: true }` for the token block alone against a body carrying no class — the `:root` rules raise no `SelectorWithoutUser`, per the 2026-08-06 narrowing of `X4` to class selectors.
  - S4.13 `composeMiss()` takes no argument, returns byte-identical `bodyHtml` and `stylesheet` on repeated calls, and its `bodyHtml` contains no `<form>`, no `<script>`, no `<iframe>` and no `on*` attribute (`X3`).
  - S4.14 Presentation imports `Branded` from Content and nothing else from this repository, and Composition imports only Content and Presentation — both asserted by the import-graph check S1.10 introduced and demonstrated red by a temporary import, verified and reverted before merge.

Out of scope: `composeApex` and the five Content derivations it consumes — S5. Any check of `P2`, `P3`
or `P4`: those stay Presentation's to maintain, and the Verification surface they would be checked
through does not exist — that is [`U9`](20-contract.md#u9--accessibility-has-no-verification-surface)
and it is under [*Blocked*](#blocked). Writing one here would introduce a signature the contract does
not carry, which this document may not do. The document shell, the head metadata, and anything
emitted to disk — S6.

---

### S5 — The apex composition

Delivers: The page this whole repository exists for — the manifesto, the ecosystem list grouped by
lifecycle stage, the contamination chain that shows which project escaped out of which, and the
footer — becomes real composed HTML. Every number on it is computed from the committed inventory
rather than typed, so the page cannot come to contradict the data it describes.

Touches: Content — `primarySlogan`, `apexFooterQuote`, `projectTotal`, `countByStage`,
`ecosystemTree`, `contaminationForest`, `sinceYear`. Composition — `composeApex`. CI — the existing
typecheck-and-test job.

Depends on: S4, and on owner-supplied copy — the manifesto prose, whether *Effortless Action* appears
and in which draft (`10-design.md` *Open questions* 5), and whether the page links to project source,
which turns on repository visibility (*Open questions* 4). `Idea.md` lines 540–604 are an unresolved
transcript and none of the three drafts in them may be treated as settled copy.

Acceptance:
  - S5.1 `sinceYear(inventory)` equals the minimum `year` in the inventory (`C10`), asserted over the committed inventory and over a fixture whose minimum year is not the first record.
  - S5.2 `projectTotal(inventory)` equals the number of projects in it, and `countByStage(inventory)` returns one entry per `Stage` in `stageOrder` order whose counts sum to `projectTotal` (`C12`).
  - S5.3 `ecosystemTree(inventory)` returns one group per `Stage` in `stageOrder` order including groups with no projects; within a group projects ascend by `id`; every project appears exactly once across all groups (`C11`).
  - S5.4 `contaminationForest(inventory)` roots every project carrying no `escapedFrom`, contains every project exactly once, and over the committed inventory yields at least one node at depth 2 or greater — the chain S2.7 put in the data.
  - S5.5 `composeApex(inventory, origin)` returns a `ComposedRoute` whose `bodyHtml` contains every project `name` in the committed inventory, the text of `primarySlogan`, and the text of `apexFooterQuote`.
  - S5.6 `composeApex` returns byte-identical `bodyHtml` for the same inventory and `origin` on repeated calls, so the built-output assertions in S6 can name what is on the page.
  - S5.7 Composing an inventory with one project removed changes the rendered total, that project's stage count, and the ecosystem grouping — asserted by comparing two compositions, so no figure on the page can be a typed literal (`X1`).
  - S5.8 A fixture project whose `name`, `line` and `question` each contain `<`, `>`, `&`, `"` and `'` composes to a `bodyHtml` in which none of the five reaches text position unescaped (`X5`).
  - S5.9 `assertStyleAgreement` returns `{ ok: true }` for `composeApex(inventory, origin)` over the committed inventory.
  - S5.10 `composeApex`'s `bodyHtml` contains no `<form>`, no `<iframe>` and no `on*` attribute (`X3`), and exactly one `<script type="application/ld+json">` element carrying no `</script` sequence in any case (`X6`).

Out of scope: The head metadata, the route declarations and the package — S6. Adding
`SubZeroDev.Platform.UI.LandingPage` as a dependency: nothing in this slice is emitted, so nothing in
it needs the package. Any accessibility check, for the reason S4 states. Reading `projects` from
Composition — `C14` closes that set and Composition is not in it; `composeApex` takes the `Inventory`
as a parameter and its tests supply it.

---

### S6 — The emitted document

Delivers: For the first time this repository produces actual HTML files. The landing-page package is
added at an exact version, the two routes are declared with their titles, descriptions and social
metadata, and running the build writes one document for the apex and one for the 404 page — each
carrying the whole page in the response body, the stylesheet inline and the icon embedded, and no
linked asset of any kind. The apex document carries exactly one inert `application/ld+json` script
(`X6`); the 404 document carries none. CI fails the build if anything the bundler adds breaks that.

**This is the slice that exercises the design's largest bet.** Every argument downstream assumes a
bundler hands back a self-contained document, and nothing has ever run it.

Touches: Content — `parseCommitId`. Adapter — `RoutePath`, `origin`, `apexPath`, `missPath`, the two
route declarations and the default `config`. Verification — `assertSelfContained`,
`assertContentPresent`, and the `ScriptElementPresent`, `LinkedStylesheetPresent`,
`ExternalAssetReference`, `ManifestoAbsent` and `ProjectNameAbsent` codes. Dependencies —
`subzerodev-platform-ui-landing-page` pinned at `0.3.0` exactly, with the lockfile. CI — a `build`
job.

Depends on: S5, and on owner-supplied copy — each route's `title` and `description` and the Open Graph
title and description — and on [`U6`](20-contract.md#u6--whether-a-social-image-asset-exists), which
decides whether `socialImageUrl`, `openGraph.imageUrl` and the `twitter` block are declared at all.
A slice transcribes these values; it does not invent them.

Acceptance:
  - S6.1 `package.json` names `subzerodev-platform-ui-landing-page` at `0.3.0` with no range prefix, `package-lock.json` resolves exactly that version, and a test asserts both — so a clean install resolving anything else fails.
  - S6.2 `parseCommitId` returns a `CommitId` for a forty-character lowercase hex string and `null` for a 39-character, a 41-character, an uppercase and a non-hex value; a check over the repository finds no second implementation of the forty-hex pattern (`C15`).
  - S6.3 `config.routes` has exactly two entries — the first at `apexPath` carrying `composeApex(inventory, origin)`, the second at `missPath` carrying `composeMiss()` — each taking `body` and `stylesheet` from its own `ComposedRoute` (`A4`).
  - S6.4 Each route's `metadata.canonicalUrl` and `metadata.openGraph.url` equal `origin` concatenated with that route's `path`, `metadata.openGraph.type` is `"website"`, and the origin string appears exactly once in Adapter's source (`A1`).
  - S6.5 `metadata.icons` has exactly one entry whose `href` is Presentation's `iconDataUri`, and `metadata.themeColor` is Presentation's `themeColor` — both imported; no hex literal and no `data:` literal appears anywhere in Adapter's source (`A2`, `A7`).
  - S6.6 Neither route declares `entry`, `hydrate` or `noScript`, and `config` declares no `styles`, no `publicDir` and no `allow` (`A6`).
  - S6.7 Adapter imports exactly Composition, the external package, Content's `projects`, `validateInventory`, `BuildContext` and `parseCommitId`, and Presentation's `themeColor` and `iconDataUri` — asserted by the import-graph check and demonstrated red by a temporary import of a Content derivation, verified and reverted before merge (`A3`).
  - S6.8 Run against a deliberately malformed fixture inventory, the build reports every `ContentError` rather than the first, exits non-zero, and leaves the output directory with no document in it (`A5`).
  - S6.9 Running the build emits a document for the apex and one at `404/index.html`, and `assertSelfContained` returns `{ ok: true }` for both (`V13`).
  - S6.10 `assertSelfContained` returns `ScriptElementPresent` for a document carrying a `<script>`, `LinkedStylesheetPresent` for one carrying a `<link rel="stylesheet">`, and `ExternalAssetReference` for one carrying an `https:` asset URL; a document carrying all three returns three errors in one `Result`.
  - S6.11 `assertContentPresent(apexHtml, manifestoSentences, inventory)` returns `{ ok: true }` for the emitted apex; a manifesto sentence absent from the document returns `ManifestoAbsent`, and an inventory carrying a project whose `name` is absent returns `ProjectNameAbsent` (`V3`).
  - S6.12 The emitted apex document contains its title, description, canonical URL, Open Graph fields and the icon `href` — asserted against the emitted HTML, never against `config`.
  - S6.13 Nothing imports Composition except Adapter, and no repository module under `src` imports Verification — both asserted by the import-graph check (`X2`).
  - S6.14 A `build` CI job runs the package build and every offline assertion above sequentially in one job over one working directory; it is green on this slice's head commit and demonstrated red by a temporary `LandingPageEntryRoute` declaration that emits a script element — verified and reverted before merge.

Out of scope: The build marker, the root `404.html` and the server configuration — all Artifact's, all
S7's. The browser request capture, which is the second half of the self-contained check and needs a
driver decision — S8. Any image, any deploy, any live URL. `metadata.noScript`, which
[`U5`](20-contract.md#u5--noscript-is-withdrawn-pending-an-owner-edit-to-the-brief) withdrew and which
the package would append **inside the body**, putting a false sentence in the page's prose.

---

### S7 — The publishable tree

Delivers: The emitted documents become a tree that can actually be published. Every document gains a
machine-readable stamp of the exact commit it was built from — which is what later lets a deployment
be proved rather than assumed — the 404 document is copied to the root filename hosting conventions
expect, and the container's server configuration is written beside the tree rather than into it, so
the file the server reads is never a file the server serves.

Touches: Artifact — `EmittedDocument`, `ArtifactInput`, `ArtifactReport`, `ArtifactErrorCode`,
`ArtifactError`, `missEmittedEntry`, `missRootEntry`, `serverConfigFilename`, `buildMarkerPrefix`,
`buildMarkerSuffix`, `buildMarker`, `serverConfig`, `injectBuildMarker`, `finalizeArtifact`.
Verification — `readBuildMarker`, `assertEveryDocumentMarked`, `assertRootMissDocument`, and the
`MarkerAbsent`, `MarkerDuplicate`, `MarkerMismatch` and `RootMissDocumentAbsent` codes. CI — the
`build` job extended.

Depends on: S6.

Acceptance:
  - S7.1 `buildMarker(commit)` equals `buildMarkerPrefix + commit + buildMarkerSuffix` exactly, and both constants equal the literals the contract names.
  - S7.2 `injectBuildMarker(html, commit)` inserts the marker immediately before the first `</head>` and nowhere else; a document with no `</head>` returns `MarkerInsertionPointMissing`; a document already carrying a marker returns `MarkerAlreadyPresent` and gains no second one.
  - S7.3 `finalizeArtifact` validates `input.commit` before anything else: a non-forty-hex value returns `CommitIdMalformed` with `entry: null`, and no file in the tree is modified.
  - S7.4 `finalizeArtifact` over a tree containing no `.html` document returns `OutputTreeMissing` with `entry: null`; over a tree with documents but no `404/index.html` it returns `MissDocumentMissing` with `entry` equal to `missEmittedEntry`.
  - S7.5 `finalizeArtifact` copies `missEmittedEntry` to `missRootEntry` before either is marked, so the two carry the same marker at the moment the copy is asserted byte-identical; after `finalizeArtifact` succeeds, `missEmittedEntry` is absent from the finished tree and `missRootEntry` is its only surviving copy (`R2`).
  - S7.6 `ArtifactReport.markedEntries` names every `.html` document in the finished tree including the root copy, and `readBuildMarker` returns the input commit for each of them (`R1`).
  - S7.7 `serverConfig()` returns text that resolves an unknown path to `missRootEntry` with status 404, names no path the build does not emit, and sets no cookie, no application-chosen cache-control directive, and no tracking or rewrite header (`R4`) — asserted against the returned string with no container, filesystem or network involved.
  - S7.8 `ArtifactReport.serverConfigPath` is outside `outputDir`, and after `finalizeArtifact` no file named `serverConfigFilename` exists anywhere inside the output tree (`R6`).
  - S7.9 `assertEveryDocumentMarked(documents, commit)` returns `{ ok: true }` for the finished tree; a document with no marker returns `MarkerAbsent`, one carrying two returns `MarkerDuplicate`, one carrying a different valid commit returns `MarkerMismatch`, and a tree carrying all three faults returns three errors in one `Result` (`V1`).
  - S7.10 `assertRootMissDocument(documents)` returns `{ ok: true }` for the finished tree and `RootMissDocumentAbsent` for a tree with `missRootEntry` removed.
  - S7.11 `missEmittedEntry` is checked against the emitted tree rather than assumed: a test derives the package's emitted path for Adapter's `missPath` from the build output and asserts it equals `missEmittedEntry` (`R5`).
  - S7.12 Artifact imports exactly `CommitId`, `parseCommitId` and `Result` from Content and nothing else from this repository, asserted by the import-graph check and demonstrated red by a temporary import — verified and reverted before merge.
  - S7.13 The `build` job runs the package build, `finalizeArtifact` and the offline assertions sequentially in one job over one working directory; it is green on this slice's head commit and demonstrated red by a temporary change that skips the marker injection — verified and reverted before merge.
  - S7.14 Every document in the tree, taken before and after `finalizeArtifact`, differs by exactly the marker string and nothing else — asserted by removing `buildMarker(commit)` from each finished document and comparing the result byte for byte against its pre-Artifact form (`R3`).

Out of scope: Any check that a running server behaves as `serverConfig()` describes — this slice
asserts the text, and S9 asserts the behaviour. The browser request capture. The image. Anything
published, and any live URL.

---

### S8 — The browser request capture

Delivers: A real browser loads the built page and CI records every request it makes. The promise this
whole design was written around — that a visitor's browser fetches the document and nothing else —
stops being an argument about source code and becomes an observation, which is the only form of it the
brief accepts.

Touches: Verification — `assertNoAdditionalRequests`, `RequestRecord`, and the `UnexpectedRequest`
code. CI — the `build` job extended with a browser step.

Depends on: S7, **and on a decision-log entry naming the browser driver and whether it loads the
document over `file://` or a local static server.** This document has listed that choice as needing a
decision before implementation since it was first written, and it is still open. It is the first
acceptance criterion below rather than a precondition stated in prose, so the slice cannot proceed
past it by accident.

Acceptance:
  - S8.1 The browser driver and its load mechanism are recorded in `90-decisions.md` before any code is written, naming the rejected alternatives, why each was rejected, and the reversibility. An implementing agent that reaches this with no owner ruling stops and asks.
  - S8.2 Loading the emitted apex document under the chosen driver produces exactly one `RequestRecord` — the navigation document, with `initiatedByTester` true — and no other record (`V2`).
  - S8.3 Loading the emitted miss document under the same driver produces the same single record.
  - S8.4 `assertNoAdditionalRequests(records)` returns `{ ok: true }` for both captures; a capture carrying one additional record returns `UnexpectedRequest` naming that record's `url`; a capture carrying three additional records returns three errors in one `Result`.
  - S8.5 Whether a document with no declared icon triggers an automatic `/favicon.ico` request is verified against the chosen driver and recorded in `90-decisions.md` — closing [issue #17](https://github.com/The-Running-Dev/SubZeroDev.com/issues/17), and settling whether the declared icon is a `V2` requirement or a brand choice.
  - S8.6 A temporary route change that links an external stylesheet turns the capture red with `UnexpectedRequest`, and the source-level `assertSelfContained` from S6 goes red on the same change — both halves of the self-contained check demonstrated, verified and reverted before merge.

Out of scope: `P4`'s keyboard traversal and focus order, which needs the same driver and has no
Verification surface — that is `U9` and it is under *Blocked*, and picking a driver here does not
release it. `P2` and `P3`. Anything published.

---

### S9 — The container image and its in-CI gate

Delivers: The release artifact — a container image serving the built tree — is built, run and
interrogated inside CI before anything could publish it. CI checks that the image serves byte for byte
what the build emitted, that an unknown path answers with a real 404 carrying the 404 page rather than
a 200 that merely looks right, and that the image's tag is the commit it was built from. An image that
fails any of those is never pushed, so no compose stack can pull a broken one.

Touches: Verification — `assertServedBytesMatchEmitted`, `assertUnknownPathResponse`,
`assertImageIdentity`, `ServedResponse`, and the `ServedBytesMismatch`, `UnknownPathStatusWrong`,
`UnknownPathBodyWrong` and `ImageTagCommitMismatch` codes. Packaging — a container definition over
`nginx:alpine` consuming Artifact's finished tree and the emitted server configuration. CI — an
`image-gate` job.

Depends on: S7, **and on a decision-log entry naming the image build and push mechanism**, with the
registry write scoped to the publication job alone. That choice has been listed as needing a decision
before implementation since this document was first written and is still open. S8 is not a
dependency: the gate is hermetic and the capture is a different observation.

Acceptance:
  - S9.1 The image build and push mechanism is recorded in `90-decisions.md` before any code is written, naming the rejected alternatives and stating that no step in this slice writes to a registry. An implementing agent that reaches this with no owner ruling stops and asks.
  - S9.2 The image is built over `nginx:alpine` from Artifact's finished tree and the emitted `serverConfigFilename`, and is tagged with the full forty-character commit id.
  - S9.3 `assertImageIdentity(imageTag, servedMarker, commit)` returns `{ ok: true }` for the built image; a tag that is not the commit returns `ImageTagCommitMismatch`; a served marker that is a different valid commit returns `MarkerMismatch`, and it is not retryable here because the image is already built (`V10`).
  - S9.4 With the image running, `assertServedBytesMatchEmitted(served, emitted)` returns `{ ok: true }` for `/` against the emitted apex document, and returns `ServedBytesMismatch` when a single byte of the emitted document is altered (`V11`).
  - S9.5 With the image running, `assertUnknownPathResponse(response, emittedMissDocument)` returns `{ ok: true }` for a unique unknown path; a 200 carrying the miss document returns `UnknownPathStatusWrong`; a 404 carrying the miss document wrapped in any other markup returns `UnknownPathBodyWrong`, because the body must equal the emitted document rather than contain it (`V12`, container half).
  - S9.6 The served response for an unknown path carries no cookie, no application-chosen cache-control directive and no tracking or rewrite header, asserted over its headers — `R4` observed rather than argued from `serverConfig()`'s text.
  - S9.7 An `image-gate` CI job builds the image, runs it, performs S9.3–S9.6 and pushes nothing; it is green on this slice's head commit and demonstrated red by a temporary server-configuration change that answers an unknown path with 200 — verified and reverted before merge (`V9`).
  - S9.8 No step in this slice authenticates to a registry or writes to one, asserted by the absence of a registry credential from the workflow and by the job's own step list.

Out of scope: Pushing the image anywhere. The Pages preview, attestation gate and release deployment —
S10. Byte identity against the Pages target, which does not exist until S10. Anything about a compose
stack: S9 guarantees the image is correct and stops there; S10 owns the deployment artifact, trigger
and endpoint read-back. *Open question* 7 (TLS termination) stays foreclosed.

---

### S10 — Publication

Delivers: Preview/development publishing and release publishing become two explicit paths. Pages
publishes every main-branch commit after the shared build, with no human approval, image gate, link
gate or truth attestation in front of it, then is read back for marker, byte and unknown-path identity.
Separately, a human approves the release against one exact commit; the gated image is pushed, the
Compose stack is redeployed, and the endpoint is read back before the site is called live. A preview
claim and a release claim are licensed independently by the read-back of the target each names.

Touches: Verification — `deploymentPollRetry`, `pollForCommit`, `assertAttestation`,
`assertDeploymentCandidateCurrent`, `ReadBackResult`, `Attestation`, and the `PollExhausted`,
`AttestationAbsent`, `AttestationCommitMismatch` and `StaleDeploymentCandidate` codes. CI —
`publish-preview`, `attestation` and `publish-release` jobs. Deployment artifact — the Compose file,
redeploy trigger and endpoint read-back. Repository configuration — Pages and the environment's
reviewer list.

Depends on: S8, S9.

Acceptance:
  - S10.1 `deploymentPollRetry` equals `{ attempts: 60, backoff: "fixed", initialDelayMs: 5000, maxDelayMs: 5000, attemptTimeoutMs: 10000 }`, asserted field by field.
  - S10.2 Against a local stub serving a document carrying the expected marker, `pollForCommit` returns `{ ok: true }` with `polls: 1`; against a stub carrying a different valid commit for two polls and the expected one on the third, `{ ok: true }` with `polls: 3`; against a stub that never carries it, `PollExhausted` after `attempts` polls.
  - S10.3 `assertAttestation(null, commit)` returns `AttestationAbsent`; an `Attestation` whose `commit` differs from the releasing commit returns `AttestationCommitMismatch`; a matching one returns `{ ok: true }` (`V5`). Pages does not call this function.
  - S10.4 `assertDeploymentCandidateCurrent(commit, branchHead)` returns `{ ok: true }` when the two are equal and `StaleDeploymentCandidate` when they differ (`V6`).
  - S10.5 The `attestation` job targets a protected GitHub Environment with required reviewers, runs only on a push to `main` (the default branch), and builds its `Attestation` from the run's approval record for `approver` and the run's `head_sha` for `commit` — so an approval cannot be replayed onto another run.
  - S10.6 `publish-preview` and `publish-release` are separate jobs sharing one concurrency group that does not cancel in progress. `publish-preview` depends only on the shared build, checks the branch head, deploys Pages and reads Pages back; it does not depend on `image-gate`, `link-check` or `attestation`. `publish-release` re-checks the branch head after the human gate and owns the registry push, redeploy trigger and endpoint read-back (`V7`).
  - S10.7 The image gated in S9 is carried into `publish-release` and pushed without being rebuilt, with its digest asserted equal on both sides of the job boundary — the gated image is the pushed image (`V9`).
  - S10.8 After the Pages deploy, `pollForCommit` against the preview apex returns `{ ok: true }` for the exact commit, `assertServedBytesMatchEmitted` succeeds against the emitted apex, and `assertUnknownPathResponse` against a unique unknown path returns `{ ok: true }` (`V8`, `V11` and `V12`, Pages halves). None is a human or release gate in front of Pages publication.
  - S10.9 No preview URL is stated before S10.8 passes; no image tag is stated before the push succeeds and the tag resolves; and no live-site claim is made before the redeployed endpoint serves the exact marker and unknown-path composition (`V8`, `V14`, `V15`).
  - S10.10 A preview or release job whose commit is no longer the deployment-branch head stops before mutating its target and reports a clean stop rather than a failure, demonstrated against `assertDeploymentCandidateCurrent` and by each job's conditional.
  - S10.11 The full graph is demonstrated by one workflow run: the shared build completes; `publish-preview` runs without waiting for release gates while image-gate and link-check prepare the release; the two branches complete independently and neither waits on the other, so truth attestation follows the image gate and the link check alone; then the branch head is re-checked, the gated image is pushed, the Compose redeploy is triggered, and exact-marker plus unknown-path endpoint read-back licenses the live claim (`V7`, `V15`).

Out of scope: A scheduled post-deploy link re-check —
*Open question* 6. The domain, its DNS records, TLS termination and any reverse proxy or host the
deployment sits behind, which the brief's non-goals still put out of scope permanently, and which
*Open question* 7 (TLS termination) accordingly stays foreclosed rather than answered.

---

### S11 — The testimonials route

Delivers: A third, content-agnostic testimonial renderer and a `/testimonials/` route carrying
SubZeroDev's own fabricated collection, published, marked and gated on exactly the same footing as the
apex — `finalizeArtifact` walks every `.html` entry (`R1`–`R3`), the image gate reads the whole
emitted tree (`V10`–`V12`), and Pages publishes the whole build, so nothing in `S9` or `S10`'s job
graph changes for a third document. This slice is additive to the publication CI table above, not a
revision of it.

Touches: Content — `Testimonial`, `Testimonials`, `testimonials`, `validateTestimonials`,
`testimonialTotal`, the three new `ContentErrorCode` values. Presentation — `grid`, `card` added to
`PrimitiveName` and `primitives`. Composition — `composeTestimonials`. Adapter — `RoutePath`,
`testimonialsPath`, the third route, the second validation call. CI — the existing typecheck-and-test
job now covers the new modules; `build` emits a third document for the existing offline-assertion and
browser-capture steps to cover.

Depends on: S4 (primitives, `stylesheetFor`), S5 (the `Testimonials`-shaped precedent `composeApex`
set for taking data as a parameter), S6 (the route-declaration and head-metadata pattern), and on
owner-supplied copy — the eighteen testimonials themselves, and the route's title, description and
Open Graph copy. An implementing agent that reaches a testimonial or a metadata string the owner has
not supplied stops and asks, on the same footing S4 and S6 hold copy to.

Acceptance:
  - S11.1 `validateTestimonials` accepts the committed `testimonials` and returns `{ ok: true }`; rejects an empty array with `EmptyTestimonials`; rejects a fixture with an empty (or whitespace-only) `quote` with `TestimonialQuoteEmpty` naming its index; rejects one with an empty `author` with `TestimonialAuthorEmpty` naming its index; rejects a present-but-empty `role` and a present-but-empty `organization` with `TestimonialRoleEmpty` and `TestimonialOrganizationEmpty` naming their indices, while accepting both when absent and when present and non-empty; and reports **all** failures in one `Result` for a fixture carrying two bad records.
  - S11.2 `testimonialTotal(testimonials)` equals the array length, asserted over the committed collection and over a fixture; removing a record changes it (`X1`).
  - S11.3 `primitives` has exactly the ten `PrimitiveName` keys; `grid` and `card`'s `className`s match `/^[a-z][a-z0-9-]*$/` and collide with none of the existing eight; every selector in each new primitive's `rules` contains that primitive's own `className` (`S4.4`'s check, extended).
  - S11.4 Exactly one primitive's `rules` reference `--font-mono` after the two additions — still `meta` (`P7`), asserted by extending `S4.9`'s suite rather than writing a parallel one.
  - S11.5 `composeTestimonials(testimonials)` returns a `ComposedRoute` whose `bodyHtml` contains every `quote` and every `author` in the given `Testimonials`, in input order — asserted by locating each pair's string offsets and checking they ascend together.
  - S11.6 A fixture testimonial carrying `role` but not `organization`, one carrying `organization` but not `role`, and one carrying neither, each compose with the metadata line present, present, and **absent** respectively (`X8`) — no empty line, no empty element.
  - S11.7 `composeTestimonials` returns byte-identical `bodyHtml` and `stylesheet` for the same input on repeated calls, and carries no testimonial content of its own — asserted by a suite that imports only fixture data and never `src/content/testimonials.ts`, plus a check that the module source contains none of the committed authors' names. Site copy of its own it may carry, on the same footing as `composeApex`'s.
  - S11.8 A fixture testimonial whose `quote`, `author`, `role` and `organization` each contain `<`, `>`, `&`, `"` and `'` composes to a `bodyHtml` in which none of the five reaches text position unescaped (`X5`).
  - S11.9 `composeTestimonials`'s `bodyHtml` contains no `<form>`, `<iframe>`, `on*` attribute, or `<script>` element of any kind (`X3`, `X6` restated) and no `avatar`-shaped image or asset reference.
  - S11.10 `assertStyleAgreement` returns `{ ok: true }` for `composeTestimonials(testimonials)` over the committed collection (`X4`).
  - S11.11 `config.routes` has exactly three entries, in order: the apex, the testimonials route, the miss route (`A4`); `testimonialsPath === "/testimonials/"`; the testimonials route's `canonicalUrl` and `openGraph.url` equal `${origin}${testimonialsPath}` (`A1`) and its `themeColor`/`icons[].href` are Presentation's `themeColor`/`iconDataUri` by reference (`A7`).
  - S11.12 Adapter reports every `ContentError` from **either** validator on failure and produces no route when either fails, asserted by a fixture forcing `validateTestimonials` to fail while `validateInventory` succeeds, and the reverse (`A5`).
  - S11.13 The build emits `testimonials/index.html`; it exists, is non-empty, and `assertSelfContained` returns `{ ok: true }` for it (`V13`, extending `S6.9`'s suite).
  - S11.14 Loading `/testimonials/` in a real browser triggers zero requests beyond the navigation document, extending `S8`'s capture to a second route (`V2`).
  - S11.15 `tests/types/route-path.type-check.ts`'s `Equals` assertion pins `RoutePath` to the three-member union; its negative case moves from `"/blog/"` to a fourth arbitrary string, still rejected.

Out of scope: A fourth Content import, a fourth route, or any change to `S9`/`S10`'s job graph — the
existing whole-tree gates already cover a third document with no per-route wiring. `V11`'s
byte-identity read-back, which contract stays scoped to `/` (see `20-contract.md`'s `V11` entry as
restated 2026-08-08). Any accessibility check, for the reason `S4` states. A second consumer of
`composeTestimonials` — nothing in this repository provides one yet; `S11.7`'s content-agnosticism
suite is what keeps the door open for one later.

---

### S12 — The inline enhancement script

Delivers: The folded content routes gain the interactive layer the imported Claude Design prototype
specified — the view switch upgraded from a fragment write to a direct swap, a search box and stage
filter chips over the ecosystem list, and a project detail overlay — carried by one inline,
request-free script (`X10`). Everything it touches is already in the response body, so the page a
crawler and a JS-off visitor receive is byte-for-byte the page that shipped before this slice, and the
CSS-only fold remains the whole of view switching without the script.

Touches: Composition — `enhancementScript`, and `foldRoutes` emitting it into both folded bodies.
Verification — `assertSelfContained`'s script-element check widened to `X10`'s second element, and
`ScriptElementPresent`'s raising conditions with it. CI — the existing `build` job's offline
assertions and browser capture now cover a document that executes something.

Depends on: S11, and on the 2026-08-10 decision-log entry admitting `X10`. **No new dependency**: the
script is hand-written and inlined, and an implementing agent that reaches for a framework, a bundler
or a minifier stops and asks, because *Hard rules* requires a decision-log entry naming the
alternatives before one is added.

Acceptance:
  - S12.1 `enhancementScript()` returns text containing no `</script` sequence in any case, asserted over the returned string and over both folded bodies (`X10`, `P5`'s shape applied to script rather than style).
  - S12.2 The script source interpolates **no** Content value — no project name, `line`, `question`, quote, author or derived figure appears in it, asserted by a check over the module source against the committed inventory and testimonials. It reads the DOM instead, which is what keeps `X5` out of this element entirely rather than needing `X6`'s JSON-escaping exception.
  - S12.3 Each folded content-route body carries exactly two script elements — the JSON-LD block and the enhancement script — neither carrying `src`; the miss document carries none; `assertSelfContained` returns `{ ok: true }` for all three emitted documents and returns `ScriptElementPresent` for a document carrying a third (`V13`, `X10`).
  - S12.4 `assertContentPresent` still returns `{ ok: true }` for the emitted apex **with scripting never executed**, and the emitted `bodyHtml` for both content routes is byte-identical to its pre-S12 form except for the added script element — asserted by removing the element and comparing byte for byte, the same shape `S7.14` uses for the build marker (`V3`).
  - S12.5 Loading `/` and `/testimonials/` in a real browser with the script executing produces exactly one `RequestRecord` each — the navigation document — extending `S8`'s capture rather than replacing it (`V2`, `X10`).
  - S12.6 With scripting disabled, clicking the shared navigation still switches views by `:target`/`:has()` and every project, manifesto sentence and testimonial remains reachable — asserted in the same browser harness with JavaScript turned off, so the baseline is measured rather than argued.
  - S12.7 The search box and stage chips only ever hide or reveal ecosystem entries already in the DOM; a filter matching nothing leaves the empty-result sentence visible and removes no element from the document, asserted by comparing element counts before and after filtering.
  - S12.8 The detail overlay is keyboard-reachable, returns focus to the control that opened it on close, closes on `Escape`, and traps focus while open (`P4`) — asserted in the browser harness.
  - S12.9 Under `prefers-reduced-motion: reduce` the script applies no transform, translation, scale, rotation, position change or scroll behaviour, and any reveal it performs leaves content visible rather than hidden (`P3`) — asserted with the media feature emulated, and demonstrated red by a temporary unguarded transform, verified and reverted before merge.
  - S12.10 With the script's own initialisation forced to throw, the document still renders every project, manifesto sentence and testimonial and the CSS fold still switches views — so a script failure degrades to the pre-S12 page rather than to a broken one.

Out of scope: Any framework, bundler, minifier or compilation step — see *Depends on*. Rendering any
content from script, which `X10` forbids and `V3` fails. A second enhancement script. The scroll-reveal
animation as the prototype expresses it, which sets `opacity: 0` before observing and is what `S12.9`'s
second clause rules out; a reveal that only ever adds visibility is in scope. Changing `composeApex`,
`composeTestimonials` or any Content module — this slice is additive at the fold, exactly as the
2026-08-08 fold was additive at the Adapter wiring.
## Outstanding

Six slices. `S13` predates the rest and is a copy swap; `S14` through `S18` were appended on
2026-08-21 and carry the CV and portfolio routes. What is left beyond them sits under
[`## Blocked`](#blocked) and is waiting on a decision rather than on work.

**`S14` through `S18` run in order and each ends runnable.** `S14` widens the link gate, `S15` commits
and validates the two content documents with nothing rendering them, `S16` and `S17` add a route each,
and `S18` rewires the masthead once both routes exist. The order is not arbitrary: the masthead cannot
point at a route that is not declared, and a content document that nothing renders is still a build
that fails when the document is wrong. **`S13` is independent of all five** and may land at any point.

## S13 — The apex's real title and description

Delivers: The front page finally introduces itself. Since the site first published, anyone arriving
from a search result, a shared link or a browser tab has been shown a stand-in sentence that says, in
as many words, that it is a placeholder waiting to be replaced — and the machine-readable summary a
search engine reads carries the same stand-in. This puts the real words there, in the site's own
voice, on the one page this whole repository exists for.

Touches: Adapter — the apex route's `title` and `description`, its Open Graph title and description,
and the `PLACEHOLDER COPY` header comment that instructs a reader to leave them alone. Composition —
the `Organization` block's `name` and `description` (`X6`), and the same comment above them.
Verification — the emitted-document metadata assertions `S6.12` established. CI — the existing `build`
job's offline assertions.

Depends on: S6, and on **owner-supplied copy — six strings**: the apex's title and description, its
Open Graph title and description, and the organisation's name and description. The 2026-08-06 ruling
that let `/slice S6` start on placeholders named "the real copy to replace it in a follow-up once
written" ([`90-decisions.md`](90-decisions.md)); **this is that follow-up**, and it has no carrier
other than this entry, which is the shape [`agent.md`](../agent.md) § *Drift* names — an amendment made
after its slice merged, with nothing to go red. An implementing agent that reaches this with no
supplied copy stops and asks; it does not write brand voice.

Acceptance:
  - S13.1 The apex route's `title`, `description`, `openGraph.title` and `openGraph.description` each equal the owner-supplied string for that field, transcribed rather than composed, asserted field by field against the declared route metadata.
  - S13.2 The `Organization` block's `name` and `description` each equal the owner-supplied string, asserted against the JSON-LD parsed out of the **emitted** apex document rather than against the module constants.
  - S13.3 Neither `site/landing.config.ts` nor `src/composition/apex.ts` contains the string `placeholder` in any case, asserted over both module sources and demonstrated red by reintroducing one — so the two `PLACEHOLDER COPY` comments go with the copy they guard. `src/composition/enhancement.ts`'s DOM `placeholder` property assignment is untouched and outside this check.
  - S13.4 The emitted apex document carries the supplied title as its `<title>` and the supplied description as its meta description — asserted against the built HTML, never against the declared configuration (`S6.12`'s rule).
  - S13.5 The emitted apex document's Open Graph title and description carry the supplied strings, while its canonical URL, `og:url` and `og:type` are unchanged from what `S6.4` asserts, and no `og:image` and no `twitter` element appears (`U6`).
  - S13.6 `assertSelfContained`, `assertContentPresent` and `assertStyleAgreement` each still return `{ ok: true }` for the emitted apex, and it still carries exactly two script elements (`V13`) — a copy swap moves no class, no rule and no element count.
  - S13.7 The miss route's metadata is unchanged, asserted value by value against the committed strings. Its copy is real already and this slice does not revisit it.
  - S13.8 A fixture organisation name or description containing `<`, `>`, `&`, `"` and `'` is JSON-string-escaped inside the `Organization` block and leaves it carrying no `</script` sequence in any case (`X5`'s exception, `X6`) — asserted with a fixture, since the committed copy is unlikely to carry any of the five.

Out of scope: The miss route's copy, which landed real in
[#74](https://github.com/The-Running-Dev/SubZeroDev.com/pull/74) — `S13.7` asserts it did not move.
**Which** metadata fields are declared: `U6` settled that no social image exists, so `socialImageUrl`,
`openGraph.imageUrl` and the whole `twitter` block stay omitted, and declaring one is a contract
question rather than a copy swap. The manifesto prose, the section headings, the testimonials and the
footer quote — all already real copy, none of it touched here. Any change to how metadata reaches the
document: this slice changes six strings and nothing structural.

---

## S14 — The link gate stops caring what a link belongs to

Delivers: The one outbound link on the site that no gate has ever checked starts being checked. Today
the CI step that goes red when a project's site dies only knows how to look at project links — so the
Projects entry in the site's own navigation, which points at a code-forge account page, has been
verified exactly once, by hand, over two weeks ago. This teaches the gate to check a link that belongs
to no project, which is also what the CV route needs before it can bring eighteen more onto the site.
Nothing a visitor sees changes; a gate that was quietly narrower than its own description stops being
so.

Touches: Content — a `CheckedLink` type and a `checkedLinks` derivation, exported. Verification —
`checkLinks`'s parameter and `LinkCheckResult.target`. The live link-check test and
`vitest.link-check.config.ts`. `30-slices.md` — S3's row in the `## Landed` index, which still reads
`—` and must record this supersession.

Depends on: S3, and on nothing this amendment adds.

**`checkedLinks` lands here at one parameter and gains its second in S15.**
[`20-contract.md`](20-contract.md) states the finished signature, `(inventory, cv)`, because that is
what `V4` will mean; this slice cannot write it, because `CvData` does not exist until S15 and a
parameter typed against a type nothing validates is worse than an arity that changes once. `S15.14`
is the criterion that closes the gap, and until it lands this slice's `checkedLinks` is honestly
narrower than `V4` as written — which is the direction that fails safe, since the links it omits are
links no route yet renders.

Acceptance:
  - S14.1 `checkLinks` takes `readonly CheckedLink[]` and `LinkCheckResult.target` is a `CheckedLink`. The three S3 behaviours are asserted unchanged against the same stub server: a 2xx passes at one attempt, a 4xx fails as `LinkNotOk` at one attempt without exhausting the policy, and a refused connection retries to `linkCheckRetry.attempts` and fails as `LinkUnreachable`.
  - S14.2 A failing target's `VerificationError.detail` names its `label` and its `url`. Asserted against a fixture whose label is not a `ProjectId` — the diagnostic that used to be a typed identity is now a string, and this is what pins that it still identifies the record.
  - S14.3 `checkedLinks(inventory)` yields one entry per `ResolvedHome`, labelled by that home's `ProjectId`, plus one for `sourceUrl`. Asserted against a fixture inventory entry by entry, including a `none` home yielding no entry.
  - S14.4 `checkedLinks` does not deduplicate: a fixture inventory carrying two records whose homes resolve to the same URL yields **two** entries with different labels. Demonstrated red by deduplicating.
  - S14.5 `checkedLinks` over the committed `site/projects.json` contains `sourceUrl`. That is the assertion this slice exists for: `V4` now reaches the link it did not.
  - S14.6 The live link-check shard runs `checkLinks` over `checkedLinks(...)` rather than over `resolvedHomes(...)`, and its target count is read from the derivation rather than typed. Asserted by the shard failing when the derivation returns an empty list.
  - S14.7 `C17` has teeth: no module, test or workflow step other than the live link-check shard calls `checkLinks`, asserted over the tree by the existing import-graph helper.
  - S14.8 S3's row in the `## Landed` index names this supersession — `S3`'s criteria are written against `ResolvedHome` and three of them turn on `LinkCheckResult.target`.

Out of scope: The CV half of `checkedLinks` and `cvOutboundLinks` — S15, which is where `CvData`
exists. Following redirects, or distinguishing a redirect to a parked page from a live one — the
2026-08-05 ruling stands and `V4` still proves an address answers rather than that what answers is
still the project. A scheduled post-deploy re-check, which stays under `## Blocked`. Any change to
`linkCheckRetry`'s values.

---

## S15 — The CV and portfolio content documents

Delivers: The material that has lived on a separate subdomain and in two sibling repositories becomes
this site's own content — a CV and a technology portfolio, committed here as data, checked on every
build the same way the project list is. Nothing renders yet; what this slice buys is that the words
exist in this repository, in a shape the build refuses to accept when it is wrong.

Touches: `site/cv.json` and `site/portfolio.json`, each with a `provenance` field naming its source.
`site/sources.public.yml` — two more `at: build` entries. Content — the `CvDocument`/`CvData` and
`PortfolioDocument`/`PortfolioData` type sets, two Zod document schemas, `cvDocumentValidator` and
`portfolioDocumentValidator`, `validateCv` and `validatePortfolio`, and nine `ContentErrorCode`
members, and `cvOutboundLinks` plus `checkedLinks`'s second parameter. Adapter — two more source
declarations and the `LandingPageDataConfig` type parameter; the `compose` callback receives two
values it does not yet use. The live link-check shard, which starts passing the CV. `30-slices.md` —
S1's row in the `## Landed` index, whose `ContentErrorCode` count is about to be wrong again.

Depends on: S1, S2, S14. And on **owner-supplied copy — one string**: `cv.header.name`. The source CV
names a job title, an address and a phone line and never states whose CV it is. An implementing agent
that reaches this with no supplied name **stops and asks**; it does not take one from a git author, a
domain or a repository name.

Acceptance:
  - S15.1 `site/cv.json` and `site/portfolio.json` are committed, each carrying `"version": 1` and a non-empty `provenance` string naming its source file in the sibling repository. Asserted by decoding both documents and matching the field against the expected source path, and by a fixture with `provenance` absent failing the schema. `site/projects.json` and `site/testimonials.json` are unchanged and carry no such field.
  - S15.2 Both are declared in `site/sources.public.yml` with `at: build`, a local `path` and `cache: manual` — the same three properties `projects` and `testimonials` carry, asserted field by field.
  - S15.3 Both document validators accept the committed documents, asserted by calling each against the file's parsed contents and requiring `ok: true`. **Positive count: 2.**
  - S15.4 Each schema is `.strict()` and rejects an unknown key, and each rejects a `version` other than `1`. Asserted with a fixture per document per fault. **Negative count: 4.**
  - S15.5 `validateCv` raises `CvFieldEmpty`, `CvCollectionEmpty`, `CvUrlInvalid`, `CvYearInvalid` and `CvYearAfterBuild`, each against its own fixture, with `field` carrying the dotted path and index of the offending value and `projectId` `null`. **Negative count: 5.**
  - S15.6 `validatePortfolio` raises `PortfolioFieldEmpty`, `PortfolioCollectionEmpty`, `PortfolioTechDepthExceeded` and `PortfolioDuplicateCategory`, each against its own fixture, on the same `field`/`projectId` rule. **Negative count: 4.** A four-level technology tree is the depth fixture and a three-level one passes beside it.
  - S15.7 Each semantic validator reports **every** fault in one `Result`, not the first: a fixture carrying four independent faults yields four `ContentError`s. Demonstrated red by returning early.
  - S15.8 `CvYearInvalid` takes precedence over `CvYearAfterBuild`: a fixture year of `99999` yields one error, not two.
  - S15.9 `CvData` and `PortfolioData` are constructible only by their validators — asserted at the type level, in the style of `tests/types/`, by a raw `CvDocument` failing to satisfy `CvData` with no `@ts-expect-error` available to suppress it.
  - S15.10 Neither committed document contains an image URL, an icon-font token, or a `src` of any kind. Asserted over the raw file text, which is what stops a later edit reintroducing the shields.io badges the transcription dropped.
  - S15.11 `C14` covers four validators: nothing outside Adapter and the document-validator tests imports any of them, asserted by the existing reachability check extended to the two new names, demonstrated red by adding an import.
  - S15.12 The build still emits exactly the routes S6 declares, with the two new sources validated and unused. `A5` holds over four documents: a fixture adapter whose CV source is malformed produces no route body, stylesheet or document, asserted the way `tests/build/malformed-testimonials-adapter.config.ts` already asserts it for testimonials.
  - S15.13 S1's row in the `## Landed` index names the new `ContentErrorCode` count.
  - S15.14 `checkedLinks` takes `(inventory, cv)` and its output additionally carries one entry per URL at each of `header.links[].href`, `roles[].website`, `projects[].link` and `openSource[].link`. Asserted against a fixture CV carrying an absent `roles[].website` and an absent `openSource[].link` so both optional paths are exercised, and against the committed `site/cv.json` by count. This closes the gap `S14` states: `checkedLinks` now means what `V4` says it means.
  - S15.15 `cvOutboundLinks` is exported and returns the CV half alone, asserted against the same fixture with no inventory in scope.
  - S15.16 `checkedLinks` still does not deduplicate across the two halves: the committed CV header's Portfolio link and the inventory's `portfolio` record both appear, carrying different labels. Demonstrated red by deduplicating.

Out of scope: Rendering either document — S16 and S17. Any route declaration. The masthead. Reading
either source repository, at build time or otherwise: the brief forbids it and this slice's whole
premise is that the transcription is committed here.

---

## S16 — The `/cv/` route

Delivers: A CV lives at `subzerodev.com/cv/`, in the site's own voice and typography, with no image,
no icon font and nothing to load. A recruiter who follows a link from a commit trailer or a business
card reaches a document that reads as part of this site rather than a stop on a different one — and a
search engine reaches a machine-readable `Person` record describing the same page.

Touches: Composition — `composeCv`, an internal CV renderer, and a `Person` JSON-LD builder beside the
existing `Organization` one. Adapter — `cvPath`, the `RoutePath` union, the third route declaration
and its metadata. `tests/types/route-path.type-check.ts` — the pinned union. Verification's build
shard — a third emitted document to assert over.

Depends on: S15, and on **owner-supplied copy — four strings**: the CV route's `title` and
`description` and its Open Graph title and description. The same standing condition
[`S13`](#s13--the-apexs-real-title-and-description) records for the apex applies here, and it applies
before this route ships rather than after: an implementing agent with no supplied copy stops and asks.

Acceptance:
  - S16.1 `RoutePath` is exactly `"/" | "/cv/" | "/portfolio/" | "/404/"`, pinned by mutual assignability in `tests/types/route-path.type-check.ts` so adding or removing a member fails the typecheck. `cvPath` is `"/cv/"` and is written `satisfies RoutePath`.
  - S16.2 The emitted tree carries `cv/index.html`, and Artifact does **not** remove it — asserted after `finalizeArtifact`, beside the existing assertion that `404/index.html` is gone.
  - S16.3 `assertStyleAgreement` returns `{ ok: true }` for the CV route's `ComposedRoute`, and its stylesheet is the token block plus exactly the primitives its body carries and nothing else (`P6`).
  - S16.4 The CV body carries no `view` class. Asserted directly against `bodyHtml` and demonstrated red by adding one — this is the constraint `assertStyleAgreement` cannot catch, because `view`'s nav-colouring selectors carry no class.
  - S16.5 `assertSelfContained` returns `{ ok: true }` for the emitted CV document, which carries **exactly one** script element: the `Person` block. Demonstrated red by adding a second.
  - S16.6 The `Person` block parses as JSON out of the emitted document, carries `name`, `jobTitle`, `url` and `sameAs`, and carries **no** `email` and **no** `telephone`. Asserted against the emitted document rather than the module constants.
  - S16.7 A fixture CV field containing `<`, `>`, `&`, `"` and `'` is HTML-escaped in text and attribute position in the body (`X5`) and JSON-string-escaped inside the `Person` block, leaving no `</script` sequence in any case.
  - S16.8 Every `CvData` outbound URL the body renders appears in `checkedLinks` for that same document. Asserted by extracting every `href` from the body, subtracting the masthead's own entries, and requiring the remainder to be a subset of the derivation's URLs — the direction that would be a defect is a rendered link no gate checks.
  - S16.9 `composeCv` renders no project entry, no stage grouping, no contamination chain and no count from the inventory — asserted by composing against an inventory whose records carry sentinel `line` values and requiring none to appear in the body.
  - S16.10 No figure on the CV document is a literal in `src/composition/` — asserted by requiring every rendered year and period to appear in `site/cv.json` (`X1` as narrowed, `U11`).
  - S16.11 The emitted CV document carries the supplied title, meta description and Open Graph fields, its canonical URL and `og:url` are `origin` + `cvPath`, and it carries no `og:image` and no `twitter` element (`A1`, `U6`).
  - S16.12 Loading the emitted CV document in a real browser triggers zero requests beyond the navigation document (`V2`), asserted by the existing request capture extended to the new route.

Out of scope: The masthead's fifth entry and the Portfolio entry's redirection — S18. The portfolio
route — S17. Any change to `portfolio.subzerodev.com`, its repository, its deployment, or anything
fronting it. A `worksFor` link between the `Person` and the apex's `Organization`, which couples two
documents and buys nothing this brief asks for.

---

## S17 — The `/portfolio/` route

Delivers: The technology-and-category portfolio lives at `subzerodev.com/portfolio/` — eleven
technology categories as a readable tree, six project categories, and the stats strip — in this site's
typography rather than a second site's. It is the evidence half of what the apex asserts, one click
from it.

Touches: Composition — `composePortfolio` and an internal portfolio renderer, including the recursive
technology-tree walk. Adapter — `portfolioPath`, the fourth route declaration and its metadata.
Verification's build shard — a fourth emitted document.

Depends on: S15, S16 — the `RoutePath` widening lands with the CV route and this one adds a value to a
union already opened. And on **owner-supplied copy — four strings**: the route's `title`,
`description` and Open Graph pair, on `S16`'s condition.

Acceptance:
  - S17.1 `portfolioPath` is `"/portfolio/"`, written `satisfies RoutePath`, and `config.routes` is exactly four entries in the order apex, CV, portfolio, miss (`A4`) — asserted against the declared configuration, with the miss last.
  - S17.2 The emitted tree carries `portfolio/index.html` and Artifact does not remove it.
  - S17.3 The technology tree renders every node at every level, asserted against a three-level fixture by requiring each node's `name` to appear, and the renderer is one recursive function rather than one per level — asserted by a fixture that is three levels deep in one branch and one level deep in another.
  - S17.4 `assertStyleAgreement` returns `{ ok: true }` for the portfolio route, its stylesheet is the token block plus exactly its own primitives, and its body carries no `view` class — demonstrated red as `S16.4` is.
  - S17.5 `assertSelfContained` returns `{ ok: true }` and the emitted portfolio document carries **zero** script elements. Demonstrated red by adding one.
  - S17.6 Every emoji in the committed portfolio document appears in the emitted document unchanged, byte for byte, and triggers no request — asserted against the emitted HTML and against the `V2` capture.
  - S17.7 No stat value is a literal in `src/composition/`: every rendered figure appears in `site/portfolio.json` (`X1` as narrowed, `U11`).
  - S17.8 `composePortfolio` renders nothing from the inventory but the masthead — asserted on `S16.9`'s sentinel method.
  - S17.9 A fixture portfolio field containing `<`, `>`, `&`, `"` and `'` is HTML-escaped in both positions (`X5`).
  - S17.10 The emitted portfolio document carries the supplied metadata and its canonical URL and `og:url` are `origin` + `portfolioPath` (`A1`).
  - S17.11 Loading it in a real browser triggers zero additional requests (`V2`).
  - S17.12 `V11` covers three content routes: the image gate compares served bytes against the emitted document for `/`, `/cv/` and `/portfolio/`, and the Pages read-back does the same. Demonstrated red by serving a modified byte on one of the two new routes.

Out of scope: The masthead — S18. Migrating, redirecting, retiring or changing
`portfolio.subzerodev.com` in any way; the inventory's `portfolio` record and its `own` home are
untouched and `V4` keeps checking that subdomain. A search or filter affordance over the technology
tree, which would need `X10`'s script on a document this slice gives none.

---

## S18 — The masthead's five entries

Delivers: The navigation finally names everything this site has. Portfolio and CV join SubZeroDev.com,
Blog and Projects, and the two that are now this site's own routes point at this site rather than off
it — so a visitor moving between the manifesto, the CV and the portfolio never leaves, and always sees
which of the three they are reading.

Touches: Composition — `renderOutbound` and its target derivation, which gains the current-route
parameter and loses its only `homeOf(hrefById, "portfolio")` call site; the module comment in
`src/composition/header.ts` that describes the group as outbound and names Portfolio as an inventory
lookup, both of which stop being true. `composeApex`, `composeCv` and `composePortfolio` — each passes
its own path. `tests/composition/apex-navigation.test.ts`. `tests/content/inventory.test.ts`, whose
assertion that the inventory still carries the `portfolio` id was the guard against that nav link
vanishing silently and now guards only the ecosystem list.

Depends on: S16, S17.

Acceptance:
  - S18.1 The masthead renders exactly five entries in the order SubZeroDev.com, Blog, Projects, Portfolio, CV — asserted against each of the three routes that carry it.
  - S18.2 Portfolio resolves to `origin` + `portfolioPath` and CV to `origin` + `cvPath`, neither to an inventory home and neither to `portfolio.subzerodev.com`. Asserted by `href`.
  - S18.3 **Exactly one** entry carries `link-current`'s class and `aria-current="page"` on each of `/`, `/cv/` and `/portfolio/`, and it is the one whose `href` equals `origin` + that route's path. Demonstrated red by marking on a path prefix instead, which would mark SubZeroDev.com current on all three.
  - S18.4 The apex's footer repeats the same five entries with the same current marking, from the same helper — asserted by comparing the two rendered strings rather than by asserting the footer's contents separately.
  - S18.5 Blog is still found by resolving the inventory's `publishing` id and is still dropped rather than faked when that id is absent — the S3-era behaviour, asserted unchanged against a fixture inventory with no `publishing` record.
  - S18.6 `homeOf(hrefById, "portfolio")` has no call site, asserted over `src/composition/`, and `src/composition/header.ts`'s module comment no longer describes Portfolio as an inventory lookup or the group as purely outbound. Demonstrated by the comment's text, since a stale comment is what this criterion exists to catch.
  - S18.7 The inventory's `portfolio` record is unchanged, still yields a `ResolvedHome`, still appears in `checkedLinks`, and still appears in the apex's ecosystem list with its own link — asserted against the committed inventory and the emitted apex document. **No outbound link is lost by this change.**
  - S18.8 `assertStyleAgreement` returns `{ ok: true }` for all four routes after the change, and `link-current`'s rule still has a user on each of the three routes that carry the masthead.
  - S18.9 A fixture origin containing `<`, `>`, `&`, `"` and `'` is escaped in the `href` (`X5`) — the masthead's own URLs are now built from `origin` on three routes rather than one.

Out of scope: Adding the masthead to the miss route, which composes no header today and takes no
inventory. Reordering or renaming the three existing entries. Any redirect from
`portfolio.subzerodev.com` to `/portfolio/`, which is delivery configuration and is out of scope by
the brief's hosting non-goal.

---
## Blocked

Nothing below is a slice. Each names what is missing and the condition that releases it. No slice
number is allocated until the contract can carry the work.

### Accessibility has no Verification surface — [`U9`](20-contract.md#u9--accessibility-has-no-verification-surface)

`P2` (greyscale legibility), `P3` (`prefers-reduced-motion`) and `P4` (focus order and keyboard
reachability) are invariants with nothing callable behind them. No `VerificationErrorCode` names any
of them and no function in *Public signatures* checks one, so a slice asserting them would have to
introduce a signature the contract does not carry — which this document may not do.

All three are `00-brief.md` *Definition of done* bullets, so this is a gap between the brief and the
contract rather than a deferral. `U9` states what would settle each; the shared fork is whether the
check is static over `StylesheetText` or a computed-style check in a browser, and the design's own
precedent for `V2` and `V13` — *"Source inspection cannot prove runtime behaviour… Both are
required"* — makes that a decision rather than an implementer's choice.

**`S12` narrowed this and did not release it.** `S12.8` and `S12.9` landed real browser assertions in
`tests/build/enhancement.test.ts`: the detail overlay is keyboard-reachable, returns focus to its
trigger, closes on `Escape` and traps focus while open; and with `prefers-reduced-motion: reduce`
emulated, nothing transforms, translates, scales, rotates, moves or scrolls. What that settles is
`P3` and `P4` **as they bind `X10`'s script**, which is the scope `X10` itself names. It leaves the
primitive set unchecked, leaves `P2` with no check of any kind, and adds no `VerificationErrorCode`
and no function to *Public signatures*. The gap is smaller than it was and is the same gap — with one
item struck off the list of what is missing, since the browser harness `P4` needed now exists.

**Not blocked by this:** anything that emits or serves a document. `P2`–`P4` stay Presentation's to
maintain, and S4 ships them maintained and unchecked, which S4's *Out of scope* states plainly.
Choosing a browser driver in S8 does not release this — S8 buys a driver, not a surface, and `S12`
spending that driver on two of the three does not either.

### A scheduled post-deploy link re-check — `10-design.md` *Open question* 6

Undecided. It is the only way a dead outbound link is noticed after deploy, it costs a workflow, and
it is the sole thing that would make this repository observe the others — adjacent to a brief
non-goal without obviously being inside it. S3 checks links before deployment and nothing checks them
after, which is the honest limit of the chosen release boundary.

### Where the compose stack terminates TLS — `10-design.md` *Open question* 7

Foreclosed, not merely undecided. `00-brief.md`'s non-goal — as amended 2026-08-07 — still excludes
TLS by name: *"an agent may not decide what terminates TLS in front of this site, or configure the
thing that does."* Naming a TLS mechanism (a reverse proxy, a certificate source) answers a question
the brief has closed twice, so this is blocked on the owner striking that clause rather than on any
missing design work.

**The 2026-08-07 amendment does not release it, and that is the point of how it was drawn.** It moved
the boundary to the deployment artifact: *Open question* 8 (the compose file) is answered and now
rests on the brief rather than in tension with it — `design/90-decisions.md`, 2026-08-07 — while what
fronts that file with TLS stays out. The compose file's existence and its ingress are separable, and
S9 and S10 need neither.

### ~~An owner edit to the brief~~ — [`U5`](20-contract.md#u5--noscript-is-withdrawn-pending-an-owner-edit-to-the-brief)

**Released 2026-08-07. The edit was made.** The brief's *Definition of done* no longer requires
`<noscript>` content and now states why the element has no role on a document that needs no scripting.
S6 therefore ships a document that satisfies the bullet rather than one that deliberately does not,
and nothing here blocks. `20-contract.md`'s `U5` was closed against that edit on 2026-08-07; its
heading is retained unchanged because three documents cite the anchor.

The same edit closed `U10`, whose motion clause the brief now carries in `P3`'s narrowed wording. It
had no entry in this section.

**A third of this shape opened on 2026-08-21 and is outstanding:**
[`U11`](20-contract.md#u11--x1s-derivation-clause-is-narrowed-to-the-apex-pending-an-owner-edit-to-the-brief)
narrows `X1`'s derivation clause to the apex, and the brief's *Definition of done* still states the
broader form. It gets no entry of its own here for `U10`'s reason — **it blocks nothing.** `S16` and
`S17` ship under `X1` as narrowed, exactly as `S4` shipped under `P3` before the brief caught up. It
is named here so a reader of this section knows a brief edit is pending rather than discovering it in
an append-only log.

## The publication CI

The job graph below is derived from [`10-design.md`](10-design.md)'s ordering invariant `V7` and its
*Concurrency and ordering* section. It is recorded here so the shape is not re-derived per slice; it is
not itself a slice, and it allocates no number.

```
typecheck-and-test ──┬──► build ──┬──► publish-preview
                     │            └──► image-gate ──┬──► attestation ──► publish-release
                     └──► link-check ───────────────┘
```

`publish-preview` is a leaf. It joins nothing downstream, and `attestation` does not wait on it — the
two branches never converge, on the 2026-08-08 ruling recorded in
[`90-decisions.md`](90-decisions.md). This graph drew an edge from `publish-preview` into `attestation`
until then.

**`link-check` hangs off `typecheck-and-test`, not off `build`.** It runs over `resolvedHomes` of the
validated inventory and never reads the emitted tree, so it needs the content gate and not the
artifact. This graph drew it under `build`, and omitted `typecheck-and-test` altogether, until
2026-08-20; `.github/workflows/ci.yml` is the canonical statement and has read this way since S3.

| Job | Discharges | Runs on | Delivered by |
|---|---|---|---|
| `typecheck-and-test` — the content gate, the derivations, and every offline unit assertion | `C1`–`C15`, `P1`, `P5`–`P7`, `X1`, `X3`–`X10` | push + all PRs | S1, and every slice since |
| `build` — emit, `finalizeArtifact`, offline assertions, browser capture | `A5`, `R1`–`R3`, `R5`, `R6`, `V1`, `V2`, `V3`, `V13`, `V16`, `X4` | push + all PRs | S6, S7, S8, S12 |
| `image-gate` — build, run and gate the image before any push | `V10`, `V11` (image half), `V12` (container half) | push + all PRs | S9 |
| `link-check` — **already implemented** | `V4` | push + same-repo PRs | S3 |
| `publish-preview` — branch-head check, Pages deploy, Pages read-back; no release gate precedes publication | `V6`, `V8` (preview half), `V11` (Pages half), `V12` (Pages half) | main push | S10 |
| `attestation` — human gate bound to the commit | `V5` | main push | S10 |
| `publish-release` — branch-head **re-check**, registry push, redeploy trigger, endpoint read-back | `V6` again, `V8` (site half), `V9`, `V14`, `V15` | main push | S10 |

Three constraints follow from the design rather than from preference. A slice that re-decides any of
them fails silently:

1. **Publication is two jobs with one concurrency group, and the branch-head check runs in each.**
   This read "`publish` is one job" until 2026-08-07, on the design's holding that two publication
   targets are not two critical sections. The truth attestation then moved to gate the release only,
   and a CI environment approval gates a **job**, not a step — so a single job can no longer express an
   ordering with a human gate in the middle of it. The two jobs share one group, which means an
   Preview publication depends only on `build`; it does not wait on `image-gate`, `link-check` or
   `attestation`. An interleaving across runs is therefore reachable: `A`'s preview, `B`'s preview,
   then `A`'s release. **The
   branch-head re-check is what makes that safe**, stopping `A`'s release cleanly because `A` is no
   longer head. Without the re-check this split is unsound, so the two changes are one change.
2. **That group does not cancel in progress.** Cancelling mid-publish produces the torn state the
   critical section exists to prevent. The design's mechanism for stopping a superseded run is the
   branch-head check — a clean stop — not cancellation.
3. **The gated image is carried, never rebuilt.** The gate precedes the push and the push follows the
   branch-head check, so the image crosses a job boundary. Rebuilding breaks *the gated image is the
   pushed image*; a staging tag would be a registry write before the branch-head check, which the
   design forbids. That leaves saving and reloading it, with the digest asserted across the boundary.

**All four choices this section named are made, and each is logged.** `U7` settled the base image and
file server and `U3` the attestation mechanism, both on 2026-08-06. The two this document carried as
first acceptance criteria were answered the same day and are recorded in
[`90-decisions.md`](90-decisions.md): the browser driver for `V2` is **Playwright driving Chromium
headless over a local static HTTP server rather than `file://`** (`S8.1`), and the image build and push
mechanism is **GHCR, tagged with the full commit id, with the registry write scoped to
`publish-release` alone** (`S9.1`). Making the decision a slice's own first criterion rather than a
warning in prose is what got both answered before either slice wrote code; that is the shape a future
mechanism choice should take.
---

## Next

`/track` is the usual next step and **cannot run here**: issues are disabled on this repository, so no
slice in this document has a tracker item and there is nothing to sync. `S13` is carried by this
document and by [`90-decisions.md`](90-decisions.md) § *Open* until that changes.

`S13` needs six owner-supplied strings before it can start, and a slice transcribes them rather than
inventing them. Nothing else here is implementable: everything under `## Landed` has shipped, and
everything under `## Blocked` is waiting on a decision rather than on work.
