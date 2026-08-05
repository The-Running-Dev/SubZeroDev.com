# Decision log

Append-only. Newest at the top. The rejected alternatives are the point — without them, every future session relitigates the same choice.

## Open
<A staging area, not a home. Things noticed mid-slice that were deliberately not acted on. `/track` turns each into a GitHub issue and removes it from here. An item that is a *decision* rather than a *todo* belongs below as an entry, not in an issue.>

- **Landing-page package version drift, across two other repositories.** `SubZeroDev.Platform.UI.LandingPage/design/30-slices.md` records UI2 as `in progress` with `0.1.0` as the published handoff, while that repo's `package.json` reads `0.2.0` and `SubZeroDev.Platform` pins `0.2.0` exactly in a shipped slice. One of those is stale. Reported, not reconciled — neither repository is this one. Blocks nothing here until a version must be pinned.
- **`schemas.subzerodev.com` is referenced in the ecosystem's docs and does not resolve** (NXDOMAIN, verified 2026-08-05). Not this repository's to fix; noted because the project inventory here must not repeat the claim.
- **`Idea.md` is CRLF.** House conventions say UTF-8 with LF. The content is clean UTF-8 — no CP1252 mojibake in the arrows or box-drawing — so this is line endings only.

---

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
