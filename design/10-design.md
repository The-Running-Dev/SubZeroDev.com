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

**The same output is published twice.** GitHub Pages is the permanent preview/development target,
deployed on every commit without a human or release gate. A container image published from this
repository is the release, delivered by a compose stack. Both serve the *same* emitted tree, byte for
byte — that identity is asserted, not assumed, because a preview that serves different bytes from the
release proves nothing about the release.

> **The disagreement this box recorded is closed, on the owner's ruling of 2026-08-07.** It stood
> here from 2026-08-05: `00-brief.md` § *Environment* opened *"Static site. No server, no application
> runtime…"* while a container serving the site runs a static file server, and *Definition of done*
> was framed around a single deployed target where there are two. Both were flagged rather than
> reconciled, because the brief outranks this document and a model may not author it.
>
> The brief now carries both. *Environment* states the **delivery wrapper** distinction this design
> had been arguing on its own — the container executes nothing per request, holds no state, and adds
> nothing to the bytes it serves, so a static file server inside it is not an application — and
> *Definition of done* names two targets with byte identity asserted between them. Neither this
> document nor the contract moved; the brief did. See [`90-decisions.md`](90-decisions.md),
> 2026-08-07.

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

- **`Own`** — an absolute URL to its own subdomain. The common case; **how many there are is the
  inventory's to say, not this document's.** A count written here is a second copy of a figure the
  inventory owns, drifting the moment a project gains or loses a subdomain — the same rule the brief
  applies to the page, applied to the document describing it.
- **`Within`** — a parent project `id` plus a path. **Lucifer Chronicles is a series on
  `blog.subzerodev.com`, not a site.** Without this case the page must either lie about it having a
  home or drop it, and it is one of the two most characterful names on the list.
- **`None`** — no address anywhere. Ogre's Kitchen. A project may legitimately be a name and an
  intention; the page says so rather than hiding it.

**`schemas.subzerodev.com` is not an inventory record**, and that is a ruling rather than an omission.
`00-brief.md` verifies it does not exist despite being referenced in the ecosystem's own docs. A
referenced name is not a project: it has no repository, no stage anyone authored and no originating
question, and a `Home.None` record would put a row on this page asserting that SubZeroDev has a project
it does not have — which the house rule against being funnier than is true forbids directly. The
dangling reference is a defect in the documents that carry it, not an entry here.

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
host. That makes it maintainable; it does not make it self-verifying. Before release publication, the author
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

### Testimonial

The one place this document models prose as data rather than as authored strings living with their
renderer — the opposite call from the paragraph above, made for the opposite reason. The manifesto is
one voice saying one thing; a testimonial is many attributed voices, each short, each independent, and
the renderer must not need to know who any of them are or how many there are. That is a record shape,
not a paragraph.

| Field | Type | Notes |
|---|---|---|
| `quote` | string | The attributed line. Required, non-empty. |
| `author` | string | Who is credited. Required, non-empty. |
| `role` | string or absent | A secondary attribution line, under the author. |
| `organization` | string or absent | A tertiary attribution line, under `role`. |

No `avatar` field and no `source` field. `avatar` would be an image asset, and the brief's
runtime-request non-goal forbids any load-triggered request after the document — the same rule that
already rules out webfonts and linked stylesheets in *Presentation*. `source` was considered as an
outbound citation link, but every candidate rendering either duplicates `organization` as inert text or
turns a fabricated attribution into a clickable claim, which the *testimonials* carve-out in
`00-brief.md` § *Source material* does not extend to.

**Order is the data's, not the renderer's.** The renderer preserves the order it is given and sorts
nothing — the same discipline `ecosystemTree` and `contaminationForest` observe over `Project`, so a
consumer supplying real customer quotes gets a plain list rather than an editorial one, and so the
escalation this repository's own collection depends on lives in the committed record order, not in
component logic that would have to know it exists.

### Route

**Three**, not two. `/` is the manifesto route, `/testimonials/` the testimonials route, and the miss
route the third. The first two are independently addressable documents, but they do not carry
independent bodies: Composition folds the apex and testimonials compositions into one shared shell
with no executable script and emits that same pair of views at both paths. The path selects only which
view is visible when no fragment is present. Their shared navigation switches views with `#apex` and
`#testimonials`, using CSS `:target`/`:has()` rather than a script, fetch or second document load.

This overturns the previous "two, and no more" and narrows the *One document, rather than routes per
section* rejection recorded in *Alternatives considered*. The reasoning behind the apex staying one
manifesto is unchanged: testimonials are different data and a different composition, but folding the
two completed compositions lets navigation replace the visible root content without turning either
into a manifesto section or introducing a client runtime. A `Route` carries:

- its **path**. The package's declared path type admits `/` or a trailing-slash path only, so the
  miss route is declared as `/404/` and the package emits it at `404/index.html`. The conventional
  root `404.html` is produced afterwards by *Artifact*, not by the route declaration — and *Artifact*
  then **removes** the emitted `404/index.html`, because a directory index is served with a **200**,
  which would put the miss composition at a fixed, discoverable, self-declared-canonical URL. That is a
  soft 404 by this design's own definition, at the one path the unknown-path checks never request. So
  it is one route with one *published* entry file, relocated, not a third route.
- its **prerendered body** — the composed document content as HTML, produced here.
- the **stylesheet** that body requires, as text, emitted into the head as an inline style element.
- its **static head metadata**: title, description, canonical URL, Open Graph fields, X/Twitter card,
  theme colour, and an icon set. The package's icon declaration is an `href` string, so **icons are
  embedded as data URIs in that existing field** rather than as linked assets. No package change is
  needed for this, and no additional request is triggered.

There is deliberately **no `<noscript>` content**. `<noscript>` renders precisely when scripting is
off; on a document that needs no scripting there is no fallback for it to describe. The brief's
*Definition of done* carries that reasoning as of its 2026-08-07 amendment and no longer requires the
element, so the two documents agree — see [`90-decisions.md`](90-decisions.md) and
[`20-contract.md`](20-contract.md) § `U5`.

**Nothing bounds the document's size, and that is recorded rather than checked.** Everything this
design ships is inline by construction — the stylesheet, the icon data URI and the JSON-LD block — so
page weight is the one property that could degrade without any assertion noticing. It is accepted
because it cannot degrade quietly: the icon is a single small SVG letterform, the inventory is
hand-authored, and every byte added is added by someone typing it. There is no size budget and no
assertion over one. If either the icon set or the inventory ever stops being author-scale, this is the
first thing that should stop being an accepted risk.

The build marker is **not** part of `Route`. The package's head metadata is a closed set with no
mechanism for arbitrary elements, so the marker is injected after the build — see *Artifact*.

### Publication targets

Two, and they publish the same tree.

| | **Preview** | **Release** |
|---|---|---|
| Target | GitHub Pages | A container image, delivered by a compose stack |
| Identity | the commit's build marker | the image tag, which **is** the full commit id |
| Unknown paths | served by the host's root-`404.html` convention | served by a **server configuration this repository owns** |
| Publication checks | post-publication marker, byte and unknown-path read-back. **No human approval, truth attestation, image gate or link gate precedes the Pages publish** | the image is run in CI and gated before publication, outbound links are checked, then the truth attestation, then the endpoint is read back after redeploy |
| Cadence | every commit, and genuinely so — nothing human is in front of it | every release |

**The two targets serve identical bytes.** Both are built from one emitted tree; neither transforms
it. That is asserted by comparing what **each** serves for `/` against the corresponding emitted file
— the running image at the CI gate, and Pages at its read-back — and it is the only thing that makes a
preview evidence about a release. Comparing one side and arguing the other from shared construction
was the earlier form, and it left the target the brief's clause is half about unchecked.

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

**Composition** — owns the three page compositions, the prose, and the fold that combines the apex and
testimonials compositions into their two emitted route bodies. Depends on **Content** and
**Presentation**. Each raw composition exposes prerendered body HTML plus the stylesheet that body
requires. The fold consumes the already-composed apex and testimonials routes, preserves both views,
reuses the apex navigation, rewrites its route links to fragments, and derives a fresh stylesheet from
each folded body. It is the only module that turns data and tokens into markup.

The fold deliberately fails loudly if a composer stops producing the structural envelope it needs —
the `page > stack` wrapper, the apex navigation and testimonials link, or the testimonials header and
back-link. Those are bare build-time exceptions rather than content errors: validated content cannot
cause them, and recovering would mean guessing how to fold a composition whose contract has changed.

**Adapter** — owns the route declarations, their static head metadata, and the single origin constant
those URLs are built from. Depends on **Composition**, the **external package**, **Content** for six
named things only — `projects`, `testimonials`, `validateInventory`, `validateTestimonials`,
`BuildContext` and `parseCommitId` — and **Presentation** for two: `themeColor` and `iconDataUri`. It is the
module the package CLI loads, so it is the one place in the import graph where the build reads its
entry conditions and the last point at which it can still refuse to produce anything — it validates
the inventory and testimonial collection exactly once each and, on either failure, reports every error
and exits non-zero, rendering nothing. Once both validate, it asks Composition to fold the apex and
testimonials routes, declares those two folded bodies plus the miss route, and exposes the adapter
configuration the package's CLI consumes. Everything **renderable** still comes from Composition, and
nothing renderable comes from Presentation — its two imports there are head-metadata values, neither
derived from Content — so there is exactly one path from data to markup.

**Artifact** — owns everything that turns the package's emitted output into a publishable tree,
performed as file operations after the build:

1. producing the conventional root `404.html` from the miss route's emitted document, and removing
   that emitted document afterwards so the miss composition has exactly one published path,
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

The only content write path. Author edits a `Project`, a `Testimonial`, a stage, or copy → the
network-free build validates both content sets and recomputes Content's derivations → Composition
renders the three raw compositions and folds the apex and testimonials into their two shared-view
bodies → Adapter declares those two plus the miss route → the package CLI emits the documents →
**Artifact** produces root
`404.html`, injects the commit marker and emits the server configuration → offline Verification
asserts against the finished output, not intent. The flow then forks. Pages publishes and is read back
as preview/development output immediately from that finished build. In parallel, the image gate and
the separate networked outbound-link check prepare the release path; only that path proceeds through
the author's commit-bound truth attestation and into release publication.

**The attestation gates the release, not the preview.** Pages exists specifically for preview and
development publishing, so no human approval, truth attestation, image gate or outbound-link gate is
placed in front of it. A gate asked for on every stylesheet typo becomes a reflex and makes the
every-commit preview cadence untrue. The cost is explicit: **the Pages URL is public and may serve
project statuses no human attested for that commit.** The brief now excludes that development target
from its release-time truth assertion. Post-publication marker, byte and unknown-path read-back still
prove what the preview serves; they do not make it a release.

Publication and read-back share one critical section. Immediately before publishing, the workflow
confirms that its commit is still the current deployment-branch head; an obsolete run stops. It then
deploys to Pages, polls `/` until the served build marker equals that commit, **compares the served
bytes against the emitted apex document**, and requests a unique unknown path to verify the 404
composition is served **with a 404 status**. Only that complete read-back licenses a claim about the
preview. A green build or merged pull request does not.

**The two branches never join.** The preview publishes without waiting for release preparation, and
the release publishes without waiting for the preview. This section required the release to wait for
the Pages read-back until 2026-08-08, on the reasoning that a release should ship only bytes a preview
had already proved identical. That reasoning does not survive naming what `V11` compares: **both
halves compare a served response against the emitted apex document, never against each other**, so the
image gate establishes the release's byte identity on its own and the Pages read-back adds nothing to
it. The wait bought a schedule rather than a proof, at the price of stalling every release behind a
publisher this repository does not run. See [`90-decisions.md`](90-decisions.md), 2026-08-08.

**The cost, stated plainly:** a release can be attested and pushed while the Pages read-back is still
running, or after it has failed — a preview left unproven beside a proven release. `V8` is what stops
that becoming a false claim: each read-back licenses a claim about its own target and about nothing
else.

**The head is checked twice, and the second check is the load-bearing one.** The attestation sits
between the release checks and the registry push, and a human gate has no bound on how long it takes.
A branch-head check taken before it proves nothing after it: an approval granted an hour later, on a
branch that moved in the meantime, would otherwise license a push and a redeploy for a superseded
commit. The re-check immediately before the push is what closes that window — the check is a
comparison at an instant, never a lock, so the only remedy for a long gap is to check again at the end
of it.

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

**After the push, the redeploy is triggered and read back.** This is the half the brief's 2026-08-07
amendment moved into this repository, and an earlier revision of this section wrongly still placed it
outside: the publish job requests the stack's redeploy, then polls the endpoint until the served build
marker equals the commit just pushed and a unique unknown path answers 404 carrying the miss
composition. Those are the same two assertions the image gate already ran, now against the delivered
instance rather than a CI approximation. **Only that read-back licenses a live claim about the site.**
A pushed image is not a deployed one, on exactly the rule that governs the Pages URL.

**The Compose file names `latest`, and the endpoint supplies the identity.** It pulls
`ghcr.io/the-running-dev/subzerodev-com:latest` with `pull_policy: always`, so the committed file is
static across releases and names no commit — a commit-pinned file would have to be rewritten and
committed per release, which permanently lags the release it deploys by one commit. What is deployed is
therefore established by reading the marker back, never by reading the tag. The commit tag stays the
immutable identity in the registry and is what a rollback names.

**What the stack declares about the network is one name.** It attaches to an already-existing network
and declares nothing else about it. What terminates TLS in front of it, and the configuration of the
thing that does, remain out of scope — see the brief's non-goal as amended, which admits the
attachment and re-states that exclusion in the same breath.

### 3. Visitor requests `/`

Pages edge, or the container's file server → prerendered HTML → the manifesto and the ecosystem list
are **present in the response body**, readable with scripting disabled and by a crawler. The
stylesheet is inline and the icons are data URIs, and the only script element is an inert
`application/ld+json` block that no browser executes and none fetches, so loading the document
triggers no additional request. Nothing is client-computed, so there is no client
state to be wrong. The folded testimonials view is present in the same response but hidden by default.
The path is the same on both targets because the bytes are the same.

### 3a. Visitor switches between the apex and testimonials

The shared navigation changes the fragment to `#testimonials` or `#apex`. CSS `:target`/`:has()`
reveals the selected folded view and hides the other; no script runs, no request starts and the route
document is not replaced. Loading `/testimonials/` directly emits the same two views with testimonials
as the no-fragment default, so both addresses remain independently loadable and crawlable while the
in-page switch stays within the document already served.

### 4. Visitor requests an unknown path

The two targets reach the same document by different routes, which is exactly why both are checked.

On **Pages**, the host's root-`404.html` convention serves it. On the **container**, Artifact's server
configuration resolves the unknown path to the same file. Either way: the same shell, the same voice,
the miss handled in the genre `Idea.md` assigns it — static, prerendered, no generator — returned with
a **404 status**.

The design changes nothing about the network in front of either target. It does own the container's
own server configuration — that is Artifact's third item — and, as of the brief's 2026-08-07
amendment, the Compose file that runs the image; the boundary is the artifact, not the host. The
Pages behaviour is verified by the deployment read-back and fails if the settled target does not
provide it; the container behaviour is verified by the in-CI image gate and fails before the image is
published.

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

**Detected by:** an assertion over the built output that no **executable** script element, no
stylesheet link and no external asset reference survives — the single `application/ld+json` block is
the one permitted element and any other `type`, any missing `type` and any `src` fails — followed by a
browser network capture that allows the navigation document and rejects every additional load-triggered
request. **Both are required.** Source inspection cannot prove runtime behaviour, and a network capture
alone does not name what leaked.

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

### A composition's fold envelope drifts

**What fails:** the apex or testimonials composer stops producing the `page > stack` envelope or the
navigation/header/back-link hooks the fold reuses. Continuing would either duplicate navigation,
discard content or emit fragment links that cannot switch views.

**Detected by:** `foldRoutes` checks each required structural hook before rewriting it and throws a
bare `Error` at build time when one is absent. This is an authored-code defect, not malformed content,
so it has no `ContentError` variant and no fallback composition.

**Response:** build failure before Adapter can declare a route. Nothing is emitted or published.

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

### The redeploy does not happen, or the endpoint does not serve the new commit

**What fails:** the image is pushed and the stack does not take it — the trigger never reached the
stack, the stack pulled and the container did not restart, the pull got a cached `latest`, or the
container came up and the endpoint still answers with the previous commit's marker. Every one of these
looks like a successful release from inside CI, because the push succeeded.

**Detected by:** polling the endpoint until the served build marker equals the commit just pushed, and
requesting a unique unknown path for a 404 carrying the miss composition. This is the same pair the
image gate ran, and it is deliberately run twice: the gate proves the artifact is correct and this
proves the delivery took it. A marker that never changes is indistinguishable from a trigger that was
never delivered, and neither is distinguishable from success without this read-back.

**Response:** the release is reported failed and **no live claim is made about the site**. The image
stays pushed and correct — it was gated before publication — so this failure is a delivery failure, not
an artifact failure, and re-running the trigger is the remedy rather than rebuilding.

**State left behind:** unknown until read-back, and the two targets can disagree: Pages may be serving
the new commit while the endpoint serves the previous one. That is a real and reachable state, and it
is why the live claim is bound to the endpoint rather than to the preview.

**Not covered:** whether the stack stays on that commit afterwards. Nothing here observes the delivery
environment after the read-back returns, on the same honest limit that applies to a project's site
dying after deploy.

### A project's site dies after deploy

**What fails:** an outbound link 404s. The page is stale, not wrong — it never claimed the site was
up.

**Detected by:** a link check over every `Home.Own` URL and every resolved `Home.Within` path. In CI
it runs after the network-free build and gates the release, not artifact construction or the Pages
preview. It proves the
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

**Known limit, recorded rather than fixed:** the read-back proves *what is served*, not *that this run
put it there*. A workflow re-run on a commit already deployed satisfies the marker comparison on its
first poll, so a publication step that silently did nothing reports success. "An old CDN response
cannot satisfy the marker comparison" is true across commits and false on a re-run of one. Making the
marker identify the deployment rather than the commit would mean a per-run value inside the artifact,
and the two targets would then carry different bytes — which `V11` exists to forbid. The honest
statement is the narrower one, and it is why a re-run is not evidence.

**Out of scope:** the domain, its DNS records, TLS termination, and any reverse proxy or host the
deployment sits behind, per the brief as amended 2026-08-07. This design assumes a publishable target
and asserts nothing about how the address reaches it. The deployment artifact itself — the Compose
file, its redeploy step and the endpoint that redeploy is verified against — is in scope; see *Open
questions* 7 and 8.

### Malformed or empty content

**What fails:** an empty inventory; a project with no `id`, invalid `year` or duplicate `id`; a
`Home.Within` with a missing or non-`Own` parent or an origin-replacing path; an `escapedFrom` edge
with a missing target, self-reference or cycle.

**Detected by:** Content-level assertions that run before anything renders, reporting **every** fault
in one pass rather than the first.

**Response:** **build failure — never a silently empty section and never a default stage.** An
inventory that reduces to nothing is a fault in the inventory, not a page with no projects on it. A
degraded page is worse than no page, because it looks deliberate.

**An empty *stage group* is a different thing and is not a fault.** The derivation carries one group
per `Stage` including empty ones, so counts and ordering stay total; the composition renders only the
groups with members. A lifecycle stage nothing has reached yet is a true fact about the work, not a
malformed inventory, and it appears as an absence rather than as a heading with nothing beneath it.
This rule was unwritten until 2026-08-07 — the sentence above was about an empty inventory and had been
read as covering both.

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

Link checks are read-only and their result is collected before release publication; the Pages preview
does not wait on them. Publication is protected
by one concurrency group covering the branch-head check, publish operation and exact-commit
read-back as a single critical section. A run that is no longer the deployment-branch head stops
before publishing, preventing an older queued run from overwriting a newer commit.

**Two publication targets do not mean two critical sections.** Both are governed by the same group,
because the failure they must not permit is the same one: an older run overwriting a newer commit.
There are three mutable locations and not two — Pages has one, the registry has one mutable tag
(`latest`), and the deployed stack is the third, since a redeploy trigger fired by a stale run pulls
whatever `latest` then names. A run that has lost the branch-head check must move none of them. The
commit-tagged image is immutable by construction and could safely be pushed by any run, but it is not
treated as an exception, because a rule with one carve-out is a rule the next author will find a
second carve-out in.

**The redeploy trigger is inside the critical section, and the endpoint read-back extends it.** That
is the section's most expensive property: it is now held across a network round trip into a delivery
environment this repository does not run, bounded only by the poll's own retry budget. The alternative
— releasing the group at the push and reading back outside it — permits precisely the interleaving the
group exists to forbid, because two runs would then be able to trigger redeploys in one order and read
back in the other.

The ordering invariant forks after the shared build: content validation → render → package build →
Artifact → offline verification. From there, the **preview branch** performs branch-head check → Pages
deploy → Pages read-back (exact marker, bytes, unknown path), without waiting on a release gate. In
parallel, the **release-preparation branch** performs image build → in-CI image gate → networked link
check, and continues on its own — the branches do not converge: truth attestation → branch-head
re-check → registry push → redeploy trigger → endpoint read-back (exact marker, unknown path) → live
claim. The preview branch ends at its own read-back. One concurrency group orders the two publishing
steps against each other; it does not order either against the other's gates. The workflow enforces
that graph; the prose report merely reflects it.

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

**Chosen:** GitHub Pages is the permanent preview/development publication, deployed every commit with
no human or release gate; the container image is the release. Both serve one tree, and byte identity
between them is asserted by post-publication read-back.

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

### The image is gated in CI before publication, and the deployment is read back after

**Chosen:** CI runs the image it built, polls its marker, checks the unknown-path status and body, and
compares served bytes against the emitted tree. Only a passing gate licenses the registry push. **Then
the redeploy is triggered and the endpoint is read back for the same commit** — both gates, in that
order.

**Rejected — gating against the deployed compose instance *instead*.** It proves the actual delivered
thing rather than a CI approximation, which is a real advantage and the reason it was considered.
Rejected because it inverts the ordering that matters: a broken image would already be published and
pullable by the time anything noticed. **That is now the whole of the argument.** This rejection used
to rest on a second reason as well — that it requires a network path from CI into the delivery
environment, coupling the release gate to infrastructure the brief puts out of scope — and that reason
is gone. The brief's 2026-08-07 amendment puts the redeploy step and the endpoint it is verified
against in this repository, so the path is authorized. It is the ordering that keeps this rejected, not
the reachability.

**Adopted 2026-08-07 — both gates**, which this section previously rejected. It is the most rigorous
option and it closes the genuine gap between *the image is correct* and *the site is serving it*. The
stated reason for rejecting it was that the second gate needs the network path the option above was
rejected for; when that premise was amended away, the rejection had nothing left holding it up. The
first gate stays hermetic and unchanged — it still needs no deployed instance and still runs
identically for anyone who builds the image themselves — and the second is what licenses the live
claim.

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

**Narrowed again on 2026-08-08, for `/testimonials/`, and reconciled to the later fold decision on
2026-08-10.** This section's argument is about the *apex's* genre being one manifesto, not about the
site having exactly two routes — `A4`'s "exactly two" was the sharper claim, and the rejected
alternative above (`/manifesto`, `/projects`, `/philosophy`) was specifically about slicing the
manifesto, which testimonials are not. Testimonials keep their own composition and route, but the two
completed compositions are folded into one shared body per route so the common navigation changes the
visible root content by fragment and CSS rather than by loading another document. The apex therefore
gains navigation state without a client runtime, persistent route-aware script or duplicated
composition. See [`90-decisions.md`](90-decisions.md), 2026-08-08 and 2026-08-10.

### One inert script element, rather than none at all

**Chosen:** the apex body carries a single `<script type="application/ld+json">` block holding an
`Organization` object. Every other script element stays forbidden, and the self-containment assertion
narrows from *no script element* to *no executable script element*.

**Rejected — the blanket ban, which is what this design shipped until 2026-08-07.** It is simpler,
trivially checkable, and impossible to erode, which is a real argument and the reason it was written
that way. Rejected because it forbade a non-executing element on the ground that it forbids execution:
JSON-LD runs nothing and fetches nothing, so it satisfies the brief's runtime non-goal completely and
was excluded only by the *shape* of the check. On a page whose stated audiences are recruiters and
search results, the cost of that accident is the one machine-readable statement of what this
organisation is.

**Rejected — putting it in the head.** Where it conventionally belongs, and impossible here: the
package owns the `<head>` and its metadata set is closed, the same fact that sent the build marker to
*Artifact*. Asking for a third package capability to place an element the body accepts would be a
release wait for nothing.

**Rejected — permitting the element and emitting nothing.** Keeps the option without spending it, and
produces a permission with no user — which is the shape this design elsewhere calls an inert
declaration and refuses.

**The cost, stated plainly:** the assertion is now a rule about `type` attributes rather than about
element names, and a rule with one carve-out is a rule the next author looks for a second carve-out in.
`X6` bounds it to exactly one element in the raw apex composition. The fold reuses that same block in
each independently emitted shared-view document; it never introduces a second block into either
document. That is the narrowest form that still admits the block.

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
7. **Where does the compose stack terminate TLS?** **Not an open question — foreclosed.** It is not
   waiting on information; `00-brief.md`'s non-goal excludes it by name, and the brief's amendment of
   2026-08-07 kept it excluded while admitting the artifact around it: *"an agent may not decide what
   terminates TLS in front of this site, or configure the thing that does."* A first answer named
   Nginx Proxy Manager and was walked back for exactly that reason. Retained under its stable number,
   restated so the next session reads it as closed rather than as an invitation. See
   `design/90-decisions.md`, 2026-08-07 — "The Q7 answer below is walked back: TLS termination stays
   undecided".

   The second half this question used to carry — *does anything in the stack need to be true for the
   container to be correct?* — **is answered, and by this design rather than by the stack: no.** The
   image gate in *Control flow* is hermetic. It runs the image it built, polls its marker, checks the
   unknown-path status and body, and compares served bytes against the emitted tree, needing no
   deployed instance and no network path into the delivery environment. Correctness of the container
   is therefore established without reference to whatever fronts it.

   **That is not the same as the live claim, and the distinction sharpened on 2026-08-07.** Since the
   brief's amendment put the redeploy step and its verification endpoint in scope, the claim that *the
   site is serving this commit* does depend on reaching the delivery environment — see *Control flow*
   2 and the redeploy failure mode. The container being correct needs nothing from the stack; the
   deployment being real needs the endpoint to answer. Q7 is untouched by that: an endpoint read-back
   asserts what is served, and decides nothing about what terminates TLS in front of it.
8. ~~**Does the compose file live in this repository?**~~ **Answered 2026-08-07: yes, and it is the
   deployment, not documentation of one.** Mirrors `SubZeroDev.Blog`'s split — a local-build Compose
   file plus a separate deployment Compose file pulling the published GHCR image, imported as the
   Portainer stack. See `design/90-decisions.md`, 2026-08-07 — "The deployment Compose file and
   Portainer GitOps redeploy are in scope for this repository".

   **Its footing changed the same day, and that is the part worth reading.** As first written this
   answer stood against a non-goal that put *hosting configuration* out of scope and said no agent
   touches it — the same clause that walked Q7 back, and one this answer wrote past rather than
   changed. The brief was amended instead, on the owner's ruling: the boundary now falls at the
   artifact, so the Compose file, the redeploy step and the endpoint it is verified against are in
   scope, while the network in front of them is not. Q8 now rests on the brief rather than in tension
   with it. See `design/90-decisions.md`, 2026-08-07 — "The brief's hosting non-goal is amended to
   draw its boundary at the deployment artifact".

   **Two things this answer left unstated were settled on 2026-08-07**, both raised by a red-team pass
   that found the file unwritable as specified. The stack **attaches to one already-existing network by
   name** and declares nothing else about it — the brief was amended to admit that, because a service
   publishing no port and joining no network is not a deployment, and the wording as it stood admitted
   neither. And the file **pulls `latest` with `pull_policy: always`** rather than a commit tag, so what
   is deployed is established by the endpoint read-back and never by reading the file. See
   `design/90-decisions.md`, 2026-08-07 — "The deployment artifact's network attachment and image
   reference are settled".

Further unresolved items were raised downstream and are owned by
[`20-contract.md`](20-contract.md) rather than restated here: whether a social image asset exists
(`U6`), and the Verification surface that would check `P2`–`P4` (`U9`). Raised there and answered on
2026-08-06: Presentation's token set (`U2`), where the attestation record lives (`U3`), and which
server serves the container tree (`U7`).
