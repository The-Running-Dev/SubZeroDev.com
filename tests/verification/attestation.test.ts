import { describe, expect, it } from "vitest";

import type { CommitId } from "../../src/content";
import { assertAttestation } from "../../src/verification";
import type { Attestation } from "../../src/verification";

const COMMIT = "a".repeat(40) as CommitId;
const OTHER_COMMIT = "b".repeat(40) as CommitId;

describe("S10.3 — assertAttestation", () => {
  it("returns AttestationAbsent when given null", () => {
    const result = assertAttestation(null, COMMIT);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toEqual(["AttestationAbsent"]);
  });

  it("returns AttestationCommitMismatch when the attestation's commit differs from the deploying commit", () => {
    const attestation: Attestation = { commit: OTHER_COMMIT, approver: "The-Running-Dev" };
    const result = assertAttestation(attestation, COMMIT);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toEqual(["AttestationCommitMismatch"]);
  });

  it("returns ok: true for a matching attestation", () => {
    const attestation: Attestation = { commit: COMMIT, approver: "The-Running-Dev" };
    expect(assertAttestation(attestation, COMMIT)).toEqual({ ok: true, value: null });
  });
});
