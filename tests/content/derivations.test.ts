// The committed-inventory cases for S5.1/S5.4 live in inventory.test.ts —
// `projects` may be imported only at that call site and Verification's
// inventory assertion (C14), and composeApex's tests supply their own
// fixture Inventory rather than reading `projects` from Composition.

import { describe, expect, it } from "vitest";

import { contaminationForest, countByStage, ecosystemTree, projectTotal, sinceYear, stageOrder } from "../../src/content";
import type { Inventory, Project } from "../../src/content";
import { makeProject, pid, yr } from "./fixtures";

function inventory(...projects: readonly [Project, ...Project[]]): Inventory {
  return projects;
}

describe("S5.1 — sinceYear", () => {
  it("equals the minimum year even when it is not the first record", () => {
    const inv = inventory(
      makeProject({ id: pid("a"), year: yr(2024) }),
      makeProject({ id: pid("b"), year: yr(2020) }),
      makeProject({ id: pid("c"), year: yr(2022) }),
    );
    expect(sinceYear(inv)).toBe(2020);
  });
});

describe("S5.2 — projectTotal and countByStage", () => {
  const inv = inventory(
    makeProject({ id: pid("a"), stage: "Prototype" }),
    makeProject({ id: pid("b"), stage: "Reusable" }),
    makeProject({ id: pid("c"), stage: "Reusable" }),
  );

  it("projectTotal equals the number of projects in it", () => {
    expect(projectTotal(inv)).toBe(3);
  });

  it("countByStage returns one entry per Stage in stageOrder order, whose counts sum to projectTotal", () => {
    const counts = countByStage(inv);
    expect(counts.map((c) => c.stage)).toEqual(stageOrder);
    expect(counts.reduce((sum, c) => sum + c.count, 0)).toBe(projectTotal(inv));
    expect(counts.find((c) => c.stage === "Reusable")?.count).toBe(2);
    expect(counts.find((c) => c.stage === "Prototype")?.count).toBe(1);
  });
});

describe("S5.3 — ecosystemTree", () => {
  it("returns one group per Stage in stageOrder order, including empty groups", () => {
    const inv = inventory(makeProject({ id: pid("only"), stage: "Reusable" }));
    const tree = ecosystemTree(inv);
    expect(tree.map((g) => g.stage)).toEqual(stageOrder);
    const nonEmpty = tree.filter((g) => g.stage === "Reusable");
    const empty = tree.filter((g) => g.stage !== "Reusable");
    expect(nonEmpty[0]?.projects).toHaveLength(1);
    expect(empty.every((g) => g.projects.length === 0)).toBe(true);
  });

  it("within a group, projects ascend by id", () => {
    const inv = inventory(
      makeProject({ id: pid("charlie"), stage: "Reusable" }),
      makeProject({ id: pid("alpha"), stage: "Reusable" }),
      makeProject({ id: pid("bravo"), stage: "Reusable" }),
    );
    const tree = ecosystemTree(inv);
    const group = tree.find((g) => g.stage === "Reusable")!;
    expect(group.projects.map((p) => p.id)).toEqual(["alpha", "bravo", "charlie"]);
  });

  it("every project appears exactly once across all groups", () => {
    const inv = inventory(
      makeProject({ id: pid("a"), stage: "Prototype" }),
      makeProject({ id: pid("b"), stage: "Reusable" }),
      makeProject({ id: pid("c"), stage: "Curiosity" }),
    );
    const tree = ecosystemTree(inv);
    const seen = tree.flatMap((g) => g.projects.map((p) => p.id));
    expect(seen.sort()).toEqual(["a", "b", "c"]);
  });
});

describe("S5.4 — contaminationForest", () => {
  it("roots every project carrying no escapedFrom", () => {
    const inv = inventory(
      makeProject({ id: pid("root-a") }),
      makeProject({ id: pid("root-b") }),
      makeProject({ id: pid("child"), escapedFrom: pid("root-a") }),
    );
    const forest = contaminationForest(inv);
    expect(forest.map((n) => n.project.id)).toEqual(["root-a", "root-b"]);
  });

  it("contains every project exactly once", () => {
    const inv = inventory(
      makeProject({ id: pid("root") }),
      makeProject({ id: pid("mid"), escapedFrom: pid("root") }),
      makeProject({ id: pid("leaf"), escapedFrom: pid("mid") }),
    );
    const forest = contaminationForest(inv);
    const ids: string[] = [];
    const walk = (nodes: typeof forest) => {
      for (const node of nodes) {
        ids.push(node.project.id);
        walk(node.escapes);
      }
    };
    walk(forest);
    expect(ids.sort()).toEqual(["leaf", "mid", "root"]);
  });
});
