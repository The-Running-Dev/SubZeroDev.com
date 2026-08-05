# Contract — SubZeroDev.com

Derived from [`10-design.md`](10-design.md). Where this document and the design disagree, one of them
is a defect; say which rather than reconciling.

Language: TypeScript. Established by the consumer pattern `SubZeroDev.Platform` proved and by
`SubZeroDev.Platform.UI.LandingPage`'s published `exports`.

Module names below — Content, Presentation, Composition, Adapter, Verification — are the design's
module boundaries, not paths.

**Part of this contract is blocked.** The design's *Failure modes* names the case where the external
package cannot emit the required artifact shape and says the design states the requirement and stops.
That case is verified true at the pinned-candidate version. Composition's entries, Adapter's route
declarations, Presentation's token set and the build marker's format are therefore under
[`## Unresolved`](#unresolved) rather than written down. Content is unaffected and is complete below.

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

export type RequestRecord = {
  readonly url: string;
  readonly resourceType: string;
  readonly initiatedByTester: boolean;
};
```

`attempts >= 1`; `initialDelayMs >= 0`; `maxDelayMs >= initialDelayMs`; `attemptTimeoutMs > 0`.
`Attestation.attestedAtUtc` is an ISO 8601 instant with a `Z` offset. `LinkCheckResult.status` is
`null` where every attempt failed before a response.

### Presentation

No type is declared. See [`## Unresolved`](#unresolved).

---

## Persisted schemas

**None.** There is no database, no collection, no file this repository writes and reads back, and no
runtime state. Every value above is a compile-time constant materialised into HTML by the build.

Three things resemble persistence and are not:

| Thing | Where it lives | Migration story |
|---|---|---|
| `Project` inventory | Source in this repository | Rebuilt from source on every commit. A change to `Project`'s shape is a compile error, not a migration. |
| Build marker | Embedded in each emitted document | No existing data. Every artifact is regenerated per commit; an older artifact is replaced, never migrated. |
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

Every function other than `validateInventory` takes an `Inventory`, which only `validateInventory`
can produce. They are total on that input and return no error. `validateInventory` is the sole
validating entry point into the module's data.

`stageOrder` is the lifecycle order, length 6, covering `Stage` exactly once.

### Presentation

Not written. See [`## Unresolved`](#unresolved).

### Composition

Not written. See [`## Unresolved`](#unresolved). The module's public surface is exactly the two route
entries and nothing else; their signatures depend on the package capability named there.

### Adapter

```ts
export const origin: "https://subzerodev.com";
```

The default export — the `LandingPageConfig` the package CLI loads — is not written. See
[`## Unresolved`](#unresolved).

### Verification

```ts
export const linkCheckRetry: RetryPolicy;

export const deploymentPollRetry: RetryPolicy;

export function readBuildMarker(documentHtml: string): CommitId | null;

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
```

Concrete policy values:

| Constant | attempts | backoff | initialDelayMs | maxDelayMs | attemptTimeoutMs |
|---|---|---|---|---|---|
| `linkCheckRetry` | 3 | `exponential` | 1000 | 8000 | 10000 |
| `deploymentPollRetry` | 60 | `fixed` | 5000 | 5000 | 10000 |

Nothing imports Verification.

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
| `HomeWithinOriginEscape` | Resolving `home.path` against the parent origin changes the origin | set | `"home.path"` |
| `EscapedFromTargetMissing` | `escapedFrom` names no project in the inventory | set | `"escapedFrom"` |
| `EscapedFromSelfReference` | `escapedFrom === id` | set | `"escapedFrom"` |
| `EscapedFromCycle` | The `escapedFrom` edge set contains a cycle | each project on the cycle | `"escapedFrom"` |

### Verification

```ts
export type VerificationErrorCode =
  | "LinkUnreachable"
  | "LinkNotOk"
  | "MarkerAbsent"
  | "MarkerMismatch"
  | "PollExhausted"
  | "UnexpectedRequest"
  | "UnknownPathNotHandled"
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
| `LinkNotOk` | A target responded outside 2xx/3xx | No | Fail the gate, deploy nothing |
| `MarkerAbsent` | An emitted or served document carries no build marker | No | Fail the build or the read-back |
| `MarkerMismatch` | The served marker is a valid `CommitId` other than the expected one | Yes, within `deploymentPollRetry` — a cache or an in-flight publish | Keep polling; on exhaustion report `PollExhausted` |
| `PollExhausted` | `deploymentPollRetry` was consumed without an exact marker match | No | Report the deploy failed. **Announce no live URL** |
| `UnexpectedRequest` | The browser capture recorded a load-triggered request other than the navigation document | No | Fail the gate, deploy nothing |
| `UnknownPathNotHandled` | A unique unknown path did not serve the 404 composition | No | Report the deploy failed. Announce no live URL |
| `AttestationCommitMismatch` | `Attestation.commit` differs from the commit being deployed | No | Refuse to deploy. An attestation is never reused |
| `AttestationAbsent` | No attestation exists for the commit | No | Refuse to deploy |
| `ManifestoAbsent` | A known manifesto sentence is missing from built HTML with scripting never executed | No | Fail the build |
| `ProjectNameAbsent` | A project `name` is missing from built HTML with scripting never executed | No | Fail the build |
| `StaleDeploymentCandidate` | At the critical section's start, this run's commit is no longer the deployment-branch head | No | Stop before publishing. This is a clean stop, not a failure |

### Composition, Presentation, Adapter

**No error type.** Composition and Presentation operate only on an `Inventory`, which cannot be
malformed by construction, and neither performs I/O. Adapter declares constants.

One bare exception exists in the system and it is not ours: the external package's
`defineLandingPage` throws `Error` on an empty route list. Nothing here catches it; an adapter that
declares no route is a compile-time-visible defect, not a runtime path.

---

## Invariants

Each is stated so it can become an assertion. The named module is responsible for maintaining it.

| Id | Invariant | Owner |
|---|---|---|
| **C1** | Content imports no other repository module | Content |
| **C2** | `Inventory` has at least one project | Content |
| **C3** | `ProjectId` is unique across the inventory | Content |
| **C4** | Every `ProjectId` matches the pattern and length above | Content |
| **C5** | Every `year` is a four-digit integer no greater than `BuildContext.utcYear` | Content |
| **C6** | Every `home.parent` names an existing project whose own `home.kind` is `"own"` | Content |
| **C7** | For every `within` home, `new URL(path, parentOrigin).origin === parentOrigin` | Content |
| **C8** | Every `escapedFrom` names an existing project, never itself, and the edge set is acyclic — the relation is a forest | Content |
| **C9** | `stageOrder` contains each `Stage` exactly once, in lifecycle order | Content |
| **C10** | `sinceYear(inventory)` equals the minimum `year` in the inventory | Content |
| **C11** | `ecosystemTree` has one group per `Stage` in `stageOrder` order; within a group projects ascend by `id`; every project appears exactly once across all groups | Content |
| **C12** | `countByStage` has one entry per `Stage` in `stageOrder` order, and its counts sum to `projectTotal` | Content |
| **C13** | `resolvedHomes` yields one entry per `own` and `within` home and none for `none` | Content |
| **C14** | Nothing imports `projects` except the call site that passes it to `validateInventory` and Verification's inventory assertion. No derivation function and no Composition entry reads it | Content |
| **P1** | Nothing in Presentation references a linked font, an external stylesheet, a gradient or an illustration asset | Presentation |
| **P2** | The rendered page is legible in greyscale | Presentation |
| **P3** | Nothing animates under `prefers-reduced-motion: reduce` | Presentation |
| **P4** | Focus order matches visual order and every interactive element is keyboard-reachable | Presentation |
| **X1** | No count, total, year or other figure on the page is a typed literal; each comes from a Content derivation | Composition |
| **X2** | Composition imports only Content and Presentation, and nothing imports Composition except the route entries | Composition |
| **X3** | The page contains no form, no analytics, no consent surface and no third-party script | Composition |
| **A1** | Every URL in route metadata is built from `origin`; no origin string is written twice | Adapter |
| **A2** | Every icon is embedded in the document; no icon is a linked asset | Adapter |
| **A3** | Adapter reads nothing from Content | Adapter |
| **V1** | Every emitted document contains `BuildContext.commit` in full, in a non-visual, machine-readable position | Verification |
| **V2** | Loading a route document triggers zero requests other than the navigation document itself | Verification |
| **V3** | Every manifesto sentence asserted, and every project `name`, appears in built HTML with scripting never executed | Verification |
| **V4** | Every `ResolvedHome` responds 2xx or 3xx before deployment | Verification |
| **V5** | An `Attestation` is valid for exactly one `CommitId` and is never accepted for another | Verification |
| **V6** | Publication happens only while this run's commit is the deployment-branch head | Verification |
| **V7** | The ordering holds: offline build and verification → link check and attestation → branch-head check → publication → exact-marker and unknown-path read-back → live claim | Verification |
| **V8** | No live URL is stated or implied until `pollForCommit` returns `ok` for the exact commit **and** the unknown-path check passes | Verification |

Two invariants the design states that this contract deliberately does **not** encode as build-time
checks, because encoding them would duplicate a fact another module owns or claim a check that cannot
be performed:

- **`home.url` addresses the project's own site.** Checking that its host is a subdomain of the apex
  would require Content to know the apex origin, which Adapter owns (`A3`). Covered by the release
  attestation and by `V4`, not by a Content assertion.
- **`genre` and `stage` are true of the project.** Both are authored facts. `Genre` is closed at the
  type level; whether the assigned value is the right one is attestation work.

---

## Unresolved

Nothing below is invented. Each item names what is missing and what would settle it.

### U1 — The external package cannot emit this consumer's required artifact shape

This is the design's *Open question 1*, and it is now answered. Verified against
`subzerodev-platform-ui-landing-page@0.2.0`:

- The adapter emits one fixed document shell per route: `<div id="root"></div>` plus
  `<script type="module" src="…">`. There is no prerender path and no server-render path.
- `LandingPageRoute.hydrate?: boolean` is declared in the package's public type and is **read by
  nothing**.
- `LandingPageRoute.path` is a template-literal union requiring either `/` or a trailing-slash path,
  so `/404` cannot be declared, and the emitted file for `/404/` is `404/index.html`. There is no
  root `404.html` output.
- There is no build-marker injection and no mechanism for a consumer to add arbitrary `<meta>`.
- `LandingPageMetadata` exposes no way to inline CSS or embed an icon as anything other than an
  `href` string.

Required of the package before Composition's entries, Adapter's route declarations and the build
marker's format can be written:

1. Emit prerendered route documents whose body carries the composed content, with no hydration script
   and no linked runtime asset.
2. Inline CSS into the document rather than emitting a linked stylesheet.
3. Emit the 404 composition at the conventional root `404.html` in addition to its route path.
4. Inject a caller-supplied full commit id into every emitted document in a non-visual,
   machine-readable position, with a documented extraction rule.

Per the design's *Failure modes*, that is a slice in `SubZeroDev.Platform.UI.LandingPage`, not
something improvised here. **This contract stops at that boundary.**

Blocked by U1: Composition's two route entry signatures; Adapter's default `LandingPageConfig`
export; the marker format `readBuildMarker` parses.

### U2 — Presentation's token set

The design fixes the constraints — dark-first, minimal, typography-first, large whitespace, no
gradient, no illustration, no webfont — and names no token, no scale step and no primitive. A token
set written here would be authored visual identity, which is brand material and not the contract's to
author. `P1`–`P4` hold regardless of what the set turns out to be.

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
