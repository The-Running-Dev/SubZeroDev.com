# Brief — SubZeroDev.com

> Written by me, not by a model. A model may interrogate it (`/brief-check`) but not author it.

> **Provenance, 2026-08-05.** Transcribed from decisions I gave in session, from
> [`Idea.md`](../Idea.md), and from facts a model verified against the live sites rather than
> asserted. **The wording throughout is a model's; the decisions and the source material are mine.**
> Rewrite the prose in my own voice before treating this as authored. This notice comes out when I
> have.

## Problem

[`Idea.md`](../Idea.md) sets out a company philosophy, a voice, a lifecycle, a genre system and a name
with a joke buried in it. **No page anywhere expresses any of it.**

Twelve project subdomains serve live sites, and each speaks in its own genre — the engine as
documentary, the platform as a status page, the blog as a journal. Nothing speaks as the company.
There is no page that says what SubZeroDev is, why any of it exists, or how one project became the
next. The apex is where that belongs and it is empty.

A visitor who arrives at the apex — from a business card, a commit trailer, a search result, my own
address bar — finds nothing, and has no route to the work.

## Who it is for

Four audiences, deliberately unranked:

- developers evaluating the projects
- recruiters and hiring managers assessing me through the work
- prospective clients
- me, as a personal index across the subdomains

A manifesto serves all four without compromise, because the manifesto *is* the evidence — which is
not true of a project index, where each audience wants a different framing. Single author. Expert.
Traffic is assumed negligible and is not designed for.

## Non-goals

The binding list. Out of scope for every agent, permanently, until this file changes.

- **No form of any kind.** No contact form, no subscribe box, no newsletter, nothing that submits
  anywhere. A `mailto:` or an outbound link is the whole of the contact story.
- **No analytics, no cookie banner, no consent surface, no third-party script.**
- **No load-triggered network request after the initial document request.** No linked stylesheet,
  script, font, icon or image, and no fetch. User-initiated navigation through an outbound link is
  excluded.
- **No content derived from sibling repositories.** The project list is hand-authored here. No
  build-time read of another repo's tree, no API call, no git dependency, no network in the build.
- **No new cross-repo contract.** Projects do not publish a manifest for this site to consume.
- **This site does not replace, restate or duplicate any project's own site.** It routes to them.
- **No blog, no changelog route, no documentation.** Those live where they already live.
- **Not the interactive excuse generator.** A 404 route is in scope; the generator named in
  `Idea.md`'s company story is a product in its own right and gets its own repository.
- **Domain, DNS, TLS and the configuration of anything this site is placed behind are out of scope.**
  Settled outside this design and outside every slice under it. No agent touches them and no
  acceptance criterion requires changing them. That covers the domain and its DNS records, TLS
  termination, and any reverse proxy or host the deployment sits behind — an agent may not decide
  what terminates TLS in front of this site, or configure the thing that does.

  **The deployment artifact this repository publishes is in scope and is this repository's to own**:
  the Compose file that runs the published image, the CI step that triggers its redeploy, and the
  endpoint that redeploy is verified against. The boundary is the artifact — this repository declares
  what it ships, how it is redeployed, and **the one already-existing network its container attaches
  to, by name**. It declares nothing else about that network: not what else is on it, not what
  terminates TLS in front of it, and not the configuration of the thing that does. Attaching to a
  network is not configuring it, and naming one is not deciding what fronts this site — the sentence
  above still binds, and Q7 stays foreclosed. Observable behaviour of a deployed target may still be
  verified, including its response to an unknown path.

## Definition of done

- The release site is deployed and serves the page, verified by polling its endpoint until the
  response carries the exact commit's build marker and then reading that response — never inferred
  from a merged pull request or a published image.
- **There are two publication targets and they serve identical bytes.** GitHub Pages is the
  preview/development publication, deployed every commit without a human approval or truth-attestation
  gate; a container image is the release. Pages is read back after publication to verify its marker,
  bytes and unknown-path behaviour, but that verification does not turn it into a release. Byte
  identity between the targets is asserted rather than assumed, because a preview serving different
  bytes from the release proves nothing about the release. The release is gated in CI before it is
  published, and no image tag is announced until the push succeeds and the tag resolves.
- The runtime-request non-goal above is asserted with a browser network log against the built output
  rather than by source inspection.
- Every outbound project link resolves, asserted by a networked CI verification step that is
  separate from the network-free build and goes red when one stops.
- **Every status shown against a project on the release target is attested as true for the exact
  commit on the day it is released**, and at that check the page states nothing about a project that
  its own site contradicts. This is a release assertion, not a preview gate and not a claim that a
  static artifact can observe later changes to other sites. The Pages preview may publish before that
  attestation because it is development output rather than the release.
- The page carries a title, meta description, canonical URL, Open Graph and X/Twitter metadata and an
  icon set — asserted against the built HTML. It carries no `<noscript>` content: that element renders
  precisely when scripting is off, and on a document that needs no scripting there is no fallback for
  it to describe.
- A 404 route exists, is on-voice, and is served for an unknown path at the apex.
- **The apex carries a fixed collection of fabricated testimonials as one of its always-visible
  sections** — not a separate route, and not hidden behind a tab: Effortless Action, The Echo System,
  Contamination and Testimonials all render on the same document at once (2026-08-10, "merge
  testimonials into the apex"). The section is presented with the same corporate seriousness as the
  rest of the site and names nothing on it as fictional, satirical or fake.
- The page is legible in greyscale, **moves** nothing under `prefers-reduced-motion: reduce`, and is
  keyboard-traversable in visual order. Moves means no transform, translation, scale, rotation,
  position change or scroll behaviour, animated or transitioned. A transition of a non-positional
  property — a colour change on hover or focus — is not motion and is permitted. The preference
  addresses vestibular motion rather than change as such.
- No count, project total or figure anywhere on the page is a typed literal.

## Environment

Static site. No application runtime, no persisted state and no application concurrency. The release is
delivered by a container, and that container is a **delivery wrapper, not a runtime**: it serves a
read-only tree, executes nothing per request, holds no state, and adds nothing to the bytes it serves.
A static file server inside it is not an application. Nothing anywhere computes a response.
CI workflow runs may overlap and must be ordered around publication. Consumes
`SubZeroDev.Platform.UI.LandingPage` through its custom `defineLandingPage` adapter — not its generic
README renderer — matching the pattern `SubZeroDev.Platform` proved in its L2 slice.

Single author, single deployment target, hand-authored content committed to this repository.

Domain, DNS and hosting are settled outside this work — see *Non-goals*. The design assumes only that
a built static artifact can be published and then read back at a known address.

**Verified 2026-08-05**, and relevant because the project inventory asserts things about them: twelve
project subdomains serve live sites. `schemas.subzerodev.com` does not exist despite being referenced
in the ecosystem's docs. Lucifer Chronicles is a series on `blog.subzerodev.com` rather than a site of
its own. Ogre's Kitchen has no repository and no subdomain.

## Lifespan

Maintained for years. It is the apex of the namespace and the front door to everything else, so it
outlives any individual project on it. That justifies running the full pipeline.

## Source material

[`Idea.md`](../Idea.md) is the brand document: philosophy, method, principles, personality, writing
style, visual identity, the genre system, slogans, footer quotes, the Running Man reference, and the
manifesto. It is input to the design, not itself a design.

Four things about it are settled here rather than there:

1. **SubZeroDev's own genre is "no genre" — the plain document.** `Idea.md` assigns a genre to seven
   products and leaves the apex blank. The apex is the parent voice unstyled: typography, whitespace,
   the words. Every child takes a genre from it; it takes none.
2. **The ecosystem list keeps every entry and labels each with a true status.** `Idea.md`'s list is
   aspirational, and the house rule is that nothing may be funnier than it is true. Labels resolve
   that without pruning the characterful names.
3. **`Idea.md` lines 540–604 are an unresolved chat transcript**, not specification. They contain
   three competing drafts of an *Effortless Action* section. None is chosen. Nothing may treat any of
   them as settled copy.
4. **The testimonials section is a bounded exception to item 2's house rule, not a repeal of it.**
   `Idea.md` § *Company Personality* and § *Writing Style* ("Never exaggerate. Reality already did.")
   describe the voice everywhere else on the site, and item 2 holds everywhere else. Testimonials is
   the one section built the opposite way on purpose: every quote in it is fabricated, most of them
   adversarial to SubZeroDev, and the page never says so. The joke depends on the page never breaking
   character — no "fake", "satire", "not real" or "for entertainment" label anywhere on it. It no
   longer needs its own route to carry that exception — it is one always-visible section of the single
   apex document (2026-08-10) — but the exception itself is unchanged and still scoped to it alone; the
   ecosystem list and everything else on the apex still answer to item 2 as written.
