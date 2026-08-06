// Verification — error semantics.
//
// The full code vocabulary is written here because `VerificationError.code` is
// one shared union across the whole module (contract's Error semantics §
// Verification). `UnexpectedRequest` is raised by `assertNoAdditionalRequests`
// as of this slice; every code still unraised belongs to a function not yet
// implemented.

export type VerificationErrorCode =
  | "LinkUnreachable"
  | "LinkNotOk"
  | "MarkerAbsent"
  | "MarkerDuplicate"
  | "MarkerMismatch"
  | "PollExhausted"
  | "UnexpectedRequest"
  | "ScriptElementPresent"
  | "LinkedStylesheetPresent"
  | "ExternalAssetReference"
  | "ClassWithoutRule"
  | "SelectorWithoutUser"
  | "RootMissDocumentAbsent"
  | "UnknownPathStatusWrong"
  | "UnknownPathBodyWrong"
  | "ServedBytesMismatch"
  | "ImageTagCommitMismatch"
  | "AttestationCommitMismatch"
  | "AttestationAbsent"
  | "ManifestoAbsent"
  | "ProjectNameAbsent"
  | "StaleDeploymentCandidate";

export type VerificationError = {
  readonly code: VerificationErrorCode;
  readonly detail: string;
  readonly observed: string | null;
  readonly expected: string | null;
};
