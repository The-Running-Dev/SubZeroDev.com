import { describe, expect, it } from "vitest";

import { checkedLinks, sourceUrl, validateInventory } from "../../src/content";
import type { Inventory, Project } from "../../src/content";
import { context, makeProject, pid, url } from "./fixtures";
import { projects } from "../helpers/site-data";

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

describe("S14.3 — checkedLinks(inventory) (invariant C17)", () => {
  it("yields one entry per resolved home, labelled by its projectId, plus one for sourceUrl", () => {
    const inventory = inventoryOf(
      { id: pid("owner"), home: { kind: "own", url: url("https://blog.subzerodev.com") } },
      { id: pid("homeless"), home: { kind: "none" } },
    );

    const links = checkedLinks(inventory);

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

    const links = checkedLinks(inventory).filter((l) => l.url === "https://portfolio.subzerodev.com");

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

    const links = checkedLinks(inventory.value);

    expect(links.some((l) => l.url === sourceUrl)).toBe(true);
  });
});
