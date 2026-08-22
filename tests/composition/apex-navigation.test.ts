// The header and footer navigation added on 2026-08-07, five entries wide
// since S18. These cases use a fixture Inventory rather than `projects`
// (C14); the committed-inventory half — that `publishing` still resolves so
// the nav's one remaining derived link does not silently vanish, and that
// `portfolio` still resolves so the ecosystem list keeps its own link
// (S18.7) — lives in tests/content/inventory.test.ts, the permitted call site.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";
import { describe, expect, it } from "vitest";

import { composeApex, composeCv, composePortfolio } from "../../src/composition";
import { escapeHtml } from "../../src/composition/escape-html";
import { sourceUrl } from "../../src/content";
import type { CvData, Inventory, PortfolioData, Project, Testimonials } from "../../src/content";
import { primitives } from "../../src/presentation";
import { assertStyleAgreement } from "../../src/verification";
import { listTsFiles } from "../helpers/import-graph";
import {
  makeCv,
  makePortfolio,
  makeProject,
  makeTestimonial,
  pid,
  TEST_ORIGIN,
  url,
} from "../content/fixtures";

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

const testimonials: Testimonials = [makeTestimonial()];

describe("the nav bar renders through the `bar` primitive", () => {
  const { bodyHtml } = composeApex(full, testimonials, TEST_ORIGIN);

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
  const { bodyHtml } = composeApex(full, testimonials, TEST_ORIGIN);
  const anchors = [...bodyHtml.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]!);

  it("emits four in-page anchors — Effortless Action, The Echo System, Contamination and Testimonials, all on the same document", () => {
    expect(anchors).toHaveLength(4);
  });

  it.each(["effortless-action", "echo-system", "contamination", "testimonials"])(
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

  it("none of the four sections carries a hidden attribute — all stay visible on the one page", () => {
    for (const anchor of anchors) {
      expect(bodyHtml).not.toMatch(new RegExp(`id="${anchor}"[^>]*\\shidden`));
    }
  });
});

describe("the nav link text is the section heading, not a second copy of it", () => {
  const { bodyHtml } = composeApex(full, testimonials, TEST_ORIGIN);

  it.each(["Effortless Action", "The Echo System", "Contamination"])(
    "%s appears as both a heading and a nav link",
    (heading) => {
      expect(bodyHtml).toContain(`<h2>${heading}</h2>`);
      expect(bodyHtml).toContain(`>${heading}</a>`);
    },
  );
});

describe("the testimonials nav link is a short label, distinct from its own heading", () => {
  const { bodyHtml } = composeApex(full, testimonials, TEST_ORIGIN);

  it("the nav carries a #testimonials link labelled Testimonials", () => {
    expect(bodyHtml).toContain(`href="#testimonials">Testimonials</a>`);
  });

  it("the section's own heading is the long joke sentence, not the nav's short label", () => {
    expect(bodyHtml).toContain(
      "<h2>You Can Absolutely 1,000% Believe Something Written on a Page of Internet.</h2>",
    );
  });
});

const cv = makeCv() as CvData;
const portfolioData = makePortfolio() as PortfolioData;
const cvPath = "/cv/";
const portfolioPath = "/portfolio/";

// S18 — the masthead's five entries. Each route composes the same header and
// footer, and each marks a different one of the three current — asserted
// once per route below rather than only against the apex, since S18.3 and
// S18.8 are properties of all three.
const routes = [
  { name: "apex", ...composeApex(full, testimonials, TEST_ORIGIN), path: "/" },
  { name: "CV", ...composeCv(full, cv, TEST_ORIGIN), path: cvPath },
  { name: "portfolio", ...composePortfolio(full, portfolioData, TEST_ORIGIN), path: portfolioPath },
];

// The two `bar` elements a route emits: the header's `<nav>` and the footer's
// `<div>`. Extracted once here rather than by each assertion, because every
// S18 criterion below is a property of those two rather than of the whole
// document — a label like "Portfolio" is also a project `name` and renders a
// third time in the ecosystem list.
function barsOf(bodyHtml: string): readonly string[] {
  return [...bodyHtml.matchAll(/<(nav|div) class="bar">(.*?)<\/\1>/gs)].map((m) => m[2]!);
}

// The outbound group inside one bar — `renderOutbound`'s own output, which is
// what `S18.4` compares between the header and the footer. It is the *last*
// `meta` paragraph in both positions: the header nav puts the in-page links
// in the first, and the apex and CV footers put their quote ahead of it.
function outboundOf(bar: string): string {
  const metas = [...bar.matchAll(/<p class="meta">(.*?)<\/p>/gs)].map((m) => m[1]!);
  return metas[metas.length - 1]!;
}

describe("the outbound group carries SubZeroDev.com, Blog, Projects, Portfolio and CV", () => {
  const { bodyHtml } = composeApex(full, testimonials, TEST_ORIGIN);

  it("SubZeroDev.com's href is the origin, slashed", () => {
    expect(bodyHtml).toContain(`href="${TEST_ORIGIN}/" aria-current="page">SubZeroDev.com</a>`);
  });

  // S18.1 is asserted against each of the three routes that carry the
  // masthead, not against the apex alone: the order is the criterion, and a
  // route that composed the group some other way would otherwise pass.
  it.each(routes)("S18.1 — $name renders the five in order in both bars", ({ bodyHtml: html }) => {
    const bars = barsOf(html);
    expect(bars).toHaveLength(2);
    for (const bar of bars) {
      const indices = [">SubZeroDev.com</a>", ">Blog</a>", ">Projects</a>", ">Portfolio</a>", ">CV</a>"].map(
        (needle) => bar.indexOf(needle),
      );
      for (const i of indices) expect(i).toBeGreaterThanOrEqual(0);
      for (let i = 1; i < indices.length; i++) {
        expect(indices[i - 1]!).toBeLessThan(indices[i]!);
      }
    }
  });

  it("Blog's href is the publishing project's own home, not a restated URL", () => {
    expect(bodyHtml).toContain(`href="https://blog.example.test">Blog</a>`);
  });

  it("S18.2 — Portfolio's masthead entry is origin + portfolioPath, not the inventory's portfolio home", () => {
    expect(bodyHtml).toContain(`href="${TEST_ORIGIN}${portfolioPath}">Portfolio</a>`);
    // The inventory's own portfolio record keeps its own link in the
    // ecosystem list (S18.7) — its href is checked in the two nav bars only,
    // since the ecosystem entry legitimately shares the same href and label.
    const bars = [...bodyHtml.matchAll(/<(nav|div) class="bar">(.*?)<\/\1>/gs)].map((m) => m[2]!);
    for (const bar of bars) {
      expect(bar).not.toContain(`href="https://portfolio.example.test">Portfolio</a>`);
    }
  });

  it("S18.2 — CV's href is origin + cvPath", () => {
    expect(bodyHtml).toContain(`href="${TEST_ORIGIN}${cvPath}">CV</a>`);
  });

  it("Projects' href is Content's sourceUrl", () => {
    expect(bodyHtml).toContain(`href="${sourceUrl}">Projects</a>`);
  });

  // Counted inside the two bars rather than over the whole document: a label
  // like "Portfolio" is also a project `name`, so it legitimately renders a
  // third time in the ecosystem list and a naive count over bodyHtml is wrong.
  it.each(["SubZeroDev.com", "Blog", "Projects", "Portfolio", "CV"])(
    "%s appears in both the header nav and the footer",
    (label) => {
      const bars = [...bodyHtml.matchAll(/<(nav|div) class="bar">(.*?)<\/\1>/gs)].map((m) => m[2]!);
      expect(bars).toHaveLength(2);
      for (const bar of bars) {
        expect(bar).toContain(`>${label}</a>`);
      }
    },
  );

  it("SubZeroDev.com carries link-current and aria-current=page in both bars", () => {
    expect(bodyHtml).toContain(
      `class="${primitives.link.className} ${primitives["link-current"].className}" href="${TEST_ORIGIN}/" aria-current="page">SubZeroDev.com</a>`,
    );
    const occurrences = bodyHtml.split(">SubZeroDev.com</a>").length - 1;
    expect(occurrences).toBe(2);
    expect(
      bodyHtml.split(
        `class="${primitives.link.className} ${primitives["link-current"].className}"`,
      ).length - 1,
    ).toBe(2);
  });

  it.each(["Blog", "Projects", "Portfolio", "CV"])(
    "%s does not carry link-current or aria-current on the apex",
    (label) => {
      for (const match of bodyHtml.matchAll(new RegExp(`<a class="([^"]*)"[^>]*>${label}</a>`, "g"))) {
        expect(match[1]).not.toContain(primitives["link-current"].className);
        expect(match[0]).not.toContain("aria-current");
      }
    },
  );
});

describe("S18.3, S18.4 — exactly one masthead entry is current, on each of the three routes", () => {
  const labelFor: Record<string, string> = { "/": "SubZeroDev.com", [cvPath]: "CV", [portfolioPath]: "Portfolio" };

  it.each(routes)("$name marks exactly the entry whose href equals origin + its own path", ({ bodyHtml, path }) => {
    const bars = [...bodyHtml.matchAll(/<(nav|div) class="bar">(.*?)<\/\1>/gs)].map((m) => m[2]!);
    expect(bars).toHaveLength(2);
    const currentLabel = labelFor[path]!;
    for (const bar of bars) {
      const currentMatches = [
        ...bar.matchAll(new RegExp(`<a class="([^"]*)" href="([^"]*)" aria-current="page">([^<]*)</a>`, "g")),
      ];
      expect(currentMatches).toHaveLength(1);
      const [, classAttr, href, label] = currentMatches[0]!;
      expect(label).toBe(currentLabel);
      expect(href).toBe(`${TEST_ORIGIN}${path}`);
      expect(classAttr).toContain(primitives["link-current"].className);
    }
  });

  // Compared as strings rather than counted: a footer passing a different
  // `currentPath` still renders exactly one current entry per bar, so a count
  // of one-per-bar passes while the two bars disagree about which route is
  // being read. Identity is the criterion, and it is what "from the same
  // helper" means.
  it.each(routes)("S18.4 — $name's footer repeats the header's group verbatim", ({ bodyHtml: html }) => {
    const bars = barsOf(html);
    expect(bars).toHaveLength(2);
    const [header, footer] = bars.map(outboundOf) as [string, string];
    expect(footer).toBe(header);
    expect([...header.matchAll(/aria-current="page"/g)]).toHaveLength(1);
  });
});

describe("S18.5 — Blog is still dropped, not faked, when the inventory carries no publishing id", () => {
  it.each(routes.map((r) => r.name))("%s: no Blog link when the inventory has no publishing record", (name) => {
    const only = inventory(portfolio);
    const bodyHtml =
      name === "apex"
        ? composeApex(only, testimonials, TEST_ORIGIN).bodyHtml
        : name === "CV"
          ? composeCv(only, cv, TEST_ORIGIN).bodyHtml
          : composePortfolio(only, portfolioData, TEST_ORIGIN).bodyHtml;
    expect(bodyHtml).not.toContain(">Blog</a>");
  });
});

// S18.6 asserted rather than reviewed. The criterion's own wording is "has no
// call site, asserted over `src/composition/`" — a comment claiming Portfolio
// is a lookup, or a reintroduced lookup contradicting the comment, is what
// this suite catches. The call sites are found on the AST rather than by
// scanning text, on `tests/helpers/import-graph.ts`'s reasoning: a call form
// quoted inside a comment or a string is not a call site.
describe("S18.6 — homeOf resolves Blog alone, and header.ts's comment says so", () => {
  const compositionDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../src/composition");

  function homeOfIds(source: string): string[] {
    const file = ts.createSourceFile("source.ts", source, ts.ScriptTarget.Latest, true);
    const ids: string[] = [];
    const visit = (node: ts.Node): void => {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "homeOf" &&
        node.arguments.length > 1 &&
        ts.isStringLiteralLike(node.arguments[1]!)
      ) {
        ids.push((node.arguments[1] as ts.StringLiteralLike).text);
      }
      ts.forEachChild(node, visit);
    };
    visit(file);
    return ids;
  }

  it("no file under src/composition calls homeOf with any id but publishing", () => {
    const files = listTsFiles(compositionDir);
    expect(files.length).toBeGreaterThan(0);
    const ids = files.flatMap((file) => homeOfIds(readFileSync(file, "utf8")));
    expect([...new Set(ids)]).toEqual(["publishing"]);
  });

  it("the check has teeth: a reintroduced portfolio lookup is flagged", () => {
    expect(homeOfIds('const p = target("Portfolio", homeOf(hrefById, "portfolio"));')).toEqual([
      "portfolio",
    ]);
  });

  it("homeOf's comment names Blog and no longer names Portfolio", () => {
    const source = readFileSync(resolve(compositionDir, "header.ts"), "utf8");
    const comment = source.slice(0, source.indexOf("function homeOf(")).split("\n\n").at(-1)!;
    expect(comment).toContain("Blog");
    expect(comment).not.toContain("Portfolio");
  });
});

describe("S18.8 — assertStyleAgreement holds for all three routes carrying the five-entry masthead", () => {
  it.each(routes)("$name", ({ bodyHtml, stylesheet }) => {
    expect(assertStyleAgreement(bodyHtml, stylesheet)).toEqual({ ok: true, value: null });
  });
});

describe('S18.9 — a fixture origin containing <, >, &, ", \' is escaped in the href on all three routes', () => {
  const dirtyOrigin = `https://sub<>&"'zerodev.test`;

  it("Portfolio's and CV's hrefs are escaped on the apex", () => {
    const { bodyHtml } = composeApex(full, testimonials, dirtyOrigin);
    expect(bodyHtml).toContain(`href="${escapeHtml(dirtyOrigin)}${portfolioPath}">Portfolio</a>`);
    expect(bodyHtml).toContain(`href="${escapeHtml(dirtyOrigin)}${cvPath}">CV</a>`);
    expect(bodyHtml).not.toContain(`href="${dirtyOrigin}${portfolioPath}"`);
  });

  it("SubZeroDev.com's href is escaped on the CV route", () => {
    const { bodyHtml } = composeCv(full, cv, dirtyOrigin);
    expect(bodyHtml).toContain(`href="${escapeHtml(dirtyOrigin)}/">SubZeroDev.com</a>`);
  });

  it("SubZeroDev.com's href is escaped on the portfolio route", () => {
    const { bodyHtml } = composePortfolio(full, portfolioData, dirtyOrigin);
    expect(bodyHtml).toContain(`href="${escapeHtml(dirtyOrigin)}/">SubZeroDev.com</a>`);
  });
});

// The fragility the composition comment names, pinned rather than described:
// the two derived links are found by the id strings written in apex.ts, so a
// renamed record drops its link with no error. This is what that looks like.
describe("a derived link is dropped — not faked — when its project is absent", () => {
  it("no Blog link when nothing carries the publishing id — Portfolio survives, being S18's own route rather than a lookup", () => {
    const { bodyHtml } = composeApex(inventory(portfolio), testimonials, TEST_ORIGIN);
    expect(bodyHtml).not.toContain(">Blog</a>");
    expect(bodyHtml).toContain(">Portfolio</a>");
  });

  it("Projects and Portfolio survive regardless, being constants rather than lookups", () => {
    const { bodyHtml } = composeApex(
      inventory(makeProject({ id: pid("unrelated") })),
      testimonials,
      TEST_ORIGIN,
    );
    expect(bodyHtml).toContain(`href="${sourceUrl}">Projects</a>`);
    expect(bodyHtml).toContain(`href="${TEST_ORIGIN}${portfolioPath}">Portfolio</a>`);
    expect(bodyHtml).not.toContain(">Blog</a>");
  });
});

describe("X4 — the nav does not break markup/stylesheet agreement", () => {
  it("assertStyleAgreement holds for a body carrying the nav", () => {
    const { bodyHtml, stylesheet } = composeApex(full, testimonials, TEST_ORIGIN);
    expect(assertStyleAgreement(bodyHtml, stylesheet)).toEqual({ ok: true, value: null });
  });
});
