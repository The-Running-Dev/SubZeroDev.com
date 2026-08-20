// Verification — the module's shared value shapes.

import type { CheckedLink, CommitId } from "../content";

export type RetryPolicy = {
  readonly attempts: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
  readonly backoff: "fixed" | "exponential";
  readonly attemptTimeoutMs: number;
};

export type LinkCheckResult = {
  readonly target: CheckedLink;
  readonly status: number | null;
  readonly attempts: number;
};

export type RequestRecord = {
  readonly url: string;
  readonly resourceType: string;
  readonly initiatedByTester: boolean;
};

export type ServedResponse = {
  readonly status: number;
  readonly body: string;
};

export type Attestation = {
  readonly commit: CommitId;
  readonly approver: string;
};

export type ReadBackResult = {
  readonly servedCommit: CommitId;
  readonly polls: number;
};
