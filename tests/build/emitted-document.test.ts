// Reads the real output of `npm run build` off disk (S6.9, S6.11, S6.12) —
// this file's own vitest config (vitest.build.config.ts) is the only one that
// includes it, and the build job runs `npm run build` before `vitest run
// --config vitest.build.config.ts` (S6.14). Running this suite without a
// prior build fails closed: the documents are simply absent.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { missRootEntry } from "../../src/artifact";
import { composeApex } from "../../src/composition";
import { validateInventory, validateTestimonials } from "../../src/content";
import { iconDataUri } from "../../src/presentation";
import { assertContentPresent, assertSelfContained } from "../../src/verification";
import { context, makeProject, pid, TEST_ORIGIN } from "../content/fixtures";
import { portfolio, projects, testimonials } from "../helpers/site-data";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, "../../site/dist");

const apexHtml = readFileSync(resolve(distDir, "index.html"), "utf8");
// cv/index.html and portfolio/index.html both survive finalizeArtifact
// untouched — R2's removal is scoped to the miss entry alone (contract's
// Adapter § "only the miss route's emitted document is relocated"), so both
// are read straight off the build output with no copy/finalize step involved
// (S16.2, S17.2).
const cvHtml = readFileSync(resolve(distDir, "cv/index.html"), "utf8");
const portfolioHtml = readFileSync(resolve(distDir, "portfolio/index.html"), "utf8");
// The emitted miss entry (404/index.html) does not survive finalizeArtifact's
// removal (R2), and this config's global-setup has already run it by the
// time this suite executes — same convention as tests/build/artifact.test.ts.
// missRootEntry (404.html) carries the same, byte-identical, marked content.
const missHtml = readFileSync(resolve(distDir, missRootEntry), "utf8");

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

describe("S16.2/S16.5 — the build emits a document at cv/index.html, self-contained with exactly one script", () => {
  it("the document exists and is non-empty", () => {
    expect(cvHtml.length).toBeGreaterThan(0);
  });

  it("assertSelfContained returns ok: true for the CV document", () => {
    expect(assertSelfContained(cvHtml)).toEqual({ ok: true, value: null });
  });

  it("carries exactly one <script> element", () => {
    expect(cvHtml.match(/<script\b/gi) ?? []).toHaveLength(1);
  });
});

describe("S16.6 — the Person block parses as JSON, carries name/jobTitle/url/sameAs, and carries no email/telephone", () => {
  it("parses and shapes correctly", () => {
    const match = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(cvHtml);
    expect(match).not.toBeNull();
    const person = JSON.parse(match![1]!) as Record<string, unknown>;
    expect(person["@type"]).toBe("Person");
    expect(typeof person.name).toBe("string");
    expect(typeof person.jobTitle).toBe("string");
    expect(typeof person.url).toBe("string");
    expect(Array.isArray(person.sameAs)).toBe(true);
    expect(person.email).toBeUndefined();
    expect(person.telephone).toBeUndefined();
  });
});

describe("S17.2/S17.5 — the build emits a document at portfolio/index.html, self-contained with zero script elements", () => {
  it("the document exists and is non-empty", () => {
    expect(portfolioHtml.length).toBeGreaterThan(0);
  });

  it("assertSelfContained returns ok: true for the portfolio document", () => {
    expect(assertSelfContained(portfolioHtml)).toEqual({ ok: true, value: null });
  });

  it("carries zero <script> elements", () => {
    expect(portfolioHtml.match(/<script\b/gi) ?? []).toHaveLength(0);
  });
});

// escapedForCompare is declared below the manifesto section; every emoji is
// its own literal grapheme, so it is compared byte for byte with no escaping
// pass rather than through that helper (S17.6).
describe("S17.6 — every emoji in the committed portfolio document appears in the emitted document unchanged", () => {
  it("byte for byte", () => {
    for (const category of portfolio.projects) {
      expect(portfolioHtml).toContain(category.icon);
    }
  });
});

describe("S17.7 — no stat value is a literal in src/composition/", () => {
  it("every rendered figure appears in site/portfolio.json", () => {
    for (const stat of portfolio.stats) {
      expect(portfolioHtml).toContain(escapedForCompare(stat.value));
      expect(portfolioHtml).toContain(escapedForCompare(stat.label));
    }
  });
});

// X5 escapes every interpolated character, so a raw quote or author carrying
// one of the five reaches the built HTML escaped — the same reason
// tests/content/inventory.test.ts and this file's own S6.11 suite name
// "Ogre's Kitchen" as a documented exception to a literal containment check
// rather than a bug. Comparing the escaped form here is the fix for
// testimonials, not a workaround.
function escapedForCompare(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

describe("the emitted apex document carries every committed testimonial quote and author", () => {
  it("every quote and author appears in the built HTML, HTML-escaped (X5)", () => {
    const validated = validateTestimonials(testimonials);
    if (!validated.ok) throw new Error("committed testimonials failed to validate");
    for (const t of validated.value) {
      expect(apexHtml).toContain(escapedForCompare(t.quote));
      expect(apexHtml).toContain(escapedForCompare(t.author));
    }
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
    const validated = validateTestimonials(testimonials);
    if (!validated.ok) throw new Error("committed testimonials failed to validate");
    const { bodyHtml } = composeApex(fixtureInventory, validated.value, TEST_ORIGIN);
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

describe("S16.11 — the emitted CV document contains its title, description, canonical URL, Open Graph fields and the icon href", () => {
  it("title", () => {
    expect(cvHtml).toContain("<title>CV (placeholder title — replace before publication)</title>");
  });

  it("description", () => {
    expect(cvHtml).toContain(
      'name="description" content="Placeholder description for the SubZeroDev CV — replace before publication."',
    );
  });

  it("canonical URL", () => {
    expect(cvHtml).toContain('<link rel="canonical" href="https://subzerodev.com/cv/">');
  });

  it("Open Graph fields, no og:image and no twitter element", () => {
    expect(cvHtml).toContain(
      'property="og:title" content="CV (placeholder Open Graph title — replace before publication)"',
    );
    expect(cvHtml).toContain(
      'property="og:description" content="Placeholder Open Graph description for the SubZeroDev CV — replace before publication."',
    );
    expect(cvHtml).toContain('property="og:type" content="website"');
    expect(cvHtml).toContain('property="og:url" content="https://subzerodev.com/cv/"');
    expect(cvHtml).not.toContain("og:image");
    expect(cvHtml).not.toContain('name="twitter:');
  });

  it("the icon href", () => {
    expect(cvHtml).toContain(`href="${iconDataUri}"`);
  });
});

describe("S17.10 — the emitted portfolio document contains its title, description, canonical URL, Open Graph fields and the icon href", () => {
  it("title", () => {
    expect(portfolioHtml).toContain(
      "<title>Portfolio (placeholder title — replace before publication)</title>",
    );
  });

  it("description", () => {
    expect(portfolioHtml).toContain(
      'name="description" content="Placeholder description for the SubZeroDev portfolio — replace before publication."',
    );
  });

  it("canonical URL", () => {
    expect(portfolioHtml).toContain('<link rel="canonical" href="https://subzerodev.com/portfolio/">');
  });

  it("Open Graph fields", () => {
    expect(portfolioHtml).toContain(
      'property="og:title" content="Portfolio (placeholder Open Graph title — replace before publication)"',
    );
    expect(portfolioHtml).toContain(
      'property="og:description" content="Placeholder Open Graph description for the SubZeroDev portfolio — replace before publication."',
    );
    expect(portfolioHtml).toContain('property="og:type" content="website"');
    expect(portfolioHtml).toContain('property="og:url" content="https://subzerodev.com/portfolio/"');
  });

  it("the icon href", () => {
    expect(portfolioHtml).toContain(`href="${iconDataUri}"`);
  });
});
