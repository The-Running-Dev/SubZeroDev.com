// Verification — public surface delivered by S3, S4, S6, S7 and S8.
//
// The remaining `assert*` functions and `pollForCommit` arrive with the work
// that is blocked until then; only what S3, S4, S6, S7 and S8 deliver is
// re-exported here.

export type { RetryPolicy, LinkCheckResult, RequestRecord } from "./types";
export type { VerificationError, VerificationErrorCode } from "./errors";
export { linkCheckRetry } from "./retry-policy";
export { checkLinks } from "./check-links";
export { assertStyleAgreement } from "./style-agreement";
export { assertSelfContained } from "./self-contained";
export { assertContentPresent } from "./content-present";
export { readBuildMarker } from "./build-marker";
export { assertEveryDocumentMarked, assertRootMissDocument } from "./document-marking";
export { assertNoAdditionalRequests } from "./request-capture";
