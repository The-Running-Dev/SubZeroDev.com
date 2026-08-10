// The committed-inventory cases for S5.5 and S5.9 live in
// tests/content/inventory.test.ts — `projects` may be imported only at that
// call site and Verification's inventory assertion (C14); composeApex's
// tests supply their own fixture Inventory rather than reading `projects`
// from Composition (S5's own scope note). The same applies to `testimonials`
// (C16) — a fixture `Testimonials` stands in here too.

import { describe, expect, it } from "vitest";

import { composeApex } from "../../src/composition";
import { apexFooterQuote, primarySlogan } from "../../src/content";
import type { Inventory, Project, Testimonials } from "../../src/content";
import { assertStyleAgreement } from "../../src/verification";
import { makeProject, makeTestimonial, pid, TEST_ORIGIN } from "../content/fixtures";

function inventory(...projects: readonly [Project, ...Project[]]): Inventory {
  return projects;
}

const alpha = makeProject({ id: pid("alpha"), name: "Alpha", stage: "Prototype" });
const bravo = makeProject({
  id: pid("bravo"),
  name: "Bravo",
  stage: "Reusable",
  escapedFrom: pid("alpha"),
});
const sample: Inventory = inventory(alpha, bravo);

const testimonials: Testimonials = [
  makeTestimonial({ quote: "A sample quote.", author: "A Sample Author" }),
];

describe("S5.5 — composeApex's bodyHtml carries project names, the slogan, the footer quote and every testimonial", () => {
  const { bodyHtml } = composeApex(sample, testimonials, TEST_ORIGIN);

  it.each(sample.map((p) => p.name))("contains project name %s", (name) => {
    expect(bodyHtml).toContain(name);
  });

  it("contains primarySlogan", () => {
    expect(bodyHtml).toContain(primarySlogan);
  });

  it("contains apexFooterQuote", () => {
    expect(bodyHtml).toContain(apexFooterQuote);
  });

  it.each(testimonials.map((t) => t.quote))("contains testimonial quote %s", (quote) => {
    expect(bodyHtml).toContain(quote);
  });
});

describe("S5.6 — composeApex is deterministic", () => {
  it("returns byte-identical bodyHtml and stylesheet for the same inventory and testimonials on repeated calls", () => {
    const first = composeApex(sample, testimonials, TEST_ORIGIN);
    const second = composeApex(sample, testimonials, TEST_ORIGIN);
    expect(first.bodyHtml).toBe(second.bodyHtml);
    expect(first.stylesheet).toBe(second.stylesheet);
  });
});

describe("S5.7 — no figure on the page is a typed literal (X1)", () => {
  it("removing a project changes the total, its stage count and the ecosystem grouping", () => {
    const full = composeApex(sample, testimonials, TEST_ORIGIN).bodyHtml;
    const reduced = composeApex(inventory(bravo), testimonials, TEST_ORIGIN).bodyHtml;

    expect(reduced).not.toBe(full);
    expect(reduced).not.toContain(alpha.name);
    expect(full).toContain(`${sample.length} projects.`);
    expect(reduced).toContain("1 projects.");
  });
});

describe("S5.8 — interpolated Content strings are escaped (X5)", () => {
  const dangerous = `<b>&"'>`;
  const inv = inventory(
    makeProject({
      id: pid("hazard"),
      name: `Name ${dangerous}`,
      line: `Line ${dangerous}`,
      question: `Question ${dangerous}`,
    }),
  );
  const { bodyHtml } = composeApex(inv, testimonials, TEST_ORIGIN);

  it("does not carry the raw fixture text in text position", () => {
    expect(bodyHtml).not.toContain(`Name ${dangerous}`);
    expect(bodyHtml).not.toContain(`Line ${dangerous}`);
    expect(bodyHtml).not.toContain(`Question ${dangerous}`);
  });

  it("carries the escaped equivalents", () => {
    const escaped = "&lt;b&gt;&amp;&quot;&#39;&gt;";
    expect(bodyHtml).toContain(`Name ${escaped}`);
    expect(bodyHtml).toContain(`Line ${escaped}`);
    expect(bodyHtml).toContain(`Question ${escaped}`);
  });
});

describe("S5.9 — assertStyleAgreement holds for composeApex", () => {
  it("returns ok: true for a fixture inventory", () => {
    const { bodyHtml, stylesheet } = composeApex(sample, testimonials, TEST_ORIGIN);
    expect(assertStyleAgreement(bodyHtml, stylesheet)).toEqual({ ok: true, value: null });
  });
});

describe("X7 — composeApex omits EcosystemGroups that carry no projects", () => {
  // Inventory has only Prototype projects; Architecture, Curiosity, etc. carry zero.
  const prototypeOnly = inventory(makeProject({ id: pid("p1"), stage: "Prototype" }));
  const { bodyHtml } = composeApex(prototypeOnly, testimonials, TEST_ORIGIN);

  it("does not render a heading for a stage with no projects", () => {
    // Each group heading is rendered as `<h3>Stage (count)</h3>`.
    expect(bodyHtml).not.toContain("Architecture (0)");
    expect(bodyHtml).not.toContain("Curiosity (0)");
    expect(bodyHtml).not.toContain("Infrastructure (0)");
    expect(bodyHtml).not.toContain("Reusable (0)");
    expect(bodyHtml).not.toContain("Escaped (0)");
  });

  it("does render the stage that has projects", () => {
    expect(bodyHtml).toContain("Prototype (1)");
  });
});

describe("S5.10 — composeApex's bodyHtml contains no form, iframe or on* attribute (X3), and exactly two scripts — ld+json (X6) and the enhancement script (X10)", () => {
  const { bodyHtml } = composeApex(sample, testimonials, TEST_ORIGIN);

  it("no <form>", () => {
    expect(bodyHtml.toLowerCase()).not.toContain("<form");
  });

  it("no <iframe>", () => {
    expect(bodyHtml.toLowerCase()).not.toContain("<iframe");
  });

  it("no on* attribute", () => {
    expect(bodyHtml).not.toMatch(/\son[a-zA-Z]+\s*=/i);
  });

  it("exactly two <script> elements — the ld+json block and the enhancement script (X6, X10)", () => {
    const matches = bodyHtml.match(/<script\b/gi) ?? [];
    expect(matches).toHaveLength(2);
    expect(bodyHtml).toContain('<script type="application/ld+json">');
    expect(bodyHtml).toMatch(/<script>[^]*<\/script>$/);
  });

  it("the ld+json block carries no </script sequence in any case", () => {
    const match = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i.exec(bodyHtml);
    expect(match).not.toBeNull();
    expect(match![1]!.toLowerCase()).not.toContain("</script");
  });

  it("the ld+json block holds a valid Organization object naming the origin", () => {
    const match = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i.exec(bodyHtml);
    expect(match).not.toBeNull();
    const parsed: unknown = JSON.parse(match![1]!);
    expect(parsed).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Organization",
      url: TEST_ORIGIN,
    });
  });
});

describe("the testimonials section renders every quote and author, in input order, always visible", () => {
  const first = makeTestimonial({ quote: "First quote.", author: "First Author" });
  const second = makeTestimonial({
    quote: "Second quote.",
    author: "Second Author",
    role: "Second Role",
  });
  const { bodyHtml } = composeApex(sample, [first, second], TEST_ORIGIN);

  it("contains every quote and author", () => {
    for (const t of [first, second]) {
      expect(bodyHtml).toContain(t.quote);
      expect(bodyHtml).toContain(t.author);
    }
  });

  it("author offsets ascend in input order", () => {
    const firstIndex = bodyHtml.indexOf(first.author);
    const secondIndex = bodyHtml.indexOf(second.author);
    expect(firstIndex).toBeGreaterThan(-1);
    expect(secondIndex).toBeGreaterThan(firstIndex);
  });

  it("renders under an id the nav can reach, with no hidden attribute", () => {
    expect(bodyHtml).toContain('id="testimonials"');
    expect(bodyHtml).not.toMatch(/id="testimonials"[^>]*\shidden/);
  });
});
