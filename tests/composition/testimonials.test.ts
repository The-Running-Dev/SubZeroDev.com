// Coverage for the testimonials section, rendered inline on the apex page by
// `renderTestimonials` (src/composition/testimonials.ts) rather than as its
// own route (design/90-decisions.md — "testimonials folds into the apex").
// Fixtures only, never the committed testimonials JSON (content-agnosticism) —
// the committed collection has its own coverage in
// tests/content/testimonials.test.ts and tests/build/emitted-document.test.ts.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { composeApex } from "../../src/composition";
import type { Inventory, Testimonials } from "../../src/content";
import { assertStyleAgreement } from "../../src/verification";
import { makeProject, makeTestimonial, pid, TEST_ORIGIN } from "../content/fixtures";

const inventory: Inventory = [makeProject({ id: pid("alpha"), name: "Alpha" })];

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

// The testimonials section is the last one composeApex renders before the
// footer's rule (apex.ts) — extracting up to that `<hr` is what lets the
// no-form/no-iframe/no-image cases below scope to the section itself rather
// than the whole document, which legitimately carries other markup (the
// ld+json script) these checks would otherwise trip on.
function testimonialsSectionOf(bodyHtml: string): string {
  const start = bodyHtml.indexOf('id="testimonials"');
  expect(start).toBeGreaterThan(-1);
  const end = bodyHtml.indexOf("<hr", start);
  expect(end).toBeGreaterThan(start);
  return bodyHtml.slice(start, end);
}

describe("composeApex renders every testimonial quote and author, in input order", () => {
  it("contains every quote and author", () => {
    const { bodyHtml } = composeApex(inventory, sample, TEST_ORIGIN);
    for (const t of sample) {
      expect(bodyHtml).toContain(t.quote);
      expect(bodyHtml).toContain(t.author);
    }
  });

  it("author offsets ascend in input order", () => {
    const { bodyHtml } = composeApex(inventory, sample, TEST_ORIGIN);
    const firstIndex = bodyHtml.indexOf(first.author);
    const secondIndex = bodyHtml.indexOf(second.author);
    expect(firstIndex).toBeGreaterThan(-1);
    expect(secondIndex).toBeGreaterThan(firstIndex);
  });
});

describe("the metadata line reflects exactly the fields present (X8)", () => {
  it("role but no organization renders role, omits an organization line", () => {
    const { bodyHtml } = composeApex(
      inventory,
      testimonials(makeTestimonial({ author: "Has Role", role: "A Role" })),
      TEST_ORIGIN,
    );
    expect(bodyHtml).toContain(`<p class="meta">A Role</p>`);
  });

  it("organization but no role renders organization", () => {
    const { bodyHtml } = composeApex(
      inventory,
      testimonials(makeTestimonial({ author: "Has Org", organization: "An Org" })),
      TEST_ORIGIN,
    );
    expect(bodyHtml).toContain(`<p class="meta">An Org</p>`);
  });

  it("neither role nor organization renders only the author line — no empty metadata line", () => {
    const { bodyHtml } = composeApex(
      inventory,
      testimonials(makeTestimonial({ author: "Solo Author" })),
      TEST_ORIGIN,
    );
    const figcaptionMatch = bodyHtml.match(/<figcaption>(.*?)<\/figcaption>/s);
    expect(figcaptionMatch).not.toBeNull();
    const metaLines = figcaptionMatch![1]!.match(/<p class="meta">/g) ?? [];
    expect(metaLines).toHaveLength(1);
    expect(bodyHtml).not.toMatch(/<p class="meta"><\/p>/);
  });

  it("a source URL renders as an escaped Source link", () => {
    const source = "https://example.test/issues/212?topic=two%20kinds";
    const { bodyHtml } = composeApex(
      inventory,
      testimonials(makeTestimonial({ author: "Issue 212", url: source })),
      TEST_ORIGIN,
    );
    expect(bodyHtml).toContain(`<a class="link" href="${source}">Source</a>`);
  });
});

describe("composeApex is deterministic and testimonials rendering is content-agnostic", () => {
  it("returns byte-identical bodyHtml and stylesheet for the same input on repeated calls", () => {
    const a = composeApex(inventory, sample, TEST_ORIGIN);
    const b = composeApex(inventory, sample, TEST_ORIGIN);
    expect(a.bodyHtml).toBe(b.bodyHtml);
    expect(a.stylesheet).toBe(b.stylesheet);
  });

  it("the module source carries no committed SubZeroDev testimonial author's name", () => {
    // Read as text rather than importing `testimonials` — C16 closes that
    // import to the `validateTestimonials` call site and Verification's
    // assertions, and a composition test is neither.
    const here = dirname(fileURLToPath(import.meta.url));
    const dataSource = readFileSync(
      resolve(here, "../../site/testimonials.json"),
      "utf8",
    );
    const compositionSource = readFileSync(
      resolve(here, "../../src/composition/testimonials.ts"),
      "utf8",
    );
    const authors = (
      JSON.parse(dataSource) as { testimonials: readonly { author: string }[] }
    ).testimonials.map((testimonial) => testimonial.author);
    expect(authors.length).toBeGreaterThan(0);
    for (const author of authors) {
      expect(compositionSource).not.toContain(author);
    }
  });
});

describe("every interpolated field is HTML-escaped in text position (X5)", () => {
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
    const { bodyHtml } = composeApex(inventory, fixture, TEST_ORIGIN);
    expect(bodyHtml).not.toContain(dangerous);
    expect(bodyHtml).toContain("&lt;script&gt;&amp;&quot;&#39;&gt;");
  });
});

describe("the testimonials section carries no form, iframe, on* attribute, image or embedded script", () => {
  it("carries none of them within the section itself", () => {
    const { bodyHtml } = composeApex(inventory, sample, TEST_ORIGIN);
    const section = testimonialsSectionOf(bodyHtml);
    expect(section).not.toContain("<form");
    expect(section).not.toContain("<iframe");
    expect(section).not.toMatch(/\son[a-z]+=/i);
    expect(section).not.toContain("<script");
    expect(section).not.toContain("<img");
    expect(section).not.toContain("data:");
  });
});

describe("assertStyleAgreement holds for composeApex with a testimonials section (X4)", () => {
  it("returns ok: true for composeApex(inventory, sample, origin)", () => {
    const { bodyHtml, stylesheet } = composeApex(inventory, sample, TEST_ORIGIN);
    expect(assertStyleAgreement(bodyHtml, stylesheet)).toEqual({ ok: true, value: null });
  });
});
