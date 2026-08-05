import { describe, expect, it } from "vitest";

import { stageOrder } from "../../src/content";
import type { Stage } from "../../src/content";

const allStages: readonly Stage[] = [
  "Curiosity",
  "Prototype",
  "Architecture",
  "Infrastructure",
  "Reusable",
  "Escaped",
];

describe("S1.1 — stageOrder (invariant C9)", () => {
  it("has length 6 and equals the lifecycle order", () => {
    expect(stageOrder).toHaveLength(6);
    expect(stageOrder).toEqual([
      "Curiosity",
      "Prototype",
      "Architecture",
      "Infrastructure",
      "Reusable",
      "Escaped",
    ]);
  });

  it("contains every Stage member exactly once", () => {
    for (const stage of allStages) {
      expect(stageOrder.filter((s) => s === stage)).toHaveLength(1);
    }
    expect(new Set(stageOrder).size).toBe(stageOrder.length);
  });
});
