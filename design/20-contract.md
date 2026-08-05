# Contract — SubZeroDev.com

Derived from [`10-design.md`](10-design.md). Where this document and the design disagree, one of them
is a defect; say which rather than reconciling.

Language: TypeScript. Established by the consumer pattern `SubZeroDev.Platform` proved and by
`SubZeroDev.Platform.UI.LandingPage`'s published `exports`.

Module names below — Content, Presentation, Composition, Adapter, Artifact, Verification — are the
design's module boundaries, not paths.

**One thing in this contract is still blocked, and it is authored brand material rather than a missing
interface.** The external package released `0.3.0` carrying all three capabilities
[`U1`](#u1--the-package-cannot-accept-a-caller-supplied-body) asked for, verified against the
published source, so Adapter's route declarations and default export are written below — as is
Artifact's server configuration, which [`U7`](#u7--which-server-serves-the-container-tree) settled.

**[`U2`](#u2--presentations-token-set-and-primitives) is the only interface still unwritten on the
render path**: Presentation's token set, and with it the two head-metadata values that are visual
identity — `themeColor` and the icon set.

**Off that path, one further surface is unwritten** — the Verification functions that would check
`P2`–`P4`, raised as [`U9`](#u9--accessibility-has-no-verification-surface). It blocks nothing that
emits a document.

What else is missing is content, not interface, and is owner-supplied rather than derivable: whether a
social image exists ([`U6`](#u6--whether-a-social-image-asset-exists)), and each route's title and
description, transcribed at slice time exactly as the inventory's `line` and `question` were.

---

## Types

### Shared

```ts
declare const brandTag: unique symbol;

export type Branded<T, B extends string> = T & { readonly [brandTag]: B };

export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly errors: readonly [E, ...E[]] };
```

`Result` carries a non-empty error list. No function in this contract throws, and no error is a
string.

**`Shared` is a grouping, not a seventh module.** Both types live in **Content** and are exported from
it, which is why `C1` needs no exception: a module that owns them imports nothing to obtain them.
Every module returning a `Result` therefore imports it from Content, and the import lists below name
it where that applies. A separate module was rejected — it would buy a boundary around two type
aliases that carry no behaviour, at the cost of a carve-out in `C1`.

### Content

```ts
export type ProjectId = Branded<string, "ProjectId">;

export type Year = Branded<number, "Year">;

export type AbsoluteUrl = Branded<string, "AbsoluteUrl">;

export type RootRelativePath = Branded<string, "RootRelativePath">;

export type CommitId = Branded<string, "CommitId">;
```

| Type | Constraint |
|---|---|
| `ProjectId` | Matches `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`. Length 1–64. |
| `Year` | Integer, `1000 <= y <= 9999`, and `y <= BuildContext.utcYear`. |
| `AbsoluteUrl` | Parses through the `URL` constructor with no base argument, and `protocol === "https:"`. |
| `RootRelativePath` | Begins with `/`, does not begin with `//`, and for the parent origin `o`, `new URL(path, o).origin === o`. |
| `CommitId` | Matches `/^[0-9a-f]{40}$/`. |

```ts
export type Stage =
  | "Curiosity"
  | "Prototype"
  | "Architecture"
  | "Infrastructure"
  | "Reusable"
  | "Escaped";

export type Genre =
  | "Documentary"
  | "Status Page"
  | "Story"
  | "Evidence"
  | "Journal"
  | "Field Reports"
  | "Comedy";

export type Home =
  | { readonly kind: "own"; readonly url: AbsoluteUrl }
  | { readonly kind: "within"; readonly parent: ProjectId; readonly path: RootRelativePath }
  | { readonly kind: "none" };

export type Project = {
  readonly id: ProjectId;
  readonly name: string;
  readonly year: Year;
  readonly stage: Stage;
  readonly question?: string;
  readonly line: string;
  readonly home: Home;
  readonly genre?: Genre;
  readonly escapedFrom?: ProjectId;
};

export type Inventory = readonly [Project, ...Project[]];
```

`name`, `line`, and `question` where present are non-empty after trimming. `home` is required; the
absence of a home is `{ kind: "none" }`, not a missing property. `question`, `genre` and
`escapedFrom` are absent, never `undefined`-valued and never empty.

```ts
export type BuildContext = {
  readonly commit: CommitId;
  readonly utcYear: Year;
};
```

### Content — derived shapes

```ts
export type StageCount = {
  readonly stage: Stage;
  readonly count: number;
};

export type EcosystemGroup = {
  readonly stage: Stage;
  readonly projects: readonly Project[];
};

export type EcosystemTree = readonly EcosystemGroup[];

export type ContaminationNode = {
  readonly project: Project;
  readonly escapes: readonly ContaminationNode[];
};

export type ContaminationForest = readonly ContaminationNode[];

export type ResolvedHome = {
  readonly projectId: ProjectId;
  readonly url: AbsoluteUrl;
};
```

`EcosystemTree` carries exactly one group per `Stage`, in `stageOrder` order, including groups with
no projects. `ResolvedHome` is produced only for `own` and `within` homes; `none` yields no entry.

### Presentation and Composition

```ts
export type StylesheetText = Branded<string, "StylesheetText">;

export type BodyHtml = Branded<string, "BodyHtml">;

export type ComposedRoute = {
  readonly bodyHtml: BodyHtml;
  readonly stylesheet: StylesheetText;
};
```

Both are branded because both are handed to the external package as strings, and an unbranded `string`
parameter there accepts any string at all — including a document fragment that was never composed.
`BodyHtml` is body **content**, not a `<body>` element: the package owns the shell. `StylesheetText`
is the text of a stylesheet with no `<style>` wrapper, because the package emits the element.

| Type | Constraint |
|---|---|
| `BodyHtml` | Every value interpolated from Content appears HTML-escaped in text position (`X5`). The package inserts this string into the document **unescaped**, so escaping is this repository's obligation and nothing downstream repairs it |
| `StylesheetText` | Contains no `</style` sequence in any case (`P5`). The package emits the text unescaped inside a `<style>` element and throws a bare `Error` on one, which is a failure this contract's error semantics cannot reach |

`ComposedRoute.stylesheet` is the stylesheet **that route's body requires**, not the union of every
rule Presentation can produce. That is what makes `X4` checkable per document rather than only across
the pair.

### Route

```ts
export type RoutePath = "/" | "/404/";
```

The design's `Route` — path, prerendered body, required stylesheet, static head metadata — **is** the
external package's `LandingPageBodyRoute` at `0.3.0`. This repository declares no type of its own
around it and extends nothing.

The package's declaration is reproduced here so the fields this contract constrains are readable.
**The canonical copy is the package's `exports`**; it is not this repository's to change, and a
package upgrade that alters it changes this contract:

```ts
type LandingPageBodyRoute = {
  path: "/" | `/${string}/`;
  body: string;
  stylesheet?: string;
  metadata: LandingPageMetadata;
};
```

`RoutePath` narrows `path` to the two values `A4` permits. `body` carries a `BodyHtml` and
`stylesheet` a `StylesheetText`; both cross the boundary as bare `string`, which is what the brands
exist to guard on this side. The metadata half is the package's `LandingPageMetadata` and needs no
addition — the icon set travels in its existing `icons[].href` as data URIs.

The package's other route form, `LandingPageEntryRoute`, is **never declared here**: it requires an
`entry` and emits `<script type="module">`, which `V13` forbids.

### Artifact

```ts
export type EmittedDocument = {
  readonly relativePath: string;
  readonly html: string;
};

export type ArtifactInput = {
  readonly outputDir: string;
  readonly serverConfigDir: string;
  readonly commit: string;
};

export type ArtifactReport = {
  readonly commit: CommitId;
  readonly markedEntries: readonly string[];
  readonly rootMissEntry: string;
  readonly serverConfigPath: string;
};
```

`ArtifactInput.commit` is the raw value read from the build environment and is **not** a `CommitId`
— validating it is Artifact's first act. `relativePath` and the `*Entry` values are positions inside
the emitted output tree, expressed with `/` separators; they are not repository source paths.

`serverConfigDir` is **not** inside `outputDir`, and `serverConfigPath` is therefore the one value in
this report that is not a position in the published tree. A file the server reads must not also be a
file the server serves: an in-tree configuration would be copied into the container's web root by the
same instruction that copies the documents, and Pages would publish it at the apex. `R6` asserts the
separation.

### Verification

```ts
export type RetryPolicy = {
  readonly attempts: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
  readonly backoff: "fixed" | "exponential";
  readonly attemptTimeoutMs: number;
};

export type Attestation = {
  readonly commit: CommitId;
  readonly approver: string;
};

export type LinkCheckResult = {
  readonly target: ResolvedHome;
  readonly status: number | null;
  readonly attempts: number;
};

export type ReadBackResult = {
  readonly servedCommit: CommitId;
  readonly polls: number;
};

export type ServedResponse = {
  readonly status: number;
  readonly body: string;
};

export type RequestRecord = {
  readonly url: string;
  readonly resourceType: string;
  readonly initiatedByTester: boolean;
};
```

`attempts >= 1`; `initialDelayMs >= 0`; `maxDelayMs >= initialDelayMs`; `attemptTimeoutMs > 0`.
`LinkCheckResult.status` is `null` where every attempt failed before a response.

**`Attestation` carries no timestamp**, and its absence is a decision rather than an omission: the
provider exposes no approval time to read, and the two fields here are the two that can be obtained
from the record without inference. The approval instant is still recorded — by GitHub, in the run and
the audit log — which is what the design requires of the *gate*. See
[`U3`](#u3--where-the-attestation-record-lives).

**The two publication targets are not a type.** Neither Pages nor the image is a value any module
holds; they are workflow configuration, distinguished only by which assertions run against which
address. Modelling them as a union would put a branch in code that has none.

---

## Persisted schemas

**None.** There is no database, no collection, no file this repository writes and reads back, and no
runtime state. Every value above is a compile-time constant materialised into HTML by the build.

Five things resemble persistence and are not:

| Thing | Where it lives | Migration story |
|---|---|---|
| `Project` inventory | Source in this repository | Rebuilt from source on every commit. A change to `Project`'s shape is a compile error, not a migration. |
| Build marker | Injected by Artifact into each emitted document | No existing data. Every artifact is regenerated per commit; an older artifact is replaced, never migrated. |
| Server configuration | Emitted by Artifact beside the output tree, never into it (`R6`) | Regenerated per build from the same source. Nothing reads a previous build's copy, and it is never published. |
| Registry tags | The image registry | A commit tag is written once and never rewritten — the image it names is immutable. `latest` moves and is never an identity. No tag is ever migrated; an old tag stays resolvable, which is what makes a rollback expressible. |
| `Attestation` | A CI approval record, owned by the CI provider | Not read by the build and not read by any later run. An attestation is consumed by exactly one deployment and never re-read. |

`ProjectId` values are never reused and never renumbered, so no rename or remap path exists to
define.

---

## Public signatures

Internal helpers are out of scope. Only surfaces crossing a module boundary appear.

### Content

```ts
export const stageOrder: readonly Stage[];

export const primarySlogan: "Well… Why not?";

export const apexFooterQuote: "Trust us… It'll be fine. Or not.";

export const projects: readonly Project[];

export function validateInventory(
  projects: readonly Project[],
  context: BuildContext,
): Result<Inventory, ContentError>;

export function parseCommitId(value: string): CommitId | null;

export function projectTotal(inventory: Inventory): number;

export function countByStage(inventory: Inventory): readonly StageCount[];

export function ecosystemTree(inventory: Inventory): EcosystemTree;

export function contaminationForest(inventory: Inventory): ContaminationForest;

export function sinceYear(inventory: Inventory): Year;

export function resolvedHomes(inventory: Inventory): readonly ResolvedHome[];
```

`projects` is the hand-authored inventory source and the **only unvalidated export in this contract**.
It is `readonly Project[]` and not `Inventory`: it carries no guarantee that any invariant holds, and
it exists so that `validateInventory` and Verification have something to read. Its field brands are
applied at the authoring site rather than earned there — which is why the *Error semantics* table
anticipates raw values that fail their own constraints. The brands gate the derivations; runtime
validation is `validateInventory`'s alone. `C14` is what stops `projects` becoming a second entry
point into the module's data.

Every function other than `validateInventory` and `parseCommitId` takes an `Inventory`, which only
`validateInventory` can produce. They are total on that input and return no error.
`validateInventory` is the sole validating entry point into the module's data.

`parseCommitId` is here because Content owns `CommitId` and Artifact depends on Content for that type.
It returns `null` rather than an error variant: its one caller turns that into `CommitIdMalformed`, and
a second error vocabulary for a single-condition parse would buy nothing. It is the **only**
implementation of the 40-hex rule; a second one is the drift *Single ownership* forbids.

`stageOrder` is the lifecycle order, length 6, covering `Stage` exactly once.

### Presentation

```ts
export const stylesheet: StylesheetText;
```

That the module produces its stylesheet as text is determined by the design. Which tokens, scale
steps, palette entries and layout primitives exist — and therefore the rest of the module's exported
surface, including how a route obtains only the rules its body requires — is authored visual identity
and is not written here. See [`U2`](#u2--presentations-token-set-and-primitives). `P1`–`P5` hold
whatever the set turns out to be.

### Composition

```ts
export function composeApex(inventory: Inventory): ComposedRoute;

export function composeMiss(): ComposedRoute;
```

These two are the module's entire public surface. Both are total and neither can fail: an `Inventory`
cannot be malformed by construction, and neither function performs I/O.

`composeMiss` takes no inventory because the miss document displays nothing derived from one. If it
ever must — a project count, the since year — that is a contract amendment, not an implementer's call,
because `X1` makes every figure on a page a Content derivation and a composition with no data cannot
carry one.

**Adapter supplies the `Inventory`.** `composeApex` takes it as a parameter and Composition never
validates, imports `projects` or reads the environment. See *Adapter* below and
[`U8`](#u8--the-validateinventory-call-site-and-load-time-failure).

### Adapter

```ts
export const origin: "https://subzerodev.com";

export const apexPath: "/";

export const missPath: "/404/";

declare const config: LandingPageConfig;
export default config;
```

The default export is the whole of Adapter's renderable surface: the package CLI loads this module
and reads `config`. No repository module imports Adapter — Verification's assertions over `A4` and
`A6` necessarily do, which is the same reading Verification's own boundary rule takes.

`config.routes` is exactly two `LandingPageBodyRoute` values, in this order — the apex at `apexPath`
carrying `composeApex(inventory)`, and the miss at `missPath` carrying `composeMiss()` — each route's
`body` and `stylesheet` taken from that route's own `ComposedRoute`.

Five fields are declared **absent**, in four groups, and each absence is load-bearing rather than a
default:

| Field | Absent because |
|---|---|
| `config.styles` | The package declares it and **reads it nowhere** at `0.3.0` — verified against the published source, the same way `hydrate` is declared and unread. Presentation's output therefore travels in each route's own `stylesheet`, which is also what makes `X4` a per-document check rather than a check across the pair |
| `config.publicDir`, `config.allow` | This repository emits no public asset and imports nothing from outside the site root. Note that omitting `publicDir` does not disable it — the package falls back to a `public` directory beside the adapter, which this repository does not create. A public directory is the one path by which a linked asset could enter the tree, and `V13` is what catches one that does |
| `metadata.noScript` | [`U5`](#u5--noscript-is-withdrawn-pending-an-owner-edit-to-the-brief). For a body route the package appends it **inside the body**, so a declaration here would put a false sentence in the document's prose |
| `metadata.repositoryUrl` | The package's adapter path does not emit it. Declaring it would be inert, and an inert declaration reads as a fact about the document |

`metadata.canonicalUrl` and `metadata.openGraph.url` are `origin` concatenated with that route's
path; `metadata.openGraph.type` is `"website"`. `A1` asserts the pairing so no second origin string
exists to drift.

The remaining metadata values are **not** written here and are not this contract's to author.
`themeColor` and `icons` are visual identity ([`U2`](#u2--presentations-token-set-and-primitives)). `socialImageUrl`,
`openGraph.imageUrl` and the whole `twitter` block turn on whether a social image exists
([`U6`](#u6--whether-a-social-image-asset-exists)). `title`, `description` and the Open Graph title
and description are owner-supplied copy. A slice transcribes them; it does not invent them.

`missPath` is the canonical declaration of the miss route's path. Artifact's `missEmittedEntry` is the
package's emitted mapping of exactly this value and must change with it; `R5` asserts the pairing.

**Adapter is the `validateInventory` call site.** It is the module the package CLI loads, so it is the
one place in the import graph where the build's entry conditions are read and where the build can
still refuse to produce anything. It constructs `BuildContext` from the environment — the commit
through `parseCommitId`, the UTC year — calls `validateInventory(projects, context)`, and on
`{ ok: false }` reports **every** `ContentError` and terminates the build with a non-zero exit,
rendering nothing. On `{ ok: true }` it hands the `Inventory` to `composeApex` and declares the two
routes. That handling is the whole of `A5`, and it is why `C14`'s closed importer set names Adapter.

It is a process exit, not a thrown exception and not a string error: *Error semantics* holds, and the
failure is expressible where a `Result` returned from module evaluation would have had no caller.

Adapter and Artifact each read the commit from the environment independently — Adapter for
`BuildContext`, Artifact for the marker — and both parse it with Content's `parseCommitId`. That they
agree is not assumed: `V1` compares the marker in every emitted document against the commit being
built.

### Artifact

```ts
export const missEmittedEntry: "404/index.html";

export const missRootEntry: "404.html";

export const serverConfigFilename: "default.conf";

export const buildMarkerPrefix: "<!-- build-commit: ";

export const buildMarkerSuffix: " -->";

export function buildMarker(commit: CommitId): string;

export function serverConfig(): string;

export function injectBuildMarker(
  documentHtml: string,
  commit: CommitId,
): Result<string, ArtifactError>;

export function finalizeArtifact(
  input: ArtifactInput,
): Promise<Result<ArtifactReport, ArtifactError>>;
```

**The marker format.** `buildMarker(commit)` is exactly
`` `${buildMarkerPrefix}${commit}${buildMarkerSuffix}` `` — an HTML comment carrying the full
forty-character commit id. `injectBuildMarker` inserts it immediately before the first `</head>` and
nowhere else, and fails rather than producing a second one. The format is a comment, not a
`<meta name>` element: an unregistered `meta` name is flagged by a conforming HTML validator, and this
design has already refused once to ship output it would have to except from validation. It is
extractable from a raw response body by a fixed pattern, with nothing parsed and nothing executed, and
because Artifact runs after the bundler no minifier ever sees it.

**`finalizeArtifact`'s order of operations is part of the contract, not an implementation detail.** It
validates `input.commit`, copies `missEmittedEntry` to `missRootEntry`, injects the marker into every
`.html` document in the tree — the copy included — and writes `serverConfig()` last, into
`serverConfigDir`. Copying before injecting is what makes `R2` hold: both documents are marked in the
same pass and stay byte-identical. Injecting first and copying after would also work today and would
break silently the day a second post-build rewrite is added. The configuration is written last and
outside `outputDir`, so it is neither a document nor a marking candidate and no ordering question
about it can arise.

**`serverConfig` is Artifact's third duty and takes no argument.** It returns the container server's
configuration text — the format belongs to `nginx`, per [`U7`](#u7--which-server-serves-the-container-tree),
and the two directives that express the requirement are recorded there rather than restated here.
It is pure and deterministic, so the text is assertable without a filesystem, a container or a
network: a test can require it to resolve an unknown path to `missRootEntry` with a 404 status
(`R4`) and to name no path this repository does not emit. `V12` verifies the behaviour the file is
supposed to produce; this function is what makes the file itself checkable before an image exists.

Artifact imports `CommitId`, `parseCommitId` and `Result` from Content, and nothing else from this
repository.

### Verification

```ts
export const linkCheckRetry: RetryPolicy;

export const deploymentPollRetry: RetryPolicy;

export function readBuildMarker(documentHtml: string): Result<CommitId, VerificationError>;

export function checkLinks(
  targets: readonly ResolvedHome[],
  policy: RetryPolicy,
): Promise<Result<readonly LinkCheckResult[], VerificationError>>;

export function pollForCommit(
  url: AbsoluteUrl,
  expected: CommitId,
  policy: RetryPolicy,
): Promise<Result<ReadBackResult, VerificationError>>;

export function assertNoAdditionalRequests(
  records: readonly RequestRecord[],
): Result<null, VerificationError>;

export function assertAttestation(
  attestation: Attestation | null,
  commit: CommitId,
): Result<null, VerificationError>;

export function assertContentPresent(
  documentHtml: string,
  manifestoSentences: readonly [string, ...string[]],
  inventory: Inventory,
): Result<null, VerificationError>;

export function assertDeploymentCandidateCurrent(
  commit: CommitId,
  branchHead: CommitId,
): Result<null, VerificationError>;

export function assertSelfContained(
  documentHtml: string,
): Result<null, VerificationError>;

export function assertStyleAgreement(
  bodyHtml: BodyHtml,
  stylesheet: StylesheetText,
): Result<null, VerificationError>;

export function assertEveryDocumentMarked(
  documents: readonly EmittedDocument[],
  commit: CommitId,
): Result<null, VerificationError>;

export function assertRootMissDocument(
  documents: readonly EmittedDocument[],
): Result<null, VerificationError>;

export function assertUnknownPathResponse(
  response: ServedResponse,
  emittedMissDocument: string,
): Result<null, VerificationError>;

export function assertServedBytesMatchEmitted(
  served: Uint8Array,
  emitted: Uint8Array,
): Result<null, VerificationError>;

export function assertImageIdentity(
  imageTag: string,
  servedMarker: CommitId,
  commit: CommitId,
): Result<null, VerificationError>;
```

Concrete policy values:

| Constant | attempts | backoff | initialDelayMs | maxDelayMs | attemptTimeoutMs |
|---|---|---|---|---|---|
| `linkCheckRetry` | 3 | `exponential` | 1000 | 8000 | 10000 |
| `deploymentPollRetry` | 60 | `fixed` | 5000 | 5000 | 10000 |

`readBuildMarker` reads the format Artifact owns, through Artifact's exported constants. It never
restates the pattern.

**`checkLinks` returns no per-target result on failure.** `Result`'s error branch carries errors
only, so a run with any failing target yields no `LinkCheckResult` at all — including for the targets
that passed. Each failing target's attempt count and observed status therefore travel in that
target's `VerificationError.detail` and `observed`, which is the only place they are readable. This
is accepted rather than designed around: `Result` is the one error shape every module returns, and a
bespoke both-branches type for one function's diagnostics would be paid for at every other call site.
The cost lands on the acceptance criteria that name `attempts` for a failing target, which are
checkable only against the stub that answered — see [`30-slices.md`](30-slices.md) § S3.

`checkLinks` does not follow redirects. A 3xx is a pass, per the `LinkNotOk` row below, so a target
that has begun redirecting to a parked page, a registrar hold or a login wall satisfies `V4`. The
gate proves an address still answers, not that what answers is still the project.

**Four codes previously had no producing function, and two invariants no callable surface.** The three
signatures that close it are the two added above and `assertAttestation`'s changed first parameter:

| Code | Producer | Discharges |
|---|---|---|
| `ManifestoAbsent`, `ProjectNameAbsent` | `assertContentPresent` | `V3` |
| `StaleDeploymentCandidate` | `assertDeploymentCandidateCurrent` | `V6` |
| `AttestationAbsent` | `assertAttestation`, given `null` | `V5` |

`assertAttestation` takes `Attestation | null` because absence is the condition `AttestationAbsent`
names, and a parameter that cannot be absent cannot express it. The `publish` job passes what it read
from the run's approval record, and `null` where there was none.

`assertContentPresent` takes the `Inventory` rather than a list of names, so a caller cannot satisfy
`V3` by passing three of fourteen. `manifestoSentences` is non-empty for the same reason: an empty
list would pass vacuously. Both lists are compared as **literal text** against the document. A
manifesto sentence or a project `name` containing `&`, `<` or `>` will have been escaped by `X5` and
will therefore not match — that is accepted rather than worked around, because the failure is a red
build naming the value, and the alternative is a second escaping implementation in the module least
able to own one.

`assertDeploymentCandidateCurrent` compares two values and reads nothing, in the same shape as
`assertImageIdentity`: the workflow observes the deployment branch's head at the top of the critical
section and passes it in. Keeping the observation outside the function is what lets `V6` be tested
without a repository, a token or a network.

Every `assert*` function reports **all** faults it finds in one `Result`, not the first. A style
disagreement with four unmatched classes returns four errors.

`assertUnknownPathResponse` requires the served body to **equal** `emittedMissDocument`, not to
contain it. A containment check passes on a host that serves the right composition wrapped in its own
error chrome, which is a different page from the one that was built and verified.

`assertServedBytesMatchEmitted` compares bytes rather than parsed documents, because the failure it
exists to catch is a transform applied on one publication path and not the other, and a transform that
preserves the parse tree still changes what a crawler receives.

**No repository module imports Verification.** Its own tests necessarily do — a module nothing may
import is a module nothing can test — so the boundary is enforced over `src`, not over the whole
tree.

---

## Error semantics

### Content

```ts
export type ContentErrorCode =
  | "EmptyInventory"
  | "MalformedProjectId"
  | "DuplicateProjectId"
  | "InvalidYear"
  | "YearAfterBuild"
  | "EmptyField"
  | "HomeOwnUrlInvalid"
  | "HomeWithinParentMissing"
  | "HomeWithinParentNotOwn"
  | "HomeWithinOriginEscape"
  | "EscapedFromTargetMissing"
  | "EscapedFromSelfReference"
  | "EscapedFromCycle";

export type ContentError = {
  readonly code: ContentErrorCode;
  readonly projectId: ProjectId | null;
  readonly field: string | null;
  readonly detail: string;
};
```

Every variant is deterministic and **not retryable**. In every case the caller — the build — exits
non-zero and publishes nothing. There is no default value, no fallback stage, no dropped project and
no silently empty section. `validateInventory` reports **all** failures in one `Result`, never the
first only.

| Code | Raised when | `projectId` | `field` |
|---|---|---|---|
| `EmptyInventory` | The inventory has no projects | `null` | `null` |
| `MalformedProjectId` | An `id` fails the `ProjectId` pattern or length | the raw value | `"id"` |
| `DuplicateProjectId` | Two projects share an `id` | the duplicate | `"id"` |
| `InvalidYear` | `year` is non-integer or outside 1000–9999 | set | `"year"` |
| `YearAfterBuild` | `year > BuildContext.utcYear`, where `year` is otherwise a valid four-digit integer. `InvalidYear` takes precedence, so one bad value yields one error rather than two carrying the same `field` | set | `"year"` |
| `EmptyField` | `name`, `line`, or a present `question` is empty after trimming | set | the field |
| `HomeOwnUrlInvalid` | `home.url` fails the `AbsoluteUrl` constraint | set | `"home.url"` |
| `HomeWithinParentMissing` | `home.parent` is not an `id` in the inventory | set | `"home.parent"` |
| `HomeWithinParentNotOwn` | `home.parent` exists but its own `home.kind` is not `"own"` | set | `"home.parent"` |
| `HomeWithinOriginEscape` | `home.path` is not root-relative, or resolving it against the parent origin changes the origin | set | `"home.path"` |
| `EscapedFromTargetMissing` | `escapedFrom` names no project in the inventory | set | `"escapedFrom"` |
| `EscapedFromSelfReference` | `escapedFrom === id` | set | `"escapedFrom"` |
| `EscapedFromCycle` | The `escapedFrom` edge set contains a cycle | each project on the cycle | `"escapedFrom"` |

### Artifact

```ts
export type ArtifactErrorCode =
  | "CommitIdMalformed"
  | "OutputTreeMissing"
  | "MissDocumentMissing"
  | "MarkerInsertionPointMissing"
  | "MarkerAlreadyPresent"
  | "WriteFailed";

export type ArtifactError = {
  readonly code: ArtifactErrorCode;
  readonly entry: string | null;
  readonly detail: string;
};
```

`entry` is a position inside the emitted output tree, with one exception: for a failed
server-configuration write it is `serverConfigFilename`, which is outside that tree by `R6`.

Every variant is **not retryable**, including `WriteFailed`: a build that could not write its own
output directory has an environment fault, and retrying inside the step would hide it. In every case
the caller — the build — exits non-zero and publishes nothing.

**State left behind:** a partially rewritten output tree. It is never published, and the next build
starts from a clean output directory rather than repairing it.

| Code | Raised when | `entry` | Caller does |
|---|---|---|---|
| `CommitIdMalformed` | `ArtifactInput.commit` fails `parseCommitId` | `null` | Fail the build. The environment supplied no usable commit, so nothing can be marked |
| `OutputTreeMissing` | `outputDir` does not exist, or contains no `.html` document | `null` | Fail the build. The package build did not produce a tree |
| `MissDocumentMissing` | `missEmittedEntry` is absent from the tree | `missEmittedEntry` | Fail the build. The miss route did not emit, so no root miss document can exist |
| `MarkerInsertionPointMissing` | A document contains no `</head>` | the document | Fail the build |
| `MarkerAlreadyPresent` | A document already carries a build marker before injection | the document | Fail the build. Artifact ran twice, or the package emitted a marker of its own |
| `WriteFailed` | A copy, a rewrite, or the server-configuration write failed at the filesystem | the document, or `serverConfigFilename` | Fail the build |

### Verification

```ts
export type VerificationErrorCode =
  | "LinkUnreachable"
  | "LinkNotOk"
  | "MarkerAbsent"
  | "MarkerDuplicate"
  | "MarkerMismatch"
  | "PollExhausted"
  | "UnexpectedRequest"
  | "ScriptElementPresent"
  | "LinkedStylesheetPresent"
  | "ExternalAssetReference"
  | "ClassWithoutRule"
  | "SelectorWithoutUser"
  | "RootMissDocumentAbsent"
  | "UnknownPathStatusWrong"
  | "UnknownPathBodyWrong"
  | "ServedBytesMismatch"
  | "ImageTagCommitMismatch"
  | "AttestationCommitMismatch"
  | "AttestationAbsent"
  | "ManifestoAbsent"
  | "ProjectNameAbsent"
  | "StaleDeploymentCandidate";

export type VerificationError = {
  readonly code: VerificationErrorCode;
  readonly detail: string;
  readonly observed: string | null;
  readonly expected: string | null;
};
```

| Code | Raised when | Retryable | Caller does |
|---|---|---|---|
| `LinkUnreachable` | Every attempt for one target failed before a response | Yes, within `linkCheckRetry`; exhaustion is terminal | Fail the gate, deploy nothing |
| `LinkNotOk` | A target responded outside 2xx/3xx. A 3xx is a pass and the redirect is never followed, so a redirected-away target is not detected here | No | Fail the gate, deploy nothing |
| `MarkerAbsent` | An emitted or served document carries no build marker | No | Fail the build or the read-back |
| `MarkerDuplicate` | A document carries more than one build marker | No | Fail the build. Artifact's single-injection guarantee is broken |
| `MarkerMismatch` | The served marker is a valid `CommitId` other than the expected one | Yes, within `deploymentPollRetry` — a cache or an in-flight publish | Keep polling; on exhaustion report `PollExhausted`. From `assertImageIdentity`, not retryable — the image is already built |
| `PollExhausted` | `deploymentPollRetry` was consumed without an exact marker match | No | Report the deploy failed. **Announce no live URL** |
| `UnexpectedRequest` | The browser capture recorded a load-triggered request other than the navigation document | No | Fail the gate, deploy nothing |
| `ScriptElementPresent` | An emitted document contains a `<script>` element | No | Fail the build |
| `LinkedStylesheetPresent` | An emitted document links a stylesheet rather than inlining it | No | Fail the build |
| `ExternalAssetReference` | An emitted document references an asset by URL other than a data URI or an outbound link | No | Fail the build |
| `ClassWithoutRule` | A class in a route's body has no selector in that route's stylesheet | No | Fail the build. **Never a warning** |
| `SelectorWithoutUser` | A selector in a route's stylesheet matches nothing in that route's body | No | Fail the build |
| `RootMissDocumentAbsent` | `missRootEntry` is absent from the finished tree | No | Fail the build |
| `UnknownPathStatusWrong` | A unique unknown path answered with a status other than 404 | No | Fail the gate or report the deploy failed. A 200 here is a soft 404 |
| `UnknownPathBodyWrong` | A unique unknown path answered 404 with a body other than the emitted miss document | No | Fail the gate or report the deploy failed |
| `ServedBytesMismatch` | What the running image serves for `/` differs byte for byte from the emitted document | No | Fail the image gate. **Never push** |
| `ImageTagCommitMismatch` | The image tag is not the full commit id being released | No | Fail the image gate. Never push |
| `AttestationCommitMismatch` | `Attestation.commit` differs from the commit being deployed | No | Refuse to deploy. An attestation is never reused |
| `AttestationAbsent` | `assertAttestation` was given `null` — the run carries no approval record | No | Refuse to deploy |
| `ManifestoAbsent` | A known manifesto sentence is missing from built HTML with scripting never executed | No | Fail the build |
| `ProjectNameAbsent` | A project `name` is missing from built HTML with scripting never executed | No | Fail the build |
| `StaleDeploymentCandidate` | At the critical section's start, this run's commit is no longer the deployment-branch head | No | Stop before publishing. This is a clean stop, not a failure |

### Composition, Presentation, Adapter

**No error type.** Composition and Presentation operate only on an `Inventory`, which cannot be
malformed by construction, and neither performs I/O.

Adapter declares none of its own either, and **handles** `ContentError`: it is the sole
`validateInventory` call site, and its whole response to `{ ok: false }` is to report every error and
exit non-zero. There is no Adapter-specific failure to name — a malformed inventory is a Content
fault, and an inventory that validates leaves Adapter nothing that can fail.

**Bare exceptions exist in the system and none of them is ours.** At `0.3.0` the external package
throws `Error` from `defineLandingPage` on an empty route list, and from `assertRoute` on a route
declaring neither or both of `entry` and `body`, on a `stylesheet` declared beside an `entry`, and on
a stylesheet containing `</style`. Nothing here catches any of them.

The first three are compile-time-visible defects under `LandingPageBodyRoute` and `A4`, not runtime
paths. **The fourth is not**: a stylesheet is generated text, so nothing about the declaration's shape
prevents it. `P5` is what keeps that throw unreachable, which is why it is an invariant on
Presentation rather than a note here.

---

## Invariants

Each is stated so it can become an assertion. The named module is responsible for maintaining it;
where a separate module checks it, that is said in the row.

| Id | Invariant | Owner |
|---|---|---|
| **C1** | Content imports no other repository module | Content |
| **C2** | `Inventory` has at least one project | Content |
| **C3** | `ProjectId` is unique across the inventory | Content |
| **C4** | Every `ProjectId` matches the pattern and length above | Content |
| **C5** | Every `year` is a four-digit integer no greater than `BuildContext.utcYear` | Content |
| **C6** | Every `home.parent` names an existing project whose own `home.kind` is `"own"` | Content |
| **C7** | For every `within` home, `path` begins with `/`, does not begin with `//`, and `new URL(path, parentOrigin).origin === parentOrigin` | Content |
| **C8** | Every `escapedFrom` names an existing project, never itself, and the edge set is acyclic — the relation is a forest | Content |
| **C9** | `stageOrder` contains each `Stage` exactly once, in lifecycle order | Content |
| **C10** | `sinceYear(inventory)` equals the minimum `year` in the inventory | Content |
| **C11** | `ecosystemTree` has one group per `Stage` in `stageOrder` order; within a group projects ascend by `id`; every project appears exactly once across all groups | Content |
| **C12** | `countByStage` has one entry per `Stage` in `stageOrder` order, and its counts sum to `projectTotal` | Content |
| **C13** | `resolvedHomes` yields one entry per `own` and `within` home and none for `none` | Content |
| **C14** | Nothing imports `projects` except the `validateInventory` call site — Adapter once it exists, and until then the committed-inventory assertion — and Verification's assertions over the inventory. No derivation function, no Composition entry and no Artifact step reads it | Content |
| **C15** | `parseCommitId` is the only implementation of the `CommitId` pattern in the repository | Content |
| **P1** | Nothing in Presentation references a linked font, an external stylesheet, a gradient or an illustration asset | Presentation |
| **P2** | The rendered page is legible in greyscale | Presentation |
| **P3** | Nothing animates under `prefers-reduced-motion: reduce` | Presentation |
| **P4** | Focus order matches visual order and every interactive element is keyboard-reachable | Presentation |
| **P5** | No `StylesheetText` contains a `</style` sequence in any case — the package emits it unescaped inside a `<style>` element and throws on one | Presentation |
| **X1** | No count, total, year or other figure on the page is a typed literal; each comes from a Content derivation | Composition |
| **X2** | Composition imports only Content and Presentation, and nothing imports Composition except Adapter | Composition |
| **X3** | The page contains no form, no analytics, no consent surface and no third-party script | Composition |
| **X4** | For each `ComposedRoute`, every class referenced in `bodyHtml` has a matching selector in `stylesheet`, and every selector in `stylesheet` has a user in `bodyHtml` — checked by `assertStyleAgreement` | Composition |
| **X5** | Every Content value interpolated into `bodyHtml` — `name`, `line`, a present `question` — is HTML-escaped in text position; `<`, `>`, `&`, `"` and `'` never reach the document unescaped from a content value. Asserted with a fixture project carrying all five | Composition |
| **A1** | Every URL in route metadata is built from `origin`; no origin string is written twice. Each route's `canonicalUrl` and `openGraph.url` equal `origin` concatenated with that route's `path` | Adapter |
| **A2** | Every icon is embedded in the document as a data URI; no icon is a linked asset | Adapter |
| **A3** | Adapter obtains everything renderable from Composition; it imports Content only for `projects`, `validateInventory`, `BuildContext` and `parseCommitId`, and never for a derivation function or a copy constant. It reads nothing from Presentation | Adapter |
| **A4** | Exactly two routes are declared: `apexPath` and `missPath` | Adapter |
| **A5** | Adapter validates the inventory exactly once; on failure it reports every `ContentError` and exits non-zero, and no route body, stylesheet or document is produced | Adapter |
| **A6** | Both routes are `LandingPageBodyRoute` values: neither declares `entry`, `hydrate` or `noScript`, and the configuration declares no `styles`, `publicDir` or `allow`. Each route's stylesheet travels in its own `stylesheet` field | Adapter |
| **R1** | Every emitted document carries exactly one build marker, and it carries the commit being built | Artifact |
| **R2** | `missRootEntry` and `missEmittedEntry` are byte-identical in the finished tree | Artifact |
| **R3** | Artifact compiles nothing, bundles nothing and resolves no module; the only change it makes to a document is the marker | Artifact |
| **R4** | The emitted server configuration resolves every unknown path to `missRootEntry` with status 404; sets no cookie, no cache-control directive chosen by application logic, and no tracking or rewrite header; and executes nothing per request. A response header that is an unconfigured byproduct of serving a static file over HTTP — a content-type, a content-length, a last-modified time, an entity tag, the server's own identifying header — is not a violation | Artifact |
| **R5** | `missEmittedEntry` is the package's emitted entry for Adapter's `missPath` — checked against the emitted tree, never assumed | Artifact |
| **R6** | The emitted server configuration is written outside `outputDir` and never appears in the published tree, on either target | Artifact |
| **V1** | No document reaches publication unless it carries the exact commit's marker | Verification |
| **V2** | Loading a route document triggers zero requests other than the navigation document itself | Verification |
| **V3** | Every manifesto sentence asserted, and every project `name`, appears in built HTML with scripting never executed | Verification |
| **V4** | Every `ResolvedHome` responds 2xx or 3xx before deployment | Verification |
| **V5** | An `Attestation` is valid for exactly one `CommitId` and is never accepted for another | Verification |
| **V6** | Publication happens only while this run's commit is the deployment-branch head | Verification |
| **V7** | The ordering holds: content validation → render → package build → Artifact → offline verification → image build → in-CI image gate → networked link check and truth attestation → branch-head check → Pages deploy and registry push → exact-marker and unknown-path read-back → live claim | Verification |
| **V8** | No live URL is stated or implied until `pollForCommit` returns `ok` for the exact commit **and** the unknown-path check passes | Verification |
| **V9** | No image is pushed to the registry unless the in-CI gate passed for that image | Verification |
| **V10** | The image tag equals the full commit id, and equals the marker the running image serves | Verification |
| **V11** | What the running image serves for `/` is byte-identical to the emitted apex document | Verification |
| **V12** | An unknown path returns status 404 carrying the emitted miss document, on **both** targets | Verification |
| **V13** | No emitted document contains a script element, a linked stylesheet or an external asset reference | Verification |
| **V14** | No image tag is stated or implied until the push for that tag has succeeded and the tag resolves in the registry | Verification |

Three things the design states that this contract deliberately does **not** encode as build-time
checks, because encoding them would duplicate a fact another module owns or claim a check that cannot
be performed:

- **`home.url` addresses the project's own site.** Checking that its host is a subdomain of the apex
  would require Content to know the apex origin, which Adapter owns (`A3`). Covered by the release
  attestation and by `V4`, not by a Content assertion.
- **`genre` and `stage` are true of the project.** Both are authored facts. `Genre` is closed at the
  type level; whether the assigned value is the right one is attestation work.
- **The deployed compose stack serves the published image.** The design guarantees a published image
  is correct and stops there. `V9`–`V12` cover the artifact; nothing here observes a delivery
  environment, and no invariant claims to.

---

## Unresolved

Nothing below is invented. Each item names what is missing and what would settle it. **Numbers are
stable and are never reused** — [`30-slices.md`](30-slices.md) cites these by number, and an item keeps
its number even where it has narrowed or been answered. No range is named here, because a range rots
the moment a higher number is cited.

### U1 — The package cannot accept a caller-supplied body

**Answered 2026-08-06: released at `0.3.0`, with all three capabilities including the preferred one.**
Retained so citations resolve.

Verified against the published package, not its documentation: `npm` carries `0.3.0`, whose `gitHead`
is `ab44435e3bc1af90509dd0364856a84aa7d932e8` — the `Release landing page package 0.3.0 (#8)` commit —
so the inspected source is the published source. `LandingPageRoute` is now
`LandingPageEntryRoute | LandingPageBodyRoute`. A `LandingPageBodyRoute` carries `body: string` and
`stylesheet?: string`, has **no** `entry` field, and the adapter emits the `<script type="module">`
only on the entry-route branch. The stylesheet is emitted as a `<style>` element inside `<head>`.
`LandingPageMetadata.noScript` remains optional, so `U5`'s decision to declare none still holds.

**Written 2026-08-06.** Adapter's default export, its two route declarations and the metadata rules
are in *Public signatures*, and `A1`, `A2`, `A4` and `A6` are enforceable against them. The
`styles`-versus-`stylesheet` question this entry left open is answered by inspection rather than by
preference: `LandingPageConfig.styles` is **read by nothing** at `0.3.0`, exactly as `hydrate` is, so
Presentation's output travels in each route's own `stylesheet`. Two package behaviours found in the
same reading became invariants here — the body and the stylesheet are both inserted **unescaped**,
which is `X5` and `P5`.

Only metadata *values* remain unwritten, and none of them is blocked by the package: `themeColor` and
`icons` by `U2`, the social-image fields by `U6`, and the titles and descriptions by their being
owner-supplied copy.

The paragraphs below describe the superseded `0.2.0` state and are retained as the record of what was
asked for and why.

Verified against `subzerodev-platform-ui-landing-page@0.2.0`: the adapter composes one fixed document
per route — `<div id="root"></div>` plus `<script type="module" src="…">` — and hands it to Vite.
`LandingPageRoute` requires an `entry` and declares no field for a body or a stylesheet.
`LandingPageRoute.hydrate?: boolean` exists and is read by nothing.

Required of the package, and **only these**:

1. Emit a caller-supplied body into the document instead of the fixed shell.
2. Omit the entry script when a body is supplied, so the emitted document loads nothing.
3. Preferred, not required: accept a caller-supplied stylesheet and emit it as a `<style>` element in
   the head. Without it the stylesheet has nowhere conforming to go, since `<style>` is not conforming
   in `<body>`.

This is narrower than the four requirements the previous revision recorded. The root `404.html` and
the build marker moved to Artifact and are written above; the icon set needs no package change, since
`LandingPageIcon.href` is a string and a data URI is a URL.

**Blocked by U1:** Adapter's `LandingPageConfig` default export, its two route declarations and their
metadata — the field names carrying a body and a stylesheet do not exist yet, and a contract may not
invent another repository's public interface. `A1`, `A2` and `A4` are unenforceable until they do.

Per the design's *Failure modes*, that is a slice in `SubZeroDev.Platform.UI.LandingPage`, not
something improvised here. **This contract stops at that boundary.**

### U2 — Presentation's token set and primitives

**This is now the only thing blocking the render path.** `U1`, `U3`, `U4` and `U7` are answered; every
signature they gated is written. Composition depends on Presentation and Adapter on Composition, so
nothing that emits a document can be sliced until this is authored — and it needs the owner, not a
model.

It also gates two head-metadata values that are visual identity rather than interface: `themeColor`,
and the icon set that travels as data URIs in `icons[].href` (`A2`).

The design fixes the constraints — dark-first, minimal, typography-first, large whitespace, no
gradient, no illustration, no webfont — and names no token, no scale step and no primitive. A token
set written here would be authored visual identity, which is brand material and not the contract's to
author. The same gap covers how a route obtains only the rules its body requires, which `X4` demands
and which depends on what a primitive is. `stylesheet: StylesheetText` is written; the rest is not.
`P1`–`P5` hold regardless of what the set turns out to be.

### U3 — Where the attestation record lives

**Answered 2026-08-06: a protected GitHub Environment with required reviewers.** Retained so citations
resolve.

The `publish` job targets the environment; a human approves; the provider records approver and
timestamp. `assertAttestation` reads the run's approval record and takes the commit from the run's
`head_sha`, so the commit is derived rather than stored. An approval cannot be replayed onto another
run, which satisfies `V5` natively.

**Verified 2026-08-06, and it does not supply one of the three fields.** `GET /repos/{owner}/{repo}/actions/runs/{run_id}/approvals`
returns an array of environment approvals carrying `state`, `user`, `comment` and an `environments`
array. Read access to the repository is the whole permission requirement, so the `publish` job needs
no scope it does not already have. `Attestation.approver` is `user.login` and `Attestation.commit` is
the run's `head_sha`.

**`Attestation.attestedAtUtc` has no source on that endpoint.** The approval object carries no
timestamp; the `created_at` and `updated_at` inside `environments[]` are the *environment resource's*
timestamps, not the approval's, and reporting one as the moment a human approved would be a
fabricated fact. `GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses` does carry
`created_at` and `creator.login`, but its creator is the run's actor rather than the approver, so
combining the two endpoints yields a record whose two halves describe different people.

**Resolved 2026-08-06 on the owner's ruling: the field is dropped.** `Attestation` is `commit` and
`approver`, both readable from the record without inference. GitHub still records the approval
instant in the run and the audit log, which is what the design asks of the *gate* — it does not
require this type to carry all three. `V5` turns only on the commit and is unchanged.

Rejected with it: redefining the field as the instant the `publish` job observed the approval — true
and recordable, but it reads as the approval time and is not, the gap being however long the run
waited. And sourcing it from `GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses`, which
does carry `created_at` — rejected because that status's `creator` is the run's actor rather than the
approver, so the record's two halves would describe different people.

**The divergence this entry recorded is closed.** `10-design.md` § *Module boundaries* said the
attestation "records approver, commit and timestamp"; `/reconcile` changed the clause on 2026-08-06 to
distinguish what the provider records from what this repository reads back. Nothing is outstanding
here.

### U4 — Package version to pin

**Answered 2026-08-06: pin `0.3.0` exactly.** Retained so citations resolve.

It is the version that satisfies `U1`, verified as published rather than assumed — see that entry for
the evidence. The pin is exact, with a lockfile, per the design's *The package is unavailable or
drifts*.

The prior drift this entry recorded — `SubZeroDev.Platform` pinning `0.2.0`, the package's own
`30-slices.md` naming `0.1.0` as the published handoff — is superseded for this repository's purposes
but is still live for the other two, and is tracked as issue #4. Neither repository is this one.

### U5 — `<noscript>` is withdrawn, pending an owner edit to the brief

The brief's *Definition of done* requires `<noscript>` content asserted against the built HTML, while
the design requires a document with no script at all. `<noscript>` renders precisely when scripting
is off; on a page that needs no scripting there is no fallback for it to describe, and the pattern
`SubZeroDev.Platform` ships — *"This site needs JavaScript to render the status page."* — would be
false here.

**Adjudicated 2026-08-05: the brief is the defect.** The requirement is vestigial, inherited from a
client-rendered status page where it was load-bearing. This contract therefore declares no
`noScript` metadata and no assertion over it.

Remaining: the owner strikes `` and `<noscript>` content `` from the *Definition of done* bullet in
`00-brief.md`. A model may interrogate that file but not author it, so the edit is not made here.
Until it is made, the brief and this contract disagree on a released requirement.

### U6 — Whether a social image asset exists

**Unblocked 2026-08-06 and still unanswered — it is an owner content decision, not an interface gap.**

The brief requires Open Graph and X/Twitter metadata. Verified at `0.3.0`: `socialImageUrl`,
`openGraph.imageUrl` and `twitter.imageUrl` are all optional, and the whole `twitter` block is
omitted when absent. An Open Graph image is fetched by a crawler, not by the document, so it does not
engage the zero-additional-request non-goal.

Two consequences make this a real fork rather than a missing string. `card: "summary_large_image"`
with no image is a claim about a picture that does not exist, so no image means either
`card: "summary"` or no `twitter` block at all. And `socialImageUrl` and `openGraph.imageUrl` each
emit an `og:image`, so declaring both emits the element twice.

An image would also be the **only** asset in this design that is neither inline nor a data URI —
`V13` permits it, since a crawler fetch is not a load-triggered request, but it is the one place the
self-contained-document rule has an edge.

### U7 — Which server serves the container tree

**Answered 2026-08-06: `nginx:alpine`.** Retained so citations resolve.

The design states the requirements — a read-only tree, nothing executed per request, no state, no
added header, and an unknown path resolved to the root miss document with a **404 status** — and says
explicitly that which server satisfies them is not a design decision. It became a contract decision the
moment Artifact had to emit a configuration file, because the file's format belongs to the server.

`try_files $uri $uri/ =404` with `error_page 404 /404.html` expresses the requirement. Settling this
also reworded `R4`: "adds no header of its own" was unsatisfiable, since HTTP requires headers and
every server sends an identifier. A later pass (PR #12 review) found the rewording itself untestable —
"the protocol and the file's content type require" named no boundary a verifier could check — and
sharpened it to name the forbidden category directly: no cookie, no application-chosen cache-control
directive, no tracking or rewrite header, with the unconfigured byproducts of serving a static file
carved out by name rather than by an open-ended "require".

**Written 2026-08-06.** `serverConfig()`, `serverConfigFilename`, `finalizeArtifact`'s third duty and
the `ArtifactInput` and `ArtifactReport` fields are in *Public signatures*. One thing the entry did
not anticipate had to be decided with them: the configuration is written **outside** `outputDir`, not
into it, because a file the server reads must not also be a file it serves — `R6`. `V12` verifies the
behaviour whatever the file says.

### U8 — The `validateInventory` call site and load-time failure

**Answered 2026-08-05: Adapter holds it.** Retained so citations resolve.

The design places content validation first in the ordering and closes the set of modules permitted to
import `projects` to "the single call site that hands it to the validator, and Verification" — without
naming which module that call site is in. The owner ruled Adapter, and `A3` narrowed accordingly: it
still obtains everything renderable from Composition, and its Content imports are enumerated rather
than forbidden outright. What Adapter does with a failing `Result` is written in *Public signatures*
and asserted as `A5`.

**The divergence this entry recorded is closed.** `10-design.md` § *Module boundaries* said Adapter
"reads nothing from Content or Presentation directly"; `/reconcile` changed the clause on 2026-08-05
and it now names the same four Content imports, with nothing renderable among them. Nothing is
outstanding here.

### U9 — Accessibility has no Verification surface

**Raised 2026-08-06 by a full re-derivation, and open. Nothing is invented here.**

`10-design.md` § *Module boundaries* gives Verification ownership of "content invariants,
derived-value correctness, markup and stylesheet agreement, **accessibility**, built-output shape,
browser request capture, link resolution, the in-CI image gate, byte identity between the two
targets, release attestation and deployment read-back". Accessibility is the only item in that list
with nothing callable behind it **at all**. Two others — content invariants and derived-value
correctness — also have no function in *Public signatures*, and need none: each is discharged by a
test calling Content's own total functions, which this contract does write. Accessibility has neither a
Verification function nor a Content one to call, and no `VerificationErrorCode` names it.

`P2`, `P3` and `P4` are therefore invariants with nothing callable behind them — the same shape `V3`,
`V5` and `V6` were in before 2026-08-06. It survived that pass because that pass counted error codes
against the signature list, and these three have no code to count.

All three are `00-brief.md` *Definition of done* bullets. That bullet is also the only one in the
list that does **not** say how it is asserted, where the two around it say "asserted against the
built HTML" and "asserted with a browser network log". Whether that omission is deliberate is the
owner's to say, and it does not change that the design assigns the check to Verification.

What is missing, and what would settle each:

- **`P3` — `prefers-reduced-motion`.** Determinable in shape but not in kind. A check over
  `StylesheetText` is static and cheap; a computed-style check in a browser is what proves the
  rendered page. The design's own precedent for `V13` and `V2` — "Source inspection cannot prove
  runtime behaviour, and a network capture alone does not name what leaked. **Both are required**" —
  makes that a fork rather than an implementer's choice.
- **`P2` — greyscale legibility.** A contrast computation over resolved colour pairs. Needs
  [`U2`](#u2--presentations-token-set-and-primitives): there is no palette to compute over, and what
  "legible" is measured as — a contrast ratio, against what threshold — is authored visual identity
  on the same footing as the token set.
- **`P4` — focus order and keyboard reachability.** Needs a rendered document and a driver.
  [`30-slices.md`](30-slices.md) § *Blocked by `U2`* already lists the browser driver for `V2` as a
  choice needing a decision-log entry before implementation; this rides on the same one.

**Not blocked by this:** anything that emits a document. `P2`–`P4` stay Presentation's to maintain
and stay in the invariant table; what is unwritten is the surface that would check them, which is why
this is a contract gap rather than a design one. [`30-slices.md`](30-slices.md) § *Blocked* listed
`P1`–`P5` as "blocked by `U2` alone", which this narrows; `/reconcile` corrected that entry on
2026-08-06, so nothing is outstanding there.
