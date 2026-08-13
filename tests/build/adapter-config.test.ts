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
const { validateInventory, validateTestimonials } = await import("../../src/content");
const { projects, testimonials } = await import("../helpers/site-data");

const { default: declaration, origin, apexPath, missPath } = adapter;
const inventory = validateInventory(projects, {
  commit: "a".repeat(40) as import("../../src/content").CommitId,
  utcYear: new Date().getUTCFullYear() as import("../../src/content").Year,
});
const validatedTestimonials = validateTestimonials(testimonials);
if (!inventory.ok || !validatedTestimonials.ok) throw new Error("committed JSON failed to validate");
const config = declaration.config({ projects: inventory.value, testimonials: validatedTestimonials.value });

const here = dirname(fileURLToPath(import.meta.url));
const adapterSource = readFileSync(resolve(here, "../../site/landing.config.ts"), "utf8");

describe("S6.3 — config.routes has exactly two entries, apex then miss", () => {
  it("has exactly two routes", () => {
    expect(config.routes).toHaveLength(2);
  });

  it("the order is apex, miss", () => {
    expect(config.routes[0]!.path).toBe(apexPath);
    expect(config.routes[1]!.path).toBe(missPath);
  });
});

describe("S6.4 — canonicalUrl and openGraph.url are origin concatenated with the route's path", () => {
  it.each([
    [0, apexPath],
    [1, missPath],
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

describe("S6.5 — themeColor and the icon are Presentation's, by reference", () => {
  it.each([0, 1] as const)("route %i", (index) => {
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
  it.each([0, 1] as const)("route %i", (index) => {
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
  it.each([0, 1] as const)("route %i", (index) => {
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
