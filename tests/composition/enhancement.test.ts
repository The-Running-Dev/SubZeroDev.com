// Coverage for `enhancementScript` (X10, S12.1, S12.2) — not part of
// Composition's public surface, so imported by its own path rather than
// through `../../src/composition`'s index, the same way other internal-only
// modules in this suite are reached.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { enhancementScript } from "../../src/composition/enhancement";

const script = enhancementScript();
const here = dirname(fileURLToPath(import.meta.url));

describe("S12.1 — enhancementScript carries no </script sequence in any case", () => {
  it("the returned string contains none", () => {
    expect(/<\/script/i.test(script)).toBe(false);
  });
});

describe("S12.2 — the script interpolates no Content value", () => {
  // Read as text rather than importing `projects`/`testimonials` — C14/C16
  // close those imports to their validator call sites and Verification's
  // assertions, and this module is neither (the same reasoning
  // tests/composition/testimonials.test.ts's S11.7 case already applies).
  it("carries none of the committed projects' names, ids or lines", () => {
    const source = readFileSync(resolve(here, "../../src/content/projects.ts"), "utf8");
    const names = [...source.matchAll(/name:\s*"([^"]+)"/g)].map((m) => m[1]!);
    const ids = [...source.matchAll(/id:\s*id\("([^"]+)"\)/g)].map((m) => m[1]!);
    const lines = [...source.matchAll(/line:\s*"([^"]+)"/g)].map((m) => m[1]!);
    expect(names.length).toBeGreaterThan(0);
    expect(ids.length).toBeGreaterThan(0);
    expect(lines.length).toBeGreaterThan(0);
    for (const value of [...names, ...ids, ...lines]) {
      expect(script).not.toContain(value);
    }
  });

  it("carries none of the committed testimonials' quotes or authors", () => {
    const source = readFileSync(resolve(here, "../../src/content/testimonials.ts"), "utf8");
    const quotes = [...source.matchAll(/quote:\s*"([^"]+)"/g)].map((m) => m[1]!);
    const authors = [...source.matchAll(/author:\s*"([^"]+)"/g)].map((m) => m[1]!);
    expect(quotes.length).toBeGreaterThan(0);
    expect(authors.length).toBeGreaterThan(0);
    for (const value of [...quotes, ...authors]) {
      expect(script).not.toContain(value);
    }
  });

  it("imports nothing from Content", () => {
    const source = readFileSync(resolve(here, "../../src/composition/enhancement.ts"), "utf8");
    expect(source).not.toMatch(/from\s+"\.\.\/content/);
  });
});

describe("S12.1/X10 — deterministic and total", () => {
  it("returns the identical string on repeated calls", () => {
    expect(enhancementScript()).toBe(script);
  });

  it("carries no literal class= attribute", () => {
    // `class="..."` would be picked up by `stylesheetFor` and
    // `assertStyleAgreement`'s naive class scan over the raw body text the
    // script travels inside of — this script styles what it creates with
    // inline `style` properties instead, so it stays invisible to both.
    expect(script).not.toMatch(/class="/);
  });
});
