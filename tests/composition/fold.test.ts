// Coverage for foldRoutes (design/90-decisions.md, 2026-08-08 — "the
// testimonials fold"): the apex and testimonials routes share one nav, and
// switching between them is a same-document `:target` swap, never a second
// script element or a broken self-contained/style-agreement check.

import { describe, expect, it } from "vitest";

import { foldRoutes } from "../../src/composition";
import { enhancementScript } from "../../src/composition/enhancement";
import type { Inventory, Project, Testimonials } from "../../src/content";
import { assertSelfContained, assertStyleAgreement } from "../../src/verification";
import { makeProject, makeTestimonial, pid, TEST_ORIGIN } from "../content/fixtures";

function inventory(...projects: readonly [Project, ...Project[]]): Inventory {
  return projects;
}

const sample: Inventory = inventory(makeProject({ id: pid("alpha"), name: "Alpha" }));
const testimonials: Testimonials = [
  makeTestimonial({ quote: "A folded quote.", author: "A Folded Author" }),
];

const { apex, testimonials: testimonialsRoute } = foldRoutes(sample, testimonials, TEST_ORIGIN);

describe("foldRoutes — both documents carry both views", () => {
  it("each route's bodyHtml carries both data-view blocks", () => {
    for (const route of [apex, testimonialsRoute]) {
      expect(route.bodyHtml).toContain('data-view="apex"');
      expect(route.bodyHtml).toContain('data-view="testimonials"');
    }
  });

  it("each route carries the apex nav once per view — apex view and testimonials view each get their own copy", () => {
    for (const route of [apex, testimonialsRoute]) {
      const occurrences = route.bodyHtml.split('<nav class="bar">').length - 1;
      expect(occurrences).toBe(2);
      expect(route.bodyHtml).toContain("Effortless Action");
      expect(route.bodyHtml).toContain(">Testimonials</a>");
    }
  });

  it("the Testimonials nav link and the back-link are same-document fragments, not a second navigation", () => {
    for (const route of [apex, testimonialsRoute]) {
      expect(route.bodyHtml).toContain('href="#testimonials">Testimonials</a>');
      expect(route.bodyHtml).toContain('href="#apex">Back to');
      expect(route.bodyHtml).not.toContain('href="/testimonials/">Testimonials</a>');
    }
  });

  it("carries every testimonial quote and author", () => {
    for (const route of [apex, testimonialsRoute]) {
      for (const t of testimonials) {
        expect(route.bodyHtml).toContain(t.quote);
        expect(route.bodyHtml).toContain(t.author);
      }
    }
  });
});

describe("foldRoutes — each document defaults to its own route's view", () => {
  it("the apex document defaults to the apex view", () => {
    expect(apex.bodyHtml).toContain("default-apex");
    expect(apex.bodyHtml).toMatch(/data-view="testimonials" hidden/);
  });

  it("the testimonials document defaults to the testimonials view", () => {
    expect(testimonialsRoute.bodyHtml).toContain("default-testimonials");
    expect(testimonialsRoute.bodyHtml).toMatch(/data-view="apex" hidden/);
  });
});

describe("foldRoutes — the hard gates the fold must not touch (X6, V13, X4)", () => {
  it("each route carries exactly the two permitted script elements — the JSON-LD block and the enhancement script (S12.3)", () => {
    for (const route of [apex, testimonialsRoute]) {
      expect(assertSelfContained(route.bodyHtml)).toEqual({ ok: true, value: null });
    }
  });

  it("assertStyleAgreement holds for both folded routes", () => {
    for (const route of [apex, testimonialsRoute]) {
      expect(assertStyleAgreement(route.bodyHtml, route.stylesheet)).toEqual({
        ok: true,
        value: null,
      });
    }
  });
});

describe("S12.3/S12.4 — the enhancement script is strictly additive over the pre-S12 fold", () => {
  const scriptTag = `<script>${enhancementScript()}</script>`;

  it("each route's bodyHtml ends with exactly one occurrence of the enhancement script tag", () => {
    for (const route of [apex, testimonialsRoute]) {
      expect(route.bodyHtml.endsWith(scriptTag)).toBe(true);
      expect(route.bodyHtml.split(scriptTag)).toHaveLength(2);
    }
  });

  it("removing the enhancement script tag reproduces the pre-S12 fold byte for byte — same views, same nav, same single script", () => {
    for (const route of [apex, testimonialsRoute]) {
      const withoutScript = route.bodyHtml.slice(0, -scriptTag.length);

      // Every property tests/composition/fold.test.ts asserted about the
      // fold before S12 still holds of the residual — this is what "byte for
      // byte, except for the added script element" means operationally, the
      // same shape S7.14 uses for the build marker.
      expect(withoutScript).toContain('data-view="apex"');
      expect(withoutScript).toContain('data-view="testimonials"');
      expect(withoutScript).toContain('href="#testimonials">Testimonials</a>');
      expect(withoutScript).toContain('href="#apex">Back to');
      expect(assertSelfContained(withoutScript)).toEqual({ ok: true, value: null });
    }
  });

  it("the apex document's residual (script removed) still defaults to the apex view; the testimonials document's still defaults to testimonials", () => {
    const apexResidual = apex.bodyHtml.slice(0, -scriptTag.length);
    const testimonialsResidual = testimonialsRoute.bodyHtml.slice(0, -scriptTag.length);
    expect(apexResidual).toContain("default-apex");
    expect(testimonialsResidual).toContain("default-testimonials");
  });
});
