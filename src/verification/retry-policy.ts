// Verification — the link-check retry policy (contract's concrete policy
// values table).

import type { RetryPolicy } from "./types";

export const linkCheckRetry: RetryPolicy = {
  attempts: 3,
  backoff: "exponential",
  initialDelayMs: 1000,
  maxDelayMs: 8000,
  attemptTimeoutMs: 10000,
};
