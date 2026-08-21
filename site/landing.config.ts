// Adapter — the module the package CLI loads (contract's Adapter section;
// S6, widened by S15). It is the only importer of Composition and of
// `themeColor`/`iconDataUri` from Presentation. Imports exactly:
// Composition, the external package, Content's four document validators,
// `BuildContext`, `Inventory`, `Testimonials`, `CvData`, `PortfolioData`
// and `parseCommitId`, and Presentation's `themeColor` and `iconDataUri`.
//
// Adapter declares the four build-time JSON sources and hands each its
// validator; the package's loader is what invokes them, once per document,
// before `compose` runs. So Adapter no longer *calls* `validateInventory` or
// `validateTestimonials` itself — `src/content/documents.ts` holds those call
// sites, inside the validators declared here. `A3`, `A5` and `C14` in
// `design/20-contract.md` describe that arrangement as it now stands;
// `/reconcile` brought them to it on 2026-08-20.
//
// PLACEHOLDER COPY: the apex, CV and portfolio routes' `title`, `description`
// and Open Graph fields below are deliberate placeholders. Leave them
// unchanged.

import { defineLandingPage, defineLandingPageData } from "subzerodev-platform-ui-landing-page";
import type { LandingPageConfig } from "subzerodev-platform-ui-landing-page";

import { composeApex, composeCv, composeMiss, composePortfolio } from "../src/composition";
import {
  cvDocumentValidator,
  parseCommitId,
  portfolioDocumentValidator,
  projectsDocumentValidator,
  testimonialsDocumentValidator,
} from "../src/content";
import type { BuildContext, CvData, Inventory, PortfolioData, Testimonials } from "../src/content";
import { iconDataUri, themeColor } from "../src/presentation";

export const origin = "https://subzerodev.com" as const;

// RoutePath (contract § Route, A4) — narrows config.routes' path to the
// values this Adapter declares, so an undeclared route path fails typecheck
// rather than relying on review (issue #52). `satisfies` checks membership without
// widening past the exact literal each constant carries per the contract's
// own signatures (design/20-contract.md § Public signatures § Adapter — cited
// by section, never by line: line numbers rot on every amendment).
export type RoutePath = "/" | "/cv/" | "/portfolio/" | "/404/";
export const apexPath = "/" as const satisfies RoutePath;
export const cvPath = "/cv/" as const satisfies RoutePath;
export const portfolioPath = "/portfolio/" as const satisfies RoutePath;
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
function compose({
  projects,
  testimonials,
  cv,
  portfolio,
}: {
  projects: Inventory;
  testimonials: Testimonials;
  cv: CvData;
  portfolio: PortfolioData;
}): LandingPageConfig {
  const apex = composeApex(projects, testimonials, origin);
  const cvRoute = composeCv(projects, cv, origin);
  const portfolioRoute = composePortfolio(projects, portfolio, origin);
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
      path: cvPath,
      body: cvRoute.bodyHtml,
      stylesheet: cvRoute.stylesheet,
      metadata: {
        title: "CV (placeholder title — replace before publication)",
        description: "Placeholder description for the SubZeroDev CV — replace before publication.",
        canonicalUrl: `${origin}${cvPath}`,
        openGraph: {
          title: "CV (placeholder Open Graph title — replace before publication)",
          description:
            "Placeholder Open Graph description for the SubZeroDev CV — replace before publication.",
          type: "website",
          url: `${origin}${cvPath}`,
        },
        themeColor,
        icons: [{ rel: "icon", href: iconDataUri }],
      },
    },
    {
      path: portfolioPath,
      body: portfolioRoute.bodyHtml,
      stylesheet: portfolioRoute.stylesheet,
      metadata: {
        title: "Portfolio (placeholder title — replace before publication)",
        description:
          "Placeholder description for the SubZeroDev portfolio — replace before publication.",
        canonicalUrl: `${origin}${portfolioPath}`,
        openGraph: {
          title: "Portfolio (placeholder Open Graph title — replace before publication)",
          description:
            "Placeholder Open Graph description for the SubZeroDev portfolio — replace before publication.",
          type: "website",
          url: `${origin}${portfolioPath}`,
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
    cv: { id: "cv", validate: cvDocumentValidator(context) },
    portfolio: { id: "portfolio", validate: portfolioDocumentValidator },
  },
  compose,
);
