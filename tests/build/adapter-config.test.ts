// Imports Adapter directly rather than reading its output off disk, so S6.3
// through S6.6 assert the actual `config` object the package CLI loads. This
// is safe to do inside the test process only because GITHUB_SHA is forced to
// a valid commit id before the import — Adapter's module-level code calls
// `process.exit` on an invalid one (A5), which would otherwise kill the test
// runner rather than fail a single test.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

process.env.GITHUB_SHA ??= "a".repeat(40);

const adapter = await import("../../site/landing.config");
const { iconDataUri, themeColor } = await import("../../src/presentation");
const { validateCv, validateInventory, validatePortfolio, validateTestimonials } = await import(
  "../../src/content"
);
const { cv, portfolio, projects, testimonials } = await import("../helpers/site-data");
const { ownRoutePaths } = await import("../../src/composition/header");

const { default: declaration, origin, apexPath, cvPath, portfolioPath, missPath } = adapter;
const buildContext = {
  commit: "a".repeat(40) as import("../../src/content").CommitId,
  utcYear: new Date().getUTCFullYear() as import("../../src/content").Year,
};
const inventory = validateInventory(projects, buildContext);
const validatedTestimonials = validateTestimonials(testimonials);
const validatedCv = validateCv(cv, buildContext);
const validatedPortfolio = validatePortfolio(portfolio);
if (!inventory.ok || !validatedTestimonials.ok || !validatedCv.ok || !validatedPortfolio.ok) {
  throw new Error("committed JSON failed to validate");
}
const config = declaration.config({
  projects: inventory.value,
  testimonials: validatedTestimonials.value,
  cv: validatedCv.value,
  portfolio: validatedPortfolio.value,
});

const here = dirname(fileURLToPath(import.meta.url));
const adapterSource = readFileSync(resolve(here, "../../site/landing.config.ts"), "utf8");

describe("S6.3/S17.1 — config.routes has exactly four entries: apex, CV, portfolio, miss", () => {
  it("has exactly four routes", () => {
    expect(config.routes).toHaveLength(4);
  });

  it("the order is apex, CV, portfolio, miss", () => {
    expect(config.routes[0]!.path).toBe(apexPath);
    expect(config.routes[1]!.path).toBe(cvPath);
    expect(config.routes[2]!.path).toBe(portfolioPath);
    expect(config.routes[3]!.path).toBe(missPath);
  });
});

describe("S6.4 — canonicalUrl and openGraph.url are origin concatenated with the route's path", () => {
  it.each([
    [0, apexPath],
    [1, cvPath],
    [2, portfolioPath],
    [3, missPath],
  ] as const)("route %i", (index, path) => {
    const route = config.routes[index]!;
    expect(route.metadata.canonicalUrl).toBe(`${origin}${path}`);
    expect(route.metadata.openGraph?.url).toBe(`${origin}${path}`);
    expect(route.metadata.openGraph?.type).toBe("website");
  });

  it("origin appears exactly once as a literal in Adapter's source", () => {
    // The literal is the const declaration itself; every other reference in
    // this file reads the imported `origin` back rather than retyping it.
    const occurrences = adapterSource.match(/https:\/\/subzerodev\.com/g) ?? [];
    expect(occurrences).toHaveLength(1);
  });
});

// X2 forbids Composition importing `RoutePath`, so `ownRoutePaths` in
// `src/composition/header.ts` restates the three own-site paths Adapter also
// declares. That restatement is forced, but it is still two copies of one
// fact, and *Single ownership* asks that a restated fact name its canonical
// copy and be checked against it. Adapter's constants are canonical — they
// are what the build actually emits — and this file is the only place both
// sides are visible, since no repository module may import Adapter.
//
// Without this, changing `cvPath` and widening `RoutePath` in the one file
// `satisfies` checks leaves every gate green while the emitted masthead links
// CV at a path the build no longer emits, and the CV route marks no entry
// current at all.
describe("S18.2 — Composition's own-route paths are Adapter's, not a second opinion", () => {
  it("ownRoutePaths matches apexPath, cvPath and portfolioPath exactly", () => {
    expect(ownRoutePaths.apex).toBe(apexPath);
    expect(ownRoutePaths.cv).toBe(cvPath);
    expect(ownRoutePaths.portfolio).toBe(portfolioPath);
  });

  it("the three are the whole of it — a fourth own route would need a masthead entry too", () => {
    expect(Object.keys(ownRoutePaths).sort()).toEqual(["apex", "cv", "portfolio"]);
  });

  it("every route Composition claims as its own is a route Adapter declares", () => {
    const declared = new Set(config.routes.map((r) => r.path));
    for (const path of Object.values(ownRoutePaths)) expect(declared).toContain(path);
  });
});

describe("S6.5 — themeColor and the icon are Presentation's, by reference", () => {
  it.each([0, 1, 2, 3] as const)("route %i", (index) => {
    const route = config.routes[index]!;
    expect(route.metadata.themeColor).toBe(themeColor);
    expect(route.metadata.icons).toHaveLength(1);
    expect(route.metadata.icons![0]!.href).toBe(iconDataUri);
  });

  it("no hex literal and no data: literal appears in Adapter's source", () => {
    expect(adapterSource).not.toMatch(/#[0-9A-Fa-f]{6}\b/);
    expect(adapterSource).not.toMatch(/["'`]data:/);
  });
});

describe("S6.6 — no route declares entry, hydrate or noScript; config declares no styles, publicDir or allow", () => {
  it.each([0, 1, 2, 3] as const)("route %i", (index) => {
    const route = config.routes[index]!;
    expect("entry" in route).toBe(false);
    expect("hydrate" in route).toBe(false);
    expect("noScript" in route.metadata).toBe(false);
  });

  it("config carries none of styles, publicDir or allow", () => {
    expect("styles" in config).toBe(false);
    expect("publicDir" in config).toBe(false);
    expect("allow" in config).toBe(false);
  });
});

describe("U6 — no social image asset is declared", () => {
  it.each([0, 1, 2, 3] as const)("route %i", (index) => {
    const route = config.routes[index]!;
    expect(route.metadata.socialImageUrl).toBeUndefined();
    expect(route.metadata.openGraph?.imageUrl).toBeUndefined();
    expect(route.metadata.twitter).toBeUndefined();
  });
});

// A5's full claim — that Adapter itself reports every ContentError from
// either validator and produces no route when either fails — needs a fixture
// substituted for the module-level `testimonials`/`projects` imports before
// Adapter runs, which this file's already-imported, already-passing config
// cannot exercise without mocking module resolution. What is asserted here is
// the half that does not need that: validateTestimonials itself reports every
// failure in one Result, which is what Adapter's error loop iterates over.
describe("validateTestimonials reports every failure in one Result, which Adapter's A5 loop iterates over", () => {
  it("a testimonial with both fields empty yields both error codes, not just the first", async () => {
    const { validateTestimonials } = await import("../../src/content");
    const failing = validateTestimonials([{ quote: "", author: "" }]);
    expect(failing.ok).toBe(false);
    if (!failing.ok) {
      expect(failing.errors.map((e) => e.code).sort()).toEqual(
        ["TestimonialAuthorEmpty", "TestimonialQuoteEmpty"].sort(),
      );
    }
  });
});
