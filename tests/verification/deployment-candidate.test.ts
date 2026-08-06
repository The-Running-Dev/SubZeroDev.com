import { describe, expect, it } from "vitest";

import type { CommitId } from "../../src/content";
import { assertDeploymentCandidateCurrent } from "../../src/verification";

const COMMIT = "a".repeat(40) as CommitId;
const OTHER_COMMIT = "b".repeat(40) as CommitId;

describe("S10.4 — assertDeploymentCandidateCurrent", () => {
  it("returns ok: true when the commit equals the branch head", () => {
    expect(assertDeploymentCandidateCurrent(COMMIT, COMMIT)).toEqual({ ok: true, value: null });
  });

  it("returns StaleDeploymentCandidate when they differ", () => {
    const result = assertDeploymentCandidateCurrent(COMMIT, OTHER_COMMIT);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toEqual(["StaleDeploymentCandidate"]);
  });
});
