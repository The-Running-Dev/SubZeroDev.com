# Slices — SubZeroDev.com

Derived from [`10-design.md`](10-design.md) and [`20-contract.md`](20-contract.md). Where this
document and the contract disagree, one of them is a defect; say which rather than reconciling.

## What can be sliced, and what cannot

**Everything on the render and publication path can now be sliced.** The three contract items that
blocked it are answered: [`U1`](20-contract.md#u1--the-package-cannot-accept-a-caller-supplied-body)
released at `0.3.0`, [`U2`](20-contract.md#u2--presentations-token-set-and-primitives) supplied
Presentation's token set on 2026-08-06, and [`U7`](20-contract.md#u7--which-server-serves-the-container-tree)
settled the container's server. Every signature `S4`–`S10` below needs is written in the contract.

**What is not a block, and is not treated as one.** Three things are still outstanding and each is
carried as a `Depends on:` line rather than as a barrier, following the precedent `S2` set when it
waited on the owner's `line` and `stage` values:

- **Owner-supplied copy** — the manifesto prose, the miss page's copy, each route's title and
  description, whether *Effortless Action* appears and in which draft
  ([`10-design.md`](10-design.md) *Open questions* 5), and whether the page links to project source
  ([*Open questions*](10-design.md#open-questions) 4). An implementing agent that reaches a sentence
  the owner has not supplied **stops and asks; it does not write brand voice.**
- **[`U6`](20-contract.md#u6--whether-a-social-image-asset-exists)** — whether a social image asset
  exists. It determines whether three metadata fields are declared at all, so it is `S6`'s to wait on.
- **Two mechanism choices** this document has recorded as needing a decision-log entry
  *before* implementation since it was first written: the browser driver for `V2`, and the image
  build-and-push mechanism. Each is now the first acceptance criterion of the slice that needs it, so
  the decision is a deliverable rather than a note.

**The earlier deferral is discharged.** A previous revision declined to slice `projectTotal`,
`countByStage`, `ecosystemTree`, `contaminationForest` and `sinceYear` because "their sole consumer is
Composition, which is blocked. Writing them now produces a layer with nothing to verify it against."
Composition is no longer blocked, so all five arrive in `S5` **with** that consumer, which is what the
deferral was waiting for. `resolvedHomes` was the exception and shipped in `S3`.

Ten units are fully specified, independently valuable, and deliverable. `S1`–`S3` are done.

**Verticality.** A static site with no runtime has two observable ends: a served document and a CI
outcome. `S1`–`S3` ended at a CI outcome because a served document was blocked. `S4` and `S5` end at a
CI outcome for a different reason — **size, not blockage** — and the distinction matters, because the
old justification no longer applies and reusing it would hide a judgement call. Each of them still
produces a *page*, not a layer: `composeMiss()` and `composeApex(inventory, origin)` each return a complete
document body and the stylesheet it requires. From `S6` on, every slice ends at an emitted or served
document.

**Ordering, and the one place it is not ideal.** The design names its own largest bet plainly — *"the
package hands the generated HTML to a bundler, and what a bundler adds to a document is its business,
not this design's"* — and that bet is exercised in `S6`, the third new slice rather than the first.
It cannot move earlier: the package cannot be handed a body until there is a body, and `A4` requires
**both** routes to be declared at once, so both compositions must exist before anything is emitted.
`S4` and `S5` are the shortest path to that point, and neither adds a layer to get there.

**Numbering.** `S1`–`S3` are fixed and closed; their criteria are ticked checkboxes on merged issues
and are reproduced here verbatim. `S4`–`S10` are allocated by this pass. Nothing is renumbered.

---

## S1 — Repository scaffold and the content gate

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

## S2 — The project inventory

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

## S3 — Outbound link verification

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

## S4 — The visual language and the miss page

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

## S5 — The apex composition

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

## S6 — The emitted document

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

## S7 — The publishable tree

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

## S8 — The browser request capture

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

## S9 — The container image and its in-CI gate

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

## S10 — Publication

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
  - S10.11 The full graph is demonstrated by one workflow run: the shared build completes; `publish-preview` runs without waiting for release gates while image-gate and link-check prepare the release; Pages read-back and those release checks converge before truth attestation; then the branch head is re-checked, the gated image is pushed, the Compose redeploy is triggered, and exact-marker plus unknown-path endpoint read-back licenses the live claim (`V7`, `V15`).

Out of scope: A scheduled post-deploy link re-check —
*Open question* 6. The domain, its DNS records, TLS termination and any reverse proxy or host the
deployment sits behind, which the brief's non-goals still put out of scope permanently, and which
*Open question* 7 (TLS termination) accordingly stays foreclosed rather than answered.

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

**Not blocked by this:** anything that emits or serves a document. `P2`–`P4` stay Presentation's to
maintain, and S4 ships them maintained and unchecked, which S4's *Out of scope* states plainly.
Choosing a browser driver in S8 does not release this — S8 buys a driver, not a surface.

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

---

## The publication CI

The job graph below is derived from [`10-design.md`](10-design.md)'s ordering invariant `V7` and its
*Concurrency and ordering* section. It is recorded here so the shape is not re-derived per slice; it is
not itself a slice, and it allocates no number.

```
build ──┬──► publish-preview ──────────┐
        ├──► image-gate ───────────────┼──► attestation ──► publish-release
        └──► link-check ───────────────┘
```

| Job | Discharges | Runs on | Delivered by |
|---|---|---|---|
| `build` — emit, `finalizeArtifact`, offline assertions, browser capture | `A5`, `R1`–`R3`, `R5`, `R6`, `V1`, `V2`, `V3`, `V13`, `V16`, `X4` | push + all PRs | S6, S7, S8 |
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

**Two of the four choices this section named are made.** `U7` settled the base image and file server,
and `U3` settled the attestation mechanism. The browser driver for `V2` and the image build-and-push
mechanism are still open, and are now the first acceptance criterion of S8 and S9 respectively rather
than a warning in prose.

---

## Next

Run `/track` in a fresh session to open the issues and milestone for `S4`–`S10`. This document opens
none. `S1`–`S3` already have issues and are closed.
