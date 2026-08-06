// Reads the real output of `npm run build` off disk (S6.9, S6.11, S6.12) —
// this file's own vitest config (vitest.build.config.ts) is the only one that
// includes it, and the build job runs `npm run build` before `vitest run
// --config vitest.build.config.ts` (S6.14). Running this suite without a
// prior build fails closed: the documents are simply absent.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { composeApex } from "../../src/composition";
import { projects, validateInventory } from "../../src/content";
import { iconDataUri } from "../../src/presentation";
import { assertContentPresent, assertSelfContained } from "../../src/verification";
import { context, makeProject, pid } from "../content/fixtures";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, "../../site/dist");

const apexHtml = readFileSync(resolve(distDir, "index.html"), "utf8");
const missHtml = readFileSync(resolve(distDir, "404/index.html"), "utf8");

describe("S6.9 — the build emits a document for the apex and one at 404/index.html", () => {
  it("both documents exist and are non-empty", () => {
    expect(apexHtml.length).toBeGreaterThan(0);
    expect(missHtml.length).toBeGreaterThan(0);
  });

  it("assertSelfContained returns ok: true for the apex", () => {
    expect(assertSelfContained(apexHtml)).toEqual({ ok: true, value: null });
  });

  it("assertSelfContained returns ok: true for the miss document", () => {
    expect(assertSelfContained(missHtml)).toEqual({ ok: true, value: null });
  });
});

// Duplicated from src/composition/apex.ts's `manifestoParagraphs` rather than
// imported — Composition's public surface is closed to composeApex and
// composeMiss (contract's Composition § public signatures), and nothing but
// Adapter may import it (X2, S6.13). Accepted per the contract's own note on
// assertContentPresent: a drift between the two is a red build naming the
// missing sentence, not a silent pass.
const manifestoSentences = [
  "SubZeroDev was always meant to be a business.",
  "We just never decided what kind.",
  "There was no master plan.",
  "No product roadmap.",
  "We built things because they were useful, interesting, or both.",
  "One problem became a solution.",
  "One solution became infrastructure.",
  "Infrastructure became a platform.",
  "Some things became products.",
  "Others escaped and became entirely different things.",
  "We don't force ideas to fit the business.",
  "We let the business follow the ideas.",
  "We do the next interesting thing well.",
  "Then we see what happened.",
  "The absence of a plan is the plan.",
] as const;

describe("S6.11 — assertContentPresent holds for the emitted apex", () => {
  it("returns ok: true for a fixture inventory whose names carry no HTML-escaped character", () => {
    // The committed inventory's "Ogre's Kitchen" is the documented exception
    // below — X5 escapes its apostrophe, so assertContentPresent's literal
    // comparison cannot match it (design/90-decisions.md, 2026-08-06, "Four
    // orphan error codes get producers"; tests/content/inventory.test.ts names
    // the same project by the same reasoning). This fixture avoids that
    // character so the positive case is demonstrated against a genuinely
    // composed, self-contained body rather than worked around.
    const fixtureInventory = [
      makeProject({ id: pid("alpha"), name: "Alpha Systems" }),
      makeProject({ id: pid("bravo"), name: "Bravo Labs" }),
    ] as const;
    const { bodyHtml } = composeApex(fixtureInventory);
    expect(assertContentPresent(bodyHtml, manifestoSentences, fixtureInventory)).toEqual({
      ok: true,
      value: null,
    });
  });

  it("the committed inventory's one apostrophe-bearing name is the documented, accepted exception", () => {
    const validated = validateInventory(projects, context);
    if (!validated.ok) throw new Error("committed inventory failed to validate");
    expect(assertContentPresent(apexHtml, manifestoSentences, validated.value)).toEqual({
      ok: false,
      errors: [
        {
          code: "ProjectNameAbsent",
          detail: expect.stringContaining("Ogre's Kitchen"),
          observed: null,
          expected: "Ogre's Kitchen",
        },
      ],
    });
  });
});

describe("S6.12 — the emitted apex document contains its title, description, canonical URL, Open Graph fields and the icon href", () => {
  it("title", () => {
    expect(apexHtml).toContain(
      "<title>SubZeroDev (placeholder title — replace before publication)</title>",
    );
  });

  it("description", () => {
    expect(apexHtml).toContain(
      'name="description" content="Placeholder description for the SubZeroDev apex — replace before publication."',
    );
  });

  it("canonical URL", () => {
    expect(apexHtml).toContain('<link rel="canonical" href="https://subzerodev.com/">');
  });

  it("Open Graph fields", () => {
    expect(apexHtml).toContain(
      'property="og:title" content="SubZeroDev (placeholder Open Graph title — replace before publication)"',
    );
    expect(apexHtml).toContain(
      'property="og:description" content="Placeholder Open Graph description for the SubZeroDev apex — replace before publication."',
    );
    expect(apexHtml).toContain('property="og:type" content="website"');
    expect(apexHtml).toContain('property="og:url" content="https://subzerodev.com/"');
  });

  it("the icon href", () => {
    expect(apexHtml).toContain(`href="${iconDataUri}"`);
  });
});
