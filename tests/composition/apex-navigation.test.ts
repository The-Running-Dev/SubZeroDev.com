// The header and footer navigation added on 2026-08-07. These cases use a
// fixture Inventory rather than `projects` (C14); the committed-inventory half
// — that `publishing` and `portfolio` still exist and still resolve, so the
// nav's two derived links do not silently vanish — lives in
// tests/content/inventory.test.ts, which is the permitted call site.

import { describe, expect, it } from "vitest";

import { composeApex } from "../../src/composition";
import { sourceUrl } from "../../src/content";
import type { Inventory, Project } from "../../src/content";
import { primitives } from "../../src/presentation";
import { assertStyleAgreement } from "../../src/verification";
import { makeProject, pid, TEST_ORIGIN, url } from "../content/fixtures";

const publishing = makeProject({
  id: pid("publishing"),
  name: "Publishing",
  stage: "Reusable",
  home: { kind: "own", url: url("https://blog.example.test") },
});

const portfolio = makeProject({
  id: pid("portfolio"),
  name: "Portfolio",
  stage: "Curiosity",
  home: { kind: "own", url: url("https://portfolio.example.test") },
});

const inventory = (...ps: readonly [Project, ...Project[]]): Inventory => ps;

const full: Inventory = inventory(publishing, portfolio);

describe("the nav bar renders through the `bar` primitive", () => {
  const { bodyHtml } = composeApex(full, TEST_ORIGIN);

  it("carries the bar class", () => {
    expect(bodyHtml).toContain(`class="${primitives.bar.className}"`);
  });

  it("uses it twice — once in the header nav, once in the footer", () => {
    const occurrences = bodyHtml.split(`class="${primitives.bar.className}"`).length - 1;
    expect(occurrences).toBe(2);
  });

  it("the header nav is a <nav> element and precedes the first rule", () => {
    expect(bodyHtml).toContain(`<nav class="${primitives.bar.className}">`);
    expect(bodyHtml.indexOf("<nav")).toBeLessThan(bodyHtml.indexOf("<hr"));
  });
});

describe("every in-page anchor resolves to a section that exists in the same document", () => {
  const { bodyHtml } = composeApex(full, TEST_ORIGIN);
  const anchors = [...bodyHtml.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]!);

  it("emits three in-page anchors", () => {
    expect(anchors).toHaveLength(3);
  });

  it.each(["effortless-action", "echo-system", "contamination"])(
    "#%s has a matching id in the body",
    (anchor) => {
      expect(anchors).toContain(anchor);
      expect(bodyHtml).toContain(`id="${anchor}"`);
    },
  );

  it("no anchor points at an id the body does not carry", () => {
    for (const anchor of anchors) {
      expect(bodyHtml).toContain(`id="${anchor}"`);
    }
  });
});

describe("the nav link text is the section heading, not a second copy of it", () => {
  const { bodyHtml } = composeApex(full, TEST_ORIGIN);

  it.each(["Effortless Action", "The Echo System", "Contamination"])(
    "%s appears as both a heading and a nav link",
    (heading) => {
      expect(bodyHtml).toContain(`<h2>${heading}</h2>`);
      expect(bodyHtml).toContain(`>${heading}</a>`);
    },
  );
});

describe("the outbound group carries Blog, Projects and Portfolio", () => {
  const { bodyHtml } = composeApex(full, TEST_ORIGIN);

  it("Blog's href is the publishing project's own home, not a restated URL", () => {
    expect(bodyHtml).toContain(`href="https://blog.example.test">Blog</a>`);
  });

  it("Portfolio's href is the portfolio project's own home", () => {
    expect(bodyHtml).toContain(`href="https://portfolio.example.test">Portfolio</a>`);
  });

  it("Projects' href is Content's sourceUrl", () => {
    expect(bodyHtml).toContain(`href="${sourceUrl}">Projects</a>`);
  });

  // Counted inside the two bars rather than over the whole document: a label
  // like "Portfolio" is also a project `name`, so it legitimately renders a
  // third time in the ecosystem list and a naive count over bodyHtml is wrong.
  it.each(["Blog", "Projects", "Portfolio"])("%s appears in both the header nav and the footer", (label) => {
    const bars = [...bodyHtml.matchAll(/<(nav|div) class="bar">(.*?)<\/\1>/gs)].map((m) => m[2]!);
    expect(bars).toHaveLength(2);
    for (const bar of bars) {
      expect(bar).toContain(`>${label}</a>`);
    }
  });
});

// The fragility the composition comment names, pinned rather than described:
// the two derived links are found by the id strings written in apex.ts, so a
// renamed record drops its link with no error. This is what that looks like.
describe("a derived link is dropped — not faked — when its project is absent", () => {
  it("no Blog link when nothing carries the publishing id", () => {
    const { bodyHtml } = composeApex(inventory(portfolio), TEST_ORIGIN);
    expect(bodyHtml).not.toContain(">Blog</a>");
    expect(bodyHtml).toContain(">Portfolio</a>");
  });

  it("Projects survives regardless, being a constant rather than a lookup", () => {
    const { bodyHtml } = composeApex(
      inventory(makeProject({ id: pid("unrelated") })),
      TEST_ORIGIN,
    );
    expect(bodyHtml).toContain(`href="${sourceUrl}">Projects</a>`);
    expect(bodyHtml).not.toContain(">Blog</a>");
    expect(bodyHtml).not.toContain(">Portfolio</a>");
  });
});

describe("the in-page nav row also carries a route link to Testimonials", () => {
  const { bodyHtml } = composeApex(full, TEST_ORIGIN);

  it('renders a link to "/testimonials/" labelled Testimonials', () => {
    expect(bodyHtml).toContain(`href="/testimonials/">Testimonials</a>`);
  });
});

describe("X4 — the nav does not break markup/stylesheet agreement", () => {
  it("assertStyleAgreement holds for a body carrying the nav", () => {
    const { bodyHtml, stylesheet } = composeApex(full, TEST_ORIGIN);
    expect(assertStyleAgreement(bodyHtml, stylesheet)).toEqual({ ok: true, value: null });
  });
});
