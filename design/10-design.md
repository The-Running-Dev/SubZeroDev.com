# Design — SubZeroDev.com

Derived from [`00-brief.md`](00-brief.md) and the brand material in [`Idea.md`](../Idea.md). Where
this document and the brief disagree, the brief wins and this is the defect.

**One decision dominates every section below.** The apex's primary content is prose meant to be read
by people and indexed by crawlers. The landing-page package, as `SubZeroDev.Platform` consumes it
today, renders client-side — its own adapter config carries `noScript: "This site needs JavaScript to
render the status page."` For a joke status page that trade is invisible. For a manifesto addressed
to recruiters and clients it is a defect: the page's entire substance would be absent from view
source. This design therefore **requires prerendered HTML** and states that requirement rather than
working around it. The emitted route documents must also be self-contained: prerendered content,
inline CSS and embedded icons, with no hydration script or linked runtime asset. See *Failure modes*
and *Open questions*.

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
| `genre` | string or absent | From `Idea.md`'s genre table. Absent for the projects it does not assign one to — the table covers seven, and inventing genres for the rest would be authoring brand material in a design doc. |
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

Two, and no more. `/` is the document. `/404` is the miss. `Route` carries its path, its entry, and
its complete static-head metadata: title, description, canonical URL, Open Graph fields, X/Twitter
card, an embedded icon set, theme colour and `<noscript>` content — the same shape
`SubZeroDev.Platform` declares, since the package's adapter contract defines it. The `/404`
composition is emitted both at its route path and as the conventional root `404.html` artifact; that
is one route with two static entry files, not a third route.

Every emitted document carries a non-visual build marker containing the full commit id. A CI build
fails if that id is absent. The deployment read-back accepts only a response whose marker equals the
commit being deployed, so a cached or older page cannot be mistaken for success.

---

## Module boundaries

Five modules in this repository, plus one external package.

**Content** — owns the `Project` inventory, `Stage`, the two named copy constants, and the derivation
functions that turn the inventory into counts, groupings and the contamination chain. Depends on
**nothing**. Exposes typed data and pure functions.

*The binding rule of this design:* **Content imports nothing from Composition or Presentation.** That
is what makes every count testable without a DOM, and what stops a number from being "computed" in a
component where the next author will quietly hard-code it.

**Presentation** — owns the visual language: the token set, the type scale, the dark-first palette,
the layout primitives. Depends on **nothing**. Per `Idea.md`: minimal, dark, typography-first, large
whitespace, no gradients, no illustrations, no webfont. Exposes tokens and primitives.

**Composition** — owns both page compositions and the prose. Depends on **Content** and
**Presentation**. Exposes the two route entries and nothing else.

**Adapter** — owns the route declarations, their static-head metadata, and the single origin
constant those URLs are built from. Depends on the **external package** only. Exposes the adapter
configuration the package's CLI consumes.

**Verification** — owns every assertion: content invariants, derived-value correctness,
accessibility, built-output shape, browser request capture, link resolution, release attestation and
deployment read-back. Offline checks depend on **Content**, **Composition** and the **built output**.
Networked checks run as a separate CI stage after the build and do not feed content back into it.
The truth attestation is a required human CI gate bound to the full commit id; it records approver,
commit and timestamp and cannot be reused by another commit. Exposes nothing.

**External: `SubZeroDev.Platform.UI.LandingPage`** — owns the build mechanism entirely: Vite
configuration, route-entry HTML generation, the `dev`/`build`/`merge` commands. For this consumer it
must emit prerendered, self-contained route HTML, the root `404.html` artifact and the build marker.
This repository owns no build system, and adding one would re-create exactly the duplication that
package was extracted to remove.

### Dependency direction

Arrows below mean "imports or reads from"; they point from consumer to provider. Build orchestration
is shown separately because the package CLI loads repository entries rather than becoming a
repository import.

```
Composition ──► Content
Composition ──► Presentation
Adapter ──────► External package
Verification ─► Content, Composition, dist/

Package CLI ──loads──► Adapter, route entries ──emits──► dist/
```

Content and Presentation import no repository module. Composition cannot be imported by either of
them. Adapter does not reach through Content for deployment configuration. Verification may read
the other modules and built output, but nothing imports Verification. Those rules make the
repository import graph acyclic and keep build orchestration out of the content model.

---

## Control flow

### 1. Author changes content, and the site redeploys

The only content write path. Author edits a `Project` record, a stage, or copy → the network-free
build recomputes Content's derivations → Composition renders → the package CLI emits self-contained,
prerendered HTML for both routes plus root `404.html` → offline Verification asserts against the
built output, not intent → a separate networked CI stage checks outbound links and records the
author's commit-bound truth attestation → deploy. The deployment job cannot start until that human
gate records that every stage and project statement was checked against the current project sites
and source material.

Publication and read-back share one deployment critical section. Immediately before publication,
the workflow confirms that its commit is still the current deployment-branch head; an obsolete run
stops. It then publishes and polls `/` until the served build marker equals that commit, reads the
served content, and requests a unique unknown path to verify the 404 composition. Only that complete
read-back licenses the live claim. A green build or merged pull request does not.

### 2. Visitor requests `/`

CDN edge → cached prerendered HTML → the manifesto and the ecosystem list are **present in the
response body**, readable with scripting disabled and by a crawler. CSS and icons are embedded, and
there is no script or linked runtime asset, so loading the document triggers no additional request.
Nothing is client-computed, so there is no client state to be wrong.

### 3. Visitor requests an unknown path

The publish target serves the emitted root `404.html` for a unique unknown path → the same shell, the
same voice, the miss handled in the genre `Idea.md` assigns it. Static, prerendered, no generator.
The design does not change hosting configuration; the deployment read-back verifies this observable
behaviour and fails if the settled target does not provide it.

---

## Failure modes

### The package does not emit self-contained prerendered HTML

**What fails:** the manifesto is absent from the served HTML, or the document loads a hydration
script, stylesheet, font, icon or other runtime asset. The first is blank without JavaScript and thin
to a crawler; the second violates the brief's zero-additional-request requirement.

**Detected by:** an assertion that a known manifesto sentence and every project `name` appear in the
built HTML with scripting never executed, followed by a browser network capture that allows the
navigation document and rejects every additional request not initiated by the tester. It fails
loudly before publication, not silently in production.

**Response:** this design **states the requirement and stops**, exactly as `SubZeroDev.Platform`'s L2
did — *"L2 states what this consumer requires and stops until a released version provides it."* If
the package cannot produce that output, it is a package slice in its own repository, not something
improvised here. Duplicating the manifesto into `<noscript>` is rejected in *Alternatives
considered*.

**State left behind:** none. A failing build publishes nothing.

### A project's site dies after deploy

**What fails:** an outbound link 404s. The page is stale, not wrong — it never claimed the site was
up.

**Detected by:** a link check over every `Home.Own` URL and every resolved `Home.Within` path. In CI
it runs after the network-free build and gates deployment, not artifact construction. After deploy
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

**Detected by:** Content-level assertions that run before anything renders.

**Response:** **build failure — never a silently empty section and never a default stage.** This
mirrors `40-site.md`'s rule that a parser returning zero slices is a failure rather than an empty
page, and it is the same class of bug.

### The package is unavailable or drifts

**What fails:** a version disappears, or a floating range moves under the build.

**Detected by:** an exact pin plus a lockfile; a clean install resolving anything else fails.

**Response:** pinned exactly, per the L2 precedent. **Which version to pin is unresolved** — the
package's slice document records `0.2.0` as in progress with `0.1.0` published, while `Platform`
pins `0.2.0`. See *Open questions*.

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

Link checks are read-only and their result is collected before deployment. Publication is protected
by one concurrency group covering the branch-head check, publish operation and exact-commit
read-back as a single critical section. A run that is no longer the deployment-branch head stops
before publishing, preventing an older queued run from overwriting a newer commit.

The ordering invariant is: offline build and verification → networked link check and truth
attestation → branch-head check → publication → exact-marker and unknown-path read-back → live claim.
The workflow enforces that sequence; the prose report merely reflects it.

---

## Alternatives considered

### Consume the landing-page package, rather than Docusaurus or hand-written HTML

**Chosen:** the package, through its custom `defineLandingPage` adapter.

**Rejected — Docusaurus.** It is what twelve project sites already run, and that is precisely the
objection: the apex would arrive looking like a thirteenth documentation site, with a sidebar, a
docs chrome and a navbar. `Idea.md` asks for minimal, dark, typography-first with large whitespace,
and the apex's genre is *the plain document*. Fighting a docs framework's shell to reach a plain
document is more work than not using one, and it would make the parent look like its own children.

**Rejected — hand-written static HTML with no build.** No tests, and every derived count becomes a
typed number, which the brief forbids outright. It also re-creates the integration the package exists
to own, in the one repository with the least reason to own it.

### Lifecycle stage rather than observed liveness

**Chosen:** `stage` as an authored lifecycle position, with liveness handled as a CI check.

**Rejected — a liveness or health field.** It is the funnier option and the verified material is
excellent. It is rejected because a hand-authored liveness claim cannot stay true: the day
`portfolio.subzerodev.com` gains data, the page is lying, and the deployed static artifact cannot
notice. `40-site.md` governs the ecosystem with *"nothing may be funnier than it is true"*, and a
joke with an expiry date nobody is watching is the exact defect that rule names.

**Rejected — deriving status from the sibling repositories.** It would stay true, and it is a brief
non-goal: it makes the build depend on twelve repositories' internal formats or on the network.

### Self-contained prerendered HTML rather than client rendering with a `<noscript>` fallback

**Chosen:** require self-contained prerendered output; treat missing content or any load-triggered
subrequest as a package gap and stop.

**Rejected — client render plus `noScript` text**, the pattern `Platform` ships. Acceptable for a
status page nobody arrives at from a search result; not acceptable for a manifesto that is the
company's only public statement of what it is, addressed to recruiters and clients.

**Rejected — duplicating the manifesto into `<noscript>`.** It works, and it creates a second copy of
every sentence that will drift from the first. `AGENTS.md` *Single ownership* forbids exactly this,
and `agent.md` records that a missed removal in a duplicated set is silent.

### One document, rather than routes per section

**Chosen:** `/` and `/404`.

**Rejected — separate `/manifesto`, `/projects`, `/philosophy` routes.** The apex's genre is the plain
document, and a document is one thing. Splitting it produces a small site, which is what every child
already is, and the apex's whole distinction is that it is not one. It would also add navigation
chrome that the visual identity rules out.

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

1. **Can the package emit this consumer's required artifact shape?** The design requires
   self-contained prerendered route HTML, root `404.html` and injection of a full commit build marker.
   If the released package cannot, the design stops at a package gap under the L2 precedent.
2. **Which package version?** `0.2.0` is pinned by `Platform` and named in the package's own
   `package.json`, while the package's `30-slices.md` records UI2 as in progress with `0.1.0` as the
   published handoff. One of those is stale. Reporting rather than reconciling, per `AGENTS.md`.
3. **What is Ogre's Kitchen?** It has no repository and no subdomain. It needs a `line` and a `stage`,
   and both are brand material I must not author.
4. **Which repositories are public?** If the page links to source, a link to a private repository is
   a 404 for every visitor but you. I have not checked visibility.
5. **Does *Effortless Action* go on the page, and in which draft?** `Idea.md` lines 540–604 hold three
   competing versions inside an unresolved conversation. None is chosen and I have treated none as
   settled.
6. **Should a scheduled link check run?** It is the only way a dead outbound link is noticed after
   deploy. It costs a workflow and it is the sole thing that would make this repository observe the
   others — adjacent to a brief non-goal, though not obviously inside it.
