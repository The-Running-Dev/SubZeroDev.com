import { describe, expect, it } from "vitest";

import { deploymentPollRetry } from "../../src/verification";

describe("S10.1 — deploymentPollRetry (contract's concrete policy values)", () => {
  it("attempts is 60", () => {
    expect(deploymentPollRetry.attempts).toBe(60);
  });

  it("backoff is fixed", () => {
    expect(deploymentPollRetry.backoff).toBe("fixed");
  });

  it("initialDelayMs is 5000", () => {
    expect(deploymentPollRetry.initialDelayMs).toBe(5000);
  });

  it("maxDelayMs is 5000", () => {
    expect(deploymentPollRetry.maxDelayMs).toBe(5000);
  });

  it("attemptTimeoutMs is 10000", () => {
    expect(deploymentPollRetry.attemptTimeoutMs).toBe(10000);
  });
});
