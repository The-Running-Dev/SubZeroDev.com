// S11.5–S11.10 — composeTestimonials. Fixtures only, never
// `src/content/testimonials.ts` (S11.7's content-agnosticism half) — the
// committed collection has its own coverage in
// tests/content/testimonials.test.ts and tests/build/emitted-document.test.ts.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { composeTestimonials } from "../../src/composition";
import type { Testimonials } from "../../src/content";
import { assertStyleAgreement } from "../../src/verification";
import { makeTestimonial } from "../content/fixtures";

// Adapter's apex route constant, so the footer back-link below is pinned to it
// rather than to a second untethered spelling of "/". GITHUB_SHA is forced to a
// valid commit id before the import because Adapter's module-level code calls
// `process.exit` on an invalid one (A5) — the same guard, for the same reason,
// as tests/build/adapter-config.test.ts.
process.env.GITHUB_SHA ??= "a".repeat(40);
const { apexPath } = await import("../../site/landing.config");

function testimonials(...ts: readonly [ReturnType<typeof makeTestimonial>, ...ReturnType<typeof makeTestimonial>[]]): Testimonials {
  return ts;
}

const first = makeTestimonial({ quote: "First quote.", author: "First Author" });
const second = makeTestimonial({
  quote: "Second quote.",
  author: "Second Author",
  role: "Second Role",
});
const sample = testimonials(first, second);

describe("S11.5 — composeTestimonials renders every quote and author, in input order", () => {
  it("contains every quote and author", () => {
    const { bodyHtml } = composeTestimonials(sample);
    for (const t of sample) {
      expect(bodyHtml).toContain(t.quote);
      expect(bodyHtml).toContain(t.author);
    }
  });

  it("author offsets ascend in input order", () => {
    const { bodyHtml } = composeTestimonials(sample);
    const firstIndex = bodyHtml.indexOf(first.author);
    const secondIndex = bodyHtml.indexOf(second.author);
    expect(firstIndex).toBeGreaterThan(-1);
    expect(secondIndex).toBeGreaterThan(firstIndex);
  });
});

describe("S11.6 — the metadata line reflects exactly the fields present (X8)", () => {
  it("role but no organization renders role, omits an organization line", () => {
    const { bodyHtml } = composeTestimonials(
      testimonials(makeTestimonial({ author: "Has Role", role: "A Role" })),
    );
    expect(bodyHtml).toContain(`<p class="meta">A Role</p>`);
  });

  it("organization but no role renders organization", () => {
    const { bodyHtml } = composeTestimonials(
      testimonials(makeTestimonial({ author: "Has Org", organization: "An Org" })),
    );
    expect(bodyHtml).toContain(`<p class="meta">An Org</p>`);
  });

  it("neither role nor organization renders only the author line — no empty metadata line", () => {
    const { bodyHtml } = composeTestimonials(
      testimonials(makeTestimonial({ author: "Solo Author" })),
    );
    const figcaptionMatch = bodyHtml.match(/<figcaption>(.*?)<\/figcaption>/s);
    expect(figcaptionMatch).not.toBeNull();
    const metaLines = figcaptionMatch![1]!.match(/<p class="meta">/g) ?? [];
    expect(metaLines).toHaveLength(1);
    expect(bodyHtml).not.toMatch(/<p class="meta"><\/p>/);
  });
});

describe("S11.7 — composeTestimonials is deterministic and content-agnostic", () => {
  it("returns byte-identical bodyHtml and stylesheet for the same input on repeated calls", () => {
    const a = composeTestimonials(sample);
    const b = composeTestimonials(sample);
    expect(a.bodyHtml).toBe(b.bodyHtml);
    expect(a.stylesheet).toBe(b.stylesheet);
  });

  it("the module source carries no committed SubZeroDev testimonial author's name", () => {
    // Read as text rather than importing `testimonials` — C16 closes that
    // import to the `validateTestimonials` call site and Verification's
    // assertions, and a composition test is neither.
    const here = dirname(fileURLToPath(import.meta.url));
    const dataSource = readFileSync(
      resolve(here, "../../src/content/testimonials.ts"),
      "utf8",
    );
    const compositionSource = readFileSync(
      resolve(here, "../../src/composition/testimonials.ts"),
      "utf8",
    );
    const authors = [...dataSource.matchAll(/author:\s*"([^"]+)"/g)].map((m) => m[1]!);
    expect(authors.length).toBeGreaterThan(0);
    for (const author of authors) {
      expect(compositionSource).not.toContain(author);
    }
  });
});

describe("S11.8 — every interpolated field is HTML-escaped in text position (X5)", () => {
  it("quote, author, role and organization each escape all five characters", () => {
    const dangerous = `<script>&"'>`;
    const fixture = testimonials(
      makeTestimonial({
        quote: dangerous,
        author: dangerous,
        role: dangerous,
        organization: dangerous,
      }),
    );
    const { bodyHtml } = composeTestimonials(fixture);
    expect(bodyHtml).not.toContain(dangerous);
    expect(bodyHtml).toContain("&lt;script&gt;&amp;&quot;&#39;&gt;");
  });
});

describe("S11.9 — no form, iframe, on* attribute or script element; no avatar-shaped asset", () => {
  const { bodyHtml } = composeTestimonials(sample);

  it("carries none of form, iframe, on* attributes or a script element", () => {
    expect(bodyHtml).not.toContain("<form");
    expect(bodyHtml).not.toContain("<iframe");
    expect(bodyHtml).not.toMatch(/\son[a-z]+=/i);
    expect(bodyHtml).not.toContain("<script");
  });

  it("carries no img element and no data: URI", () => {
    expect(bodyHtml).not.toContain("<img");
    expect(bodyHtml).not.toContain("data:");
  });
});

describe("the footer back-link targets Adapter's apexPath", () => {
  it("renders the back-link at apexPath rather than a second spelling of it", () => {
    const { bodyHtml } = composeTestimonials(sample);
    expect(bodyHtml).toContain(`href="${apexPath}">Back to`);
  });
});

describe("S11.10 — assertStyleAgreement holds (X4)", () => {
  it("returns ok: true for composeTestimonials(sample)", () => {
    const { bodyHtml, stylesheet } = composeTestimonials(sample);
    expect(assertStyleAgreement(bodyHtml, stylesheet)).toEqual({ ok: true, value: null });
  });
});
