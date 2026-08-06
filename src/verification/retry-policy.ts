// Verification — the link-check and deployment-poll retry policies
// (contract's concrete policy values table).

import type { RetryPolicy } from "./types";

export const linkCheckRetry: RetryPolicy = {
  attempts: 3,
  backoff: "exponential",
  initialDelayMs: 1000,
  maxDelayMs: 8000,
  attemptTimeoutMs: 10000,
};

export const deploymentPollRetry: RetryPolicy = {
  attempts: 60,
  backoff: "fixed",
  initialDelayMs: 5000,
  maxDelayMs: 5000,
  attemptTimeoutMs: 10000,
};
