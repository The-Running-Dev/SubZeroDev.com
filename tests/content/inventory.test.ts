// S2.1–S2.7 — the committed JSON inventory, read through the shared test
// helper. Production validation belongs to the Adapter's document validator.

import { describe, expect, it } from "vitest";

import { composeApex } from "../../src/composition";
import {
  contaminationForest,
  primarySlogan,
  sinceYear,
  apexFooterQuote,
  validateInventory,
} from "../../src/content";
import type { BuildContext, CommitId, Inventory, Project, Testimonials, Year } from "../../src/content";
import { assertStyleAgreement } from "../../src/verification";
import { makeTestimonial, TEST_ORIGIN } from "./fixtures";
import { projects } from "../helpers/site-data";

const testimonials: Testimonials = [makeTestimonial()];

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
    "AgentKit",
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

// The committed-inventory cases for S5.1, S5.4, S5.5 and S5.9 — `projects`
// may be imported only here and at Verification's inventory assertion (C14).
const committed: Inventory = (() => {
  const result = validateInventory(projects, context);
  if (!result.ok) throw new Error("committed inventory failed to validate");
  return result.value;
})();

describe("S5.1 — sinceYear over the committed inventory", () => {
  it("equals the minimum year in the committed inventory", () => {
    const min = Math.min(...projects.map((p) => p.year));
    expect(sinceYear(committed)).toBe(min);
  });

  it("equals 2026 — mirrored as a literal in SubZeroDev.Blog's Navbar and Test-DocumentationArtifact.ps1; this pin exists so a year change here is caught on the side where it originates", () => {
    expect(sinceYear(committed)).toBe(2026);
  });
});

describe("S5.4 — contaminationForest over the committed inventory", () => {
  it("contains every project exactly once", () => {
    const forest = contaminationForest(committed);
    const ids: string[] = [];
    const walk = (nodes: typeof forest) => {
      for (const node of nodes) {
        ids.push(node.project.id);
        walk(node.escapes);
      }
    };
    walk(forest);
    expect(ids.sort()).toEqual(committed.map((p) => p.id).slice().sort());
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("yields at least one node at depth 2 or greater — the chain S2.7 put in the data", () => {
    const forest = contaminationForest(committed);
    let maxDepth = -1;
    const walk = (nodes: typeof forest, depth: number) => {
      for (const node of nodes) {
        maxDepth = Math.max(maxDepth, depth);
        walk(node.escapes, depth + 1);
      }
    };
    walk(forest, 0);
    expect(maxDepth).toBeGreaterThanOrEqual(2);
  });
});

// `name` values containing `<`, `>`, `&`, `"` or `'` are HTML-escaped by X5
// and therefore will not appear as a raw substring — the same accepted
// consequence 90-decisions.md records for `assertContentPresent`'s literal
// match (2026-08-06, "Four orphan error codes get producers"), extended here
// to the two quote characters X5 also names. "Ogre's Kitchen" is the one
// committed name this affects.
const ESCAPE_SOURCE = /[<>&"']/g;
const ESCAPE_TABLE: Record<string, string> = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  '"': "&quot;",
  "'": "&#39;",
};
const htmlEscape = (s: string): string => s.replace(ESCAPE_SOURCE, (c) => ESCAPE_TABLE[c]!);

describe("S5.5 — composeApex(inventory)'s bodyHtml over the committed inventory", () => {
  const { bodyHtml } = composeApex(committed, testimonials, TEST_ORIGIN);

  it.each(projects.map((p) => p.name))("contains project name %s (escaped where X5 requires it)", (name) => {
    expect(bodyHtml).toContain(htmlEscape(name));
  });

  it("contains the text of primarySlogan", () => {
    expect(bodyHtml).toContain(primarySlogan);
  });

  it("contains the text of apexFooterQuote", () => {
    expect(bodyHtml).toContain(apexFooterQuote);
  });
});

// The apex nav derives its Blog and Portfolio links by looking up the id
// strings `publishing` and `portfolio` (apex.ts). Composition is total and
// cannot fail, so a renamed or removed record drops the link silently. These
// are the assertions that go red instead — see 90-decisions.md, 2026-08-07.
describe("the apex nav's two derived links still resolve against the committed inventory", () => {
  it.each(["publishing", "portfolio"])("a project with id %s exists and has a resolvable home", (id) => {
    const project = projects.find((p) => p.id === id);
    expect(project, `no project carries the id "${id}" that apex.ts looks up`).toBeDefined();
    expect(project?.home.kind, `project "${id}" must have a home the nav can link to`).not.toBe(
      "none",
    );
  });

  it("composeApex over the committed inventory renders all three outbound links", () => {
    const { bodyHtml } = composeApex(committed, testimonials, TEST_ORIGIN);
    for (const label of ["Blog", "Projects", "Portfolio"]) {
      expect(bodyHtml, `the nav lost its ${label} link`).toContain(`>${label}</a>`);
    }
  });
});

describe("S5.9 — assertStyleAgreement holds for composeApex(inventory) over the committed inventory", () => {
  it("returns ok: true", () => {
    const { bodyHtml, stylesheet } = composeApex(committed, testimonials, TEST_ORIGIN);
    expect(assertStyleAgreement(bodyHtml, stylesheet)).toEqual({ ok: true, value: null });
  });
});
