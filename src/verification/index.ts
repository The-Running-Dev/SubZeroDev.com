// Verification — public surface delivered by S3, S4, S6, S7, S8, S9 and S10.

export type {
  RetryPolicy,
  LinkCheckResult,
  RequestRecord,
  ServedResponse,
  Attestation,
  ReadBackResult,
} from "./types";
export type { VerificationError, VerificationErrorCode } from "./errors";
export { linkCheckRetry, deploymentPollRetry } from "./retry-policy";
export { checkLinks } from "./check-links";
export { assertStyleAgreement } from "./style-agreement";
export { assertSelfContained } from "./self-contained";
export { assertContentPresent } from "./content-present";
export { readBuildMarker } from "./build-marker";
export {
  assertEveryDocumentMarked,
  assertRootMissDocument,
  assertMissEntryRemoved,
} from "./document-marking";
export { assertNoAdditionalRequests } from "./request-capture";
export { assertUnknownPathResponse, assertServedBytesMatchEmitted } from "./served-response";
export { assertImageIdentity } from "./image-identity";
export { pollForCommit } from "./poll-for-commit";
export { assertAttestation } from "./attestation";
export { assertDeploymentCandidateCurrent } from "./deployment-candidate";
