// Verification — `pollForCommit` (contract's Verification § public
// signatures, V8). Polls a served address until its build marker equals the
// expected commit or the policy is exhausted. A response carrying no marker,
// a duplicate marker, or a different valid commit is retried like an
// unreachable host — `MarkerMismatch` is explicitly retryable here (contract's
// Error semantics § Verification); only exhaustion is terminal.

import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

import type { AbsoluteUrl, CommitId, Result } from "../content";
import { readBuildMarker } from "./build-marker";
import type { VerificationError } from "./errors";
import type { ReadBackResult, RetryPolicy } from "./types";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchOnce(url: string, timeoutMs: number): Promise<string | null> {
  return new Promise((resolvePromise) => {
    let settled = false;
    const settle = (value: string | null): void => {
      if (settled) return;
      settled = true;
      resolvePromise(value);
    };

    let target: URL;
    try {
      target = new URL(url);
    } catch {
      settle(null);
      return;
    }

    const requester = target.protocol === "https:" ? httpsRequest : httpRequest;
    const req = requester(target, { method: "GET", timeout: timeoutMs }, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => settle(Buffer.concat(chunks).toString("utf8")));
      res.on("error", () => settle(null));
    });
    req.on("timeout", () => {
      req.destroy();
      settle(null);
    });
    req.on("error", () => settle(null));
    req.end();
  });
}

export async function pollForCommit(
  url: AbsoluteUrl,
  expected: CommitId,
  policy: RetryPolicy,
): Promise<Result<ReadBackResult, VerificationError>> {
  let delay = policy.initialDelayMs;
  for (let attempt = 1; attempt <= policy.attempts; attempt++) {
    const body = await fetchOnce(url, policy.attemptTimeoutMs);
    if (body !== null) {
      const marker = readBuildMarker(body);
      if (marker.ok && marker.value === expected) {
        return { ok: true, value: { servedCommit: expected, polls: attempt } };
      }
    }
    if (attempt < policy.attempts) {
      await sleep(delay);
      delay = policy.backoff === "exponential" ? Math.min(delay * 2, policy.maxDelayMs) : delay;
    }
  }

  return {
    ok: false,
    errors: [
      {
        code: "PollExhausted",
        detail: `no response from "${url}" carried the build marker for commit "${expected}" within ${policy.attempts} attempt(s).`,
        observed: null,
        expected,
      },
    ],
  };
}
