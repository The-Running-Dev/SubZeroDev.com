// Adapter — the module the package CLI loads (contract's Adapter section;
// S6, S11). It is the sole `validateInventory` and `validateTestimonials`
// call site (A5) and the only importer of Composition and of
// `themeColor`/`iconDataUri` from Presentation (A3). Imports exactly:
// Composition, the external package, Content's `projects`, `testimonials`,
// `validateInventory`, `validateTestimonials`, `BuildContext` and
// `parseCommitId`, and Presentation's `themeColor` and `iconDataUri` (S6.7).
//
// PLACEHOLDER COPY: the apex and miss routes' `title`, `description` and
// Open Graph fields below are placeholders, started on the owner's explicit
// instruction ahead of final copy (design/90-decisions.md, 2026-08-06 — "S6's
// route titles and descriptions start as placeholder copy"). Replace before
// publication. The testimonials route's metadata is authored copy, not a
// placeholder — S11's `Depends on` line covers only the testimonials
// themselves and this route's title/description.

import { defineLandingPage } from "subzerodev-platform-ui-landing-page";
import type { LandingPageConfig } from "subzerodev-platform-ui-landing-page";

import { composeApex, composeMiss, composeTestimonials } from "../src/composition";
import {
  parseCommitId,
  projects,
  testimonials,
  validateInventory,
  validateTestimonials,
} from "../src/content";
import type { BuildContext } from "../src/content";
import { iconDataUri, themeColor } from "../src/presentation";

export const origin = "https://subzerodev.com" as const;

// RoutePath (contract § Route, A4) — narrows config.routes' path to the three
// values this Adapter declares, so a fourth route path fails typecheck rather
// than relying on review (issue #52). `satisfies` checks membership without
// widening past the exact literal each constant carries per the contract's
// own signatures (design/20-contract.md:639-641).
export type RoutePath = "/" | "/404/" | "/testimonials/";
export const apexPath = "/" as const satisfies RoutePath;
export const testimonialsPath = "/testimonials/" as const satisfies RoutePath;
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
const validatedInventory = validateInventory(projects, context);
const validatedTestimonials = validateTestimonials(testimonials);

if (!validatedInventory.ok || !validatedTestimonials.ok) {
  const errors = [
    ...(validatedInventory.ok ? [] : validatedInventory.errors),
    ...(validatedTestimonials.ok ? [] : validatedTestimonials.errors),
  ];
  for (const error of errors) {
    console.error(
      `${error.code} (project: ${error.projectId ?? "-"}, field: ${error.field ?? "-"}): ${error.detail}`,
    );
  }
  process.exit(1);
}

const inventory = validatedInventory.value;
const apex = composeApex(inventory, origin);
const testimonialsRoute = composeTestimonials(validatedTestimonials.value);
const miss = composeMiss();

const config: LandingPageConfig = defineLandingPage({
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
      path: testimonialsPath,
      body: testimonialsRoute.bodyHtml,
      stylesheet: testimonialsRoute.stylesheet,
      metadata: {
        title: "Testimonials — SubZeroDev",
        description: "What people are saying about SubZeroDev.",
        canonicalUrl: `${origin}${testimonialsPath}`,
        openGraph: {
          title: "Testimonials — SubZeroDev",
          description: "What people are saying about SubZeroDev.",
          type: "website",
          url: `${origin}${testimonialsPath}`,
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
        title: "404 (placeholder title — replace before publication)",
        description: "Placeholder description for the miss page — replace before publication.",
        canonicalUrl: `${origin}${missPath}`,
        openGraph: {
          title: "404 (placeholder Open Graph title — replace before publication)",
          description:
            "Placeholder Open Graph description for the miss page — replace before publication.",
          type: "website",
          url: `${origin}${missPath}`,
        },
        themeColor,
        icons: [{ rel: "icon", href: iconDataUri }],
      },
    },
  ],
});

export default config;
