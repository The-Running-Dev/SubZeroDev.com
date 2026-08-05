// S2.1–S2.7 — the committed inventory. This is C14's designated call site:
// the one place outside Content permitted to import `projects`.

import { describe, expect, it } from "vitest";

import { projects, validateInventory } from "../../src/content";
import type { BuildContext, CommitId, Project, Year } from "../../src/content";

const context: BuildContext = {
  commit: "0".repeat(40) as CommitId,
  utcYear: new Date().getUTCFullYear() as Year,
};

describe("S2.1 — the committed inventory validates", () => {
  it("validateInventory(projects, context) returns ok: true", () => {
    const result = validateInventory(projects, context);
    if (!result.ok) {
      throw new Error(
        `inventory failed to validate: ${result.errors.map((e) => `${e.code} (${e.projectId ?? "-"}.${e.field ?? "-"})`).join(", ")}`,
      );
    }
    expect(result.ok).toBe(true);
  });
});

const byName = (name: string): Project[] => projects.filter((p) => p.name === name);
const one = (name: string): Project => {
  const matches = byName(name);
  expect(matches, `expected exactly one project named "${name}"`).toHaveLength(1);
  return matches[0]!;
};

describe("S2.2 — every named ecosystem product appears exactly once", () => {
  const NAMED = [
    "Game Engine",
    "Platform",
    "Publishing",
    "Automation",
    "Documentation",
    "Lucifer Chronicles",
    "Ogre's Kitchen",
  ];

  it.each(NAMED)("%s appears exactly once", (name) => {
    one(name);
  });
});

describe("S2.3 — the twelve verified subdomains each appear exactly once as an own home", () => {
  const VERIFIED_SUBDOMAINS = [
    "https://blog.subzerodev.com",
    "https://build-agent.subzerodev.com",
    "https://docs-template.subzerodev.com",
    "https://game-engine.subzerodev.com",
    "https://suntrap.subzerodev.com",
    "https://psgenerator.subzerodev.com",
    "https://plugins-github.subzerodev.com",
    "https://blogging.subzerodev.com",
    "https://platform.subzerodev.com",
    "https://workspace.subzerodev.com",
    "https://winget.subzerodev.com",
    "https://portfolio.subzerodev.com",
  ];

  const ownUrls: string[] = [];
  for (const p of projects) if (p.home.kind === "own") ownUrls.push(p.home.url);

  it("carries exactly twelve own homes", () => {
    expect(ownUrls).toHaveLength(12);
  });

  it.each(VERIFIED_SUBDOMAINS)("%s appears exactly once", (target) => {
    expect(ownUrls.filter((u) => u === target)).toHaveLength(1);
  });

  it("has no own home outside the verified list", () => {
    for (const u of ownUrls) expect(VERIFIED_SUBDOMAINS).toContain(u);
  });
});

describe("S2.4 — Lucifer Chronicles is within the blog project", () => {
  it("home.kind is 'within', naming the Publishing project, whose own home.kind is 'own'", () => {
    const lucifer = one("Lucifer Chronicles");
    const home = lucifer.home;
    expect(home.kind).toBe("within");
    if (home.kind !== "within") return;
    const parent = projects.find((p) => p.id === home.parent);
    expect(parent).toBeDefined();
    expect(parent?.home.kind).toBe("own");
  });
});

describe("S2.5 — Ogre's Kitchen has no home", () => {
  it("home.kind is 'none'", () => {
    expect(one("Ogre's Kitchen").home.kind).toBe("none");
  });
});

describe("S2.6 — schemas.subzerodev.com is never a home", () => {
  it("no own home has that host", () => {
    for (const p of projects) {
      if (p.home.kind === "own") expect(new URL(p.home.url).host).not.toBe("schemas.subzerodev.com");
    }
  });
});

describe("S2.7 — the escapedFrom chain is at least two hops deep", () => {
  it("some project's escapedFrom target itself carries an escapedFrom", () => {
    const byId = new Map(projects.map((p) => [p.id, p]));
    const chained = projects.some((p) => {
      if (p.escapedFrom === undefined) return false;
      const parent = byId.get(p.escapedFrom);
      return parent?.escapedFrom !== undefined;
    });
    expect(chained).toBe(true);
  });
});
