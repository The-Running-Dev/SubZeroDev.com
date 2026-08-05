// Verification — the module's shared value shapes.
//
// Only `RetryPolicy` and `LinkCheckResult` are exercised in this slice; the
// rest of the module's public surface (S3's Out of scope) is blocked.

import type { ResolvedHome } from "../content";

export type RetryPolicy = {
  readonly attempts: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
  readonly backoff: "fixed" | "exponential";
  readonly attemptTimeoutMs: number;
};

export type LinkCheckResult = {
  readonly target: ResolvedHome;
  readonly status: number | null;
  readonly attempts: number;
};
