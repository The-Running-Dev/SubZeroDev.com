// S15.6-S15.7 — validatePortfolio's own semantic checks, below the document
// validator. Fixtures are deep-cloned plain JSON, typed loosely so a single
// dotted path can be mutated without fighting PortfolioDocument's readonly
// tuples — validatePortfolio is the function under test, not the type
// system.

import { describe, expect, it } from "vitest";

import { validatePortfolio } from "../../src/content";
import type { PortfolioDocument } from "../../src/content";
import { makePortfolio } from "./fixtures";

function clone(): any {
  return JSON.parse(JSON.stringify(makePortfolio()));
}

function codesOf(portfolio: any): string[] {
  const result = validatePortfolio(portfolio as PortfolioDocument);
  if (result.ok) return [];
  return result.errors.map((e) => e.code);
}

describe("S15.3 — validatePortfolio accepts a well-formed document", () => {
  it("returns ok: true for the base fixture", () => {
    expect(validatePortfolio(makePortfolio()).ok).toBe(true);
  });
});

describe("S15.6 — validatePortfolio raises its four codes", () => {
  it("PortfolioFieldEmpty on an empty required string, naming its dotted path", () => {
    const portfolio = clone();
    portfolio.header.subtitle = "  ";
    const result = validatePortfolio(portfolio as PortfolioDocument);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        code: "PortfolioFieldEmpty",
        projectId: null,
        field: "header.subtitle",
      });
    }
  });

  it("PortfolioFieldEmpty on PortfolioStat.value specifically", () => {
    const portfolio = clone();
    portfolio.stats[0].value = "";
    expect(codesOf(portfolio)).toEqual(["PortfolioFieldEmpty"]);
  });

  it("PortfolioCollectionEmpty on an empty top-level collection", () => {
    const portfolio = clone();
    portfolio.projects = [];
    const result = validatePortfolio(portfolio as PortfolioDocument);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({ code: "PortfolioCollectionEmpty", field: "projects" });
    }
  });

  it("PortfolioCollectionEmpty on a present-but-empty TechNode.children", () => {
    const portfolio = clone();
    portfolio.technologies[0].children = [];
    expect(codesOf(portfolio)).toEqual(["PortfolioCollectionEmpty"]);
  });

  it("an absent TechNode.children is valid — that is how a leaf is spelled", () => {
    const portfolio = clone();
    delete portfolio.technologies[0].children;
    expect(validatePortfolio(portfolio as PortfolioDocument).ok).toBe(true);
  });

  it("PortfolioTechDepthExceeded on a fourth level", () => {
    const portfolio = clone();
    portfolio.technologies = [
      {
        name: "Level 1",
        children: [{ name: "Level 2", children: [{ name: "Level 3", children: [{ name: "Level 4" }] }] }],
      },
    ];
    expect(codesOf(portfolio)).toEqual(["PortfolioTechDepthExceeded"]);
  });

  it("a three-level tree passes beside the depth fixture", () => {
    const portfolio = clone();
    portfolio.technologies = [
      { name: "Level 1", children: [{ name: "Level 2", children: [{ name: "Level 3" }] }] },
    ];
    expect(validatePortfolio(portfolio as PortfolioDocument).ok).toBe(true);
  });

  it("PortfolioDuplicateCategory on two top-level technologies entries sharing a name", () => {
    const portfolio = clone();
    portfolio.technologies = [{ name: "Backend" }, { name: "Backend" }];
    expect(codesOf(portfolio)).toEqual(["PortfolioDuplicateCategory"]);
  });

  it("PortfolioDuplicateCategory on two projects entries sharing a category", () => {
    const portfolio = clone();
    portfolio.projects = [
      { category: "Web", icon: "🌐", description: "First." },
      { category: "Web", icon: "🌐", description: "Second." },
    ];
    expect(codesOf(portfolio)).toEqual(["PortfolioDuplicateCategory"]);
  });
});

describe("S15.7 — every fault is reported in one Result, not the first", () => {
  it("a fixture with four independent faults yields four ContentErrors", () => {
    const portfolio = clone();
    portfolio.header.subtitle = "";
    portfolio.projects = [];
    portfolio.technologies = [
      {
        name: "Level 1",
        children: [{ name: "Level 2", children: [{ name: "Level 3", children: [{ name: "Level 4" }] }] }],
      },
      { name: "Level 1" },
    ];
    expect(codesOf(portfolio).sort()).toEqual(
      [
        "PortfolioFieldEmpty",
        "PortfolioCollectionEmpty",
        "PortfolioTechDepthExceeded",
        "PortfolioDuplicateCategory",
      ].sort(),
    );
  });
});
