// Adapter — the module the package CLI loads (contract's Adapter section;
// S6). It is the only importer of Composition and of
// `themeColor`/`iconDataUri` from Presentation. Imports exactly:
// Composition, the external package, Content's document validators,
// `BuildContext`, `Inventory`, `Testimonials` and `parseCommitId`, and
// Presentation's `themeColor` and `iconDataUri`.
//
// Adapter declares the two build-time JSON sources and hands each its
// validator; the package's loader is what invokes them, once per document,
// before `compose` runs. So Adapter no longer *calls* `validateInventory` or
// `validateTestimonials` itself — `src/content/documents.ts` holds those call
// sites, inside the validators declared here. `design/20-contract.md` still
// describes the pre-migration arrangement (`A3`, `A5`, `C14`, `C16`, `V16`);
// that divergence is staged in `design/90-decisions.md` § Open for a later
// `/reconcile` and is deliberately not resolved here.
//
// PLACEHOLDER COPY: the apex route's `title`, `description` and Open Graph
// fields below are deliberate placeholders. Leave them unchanged.

import { defineLandingPage, defineLandingPageData } from "subzerodev-platform-ui-landing-page";
import type { LandingPageConfig } from "subzerodev-platform-ui-landing-page";

import { composeApex, composeMiss } from "../src/composition";
import {
  parseCommitId,
  projectsDocumentValidator,
  testimonialsDocumentValidator,
} from "../src/content";
import type { BuildContext, Inventory, Testimonials } from "../src/content";
import { iconDataUri, themeColor } from "../src/presentation";

export const origin = "https://subzerodev.com" as const;

// RoutePath (contract § Route, A4) — narrows config.routes' path to the two
// values this Adapter declares, so a third route path fails typecheck rather
// than relying on review (issue #52). `satisfies` checks membership without
// widening past the exact literal each constant carries per the contract's
// own signatures (design/20-contract.md:639-641).
export type RoutePath = "/" | "/404/";
export const apexPath = "/" as const satisfies RoutePath;
export const missPath = "/404/" as const satisfies RoutePath;

function buildContext(): BuildContext {
  const rawCommit = process.env.GITHUB_SHA ?? "";
  const commit = parseCommitId(rawCommit);
  if (commit === null) {
    console.error(
      `GITHUB_SHA ("${rawCommit}") is not a forty-character lowercase hex commit id; refusing to build.`,
    );
    process.exit(1);
  }
  return { commit, utcYear: new Date().getUTCFullYear() as BuildContext["utcYear"] };
}

const context = buildContext();
function compose({ projects, testimonials }: { projects: Inventory; testimonials: Testimonials }): LandingPageConfig {
  const apex = composeApex(projects, testimonials, origin);
  const miss = composeMiss();
  return defineLandingPage({
  routes: [
    {
      path: apexPath,
      body: apex.bodyHtml,
      stylesheet: apex.stylesheet,
      metadata: {
        title: "SubZeroDev (placeholder title — replace before publication)",
        description:
          "Placeholder description for the SubZeroDev apex — replace before publication.",
        canonicalUrl: `${origin}${apexPath}`,
        openGraph: {
          title: "SubZeroDev (placeholder Open Graph title — replace before publication)",
          description:
            "Placeholder Open Graph description for the SubZeroDev apex — replace before publication.",
          type: "website",
          url: `${origin}${apexPath}`,
        },
        themeColor,
        icons: [{ rel: "icon", href: iconDataUri }],
      },
    },
    {
      path: missPath,
      body: miss.bodyHtml,
      stylesheet: miss.stylesheet,
      metadata: {
        title: "404 — Nothing Is Missing | SubZeroDev",
        description: "This page was never built. There was nothing here to begin with.",
        canonicalUrl: `${origin}${missPath}`,
        openGraph: {
          title: "404 — Nothing Is Missing | SubZeroDev",
          description: "This page was never built. There was nothing here to begin with.",
          type: "website",
          url: `${origin}${missPath}`,
        },
        themeColor,
        icons: [{ rel: "icon", href: iconDataUri }],
      },
    },
  ],
  });
}

export default defineLandingPageData(
  {
    projects: { id: "projects", validate: projectsDocumentValidator(context) },
    testimonials: { id: "testimonials", validate: testimonialsDocumentValidator },
  },
  compose,
);
