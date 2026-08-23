import { describe, expect, it } from "vitest";

import { checkedLinks, cvOutboundLinks, linkCheckExemptions, resolvedHomes, sourceUrl, validateInventory } from "../../src/content";
import type { AbsoluteUrl, CvData, Inventory, LinkCheckExemption, Project } from "../../src/content";
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

describe("S19.1 — linkCheckExemptions (invariant C19)", () => {
  it("carries exactly one member, exempting https://derivco.com with a recorded reason", () => {
    expect(linkCheckExemptions).toHaveLength(1);
    expect(linkCheckExemptions[0]?.url).toBe("https://derivco.com");
    expect(linkCheckExemptions[0]?.reason.trim().length).toBeGreaterThan(0);
  });
});

describe("S19.2 — checkedLinks omits every URL linkCheckExemptions names", () => {
  it("the exempt address is absent, every other target is present, and surviving labels are unchanged", () => {
    const inventory = inventoryOf({ id: pid("only"), home: { kind: "none" } });
    const cv = {
      ...baseCv,
      header: { ...baseCv.header, links: [] },
      roles: [{ ...baseCv.roles[0]!, website: url("https://derivco.com") }],
      projects: [],
      openSource: [],
    } as unknown as CvData;

    const links = checkedLinks(inventory, cv);

    expect(links.some((l) => l.url === "https://derivco.com")).toBe(false);
    expect(links.map((l) => l.label).sort()).toEqual(["sourceUrl"]);
  });
});

describe("S19.3 — matching is by exact URL, never by host or prefix", () => {
  it("a CV carrying both the exempt address and a distinct path on the same host keeps only the latter", () => {
    const inventory = inventoryOf({ id: pid("only"), home: { kind: "none" } });
    const cv = {
      ...baseCv,
      header: { ...baseCv.header, links: [] },
      roles: [{ ...baseCv.roles[0]!, website: url("https://derivco.com") }],
      projects: [{ ...baseCv.projects[0]!, link: url("https://derivco.com/careers") }],
      openSource: [],
    } as unknown as CvData;

    const links = checkedLinks(inventory, cv).filter((l) => l.url.includes("derivco.com"));

    expect(links).toHaveLength(1);
    expect(links[0]?.url).toBe("https://derivco.com/careers");
  });
});

describe("S19.4 — cvOutboundLinks does not subtract", () => {
  it("called against the S19.2 fixture, still returns the exempt URL", () => {
    const cv = {
      ...baseCv,
      header: { ...baseCv.header, links: [] },
      roles: [{ ...baseCv.roles[0]!, website: url("https://derivco.com") }],
      projects: [],
      openSource: [],
    } as unknown as CvData;

    const links = cvOutboundLinks(cv);

    expect(links.some((l) => l.url === "https://derivco.com")).toBe(true);
  });
});

describe("S19.5 — checkedLinks still returns a non-empty tuple after the subtraction", () => {
  it("element 0 is indexable with no narrowing check, and sourceUrl appears over the committed documents", () => {
    const inventory = validateInventory(projects, context);
    if (!inventory.ok) {
      throw new Error(`inventory failed to validate: ${inventory.errors.map((e) => e.code).join(", ")}`);
    }
    const cv = committedCv as unknown as CvData;

    const links = checkedLinks(inventory.value, cv);
    const first: (typeof links)[0] = links[0];

    expect(first).toBeDefined();
    expect(links.some((l) => l.url === sourceUrl)).toBe(true);
  });
});

describe("C19 — every linkCheckExemption is live, justified and not this repository's own address", () => {
  function liveUrls(): ReadonlySet<AbsoluteUrl> {
    const inventory = validateInventory(projects, context);
    if (!inventory.ok) {
      throw new Error(`inventory failed to validate: ${inventory.errors.map((e) => e.code).join(", ")}`);
    }
    const cv = committedCv as unknown as CvData;
    return new Set([
      ...resolvedHomes(inventory.value).map((h) => h.url),
      ...cvOutboundLinks(cv).map((l) => l.url),
    ]);
  }

  // Each clause checked independently, so a fixture can be crafted to
  // violate exactly one and satisfy the rest (S19.7's "negative count: 4").
  function isLive(exemptions: readonly LinkCheckExemption[]): boolean {
    const urls = liveUrls();
    return exemptions.every((e) => urls.has(e.url));
  }
  function isJustified(exemptions: readonly LinkCheckExemption[]): boolean {
    return exemptions.every((e) => e.reason.trim().length > 0);
  }
  function hasNoDuplicateUrl(exemptions: readonly LinkCheckExemption[]): boolean {
    const seen = new Set<string>();
    for (const e of exemptions) {
      if (seen.has(e.url)) return false;
      seen.add(e.url);
    }
    return true;
  }
  function namesNoSourceUrl(exemptions: readonly LinkCheckExemption[]): boolean {
    return exemptions.every((e) => e.url !== sourceUrl);
  }
  function satisfiesC19(exemptions: readonly LinkCheckExemption[]): boolean {
    return (
      isLive(exemptions) &&
      isJustified(exemptions) &&
      hasNoDuplicateUrl(exemptions) &&
      namesNoSourceUrl(exemptions)
    );
  }

  it("the real constant satisfies all four clauses", () => {
    expect(satisfiesC19(linkCheckExemptions)).toBe(true);
  });

  it("S19.6 — a stale entry, for an address neither committed document carries, fails liveness alone", () => {
    const stale: LinkCheckExemption = {
      url: url("https://not-in-any-committed-document.example.com"),
      reason: "was live once",
    };
    expect(isLive([stale])).toBe(false);
    expect(isJustified([stale])).toBe(true);
    expect(hasNoDuplicateUrl([stale])).toBe(true);
    expect(namesNoSourceUrl([stale])).toBe(true);
  });

  it("an entry whose reason is empty after trimming fails justification alone", () => {
    const [live] = [...liveUrls()];
    const blank: LinkCheckExemption = { url: live!, reason: "   " };
    expect(isLive([blank])).toBe(true);
    expect(isJustified([blank])).toBe(false);
    expect(hasNoDuplicateUrl([blank])).toBe(true);
    expect(namesNoSourceUrl([blank])).toBe(true);
  });

  it("a duplicate url fails that clause alone", () => {
    const [live] = [...liveUrls()];
    const duplicate: LinkCheckExemption = { url: live!, reason: "observed by hand" };
    expect(isLive([duplicate, duplicate])).toBe(true);
    expect(isJustified([duplicate, duplicate])).toBe(true);
    expect(hasNoDuplicateUrl([duplicate, duplicate])).toBe(false);
    expect(namesNoSourceUrl([duplicate, duplicate])).toBe(true);
  });

  it("an exemption naming sourceUrl fails that clause alone", () => {
    const named: LinkCheckExemption = { url: sourceUrl, reason: "observed by hand" };
    expect(isJustified([named])).toBe(true);
    expect(hasNoDuplicateUrl([named])).toBe(true);
    expect(namesNoSourceUrl([named])).toBe(false);
  });
});
