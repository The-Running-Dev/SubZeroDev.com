// Verification — `checkLinks` (contract's Verification § public signatures).
//
// A response — any status at all — settles a target immediately: `LinkNotOk`
// is not retryable (contract's Error semantics § Verification), so a 4xx/5xx
// response ends the attempt loop at `attempts: 1` rather than exhausting the
// policy. Only the absence of a response (a refused connection, a timeout)
// retries, with the policy's backoff between attempts.
//
// Plain `node:http`/`node:https` requests are used rather than `fetch`: a
// `redirect: "manual"` fetch yields an opaque, statusless response, which
// cannot be told apart from a 2xx by status code — and this needs the raw
// 3xx status without following it anywhere.

import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

import type { ResolvedHome, Result } from "../content";
import type { VerificationError } from "./errors";
import type { LinkCheckResult, RetryPolicy } from "./types";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestOnce(url: string, timeoutMs: number): Promise<number | null> {
  return new Promise((resolvePromise) => {
    let settled = false;
    const settle = (value: number | null): void => {
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
      // Only the status code is needed; destroying rather than draining stops
      // a large or continuously streaming body from prolonging this request.
      res.destroy();
      settle(res.statusCode ?? null);
    });
    req.on("timeout", () => {
      req.destroy();
      settle(null);
    });
    req.on("error", () => settle(null));
    req.end();
  });
}

function isOkStatus(status: number): boolean {
  return status >= 200 && status < 400;
}

async function checkOneTarget(target: ResolvedHome, policy: RetryPolicy): Promise<LinkCheckResult> {
  let delay = policy.initialDelayMs;
  for (let attempt = 1; attempt <= policy.attempts; attempt++) {
    const status = await requestOnce(target.url, policy.attemptTimeoutMs);
    if (status !== null) {
      return { target, status, attempts: attempt };
    }
    if (attempt < policy.attempts) {
      await sleep(delay);
      delay = policy.backoff === "exponential" ? Math.min(delay * 2, policy.maxDelayMs) : delay;
    }
  }
  return { target, status: null, attempts: policy.attempts };
}

export async function checkLinks(
  targets: readonly ResolvedHome[],
  policy: RetryPolicy,
): Promise<Result<readonly LinkCheckResult[], VerificationError>> {
  const results = await Promise.all(targets.map((target) => checkOneTarget(target, policy)));

  const errors: VerificationError[] = [];
  for (const result of results) {
    if (result.status === null) {
      errors.push({
        code: "LinkUnreachable",
        detail: `${result.target.projectId} (${result.target.url}) did not respond after ${result.attempts} attempt(s).`,
        observed: null,
        expected: null,
      });
    } else if (!isOkStatus(result.status)) {
      errors.push({
        code: "LinkNotOk",
        detail: `${result.target.projectId} (${result.target.url}) responded ${result.status}.`,
        observed: String(result.status),
        expected: "2xx or 3xx",
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors: errors as [VerificationError, ...VerificationError[]] };
  }
  return { ok: true, value: results };
}
