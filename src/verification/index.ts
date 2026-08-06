// Verification — public surface delivered by S3, S4 and S6.
//
// The remaining `assert*` functions, `readBuildMarker` and `pollForCommit`
// arrive with the work that is blocked until then; only what S3, S4 and S6
// deliver is re-exported here.

export type { RetryPolicy, LinkCheckResult } from "./types";
export type { VerificationError, VerificationErrorCode } from "./errors";
export { linkCheckRetry } from "./retry-policy";
export { checkLinks } from "./check-links";
export { assertStyleAgreement } from "./style-agreement";
export { assertSelfContained } from "./self-contained";
export { assertContentPresent } from "./content-present";
