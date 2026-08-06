// Verification — `assertDeploymentCandidateCurrent` (contract's Verification
// § public signatures, V6). Compares two values and reads nothing, in the
// same shape as `assertImageIdentity`: the workflow observes the deployment
// branch's head at the top of the critical section and passes it in, which
// is what lets this be tested without a repository, a token or a network.

import type { CommitId, Result } from "../content";
import type { VerificationError } from "./errors";

export function assertDeploymentCandidateCurrent(
  commit: CommitId,
  branchHead: CommitId,
): Result<null, VerificationError> {
  if (commit !== branchHead) {
    return {
      ok: false,
      errors: [
        {
          code: "StaleDeploymentCandidate",
          detail: `this run's commit "${commit}" is no longer the deployment branch's head.`,
          observed: commit,
          expected: branchHead,
        },
      ],
    };
  }

  return { ok: true, value: null };
}
