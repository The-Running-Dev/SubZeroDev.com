import { describe, expect, it } from "vitest";

import { linkCheckRetry } from "../../src/verification";

describe("S3.2 — linkCheckRetry (contract's concrete policy values)", () => {
  it("attempts is 3", () => {
    expect(linkCheckRetry.attempts).toBe(3);
  });

  it("backoff is exponential", () => {
    expect(linkCheckRetry.backoff).toBe("exponential");
  });

  it("initialDelayMs is 1000", () => {
    expect(linkCheckRetry.initialDelayMs).toBe(1000);
  });

  it("maxDelayMs is 8000", () => {
    expect(linkCheckRetry.maxDelayMs).toBe(8000);
  });

  it("attemptTimeoutMs is 10000", () => {
    expect(linkCheckRetry.attemptTimeoutMs).toBe(10000);
  });
});
