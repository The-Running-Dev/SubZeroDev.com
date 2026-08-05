// Verification — public surface delivered by S3.
//
// The remaining `assert*` functions, `readBuildMarker` and `pollForCommit`
// arrive with the work that is blocked until then; only what S3 delivers is
// re-exported here.

export type { RetryPolicy, LinkCheckResult } from "./types";
export type { VerificationError, VerificationErrorCode } from "./errors";
export { linkCheckRetry } from "./retry-policy";
export { checkLinks } from "./check-links";
