import { describe, expect, it } from "vitest";

import { resolvedHomes, validateInventory } from "../../src/content";
import type { Inventory, Project } from "../../src/content";
import { context, makeProject, pid, rrp, url } from "./fixtures";

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

describe("S3.1 — resolvedHomes (invariant C13)", () => {
  it("yields one entry per own home, one per within home, and none for a none home", () => {
    const inventory = inventoryOf(
      { id: pid("owner"), home: { kind: "own", url: url("https://blog.subzerodev.com") } },
      {
        id: pid("nested"),
        home: { kind: "within", parent: pid("owner"), path: rrp("/lucifer-chronicles") },
      },
      { id: pid("homeless"), home: { kind: "none" } },
    );

    const resolved = resolvedHomes(inventory);

    expect(resolved).toHaveLength(2);
    expect(resolved.map((r) => r.projectId).sort()).toEqual(["nested", "owner"]);
  });

  it("resolves a within home to the parent's origin with the path applied", () => {
    const inventory = inventoryOf(
      { id: pid("publishing"), home: { kind: "own", url: url("https://blog.subzerodev.com") } },
      {
        id: pid("lucifer-chronicles"),
        home: { kind: "within", parent: pid("publishing"), path: rrp("/lucifer-chronicles") },
      },
    );

    const resolved = resolvedHomes(inventory);
    const lucifer = resolved.find((r) => r.projectId === "lucifer-chronicles");

    expect(lucifer?.url).toBe("https://blog.subzerodev.com/lucifer-chronicles");
  });

  it("resolves an own home to its own url unchanged", () => {
    const inventory = inventoryOf({
      id: pid("owner"),
      home: { kind: "own", url: url("https://portfolio.subzerodev.com") },
    });

    expect(resolvedHomes(inventory)).toEqual([
      { projectId: "owner", url: "https://portfolio.subzerodev.com" },
    ]);
  });
});
