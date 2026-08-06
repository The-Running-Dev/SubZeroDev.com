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

const { default: config, origin, apexPath, missPath } = adapter;

const here = dirname(fileURLToPath(import.meta.url));
const adapterSource = readFileSync(resolve(here, "../../site/landing.config.ts"), "utf8");

describe("S6.3 — config.routes has exactly two entries, apex then miss", () => {
  it("has exactly two routes", () => {
    expect(config.routes).toHaveLength(2);
  });

  it("the first is the apex at apexPath, the second the miss at missPath", () => {
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

describe("S6.6 — neither route declares entry, hydrate or noScript; config declares no styles, publicDir or allow", () => {
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
