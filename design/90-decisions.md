# Decision log

Append-only. Newest at the top. The rejected alternatives are the point — without them, every future session relitigates the same choice.

## Open
<A staging area, not a home. Things noticed mid-slice that were deliberately not acted on. `/track` turns each into a GitHub issue and removes it from here. An item that is a *decision* rather than a *todo* belongs below as an entry, not in an issue.>

---

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

### 2026-08-05 — Kit install into a new, empty repository
Context: `/install SubZeroDev.com` was run before the repository existed. It was created and git-initialized as an empty repo, so every kit artifact classified as Absent — no reconciliation was needed.
Chosen: Installed `AGENTS.md`, `CLAUDE.md`, `agent.md` (seed kept in full, see below), all `.claude/commands/*.md`, `tools/Measure-Session.ps1` and `tools/Wait-PullRequestCheck.ps1` (with their `.Tests.ps1` companions), `design/` seeded from `templates/design/`, `.github/ISSUE_TEMPLATE/{bug,story}.md`. `codex/PROFILES.md` skipped — no evidence of Codex use.
Rejected: n/a — nothing diverged, nothing was occupied.
Reversibility: cheap
