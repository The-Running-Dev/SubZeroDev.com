// Artifact — error semantics (contract's Error semantics § Artifact).
//
// Every variant is deterministic and not retryable: a build that could not
// finalize its own output has an environment fault, and retrying inside the
// step would hide it. In every case the caller — the build — exits non-zero
// and publishes nothing.

export type ArtifactErrorCode =
  | "CommitIdMalformed"
  | "OutputTreeMissing"
  | "MissDocumentMissing"
  | "MarkerInsertionPointMissing"
  | "MarkerAlreadyPresent"
  | "WriteFailed";

export type ArtifactError = {
  readonly code: ArtifactErrorCode;
  readonly entry: string | null;
  readonly detail: string;
};
