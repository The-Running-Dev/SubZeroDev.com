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
- **Domain, DNS, TLS and hosting configuration are out of scope.** Settled outside this design and
  outside every slice under it. No agent touches them and no acceptance criterion requires changing
  them. Observable behaviour of the deployed target may still be verified, including its response
  to an unknown path.

## Definition of done

- The site is deployed and serves the page, verified by polling until the response carries the exact
  commit's build marker and then reading that response — never inferred from a merged pull request.
- The runtime-request non-goal above is asserted with a browser network log against the built output
  rather than by source inspection.
- Every outbound project link resolves, asserted by a networked CI verification step that is
  separate from the network-free build and goes red when one stops.
- **Every status shown against a project is attested as true for the exact commit on the day it is
  deployed**, and at that check the page states nothing about a project that its own site
  contradicts. This is a release assertion, not a claim that a static artifact can observe later
  changes to other sites.
- The page carries a title, meta description, canonical URL, Open Graph and X/Twitter metadata, an
  icon set and `<noscript>` content — asserted against the built HTML.
- A 404 route exists, is on-voice, and is served for an unknown path at the apex.
- The page is legible in greyscale, animates nothing under `prefers-reduced-motion: reduce`, and is
  keyboard-traversable in visual order.
- No count, project total or figure anywhere on the page is a typed literal.

## Environment

Static site. No server, no application runtime, no persisted state and no application concurrency.
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

Three things about it are settled here rather than there:

1. **SubZeroDev's own genre is "no genre" — the plain document.** `Idea.md` assigns a genre to seven
   products and leaves the apex blank. The apex is the parent voice unstyled: typography, whitespace,
   the words. Every child takes a genre from it; it takes none.
2. **The ecosystem list keeps every entry and labels each with a true status.** `Idea.md`'s list is
   aspirational, and the house rule is that nothing may be funnier than it is true. Labels resolve
   that without pruning the characterful names.
3. **`Idea.md` lines 540–604 are an unresolved chat transcript**, not specification. They contain
   three competing drafts of an *Effortless Action* section. None is chosen. Nothing may treat any of
   them as settled copy.
