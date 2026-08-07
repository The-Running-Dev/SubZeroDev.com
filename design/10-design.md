# Design — SubZeroDev.com

Derived from [`00-brief.md`](00-brief.md) and the brand material in [`Idea.md`](../Idea.md). Where
this document and the brief disagree, the brief wins and this is the defect.

**One decision dominates every section below.** The apex's primary content is prose meant to be read
by people and indexed by crawlers. The landing-page package, as `SubZeroDev.Platform` consumes it
today, renders client-side. For a joke status page that trade is invisible. For a manifesto addressed
to recruiters and clients it is a defect: the page's entire substance would be absent from view
source. This design therefore **requires that the served document already contain the page**, with no
hydration script and no linked runtime asset.

**Where the rendering happens is the second decision, and it moved.** An earlier draft of this
document required the *package* to render. Verified against
`subzerodev-platform-ui-landing-page@0.2.0` at `be67a11`, the package has no render path of any kind
— it composes a fixed `<head>`, emits a shell body of `<div id="root"></div>` plus a module script,
and hands the whole thing to Vite. It has no React dependency and no server-render step. Asking it to
render would mean asking it to execute consumer entry modules, which is a large feature in a package
that currently owns bundling and nothing else.

The route entry it bundles is already **consumer-owned code**. So this design puts rendering where the
content already lives — here — and narrows the package's obligation to accepting a caller-supplied
body and omitting the script when one is given. The package keeps Vite, the build invocation, the
document shell and the `<head>`. This repository still owns no build system. It now owns rendering,
and one post-build step over the emitted artifact. That distinction is the subject of *Module
boundaries* and the first two entries in *Alternatives considered*.

**The same output is published twice.** GitHub Pages is the permanent preview target, deployed on
every commit. A container image published from this repository is the release, delivered by a compose
stack. Both serve the *same* emitted tree, byte for byte — that identity is asserted, not assumed,
because a preview that serves different bytes from the release proves nothing about the release.

> **Known disagreement with the brief.** `00-brief.md` § *Environment* opens *"Static site. No server,
> no application runtime, no persisted state and no application concurrency."* A container serving the
> site runs a static file server, which is an application runtime by that sentence. This design treats
> the container as a **delivery wrapper** — it executes nothing per request, holds no state, and adds
> nothing to the bytes it serves — which keeps the sentence's intent while contradicting its letter.
> The brief also frames *Definition of done* around a single deployed target, and there are now two.
> The brief outranks this document and is the owner's to author; both clauses are flagged rather than
> reconciled here.

---

## Data model

Nothing is persisted. There is no database, no server, no runtime state, no session, no cookie, no
`localStorage`. Every entity below is a compile-time constant in this repository, materialised into
HTML by the build and immutable thereafter. "Lifecycle" throughout means *the lifecycle of the record
in this repository*, not a row's lifecycle in a store.

### Project

The only entity with real structure. It is a record **this repository owns about a repository it does
not** — which is the source of the single largest correctness risk in the design, and the reason the
`stage` field is defined as it is.

| Field | Type | Notes |
|---|---|---|
| `id` | slug | **Identity.** Stable, lowercase, hyphenated. Never reused, never renumbered. It is the anchor fragment, the test key, and the sort tiebreak. Renaming a project changes `name`, never `id`. |
| `name` | display string | What the project is called now. |
| `year` | four-digit integer | The year the project began, no later than the build's UTC year. Required so the earliest year, and therefore the displayed "since" year, is derived from the inventory rather than typed into copy. |
| `stage` | `Stage` (below) | Where it sits in `Idea.md`'s lifecycle. **Authored, not observed.** |
| `question` | string or absent | The originating "I wonder…". Present only where one is genuinely recorded; never invented to fill the field. |
| `line` | string | One sentence, in voice, about what it is. |
| `home` | `Home` (below) | Where a visitor goes. May be absent. |
| `genre` | `Genre` or absent | A closed union of the seven values in `Idea.md`'s genre table. Absent for the projects the table does not cover — the closure prevents a typo, while *which* project gets *which* genre, and whether it gets one at all, stays authored brand material this document does not assign. |
| `escapedFrom` | `id` or absent | The project this one escaped out of. Encodes *Cross Contamination* as a real relation rather than a paragraph. |

`Home` is a closed union of three cases, forced by verified reality rather than by symmetry:

- **`Own`** — an absolute URL to its own subdomain. Twelve projects.
- **`Within`** — a parent project `id` plus a path. **Lucifer Chronicles is a series on
  `blog.subzerodev.com`, not a site.** Without this case the page must either lie about it having a
  home or drop it, and it is one of the two most characterful names on the list.
- **`None`** — no address anywhere. Ogre's Kitchen. A project may legitimately be a name and an
  intention; the page says so rather than hiding it.

`Home.Within` is valid only when its parent `id` exists and that parent has `Home.Own`. Its path is
root-relative within that parent's origin. Resolution through a URL parser must preserve the parent
origin; a missing or non-`Own` parent, or a path that changes the origin, fails the build. It never
falls back to a guessed URL.

`escapedFrom` follows the same identity rules: its target must exist and differ from the source, and
the complete edge set must be acyclic. The contamination chain is therefore a forest. A dangling
edge, self-edge or cycle is malformed content, not an empty or truncated chain.

### Stage — and why it is not liveness

`Stage` is a closed, ordered enum taken directly from `Idea.md`'s own method diagram, because the
brand document already contains the vocabulary and inventing a second one would be two vocabularies
for one idea:

`Curiosity` → `Prototype` → `Architecture` → `Infrastructure` → `Reusable` → `Escaped`

`Escaped` is the diagram's "Apparently it's a product now."

**`stage` deliberately does not encode whether the project's site is up.** This is the most
consequential decision in the data model, so the reasoning is stated rather than implied.

Liveness is the tempting choice — the verified facts are very funny. `portfolio.subzerodev.com`
returns 200 and says *"No Portfolio Data Found."* `build-agent.subzerodev.com` serves the unmodified
Docusaurus template. Both are exactly the register the brand asks for, and neither may go on the
page, because **a hand-authored liveness claim becomes a lie the moment the thing is fixed**, and
nothing in this design can notice after publication. The brief requires every status to be attested
as true for the released commit, and the non-goals forbid deriving content from sibling repositories
or touching the network at build time. A liveness field satisfies none of that.

A lifecycle stage is a slow, owner-authored fact. It is a claim about the work rather than about a
host. That makes it maintainable; it does not make it self-verifying. Before publication, the author
attests the complete inventory against the current project sites and source material for that exact
commit. The networked link check verifies reachability separately. Together they satisfy the
brief's release-time truth requirement without making the build derive content from another
repository or site. After publication, the static artifact cannot observe a later change.

**The accepted cost, stated plainly:** the funniest true sentences available today do not appear on
the site.

### Derived values

Every one of these is computed from the `Project` inventory at build time. **No count, total or
figure is typed anywhere**, per the brief:

- project total, and the count per `Stage`
- the ecosystem tree grouped in `Stage` enum order, with `id` as the deterministic order within a
  stage
- the contamination chain, from `escapedFrom` edges
- the "since" year in *Professional uncertainty since 2026* — derived from the earliest project's
  recorded year, not typed, so it cannot contradict the inventory

### Copy

Prose is not data. The manifesto, philosophy and principle text are authored strings living with the
components that render them, and modelling them as records would buy nothing and cost a schema.

Two exceptions, because both are selections from a set `Idea.md` enumerates and the choice needs to
be visible rather than buried in markup: the **primary slogan** (`Well… Why not?`) and the **apex
footer quote** (`Trust us… It'll be fine. Or not.`). Each is a single named constant, not a
collection. There is no rotation — see *Alternatives considered*.

### Route

Two, and no more. `/` is the document. The miss is the second. A `Route` carries:

- its **path**. The package's declared path type admits `/` or a trailing-slash path only, so the
  miss route is declared as `/404/` and the package emits it at `404/index.html`. The conventional
  root `404.html` is produced afterwards by *Artifact*, not by the route declaration. That is one
  route with two static entry files, not a third route.
- its **prerendered body** — the composed document content as HTML, produced here.
- the **stylesheet** that body requires, as text, emitted into the head as an inline style element.
- its **static head metadata**: title, description, canonical URL, Open Graph fields, X/Twitter card,
  theme colour, and an icon set. The package's icon declaration is an `href` string, so **icons are
  embedded as data URIs in that existing field** rather than as linked assets. No package change is
  needed for this, and no additional request is triggered.

There is deliberately **no `<noscript>` content**. `<noscript>` renders precisely when scripting is
off; on a document that needs no scripting there is no fallback for it to describe. The brief's
*Definition of done* still requires it, and the owner has ruled the brief the defect — see
[`90-decisions.md`](90-decisions.md). Until that clause is struck, the brief and this design disagree
on a released requirement, and the disagreement is known rather than resolved here.

The build marker is **not** part of `Route`. The package's head metadata is a closed set with no
mechanism for arbitrary elements, so the marker is injected after the build — see *Artifact*.

### Publication targets

Two, and they publish the same tree.

| | **Preview** | **Release** |
|---|---|---|
| Target | GitHub Pages | A container image, delivered by a compose stack |
| Identity | the commit's build marker | the image tag, which **is** the full commit id |
| Unknown paths | served by the host's root-`404.html` convention | served by a **server configuration this repository owns** |
| Gate | marker read-back against the served site | the image is run in CI and gated there, before publication |
| Cadence | every commit | every release |

**The two targets serve identical bytes.** Both are built from one emitted tree; neither transforms
it. That is asserted by comparing what the running image serves against the corresponding emitted
file, and it is the only thing that makes a preview evidence about a release.

**Image identity is commit identity.** The image is tagged with the full commit id — the same value
the build marker carries — so there is exactly one answer to what is deployed, and the marker inside a
served document can be checked against the tag of the image serving it. A moving `latest` exists for
the compose stack's convenience and is never an identity.

The container's server is a **delivery wrapper and nothing more**: it serves a read-only tree,
executes nothing per request, holds no state, adds nothing to the body, and sets no response header of
its own choosing. `R4` in [`20-contract.md`](20-contract.md) is the canonical statement of that last
rule and names the forbidden categories, because a server cannot literally add no header at all —
HTTP requires them and every server identifies itself. It must return a
**404 status** for an unknown path, not a 200 carrying the miss page — a soft 404 is a defect that
looks like success to a person and lies to a crawler. Those constraints are the requirement; which
server satisfies them is not a design decision.

---

## Module boundaries

Six modules in this repository, plus one external package.

**Content** — owns the `Project` inventory, `Stage`, `Genre`, the two named copy constants, and the
derivation functions that turn the inventory into counts, groupings and the contamination chain.
Depends on **nothing**. Exposes typed data and pure functions.

*The binding rule of this design:* **Content imports nothing from Composition, Presentation, Adapter
or Artifact.** That is what makes every count testable without a DOM, and what stops a number from
being "computed" in a component where the next author will quietly hard-code it.

Content exposes the hand-authored inventory **unvalidated**, because validation must report every
fault at once rather than throwing at module load, and because Verification is entitled to read the
raw records. That export is the one door into the module's data that carries no guarantee, so **the
set of modules permitted to import it is closed**: the single call site that hands it to the
validator, and Verification. No derivation function and no rendering module reads it. Everything else
consumes the validated form, which only the validator can produce.

**Presentation** — owns the visual language: the token set, the type scale, the dark-first palette,
the layout primitives, and **the stylesheet those primitives require, as text**. Depends on
**Content** for `Branded` only: every type it exports is branded, and that type has one home.
Per `Idea.md`: minimal, dark, typography-first, large whitespace, no gradients, no
illustrations, no webfont. The stylesheet is a value this module produces, not a file another tool
discovers, because it has to be handed to the package as a string.

**Composition** — owns both page compositions and the prose. Depends on **Content** and
**Presentation**. Exposes, per route, the **prerendered body HTML**, plus the stylesheet that body
requires. It exposes nothing else. It is the only module that turns data and tokens into markup.

**Adapter** — owns the route declarations, their static head metadata, and the single origin constant
those URLs are built from. Depends on **Composition**, the **external package**, **Content** for four
named things only — `projects`, `validateInventory`, `BuildContext` and `parseCommitId` — and
**Presentation** for two: `themeColor` and `iconDataUri`. It is the
module the package CLI loads, so it is the one place in the import graph where the build reads its
entry conditions and the last point at which it can still refuse to produce anything — it validates
the inventory exactly once and, on failure, reports every error and exits non-zero, rendering nothing.
Everything **renderable** still comes from Composition, and nothing renderable comes from Presentation
— its two imports there are head-metadata values, neither derived from Content — so there is exactly
one path from data to markup. Exposes the adapter configuration the package's CLI consumes.

**Artifact** — owns everything that turns the package's emitted output into a publishable tree,
performed as file operations after the build:

1. producing the conventional root `404.html` from the miss route's emitted document,
2. injecting the full commit id into every emitted document, in a non-visual, machine-readable
   position, extractable from a raw response body without parsing or executing anything, and
3. the **server configuration the container needs** to serve that tree — principally, resolving an
   unknown path to the root `404.html` with a 404 status.

Items 1 and 3 are one concern in two files and belong to one module: the first puts the miss document
where a host convention expects it, the second tells a host with no such convention where it is. Split
across modules they would drift, and the failure is silent — a container that answers every unknown
path with 200 looks fine until a crawler indexes it.

Depends on **Content** for `CommitId`, `parseCommitId` and the shared `Result` type, and on the
emitted output. It takes the commit value from the build environment. **This is not a build system.** It compiles nothing, bundles
nothing and resolves no module; it copies one file, rewrites a string in the others, and emits a
static configuration. Owning it here removes two of the four things that would otherwise block this
repository on another repository's release.

**The image build and its registry push are packaging, not a module.** They consume Artifact's
finished tree and add no behaviour to it. They appear in *Control flow* and *Failure modes*; they
import nothing and are imported by nothing.

**Verification** — owns every assertion: content invariants, derived-value correctness, markup and
stylesheet agreement, accessibility, built-output shape, browser request capture, link resolution,
the in-CI image gate, byte identity between the two targets, release attestation and deployment
read-back. It may read any other module and the built output; **no repository module imports
Verification** — its own tests necessarily do, which is the one reading of that rule an
implementation can satisfy. Offline checks run against the output *after* Artifact has finished
with it. Networked checks run as a separate CI stage after the build and do not feed content back
into it. The truth attestation is a required human CI gate bound to the full commit id, and cannot be
reused by another commit: the CI provider records the approver, the run and the approval instant,
while the value this repository reads back from that record carries the commit and the approver — see
[`20-contract.md`](20-contract.md) § `U3`. Exposes nothing.

**External: `SubZeroDev.Platform.UI.LandingPage`** — owns the build mechanism: the Vite invocation,
the document shell, the `<head>`, and writing the output tree. This repository owns no build system,
and adding one would re-create exactly the duplication that package was extracted to remove.

Three things are required of it, and **all three are delivered as of `0.3.0`** — verified against the
published source rather than its documentation, in [`20-contract.md`](20-contract.md) § `U1`:

1. **Emit a caller-supplied body** into the document instead of the fixed `<div id="root"></div>`.
2. **Omit the entry script** when a body is supplied, so the emitted document loads nothing.
3. Preferred rather than required, and shipped alongside the other two: a caller-supplied inline
   stylesheet emitted as a `<style>` element in the head. See *Alternatives considered* for why the
   stylesheet is not simply carried inside the body string.

The list is retained as the record of what was asked for and why. `0.2.0` provided none of the three,
which is the state every argument in *Failure modes* and *Alternatives considered* below was written
against. The package also declares a per-route hydration flag that nothing reads; whether that flag is
wired to this mechanism or removed is the package's call, not this design's.

### Dependency direction

Arrows mean "imports or reads from"; they point from consumer to provider. Build orchestration is
shown separately because the package CLI loads repository entries rather than becoming a repository
import.

```
Presentation ─► Content (Branded)
Composition ──► Content, Presentation
Adapter ──────► Composition, External package, Content (validation entry conditions),
                Presentation (themeColor, iconDataUri)
Artifact ─────► Content (CommitId, parseCommitId, Result), emitted tree
Verification ─► any module, emitted tree, running image

Package CLI ──loads──► Adapter ──emits──► tree ──► Artifact ──► publishable tree
                                                                   │
                                                    ┌──────────────┴──────────────┐
                                                    ▼                             ▼
                                              Pages deploy                   image build
```

Content imports no repository module and is the only sink. Nothing imports Adapter, Artifact or
Verification from within the repository. The graph is therefore acyclic: `Content` is the sink,
`Presentation` sits above it, `Composition` above them both, `Adapter` above that, and `Artifact` and
`Verification` are sources with no in-edges.

**The fork at the bottom is where the two targets separate, and it is the last point at which they
are provably the same.** Everything above it is shared by construction; everything below it is
asserted. That is why byte identity is checked at the image gate rather than argued from the diagram.

---

## Control flow

### 1. Author changes content, and the site redeploys

The only content write path. Author edits a `Project` record, a stage, or copy → the network-free
build recomputes Content's derivations → Composition renders the body and the stylesheet → Adapter
declares the routes carrying them → the package CLI emits the documents → **Artifact** produces root
`404.html`, injects the commit marker and emits the server configuration → offline Verification
asserts against the finished output, not intent → a separate networked CI stage checks outbound links
and records the author's commit-bound truth attestation → publish. The publication job cannot start
until that human gate records that every stage and project statement was checked against the current
project sites and source material.

Publication and read-back share one critical section. Immediately before publishing, the workflow
confirms that its commit is still the current deployment-branch head; an obsolete run stops. It then
deploys to Pages and polls `/` until the served build marker equals that commit, reads the served
content, and requests a unique unknown path to verify the 404 composition is served **with a 404
status**. Only that complete read-back licenses the live claim. A green build or merged pull request
does not.

### 2. A release is cut, and the image is published

The image is built from Artifact's finished tree — the identical tree Pages received — and tagged
with the full commit id.

**It is gated before it is published, not after.** CI runs the image it just built, polls it until
the served build marker equals the commit, requests a unique unknown path and requires a 404 status
carrying the miss composition, and compares the bytes it serves for `/` against the corresponding
emitted file. That last comparison is what makes the Pages preview evidence about the release rather
than a separate thing that happens to look similar.

Only a gate that passes licenses the push to the registry. An image that fails is never published, so
no compose stack can pull a broken one. The gate is hermetic: it needs no deployed instance, no
network path into the delivery environment, and it runs identically for anyone who builds the image
themselves.

**What happens after the push is outside this design.** Whether a compose stack pulls the new tag, and
when, is delivery configuration the brief puts out of scope. This design guarantees that a published
image is correct, not that anything has deployed it.

### 3. Visitor requests `/`

Pages edge, or the container's file server → prerendered HTML → the manifesto and the ecosystem list
are **present in the response body**, readable with scripting disabled and by a crawler. The
stylesheet is inline and the icons are data URIs, and there is no script or linked runtime asset, so
loading the document triggers no additional request. Nothing is client-computed, so there is no client
state to be wrong. The path is the same on both targets because the bytes are the same.

### 4. Visitor requests an unknown path

The two targets reach the same document by different routes, which is exactly why both are checked.

On **Pages**, the host's root-`404.html` convention serves it. On the **container**, Artifact's server
configuration resolves the unknown path to the same file. Either way: the same shell, the same voice,
the miss handled in the genre `Idea.md` assigns it — static, prerendered, no generator — returned with
a **404 status**.

The design does not change hosting configuration. The Pages behaviour is verified by the deployment
read-back and fails if the settled target does not provide it; the container behaviour is verified by
the in-CI image gate and fails before the image is published.

---

## Failure modes

### The package cannot accept a caller-supplied body

**What fails:** the composed content has nowhere to go. The emitted document is the fixed shell, the
manifesto is absent from the served HTML, and the document loads a module script.

**Detected by:** this is a static fact about the pinned version, not a runtime condition. It was true
at `0.2.0` and is **false at `0.3.0`**, which delivers all three capabilities — verified against the
published package source rather than its documentation ([`20-contract.md`](20-contract.md) § `U1`).

**Response:** while it held, this design **stated the requirement and stopped**, exactly as
`SubZeroDev.Platform`'s L2 did — the capabilities were a package slice in
`SubZeroDev.Platform.UI.LandingPage`, not something improvised here. Duplicating the manifesto into
`<noscript>` is rejected in *Alternatives considered*, and so is abandoning the package. The failure
mode is retained rather than deleted because a pin can move and the same fact has to stay checkable: a
version not providing them re-blocks everything that emits or serves a document. Nothing is blocked by
the package today, and nothing is blocked by Presentation's token set either — `U2` was answered and
written on 2026-08-06. What is still unwritten is owner-supplied copy — each route's title and
description, and whether a social image asset exists (`U6`) — and `U9`'s Verification surface, which
blocks nothing that emits a document.

**State left behind:** none. Nothing is built and nothing is published.

### The emitted document is not self-contained

**What fails:** the package or Vite injects something the design forbids — a module script, a
preload hint, a linked stylesheet, a rewritten asset URL. This is the failure mode that must not be
assumed away: the package hands the generated HTML to a bundler, and what a bundler adds to a
document is its business, not this design's.

**Detected by:** an assertion over the built output that no script element, no stylesheet link and no
external asset reference survives, followed by a browser network capture that allows the navigation
document and rejects every additional load-triggered request. **Both are required.** Source
inspection cannot prove runtime behaviour, and a network capture alone does not name what leaked.

**Response:** build failure before publication.

**State left behind:** none.

### Markup and stylesheet disagree

**What fails:** Composition emits markup carrying a class Presentation has no rule for, or
Presentation carries a rule nothing uses. This risk is created by this design: splitting the document
into two strings produced by two modules and reassembled by a third means they can drift without a
compiler noticing.

**Detected by:** an assertion that every class referenced in the emitted body has a matching selector
in the emitted stylesheet, and that every selector has a user. A page that silently loses its styling
is otherwise indistinguishable from a page that never had any.

**Response:** build failure. **Not a warning** — an unstyled apex is the failure this whole design
exists to prevent, and a warning in a log nobody reads is how it would ship.

### Artifact's post-build step does not run, or runs on the wrong output

**What fails:** the root `404.html` is missing, or a document carries no build marker or a stale one.
A missing marker makes the deployment read-back unable to prove what is served, which turns the
release gate into an assertion of hope.

**Detected by:** an offline assertion, after Artifact, that root `404.html` exists and that **every**
emitted document carries the exact commit being built. A build whose marker is absent fails; a build
whose marker is any other commit fails.

**Response:** build failure. No publication.

**State left behind:** a partially rewritten output tree. It is never published, and the next build
starts from a clean output directory rather than repairing it.

### The server configuration and the emitted tree disagree

**What fails:** the container answers an unknown path with a 200 carrying the miss page, or with its
own default error page, or with the index document. All three look like a working site. The first two
lie to a crawler; the third is worse, because the apex would appear to exist at every path it does
not have.

**Detected by:** the in-CI image gate requesting a unique unknown path and requiring **both** a 404
status and the miss composition in the body. Neither alone is sufficient — a correct status with the
wrong body is a broken page, and the right body with a 200 is a soft 404.

**Response:** the gate fails and the image is never pushed. No registry state changes.

**State left behind:** a local image in the CI runner, discarded with the runner.

### The two targets serve different bytes

**What fails:** Pages and the image diverge — a transform applied on one path and not the other, a
stale tree copied into the image, a `latest` tag pointing at a different build. The preview then
proves nothing about the release, which is the entire reason the preview exists.

**Detected by:** the image gate comparing what the running container serves for `/` against the
corresponding emitted file, and requiring the marker in the served document to equal the commit the
image is tagged with. Divergence is a mismatch, not a warning.

**Response:** gate failure, no push.

**Why it is checked rather than argued:** both targets are built from one tree by construction, so
this failure "cannot happen". That is precisely the class of assumption that is cheap to assert and
expensive to discover, and the image build is the one step in the pipeline that copies rather than
references.

### The registry push fails

**What fails:** the image is correct and gated, and does not reach the registry — credentials,
quota, an outage.

**Detected by:** the push's own exit status. There is nothing subtle here.

**Response:** the release is reported failed. **No image tag is announced**, on the same rule that
governs the live URL: an artifact is not published until it has been read back.

**State left behind:** possibly a partial upload of layers. A registry addresses layers by digest and
an incomplete manifest is not resolvable by tag, so a partial push does not produce a pullable broken
image. The next attempt re-pushes; nothing is repaired by hand.

### A project's site dies after deploy

**What fails:** an outbound link 404s. The page is stale, not wrong — it never claimed the site was
up.

**Detected by:** a link check over every `Home.Own` URL and every resolved `Home.Within` path. In CI
it runs after the network-free build and gates deployment, not artifact construction. It proves the
address still answers and no more: a redirect is a pass and is not followed, and the check does not
run on a fork pull request, where the hostnames it would reach are the pull request's to choose. The
first limit is written in [`20-contract.md`](20-contract.md) § *Error semantics*; the second is
workflow configuration and is recorded in [`90-decisions.md`](90-decisions.md). After deploy
nothing notices, which is the honest limit of the chosen static release boundary. A scheduled check
is deliberately left to *Open questions* rather than assumed.

**User sees:** a working page with one dead link.

### Publication fails

**What fails:** the build succeeds but the artifact is not published, or is published and does not
serve.

**Detected by:** polling until the served document's full build marker equals the expected commit,
then asserting its known content and the unknown-path response. An old CDN response cannot satisfy
the marker comparison.

**Response:** the deploy is reported failed and no live URL is announced.

**State left behind:** unknown until read-back. This design does not assume that a static publisher
promotes a whole artifact atomically; a failed publication may leave the previous artifact, the new
artifact or a partial upload. No live claim is made for the failed commit.

**Out of scope:** domain, DNS, TLS and hosting configuration, per the brief. This design assumes a
publishable target and asserts nothing about how the address reaches it.

### Malformed or empty content

**What fails:** an empty inventory; a project with no `id`, invalid `year` or duplicate `id`; a
`Home.Within` with a missing or non-`Own` parent or an origin-replacing path; an `escapedFrom` edge
with a missing target, self-reference or cycle.

**Detected by:** Content-level assertions that run before anything renders, reporting **every** fault
in one pass rather than the first.

**Response:** **build failure — never a silently empty section and never a default stage.** An
inventory that reduces to nothing is a fault in the inventory, not a page with no projects on it. A
degraded page is worse than no page, because it looks deliberate.

### The package is unavailable or drifts

**What fails:** a version disappears, or a floating range moves under the build.

**Detected by:** an exact pin plus a lockfile; a clean install resolving anything else fails.

**Response:** pinned exactly, per the L2 precedent. **Which version to pin is unresolved** — see
*Open questions*.

### Partial failure and retry

The local build is all-or-nothing and does not retry deterministic failures. Networked verification
and publication are different: they perform reads and writes that can fail after earlier work has
succeeded. The link checker and deployment poll use bounded retry policies defined in the contract;
exhaustion fails the gate. Publication state remains unknown until exact-marker read-back succeeds,
and no failure path is described as atomic without evidence from the settled publisher.

---

## Concurrency and ordering

Runtime page delivery has no shared application state, so visitors do not interact through this
site. CI workflow runs can still overlap, link checks may be parallel, and multiple commits can
become deployment candidates. Those are concurrency even though the artifact is static.

**Within the build, Artifact mutates the output tree that Verification then reads.** That is the one
read-after-write hazard in the system. It is enforced structurally: the package build, Artifact and
the offline assertions run **sequentially in a single CI job** over one working directory. They are
not separate jobs exchanging an uploaded artifact, because a job boundary is where a stale or partial
tree would become invisible. Nothing else in the repository writes to the output tree, and each build
starts from a clean one.

Link checks are read-only and their result is collected before publication. Publication is protected
by one concurrency group covering the branch-head check, publish operation and exact-commit
read-back as a single critical section. A run that is no longer the deployment-branch head stops
before publishing, preventing an older queued run from overwriting a newer commit.

**Two publication targets do not mean two critical sections.** Both are governed by the same group,
because the failure they must not permit is the same one: an older run overwriting a newer commit.
Pages has one mutable location and the registry has one mutable tag — `latest` — and a run that has
lost the branch-head check must move neither. The commit-tagged image is immutable by construction
and could safely be pushed by any run, but it is not treated as an exception, because a rule with one
carve-out is a rule the next author will find a second carve-out in.

The ordering invariant is: content validation → render → package build → Artifact → offline
verification → image build → in-CI image gate → networked link check and truth attestation →
branch-head check → Pages deploy and registry push → exact-marker and unknown-path read-back → live
claim. The workflow enforces that sequence; the prose report merely reflects it.

The image gate sits **before** the attestation rather than after, because it is hermetic and
deterministic: it costs nothing to run, needs no human and no network, and a failure there means the
artifact is wrong. Spending a human attestation on an artifact a machine can already prove broken
wastes the one gate in this pipeline that cannot be re-run cheaply.

---

## Alternatives considered

### Render here and hand the package a body, rather than making the package render

**Chosen:** this repository renders its composition to HTML; the package accepts that body, omits the
entry script, and keeps Vite, the shell and the head.

**Rejected — require the package to render.** This was the earlier draft's position and it was
adopted before anyone had read the package. Verified: the package has no render path, no React
dependency and no server-render step, so satisfying it means the package must execute consumer entry
modules and turn into a rendering framework. That is a large feature added to a package whose whole
job is bundling, and every consumer would pay for it. The narrower ask — accept a body — is roughly
two optional fields and lands sooner.

**Rejected — abandon the package and own the emission here.** It is the only option that ships
without another repository moving, which is a real advantage and the reason it was seriously
considered. Rejected because it puts a Vite configuration, a bundler and an HTML pipeline into the
repository that has the least reason to own one, and re-creates precisely the duplication the package
was extracted to remove. The cost of that duplication is paid forever; the cost of waiting is paid
once.

**Rejected — client render plus a `<noscript>` line**, the pattern `Platform` ships. Acceptable for a
status page nobody arrives at from a search result; not acceptable for a manifesto that is the
company's only public statement of what it is, addressed to recruiters and clients.

**Rejected — duplicating the manifesto into `<noscript>`.** It works, and it creates a second copy of
every sentence that will drift from the first. `AGENTS.md` *Single ownership* forbids exactly this,
and `agent.md` records that a missed removal in a duplicated set is silent.

### A post-build step owned here, rather than four requirements on the package

**Chosen:** the root `404.html` and the build marker are produced here, after the package build, by
a step that copies one file and rewrites a string.

**Rejected — asking the package for both.** It is the tidier boundary on paper: everything that
touches the artifact stays in one place, and this repository owns nothing after the build. Rejected
because it doubles the package ask for two operations that need no knowledge of the package at all,
and it blocks two trivially-solvable requirements behind another repository's release schedule. The
distinction that makes this safe is that the step compiles and resolves nothing — the moment it needs
to, it has become a build system and belongs back in the package.

**Rejected — treating the marker as head metadata.** The package's metadata set is closed with no
element for it, so this collapses into the previous option.

**Rejected — deriving the served commit from page content instead of a marker.** Two commits can emit
identical copy, and a CDN can serve either. It cannot distinguish them, which is the one thing the
read-back exists to do.

### The stylesheet is a head element, not carried inside the body string

**Chosen:** the stylesheet is supplied separately and emitted as a `<style>` element in the head.

**Rejected — carrying `<style>` inside the prerendered body string.** Tempting, because it reduces
the package ask to a single field and keeps markup and stylesheet travelling together, which is
exactly where the drift risk is. Rejected because `<style>` is metadata content and is **not
conforming** in `<body>` — every browser renders it, and a validator flags it. A design that asserts
its own output shape should not ship output it would have to except from validation.

### Icons as data URIs in the package's existing field, rather than a new embed mechanism

**Chosen:** icons are embedded as data URIs in the icon declaration the package already emits.

**Rejected — asking the package for an icon-embedding mechanism.** It would be a third requirement on
a release this repository is already waiting for, to buy nothing: the field is an `href` string and a
data URI is a URL. The requirement was in the earlier draft's package ask and did not survive reading
the package's source.

### Two publication targets, with Pages permanent rather than transitional

**Chosen:** GitHub Pages is the permanent preview, deployed every commit; the container image is the
release. Both serve one tree, and byte identity between them is asserted.

**Rejected — Pages as scaffolding until the container works, then removed.** The cheaper design: one
target, one gate, no identity assertion. Rejected because it discards a per-commit URL that costs
almost nothing — Pages is already enabled on this repository and the package already ships the deploy
workflow — and because a preview you delete is a preview that was never load-bearing. Reviewing a
prose site from a diff is the thing this whole design is trying to avoid.

**Rejected — Pages as the release, container as an extra distribution.** The original single-target
design with a container bolted on. Rejected on the owner's ruling that delivery is the compose stack;
it also leaves the question of which target the attestation and the live claim actually govern, and
two answers to that is worse than two targets.

**The cost, stated plainly:** a second publication path, and an identity assertion that exists only
because there are two. If the preview is ever allowed to drift from the release, it becomes worse
than having no preview, because it will be trusted.

### The image is gated in CI before publication, not after deployment

**Chosen:** CI runs the image it built, polls its marker, checks the unknown-path status and body, and
compares served bytes against the emitted tree. Only a passing gate licenses the registry push.

**Rejected — gating against the deployed compose instance.** It proves the actual delivered thing
rather than a CI approximation, which is a real advantage and the reason it was considered. Rejected
because it requires a network path from CI into the delivery environment, couples the release gate to
infrastructure the brief puts out of scope, and inverts the ordering that matters: a broken image
would already be published and pullable by the time anything noticed.

**Rejected — both gates.** The most rigorous option, and it closes the genuine gap between *the image
is correct* and *the site is serving it*. Rejected for now because the second gate needs the network
path the previous option was rejected for. It is the right thing to add if the compose stack ever
becomes reachable from CI, and nothing here forecloses it.

**Rejected — publishing on a green build with no image gate at all.** The convention, and it means the
first thing to run the image is the compose stack.

### The image is tagged by commit id, in the repository's own registry

**Chosen:** GHCR, tagged with the full commit id, plus a moving `latest`.

**Rejected — semantic version tags.** They read better in a compose file, which is a real benefit for
the person maintaining one. Rejected because this design binds marker, attestation and read-back to
the commit id, and a second identity means two answers to "what is deployed" and a mapping between
them that nothing maintains. There is also no release process in this repository to produce a version.

**Rejected — Docker Hub.** Public and familiar, at the cost of credentials outside the repository's
own permission model for no capability GHCR lacks.

**Rejected — tagging only `latest`.** One less thing to think about, and it makes a rollback
impossible to express and the read-back impossible to bind to a commit.

### Lifecycle stage rather than observed liveness

**Chosen:** `stage` as an authored lifecycle position, with liveness handled as a CI check.

**Rejected — a liveness or health field.** It is the funnier option and the verified material is
excellent. It is rejected because a hand-authored liveness claim cannot stay true: the day
`portfolio.subzerodev.com` gains data, the page is lying, and the deployed static artifact cannot
notice. The brief holds that nothing may be funnier than it is true, and a joke with an expiry date
nobody is watching is the exact defect that rule names.

**Rejected — deriving status from the sibling repositories.** It would stay true, and it is a brief
non-goal: it makes the build depend on twelve repositories' internal formats or on the network.

### One document, rather than routes per section

**Chosen:** `/` and the miss route.

**Rejected — separate `/manifesto`, `/projects`, `/philosophy` routes.** The apex's genre is the plain
document, and a document is one thing. Splitting it produces a small site, which is what every child
already is, and the apex's whole distinction is that it is not one. It would also add the navigation
chrome a *multi-route* site requires — a persistent bar carrying route state, a current-page
affordance, a path back — which is what the visual identity rules out.

**That last clause was narrowed on 2026-08-07**, because it had been read as forbidding any link row
at all. It was never entitled to that reading: the visual identity ruling
([`90-decisions.md`](90-decisions.md), 2026-08-06, *"`U2` answered"*) enumerates its constraints —
minimal, dark, typography-first, large whitespace, no gradient, no illustration, no webfont, a closed
primitive set — and names no rule about navigation. `00-brief.md` states the opposite obligation: the
apex *"routes to them"*, and a visitor who arrives and *"has no route to the work"* is the problem
this site exists to solve. This document's own *Data model* already anticipates the mechanism, calling
a project `id` *"the anchor fragment"*. **A single row of links on the one document is in scope**; the
chrome this paragraph rejects is the kind that only a multi-route site can have. See
[`90-decisions.md`](90-decisions.md), 2026-08-07.

### A fixed slogan, rather than rotation

**Chosen:** one primary slogan and one footer quote, each a named constant. `Idea.md` already
designates both.

**Rejected — rotating through the fourteen slogans per load.** Very on-brand, and it makes the page
non-deterministic: the built-output assertions cannot name the tagline, and a slogan seen one time in
fourteen is not a brand statement. Randomness is also the only client-side computation the design
would contain, for no gain.

---

## Open questions

These need information I do not have. I have not assumed answers to any of them.

**Numbers are stable and are never reused.** `20-contract.md` and `30-slices.md` cite these by number,
and renumbering would rot those citations silently. An answered question keeps its number and says so.

1. ~~**Can the package emit this consumer's required artifact shape?**~~ **Answered 2026-08-05: no,
   and there is no path to it in the current design.** Verified against the package source rather
   than its documentation. The question is superseded — this design no longer asks the package to
   render. What it now asks for is in *Module boundaries*, and what happens if it is unavailable is
   in *Failure modes*. Retained so the citations to it resolve.
2. ~~**Which package version?**~~ **Answered 2026-08-06: `0.3.0`, pinned exactly.** It is the first
   release that accepts a caller-supplied body and omits the entry script, verified as published
   rather than assumed — [`20-contract.md`](20-contract.md) § `U4`. The separate version drift this
   question also recorded — `SubZeroDev.Platform` pinning `0.2.0` while the package's own
   `30-slices.md` names `0.1.0` as the published handoff — is unaffected by this answer and is tracked
   as issue #4; neither repository is this one. Retained so the citations to it resolve.
3. ~~**What is Ogre's Kitchen?**~~ **Answered 2026-08-05: the owner supplied the copy, and S2
   committed it.** It carries `stage: "Curiosity"`, a `line` and a `question`, and `home` is `none` —
   it has no repository and no subdomain, which is the entry's whole content. Retained so the
   citations to it resolve.
4. **Which repositories are public?** If the page links to source, a link to a private repository is
   a 404 for every visitor but you. I have not checked visibility.
5. **Does *Effortless Action* go on the page, and in which draft?** `Idea.md` lines 540–604 hold three
   competing versions inside an unresolved conversation. None is chosen and I have treated none as
   settled.
6. **Should a scheduled link check run?** It is the only way a dead outbound link is noticed after
   deploy. It costs a workflow and it is the sole thing that would make this repository observe the
   others — adjacent to a brief non-goal, though not obviously inside it.
7. **Where does the compose stack terminate TLS, and does anything in it need to be true for the
   container to be correct?** This design guarantees a published image is correct and stops there —
   whether a stack pulls it, behind what proxy, on what hostname, is delivery configuration the
   brief's DNS/TLS non-goal covers. I am asking only because the container is new to the brief and
   that non-goal was written when there was one static target. If the answer is "nothing", this
   closes with no work.
8. **Does the compose file live in this repository?** The brief says this repository publishes the
   image; it does not say whether it also owns the stack that runs it. A compose file here is
   documentation of how to run the image; a compose file in the homelab repository is the deployment.
   They are different things and only one of them is this repository's.

Further unresolved items were raised downstream and are owned by
[`20-contract.md`](20-contract.md) rather than restated here: whether a social image asset exists
(`U6`), and the Verification surface that would check `P2`–`P4` (`U9`). Raised there and answered on
2026-08-06: Presentation's token set (`U2`), where the attestation record lives (`U3`), and which
server serves the container tree (`U7`).
