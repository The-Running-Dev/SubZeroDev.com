// composePortfolio's own acceptance criteria (S17.3, S17.4, S17.5, S17.8,
// S17.9). The committed-portfolio cases for S17.2/S17.6/S17.7/S17.10/S17.11/
// S17.12 read the real build output and live in tests/build/, on the same
// footing tests/composition/cv.test.ts's own scope note describes.

import { describe, expect, it } from "vitest";

import { composePortfolio } from "../../src/composition";
import type { Inventory, PortfolioData, Project } from "../../src/content";
import { assertStyleAgreement } from "../../src/verification";
import { makePortfolio, makeProject, pid, TEST_ORIGIN } from "../content/fixtures";

function inventory(...projects: readonly [Project, ...Project[]]): Inventory {
  return projects;
}

const alpha = makeProject({ id: pid("alpha"), name: "Alpha", stage: "Prototype" });
const sample: Inventory = inventory(alpha);

const portfolio = makePortfolio() as PortfolioData;

describe("S17.4 — assertStyleAgreement holds for the portfolio route, and the body carries no view class", () => {
  it("returns ok: true", () => {
    const { bodyHtml, stylesheet } = composePortfolio(sample, portfolio, TEST_ORIGIN);
    expect(assertStyleAgreement(bodyHtml, stylesheet)).toEqual({ ok: true, value: null });
  });

  it("bodyHtml contains no class attribute naming view", () => {
    const { bodyHtml } = composePortfolio(sample, portfolio, TEST_ORIGIN);
    expect(bodyHtml).not.toMatch(/class="[^"]*\bview\b[^"]*"/);
  });
});

describe("S17.3 — the technology tree renders every node at every level, with one recursive renderer", () => {
  it("a fixture three levels deep in one branch and one level deep in another renders every node's name", () => {
    const deep: PortfolioData = {
      ...portfolio,
      technologies: [
        {
          name: "Root A",
          children: [
            { name: "Mid A1", children: [{ name: "Leaf A1a" }, { name: "Leaf A1b" }] },
          ],
        },
        { name: "Root B" },
      ],
    } as PortfolioData;
    const { bodyHtml } = composePortfolio(sample, deep, TEST_ORIGIN);
    expect(bodyHtml).toContain("Root A");
    expect(bodyHtml).toContain("Mid A1");
    expect(bodyHtml).toContain("Leaf A1a");
    expect(bodyHtml).toContain("Leaf A1b");
    expect(bodyHtml).toContain("Root B");
  });
});

describe("S17.5 — the composed body carries zero script elements", () => {
  it("no <script tag appears", () => {
    const { bodyHtml } = composePortfolio(sample, portfolio, TEST_ORIGIN);
    expect(bodyHtml.match(/<script\b/gi) ?? []).toHaveLength(0);
  });
});

describe("S17.8 — composePortfolio renders nothing from the inventory but the masthead", () => {
  it("a sentinel inventory line never appears in bodyHtml", () => {
    const sentinel = inventory(
      makeProject({ id: pid("sentinel"), name: "Sentinel", line: "SENTINEL_LINE_VALUE_ZZZ" }),
    );
    const { bodyHtml } = composePortfolio(sentinel, portfolio, TEST_ORIGIN);
    expect(bodyHtml).not.toContain("SENTINEL_LINE_VALUE_ZZZ");
  });
});

describe('S17.9 — a PortfolioData field carrying <, >, &, ", \' is escaped in both positions', () => {
  it("the fixture's escaped form appears in bodyHtml and the raw form does not", () => {
    const dirty = {
      ...portfolio,
      header: { ...portfolio.header, title: `A & B <C> "D" 'E'` },
    } as PortfolioData;
    const { bodyHtml } = composePortfolio(sample, dirty, TEST_ORIGIN);
    expect(bodyHtml).toContain("A &amp; B &lt;C&gt; &quot;D&quot; &#39;E&#39;");
    expect(bodyHtml).not.toContain(`A & B <C> "D" 'E'`);
  });
});
