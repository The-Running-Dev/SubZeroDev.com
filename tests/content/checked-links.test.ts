import { describe, expect, it } from "vitest";

import { checkedLinks, cvOutboundLinks, sourceUrl, validateInventory } from "../../src/content";
import type { CvData, Inventory, Project } from "../../src/content";
import { context, makeCv, makeProject, pid, url } from "./fixtures";
import { cv as committedCv, projects } from "../helpers/site-data";

function inventoryOf(...overrides: readonly Partial<Project>[]): Inventory {
  const result = validateInventory(
    overrides.map((o) => makeProject(o)),
    context,
  );
  if (!result.ok) {
    throw new Error(`expected fixture to validate: ${result.errors.map((e) => e.code).join(", ")}`);
  }
  return result.value;
}

// makeCv()'s fixture is a well-formed CvDocument; the brand is earned at
// runtime by validateCv, which these tests don't need to exercise.
const baseCv = makeCv() as unknown as CvData;

describe("S14.3 — checkedLinks(inventory, cv) (invariant C17)", () => {
  it("yields one entry per resolved home, labelled by its projectId, plus one for sourceUrl", () => {
    const inventory = inventoryOf(
      { id: pid("owner"), home: { kind: "own", url: url("https://blog.subzerodev.com") } },
      { id: pid("homeless"), home: { kind: "none" } },
    );
    const cv = { ...baseCv, header: { ...baseCv.header, links: [] }, roles: [], projects: [], openSource: [] };

    const links = checkedLinks(inventory, cv as unknown as CvData);

    expect(links).toHaveLength(2);
    expect(links.map((l) => l.label).sort()).toEqual(["owner", "sourceUrl"]);
    const sourceEntry = links.find((l) => l.label === "sourceUrl");
    expect(sourceEntry?.url).toBe(sourceUrl);
  });
});

describe("S14.4 — checkedLinks does not deduplicate", () => {
  it("two records resolving to the same URL yield two entries with different labels", () => {
    const inventory = inventoryOf(
      { id: pid("first"), home: { kind: "own", url: url("https://portfolio.subzerodev.com") } },
      { id: pid("second"), home: { kind: "own", url: url("https://portfolio.subzerodev.com") } },
    );
    const cv = { ...baseCv, header: { ...baseCv.header, links: [] }, roles: [], projects: [], openSource: [] };

    const links = checkedLinks(inventory, cv as unknown as CvData).filter(
      (l) => l.url === "https://portfolio.subzerodev.com",
    );

    expect(links).toHaveLength(2);
    expect(links.map((l) => l.label).sort()).toEqual(["first", "second"]);
  });
});

describe("S14.5 — checkedLinks over the committed inventory reaches sourceUrl", () => {
  it("contains sourceUrl", () => {
    const inventory = validateInventory(projects, context);
    if (!inventory.ok) {
      throw new Error(`inventory failed to validate: ${inventory.errors.map((e) => e.code).join(", ")}`);
    }

    const links = checkedLinks(inventory.value, committedCv as unknown as CvData);

    expect(links.some((l) => l.url === sourceUrl)).toBe(true);
  });
});

describe("S15.14 — checkedLinks additionally carries the CV's four link-bearing field paths", () => {
  it("counts an absent roles[].website and an absent openSource[].link as no entry", () => {
    const inventory = inventoryOf({ id: pid("only"), home: { kind: "none" } });
    const { website: _website, ...roleWithoutWebsite } = baseCv.roles[0]!;
    const { link: _link, ...openSourceWithoutLink } = baseCv.openSource[0]!;
    const cv = {
      ...baseCv,
      header: { ...baseCv.header, links: [{ label: "L", href: url("https://a.example.com") }] },
      roles: [roleWithoutWebsite],
      projects: [{ ...baseCv.projects[0]!, link: url("https://b.example.com") }],
      openSource: [openSourceWithoutLink],
    } as unknown as CvData;

    const links = checkedLinks(inventory, cv);
    const cvLabels = links.map((l) => l.label).filter((l) => l.startsWith("header.") || l.startsWith("roles[") || l.startsWith("projects[") || l.startsWith("openSource["));

    expect(cvLabels.sort()).toEqual(["header.links[0].href", "projects[0].link"]);
  });

  it("over the committed site/cv.json, yields the four field paths' worth of entries", () => {
    const inventory = validateInventory(projects, context);
    if (!inventory.ok) {
      throw new Error(`inventory failed to validate: ${inventory.errors.map((e) => e.code).join(", ")}`);
    }
    const cv = committedCv as unknown as CvData;

    const expectedCount =
      cv.header.links.length +
      cv.roles.filter((r) => r.website !== undefined).length +
      cv.projects.length +
      cv.openSource.filter((o) => o.link !== undefined).length;

    expect(cvOutboundLinks(cv)).toHaveLength(expectedCount);
  });
});

describe("S15.15 — cvOutboundLinks returns the CV half alone", () => {
  it("needs no inventory in scope", () => {
    const links = cvOutboundLinks(baseCv);
    expect(links.length).toBeGreaterThan(0);
    expect(links.every((l) => l.label !== "sourceUrl")).toBe(true);
  });
});

describe("S15.16 — checkedLinks still does not deduplicate across the two halves", () => {
  it("the committed CV header's Portfolio link and the inventory's portfolio record both appear", () => {
    const inventory = validateInventory(projects, context);
    if (!inventory.ok) {
      throw new Error(`inventory failed to validate: ${inventory.errors.map((e) => e.code).join(", ")}`);
    }
    const cv = committedCv as unknown as CvData;

    const links = checkedLinks(inventory.value, cv).filter((l) => l.url === "https://portfolio.subzerodev.com");

    expect(links.length).toBeGreaterThanOrEqual(2);
  });
});
