// composeCv's own acceptance criteria (S16.3, S16.4, S16.7, S16.8, S16.9,
// S16.10). The committed-CV cases for S16.2/S16.5/S16.6/S16.11/S16.12 read
// the real build output and live in tests/build/ — this file supplies its
// own fixture CvData, on the same footing tests/composition/apex.test.ts
// supplies its own fixture Inventory and Testimonials (S16's own scope
// note, mirroring S5's).

import { describe, expect, it } from "vitest";

import { composeCv } from "../../src/composition";
import { checkedLinks, resolvedHomes, sourceUrl } from "../../src/content";
import type { CvData, Inventory, Project } from "../../src/content";
import { assertStyleAgreement } from "../../src/verification";
import { makeCv, makeProject, pid, TEST_ORIGIN, yr } from "../content/fixtures";

function inventory(...projects: readonly [Project, ...Project[]]): Inventory {
  return projects;
}

const alpha = makeProject({ id: pid("alpha"), name: "Alpha", stage: "Prototype" });
const sample: Inventory = inventory(alpha);

const cv = makeCv() as CvData;

describe("S16.3 — assertStyleAgreement holds for the CV route's ComposedRoute", () => {
  it("returns ok: true", () => {
    const { bodyHtml, stylesheet } = composeCv(sample, cv, TEST_ORIGIN);
    expect(assertStyleAgreement(bodyHtml, stylesheet)).toEqual({ ok: true, value: null });
  });
});

describe("S16.4 — the CV body carries no view class", () => {
  it("bodyHtml contains no class attribute naming view", () => {
    const { bodyHtml } = composeCv(sample, cv, TEST_ORIGIN);
    expect(bodyHtml).not.toMatch(/class="[^"]*\bview\b[^"]*"/);
  });
});

describe("S16.7 — a CvData field carrying <, >, &, \", ' is escaped in text and attribute position", () => {
  it("the fixture's escaped form appears in bodyHtml and the raw form does not", () => {
    const dirty = {
      ...cv,
      header: { ...cv.header, name: `A & B <C> "D" 'E'` },
    } as CvData;
    const { bodyHtml } = composeCv(sample, dirty, TEST_ORIGIN);
    expect(bodyHtml).toContain("A &amp; B &lt;C&gt; &quot;D&quot; &#39;E&#39;");
    expect(bodyHtml).not.toContain(`A & B <C> "D" 'E'`);
  });

  it("a CvData field carrying a literal </script survives as no more than the Person block's own script tag", () => {
    const dirty = {
      ...cv,
      quote: "</script><script>alert(1)</script>",
    } as CvData;
    const { bodyHtml } = composeCv(sample, dirty, TEST_ORIGIN);
    expect(bodyHtml.match(/<script\b/gi) ?? []).toHaveLength(1);
  });
});

describe("S16.8 — every CvData outbound URL the body renders appears in checkedLinks for that document", () => {
  it("body hrefs, minus the masthead's own and mailto:, are a subset of checkedLinks' URLs", () => {
    const { bodyHtml } = composeCv(sample, cv, TEST_ORIGIN);
    const links = checkedLinks(sample, cv).map((l) => l.url);
    const mastheadUrls = new Set<string>([
      `${TEST_ORIGIN}/`,
      `${TEST_ORIGIN}/cv/`,
      `${TEST_ORIGIN}/portfolio/`,
      ...resolvedHomes(sample).map((h) => h.url),
      sourceUrl,
    ]);
    const hrefs = [...bodyHtml.matchAll(/href="([^"]+)"/g)]
      .map((m) => m[1]!)
      .filter((href) => !href.startsWith("mailto:"))
      .filter((href) => !mastheadUrls.has(href));

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(links).toContain(href);
    }
  });
});

describe("S16.9 — composeCv renders no project entry, stage grouping, contamination chain or count from the inventory", () => {
  it("a sentinel inventory line never appears in bodyHtml", () => {
    const sentinel = inventory(
      makeProject({ id: pid("sentinel"), name: "Sentinel", line: "SENTINEL_LINE_VALUE_ZZZ" }),
    );
    const { bodyHtml } = composeCv(sentinel, cv, TEST_ORIGIN);
    expect(bodyHtml).not.toContain("SENTINEL_LINE_VALUE_ZZZ");
  });
});

describe("S16.10 — no figure on the CV document is a literal in src/composition/", () => {
  it("a role's period and a project's year both flow through unchanged, rather than a hardcoded value", () => {
    const withFigures = {
      ...cv,
      roles: [{ ...cv.roles[0]!, period: "1111 – 1112" }],
      projects: [{ ...cv.projects[0]!, year: yr(1113) }],
    } as CvData;
    const { bodyHtml } = composeCv(sample, withFigures, TEST_ORIGIN);
    expect(bodyHtml).toContain("1111 – 1112");
    expect(bodyHtml).toContain("1113");
  });
});
