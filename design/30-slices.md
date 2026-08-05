# Slices — SubZeroDev.com

Derived from [`10-design.md`](10-design.md) and [`20-contract.md`](20-contract.md). Where this
document and the contract disagree, one of them is a defect; say which rather than reconciling.

## What can be sliced, and what cannot

[`20-contract.md`](20-contract.md) § `U1` records a verified fact rather than a risk: at
`subzerodev-platform-ui-landing-page@0.2.0` the external package **cannot** accept a caller-supplied
body, and **cannot** omit its entry script when one is given. The contract therefore does not write
Adapter's `LandingPageConfig`, its route declarations and their metadata, or Presentation's tokens.

This paragraph previously also named the root `404.html`, the build marker and Composition's route
entries. All three have since moved or been written — see the note under [*Blocked*](#blocked).

`/slices` may not introduce a signature the contract does not carry. Every slice that would emit,
verify or publish a document is consequently unwritable today — not deferred by preference, but absent
from the contract. Those are enumerated under [*Blocked*](#blocked) with the condition that releases
each one.

Three units remain fully specified, independently valuable, and deliverable now. They are below.

**Verticality under `U1`.** A static site with no runtime has two observable ends: a served document
and a CI outcome. Served documents are blocked, so each slice below ends at an observable CI outcome —
a job that is green on correct input and red, for a named reason, on incorrect input. That is the
whole of the design's *Control flow* § 1 that is reachable, and each slice leaves the repository
runnable in that sense. Where a slice stops short of a served page, it is because the page is blocked,
not because the slice is a layer.

**Numbering.** `S1`–`S3` are fixed. The blocked work takes `S4` onward when the contract can carry it;
nothing below is renumbered to make room.

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

Delivers: Every address the site will send a visitor to is checked by CI before anything could be
deployed, and the check goes red when one of them stops answering. It runs on the network, after the
network-free build, so the build never reaches another site and no content the site shows is derived
from what a check found.

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

## Not sliced, and why

`projectTotal`, `countByStage`, `ecosystemTree`, `contaminationForest` and `sinceYear` are fully
specified in the contract and are deliberately **not** sliced. Their sole consumer is Composition,
which is blocked. Writing them now produces a layer with nothing to verify it against, which is the
failure this document's slicing rule exists to prevent. `resolvedHomes` is the exception and is in S3
because the link check consumes it. The rest arrive with the page.

---

## Blocked

Nothing below is a slice. Each names what is missing and the condition that releases it. No slice
number is allocated until the contract can carry the work.

### Blocked by `U1` — the package cannot emit the required artifact shape

- Presentation's token set and primitives, and invariants `P1`–`P4`. Also blocked by `U2`.
- Composition's two route entries, all page prose, and invariants `X1`–`X3`.
- Adapter's `LandingPageConfig`, the route declarations and their metadata, and invariants `A1`–`A2`.
  The `origin` constant is written in the contract but has no consumer until then.
- `readBuildMarker` and the marker format, and invariant `V1`.
- `pollForCommit`, the deployment critical section and the read-back, and invariants `V6`–`V8`.
- `assertNoAdditionalRequests`'s CI wiring and invariant `V2` — the browser capture needs a built page
  to load.
- The built-output content assertions and invariant `V3`.
- The `/404` route and the root `404.html` artifact.
- Deployment itself, and with it every *Definition of done* bullet that names the deployed site.
- Pinning the package version — `U4`, moot until a version satisfying `U1` exists.
- Whether a social image asset exists — `U6`, settled with the metadata block.

**Released by:** a released version of `SubZeroDev.Platform.UI.LandingPage` satisfying the
requirements enumerated in [`20-contract.md`](20-contract.md) § `U1` — two required, one preferred.
Per the design's *Failure modes*, that is a slice in that repository, not something improvised here.

> **Stale against the revised contract — reported by `/reconcile`, not resolved here.** The revision
> that moved rendering into this repository also moved the root miss document and the build marker out
> of the package ask and into Artifact, and the contract now writes them in full: `buildMarkerPrefix`,
> `buildMarkerSuffix`, `buildMarker`, `injectBuildMarker`, `finalizeArtifact` and `readBuildMarker`.
> The marker-format half of the `readBuildMarker` entry above is therefore no longer blocked by `U1`;
> only the parts needing an emitted document still are. `parseCommitId` and `C15` are likewise fully
> specified and belong to no slice at all. What that work becomes is a slicing decision this note does
> not make.

### Blocked by `U3` — where the attestation record lives

`assertAttestation`'s CI wiring and invariant `V5`. The `Attestation` type and the function signature
are written; the storage mechanism and how the function obtains a record are not.

**Released by:** choosing the CI gate mechanism.

### Blocked by `U1`, `U3` and `U7` — the publication CI

The job graph below is derived from [`10-design.md`](10-design.md)'s ordering invariant `V7` and its
*Concurrency and ordering* section. It is recorded here so the shape is not re-derived per slice; it is
not itself a slice, and it allocates no number.

```
build ──┬──► image-gate ──┐
        │                 ├──► attestation ──► publish
        └──► link-check ──┘
```

| Job | Discharges | Runs on | Blocked by |
|---|---|---|---|
| `build` — emit, `finalizeArtifact`, offline assertions, browser capture | `A5`, `R1`–`R3`, `R5`, `V1`, `V2`, `V3`, `V13`, `X4` | push + all PRs | `U1`, `U7` |
| `image-gate` — build, run and gate the image before any push | `V10`, `V11`, `V12` (container half) | push + all PRs | `U1`, `U7` |
| `link-check` — **already implemented** | `V4` | push + same-repo PRs | — |
| `attestation` — human gate bound to the commit | `V5` | master push | `U3` |
| `publish` — branch-head check, deploy and push, read-back | `V6`–`V9`, `V12` (Pages half), `V14` | master push | `U1`, `U3`, `U7` |

Three constraints follow from the design rather than from preference. A slice that re-decides any of
them fails silently:

1. **`publish` is one job.** The design holds that two publication targets are not two critical
   sections. A workflow's concurrency group is per job, and two jobs sharing a group serialize against
   each other, which cannot express one critical section spanning both. Pages deploy and registry push
   therefore share a single job holding a single group.
2. **That group does not cancel in progress.** Cancelling mid-publish produces the torn state the
   critical section exists to prevent. The design's mechanism for stopping a superseded run is the
   branch-head check — a clean stop — not cancellation.
3. **The gated image is carried, never rebuilt.** The gate precedes the push and the push follows the
   branch-head check, so the image crosses a job boundary. Rebuilding breaks *the gated image is the
   pushed image*; a staging tag would be a registry write before the branch-head check, which the
   design forbids. That leaves saving and reloading it, with the digest asserted across the boundary.

Four choices are open and each needs a decision-log entry before implementation, not an implementer's
call: the browser driver for `V2` and whether it loads over `file://` or a local static server; the base
image and file server (`U7`, which also determines Artifact's third duty); the image build and push
mechanism, with registry write scoped to `publish` alone; and the attestation mechanism (`U3`).

**Released by:** `U7` and `U3` are answered as of 2026-08-06 — `nginx:alpine` and a protected GitHub
Environment respectively — so what remains for each is contract text, not a decision. `U1` is the
external half and is the gate on the whole graph. Independently of all three, `V3` and `V6` have no
callable surface; that gap is staged in [`90-decisions.md`](90-decisions.md) § *Open* and is
`/contract`'s, not a slice's.

---

## Next

Run `/track` in a fresh session to open the issues and milestone for `S1`–`S3`. This document opens
none.
