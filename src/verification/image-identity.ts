// Verification — assertImageIdentity (contract's Verification § public
// signatures, V10). The workflow observes the image's tag and the marker the
// running image serves, and passes both in — keeping the observation outside
// this function is what lets it be tested without a container or a registry.

import type { CommitId, Result } from "../content";
import type { VerificationError } from "./errors";

export function assertImageIdentity(
  imageTag: string,
  servedMarker: CommitId,
  commit: CommitId,
): Result<null, VerificationError> {
  const errors: VerificationError[] = [];

  if (imageTag !== commit) {
    errors.push({
      code: "ImageTagCommitMismatch",
      detail: `the image is tagged "${imageTag}", which is not the commit being released.`,
      observed: imageTag,
      expected: commit,
    });
  }

  // Not retryable here, unlike the deployment read-back's own MarkerMismatch
  // handling: the image is already built, so polling again cannot change
  // what it serves (contract's Verification § error semantics, `MarkerMismatch` row).
  if (servedMarker !== commit) {
    errors.push({
      code: "MarkerMismatch",
      detail: "the running image serves a build marker for a different commit.",
      observed: servedMarker,
      expected: commit,
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors: errors as [VerificationError, ...VerificationError[]] };
  }
  return { ok: true, value: null };
}
