# Contract — SubZeroDev.com

Derived from [`10-design.md`](10-design.md). Where this document and the design disagree, one of them
is a defect; say which rather than reconciling.

Language: TypeScript. Established by the consumer pattern `SubZeroDev.Platform` proved and by
`SubZeroDev.Platform.UI.LandingPage`'s published `exports`.

Module names below — Content, Presentation, Composition, Adapter, Artifact, Verification — are the
design's module boundaries, not paths.

**One part of this contract is still blocked, and it is smaller than it was.** The design moved
rendering into this repository, so Composition's surface, Artifact's surface and the build marker's
format are now this repository's to define and are written below. What remains blocked is **Adapter's
route declaration and its default export**: the design requires a document carrying a caller-supplied
body and no entry script, and the external package's `LandingPageRoute` at `0.2.0` has no field for a
body and requires an `entry`. Field names that do not exist cannot be written down. See
[`U1`](#u1--the-package-cannot-accept-a-caller-supplied-body). Presentation's token set is unresolved
for a different reason — it is authored brand material, [`U2`](#u2--presentations-token-set-and-primitives).

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

`ComposedRoute.stylesheet` is the stylesheet **that route's body requires**, not the union of every
rule Presentation can produce. That is what makes `X4` checkable per document rather than only across
the pair.

### Route

`RoutePath` is determined; the rest of `Route` is not.

```ts
export type RoutePath = "/" | "/404/";
```

The design's `Route` — path, prerendered body, required stylesheet, static head metadata — is
declared as the external package's `LandingPageRoute`, extended with the fields that carry a body and
a stylesheet. Those fields do not exist at `0.2.0`, so the extended type is not written here. The
metadata half is already provided by the package's `LandingPageMetadata` and needs no addition; the
icon set travels in its existing `icons[].href` as data URIs. See
[`U1`](#u1--the-package-cannot-accept-a-caller-supplied-body).

### Artifact

```ts
export type EmittedDocument = {
  readonly relativePath: string;
  readonly html: string;
};

export type ArtifactInput = {
  readonly outputDir: string;
  readonly commit: string;
};

export type ArtifactReport = {
  readonly commit: CommitId;
  readonly markedEntries: readonly string[];
  readonly rootMissEntry: string;
};
```

`ArtifactInput.commit` is the raw value read from the build environment and is **not** a `CommitId`
— validating it is Artifact's first act. `relativePath` and the `*Entry` values are positions inside
the emitted output tree, expressed with `/` separators; they are not repository source paths.

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
  readonly attestedAtUtc: string;
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
`Attestation.attestedAtUtc` is an ISO 8601 instant with a `Z` offset. `LinkCheckResult.status` is
`null` where every attempt failed before a response.

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
| Server configuration | Emitted by Artifact into the output tree | Regenerated per build from the same source. Nothing reads a previous build's copy. |
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
and is not written here. See [`U2`](#u2--presentations-token-set-and-primitives). `P1`–`P4` hold
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
```

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

The default export — the `LandingPageConfig` the package CLI loads — and the route declarations inside
it are not written. See [`U1`](#u1--the-package-cannot-accept-a-caller-supplied-body).

### Artifact

```ts
export const missEmittedEntry: "404/index.html";

export const missRootEntry: "404.html";

export const buildMarkerPrefix: "<!-- build-commit: ";

export const buildMarkerSuffix: " -->";

export function buildMarker(commit: CommitId): string;

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
validates `input.commit`, copies `missEmittedEntry` to `missRootEntry`, and only then injects the
marker into every `.html` document in the tree — the copy included. Copying first is what makes `R2`
hold: both documents are marked in the same pass and stay byte-identical. Injecting first and copying
after would also work today and would break silently the day a second post-build rewrite is added.

Emitting the container's server configuration is Artifact's third duty and is **not** written: the
file's format is the server's, and which server serves the tree is undetermined. `ArtifactReport`
gains a field for it when that closes. See [`U7`](#u7--which-server-serves-the-container-tree).

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
  attestation: Attestation,
  commit: CommitId,
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
| `YearAfterBuild` | `year > BuildContext.utcYear` | set | `"year"` |
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
| `WriteFailed` | A copy or rewrite failed at the filesystem | the document | Fail the build |

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
| `AttestationAbsent` | No attestation exists for the commit | No | Refuse to deploy |
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

One bare exception exists in the system and it is not ours: the external package's
`defineLandingPage` throws `Error` on an empty route list. Nothing here catches it; an adapter that
declares no route is a compile-time-visible defect, not a runtime path.

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
| **X1** | No count, total, year or other figure on the page is a typed literal; each comes from a Content derivation | Composition |
| **X2** | Composition imports only Content and Presentation, and nothing imports Composition except Adapter | Composition |
| **X3** | The page contains no form, no analytics, no consent surface and no third-party script | Composition |
| **X4** | For each `ComposedRoute`, every class referenced in `bodyHtml` has a matching selector in `stylesheet`, and every selector in `stylesheet` has a user in `bodyHtml` — checked by `assertStyleAgreement` | Composition |
| **A1** | Every URL in route metadata is built from `origin`; no origin string is written twice | Adapter |
| **A2** | Every icon is embedded in the document as a data URI; no icon is a linked asset | Adapter |
| **A3** | Adapter obtains everything renderable from Composition; it imports Content only for `projects`, `validateInventory`, `BuildContext` and `parseCommitId`, and never for a derivation function or a copy constant. It reads nothing from Presentation | Adapter |
| **A4** | Exactly two routes are declared: `apexPath` and `missPath` | Adapter |
| **A5** | Adapter validates the inventory exactly once; on failure it reports every `ContentError` and exits non-zero, and no route body, stylesheet or document is produced | Adapter |
| **R1** | Every emitted document carries exactly one build marker, and it carries the commit being built | Artifact |
| **R2** | `missRootEntry` and `missEmittedEntry` are byte-identical in the finished tree | Artifact |
| **R3** | Artifact compiles nothing, bundles nothing and resolves no module; the only change it makes to a document is the marker | Artifact |
| **R4** | The emitted server configuration resolves every unknown path to `missRootEntry` with status 404, adds no header of its own, and executes nothing per request | Artifact |
| **R5** | `missEmittedEntry` is the package's emitted entry for Adapter's `missPath` — checked against the emitted tree, never assumed | Artifact |
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

Nothing below is invented. Each item names what is missing and what would settle it. Numbers are
stable: `U1`–`U6` keep the meaning [`30-slices.md`](30-slices.md) cites them by, even where the item
has narrowed.

### U1 — The package cannot accept a caller-supplied body

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

The design fixes the constraints — dark-first, minimal, typography-first, large whitespace, no
gradient, no illustration, no webfont — and names no token, no scale step and no primitive. A token
set written here would be authored visual identity, which is brand material and not the contract's to
author. The same gap covers how a route obtains only the rules its body requires, which `X4` demands
and which depends on what a primitive is. `stylesheet: StylesheetText` is written; the rest is not.
`P1`–`P4` hold regardless of what the set turns out to be.

### U3 — Where the attestation record lives

The design requires an attestation bound to the full commit id, recording approver, commit and
timestamp, that cannot be reused. The `Attestation` type and `V5` are written above. The storage — a
CI environment approval, a signed file, a workflow artifact — is not determined, and neither is how
`assertAttestation` obtains the record. Settled by choosing the CI gate mechanism.

### U4 — Package version to pin

The design's *Open question 2*, unchanged. `SubZeroDev.Platform` pins `0.2.0` exactly and the
package's `package.json` reads `0.2.0`, while that package's own `30-slices.md` records UI2 as in
progress with `0.1.0` as the published handoff. Reported, not reconciled — neither repository is this
one. U1 makes this moot until a version exists that satisfies it.

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

The brief requires Open Graph and X/Twitter metadata. `LandingPageTwitterMetadata.card` with no image
makes `summary_large_image` wrong, and `LandingPageOpenGraphMetadata.imageUrl` is optional. An Open
Graph image is fetched by a crawler, not by the document, so it does not engage the
zero-additional-request non-goal — but whether one exists changes the emitted head and is not
determined. Settled with U1, since the whole metadata block is written then.

### U7 — Which server serves the container tree

The design states the requirements — a read-only tree, nothing executed per request, no state, no
added header, and an unknown path resolved to the root miss document with a **404 status** — and says
explicitly that which server satisfies them is not a design decision. It is, however, a contract
decision the moment Artifact has to emit a configuration file, because the file's format belongs to
the server. `R4` states the behaviour; the emitted file's shape and `finalizeArtifact`'s third duty
are not written.

Settled by choosing the base image and server. `V12` verifies the behaviour whatever the choice, so
nothing downstream of the image gate depends on this.

### U8 — The `validateInventory` call site and load-time failure

**Answered 2026-08-05: Adapter holds it.** Retained so citations resolve.

The design places content validation first in the ordering and closes the set of modules permitted to
import `projects` to "the single call site that hands it to the validator, and Verification" — without
naming which module that call site is in. The owner ruled Adapter, and `A3` narrowed accordingly: it
still obtains everything renderable from Composition, and its Content imports are enumerated rather
than forbidden outright. What Adapter does with a failing `Result` is written in *Public signatures*
and asserted as `A5`.

**This is a divergence from `10-design.md`, not a reading of it.** That document's *Module boundaries*
says Adapter "reads nothing from Content or Presentation directly". Under this contract it reads four
named things from Content and still nothing renderable, so the design's sentence needs one clause
changed. Reported rather than reconciled — `/reconcile` owns that edit.
