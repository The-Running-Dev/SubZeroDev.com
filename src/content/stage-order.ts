// Content — the lifecycle order, taken directly from Idea.md's method diagram.
// Length 6, covering `Stage` exactly once, in lifecycle order (invariant C9).

import type { Stage } from "./types";

export const stageOrder: readonly Stage[] = [
  "Curiosity",
  "Prototype",
  "Architecture",
  "Infrastructure",
  "Reusable",
  "Escaped",
];
