import { describe, expect, it } from "vitest";

import type { CommitId } from "../../src/content";
import { assertImageIdentity } from "../../src/verification";

const COMMIT = "a".repeat(40) as CommitId;
const OTHER_COMMIT = "b".repeat(40) as CommitId;

describe("S9.3 — assertImageIdentity", () => {
  it("returns ok: true for an image tagged and marked with the commit being released", () => {
    expect(assertImageIdentity(COMMIT, COMMIT, COMMIT)).toEqual({ ok: true, value: null });
  });

  it("a tag that is not the commit returns ImageTagCommitMismatch", () => {
    const result = assertImageIdentity(OTHER_COMMIT, COMMIT, COMMIT);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toEqual(["ImageTagCommitMismatch"]);
  });

  it("a served marker for a different valid commit returns MarkerMismatch", () => {
    const result = assertImageIdentity(COMMIT, OTHER_COMMIT, COMMIT);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toEqual(["MarkerMismatch"]);
  });

  it("a tag and a served marker both wrong return both faults in one Result", () => {
    const result = assertImageIdentity(OTHER_COMMIT, OTHER_COMMIT, COMMIT);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code).sort()).toEqual(
      ["ImageTagCommitMismatch", "MarkerMismatch"].sort(),
    );
  });
});
