import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

import { afterEach, describe, expect, it } from "vitest";

import { buildMarker } from "../../src/artifact";
import type { AbsoluteUrl, CommitId } from "../../src/content";
import { pollForCommit } from "../../src/verification";
import type { RetryPolicy } from "../../src/verification";

// A policy structurally identical to `deploymentPollRetry` (S10.1 owns
// testing its exact values) but with short delays, so the exhaustion case
// here runs in milliseconds rather than five minutes.
const fastPolicy: RetryPolicy = {
  attempts: 3,
  backoff: "fixed",
  initialDelayMs: 5,
  maxDelayMs: 5,
  attemptTimeoutMs: 300,
};

const EXPECTED = "a".repeat(40) as CommitId;
const OTHER = "b".repeat(40) as CommitId;

let server: Server | undefined;

afterEach(async () => {
  if (server !== undefined) {
    await new Promise<void>((resolve) => server!.close(() => resolve()));
    server = undefined;
  }
});

function startStub(bodies: readonly string[]): Promise<AbsoluteUrl> {
  let call = 0;
  return new Promise((resolvePromise) => {
    server = createServer((_req, res) => {
      const body = bodies[Math.min(call, bodies.length - 1)]!;
      call += 1;
      res.writeHead(200, { "content-type": "text/html" });
      res.end(body);
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server!.address() as AddressInfo;
      resolvePromise(`http://127.0.0.1:${port}` as AbsoluteUrl);
    });
  });
}

describe("S10.2 — pollForCommit", () => {
  it("returns ok: true with polls: 1 when the first response carries the expected marker", async () => {
    const url = await startStub([`<html><head>${buildMarker(EXPECTED)}</head></html>`]);

    const result = await pollForCommit(url, EXPECTED, fastPolicy);

    expect(result).toEqual({ ok: true, value: { servedCommit: EXPECTED, polls: 1 } });
  });

  it("returns ok: true with polls: 3 after two responses carrying a different valid commit", async () => {
    const url = await startStub([
      `<html><head>${buildMarker(OTHER)}</head></html>`,
      `<html><head>${buildMarker(OTHER)}</head></html>`,
      `<html><head>${buildMarker(EXPECTED)}</head></html>`,
    ]);

    const result = await pollForCommit(url, EXPECTED, fastPolicy);

    expect(result).toEqual({ ok: true, value: { servedCommit: EXPECTED, polls: 3 } });
  });

  it("returns PollExhausted after attempts polls when the expected marker never appears", async () => {
    const url = await startStub([`<html><head>${buildMarker(OTHER)}</head></html>`]);

    const result = await pollForCommit(url, EXPECTED, fastPolicy);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toEqual(["PollExhausted"]);
  });
});
