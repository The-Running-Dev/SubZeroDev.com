// Verification — `assertAttestation` (contract's Verification § public
// signatures, V5). Takes `Attestation | null` because absence is the
// condition `AttestationAbsent` names, and a parameter that cannot be absent
// cannot express it (contract's Verification § public signatures, note on
// `assertAttestation`).

import type { CommitId, Result } from "../content";
import type { VerificationError } from "./errors";
import type { Attestation } from "./types";

export function assertAttestation(
  attestation: Attestation | null,
  commit: CommitId,
): Result<null, VerificationError> {
  if (attestation === null) {
    return {
      ok: false,
      errors: [
        {
          code: "AttestationAbsent",
          detail: "the run carries no approval record.",
          observed: null,
          expected: commit,
        },
      ],
    };
  }

  if (attestation.commit !== commit) {
    return {
      ok: false,
      errors: [
        {
          code: "AttestationCommitMismatch",
          detail: `the attestation is for commit "${attestation.commit}", not the commit being deployed.`,
          observed: attestation.commit,
          expected: commit,
        },
      ],
    };
  }

  return { ok: true, value: null };
}
