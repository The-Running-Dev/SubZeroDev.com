// The publish-release job's endpoint read-back, after the Compose redeploy
// is triggered (design/30-slices.md § S10.11; contract's V15). Runs only
// under `vitest.publish.config.ts`'s own job — same convention as this
// directory's other gate tests: a plain `vitest run` never reaches the
// network.
//
// V15 reuses `pollForCommit` and `assertUnknownPathResponse` unchanged and
// names no byte-match check here — the container's bytes were already
// asserted equal to the emitted tree in `image-gate` (S9), and this read-back
// exists to prove the *redeploy* landed, not to re-derive the container's
// own correctness.

import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { missRootEntry } from "../../src/artifact";
import type { AbsoluteUrl, CommitId } from "../../src/content";
import { assertUnknownPathResponse, deploymentPollRetry, pollForCommit } from "../../src/verification";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, "../../site/dist");

const commit = process.env.GITHUB_SHA as CommitId;
const siteUrl = process.env.SITE_URL as AbsoluteUrl;

describe("S10.11 — the redeployed endpoint serves the exact commit and answers an unknown path with 404", () => {
  it("pollForCommit and assertUnknownPathResponse both return ok: true", async () => {
    const result = await pollForCommit(siteUrl, commit, deploymentPollRetry);
    expect(result.ok).toBe(true);

    const emittedMissDocument = readFileSync(resolve(distDir, missRootEntry), "utf8");
    const response = await fetch(`${siteUrl}${randomUUID()}-does-not-exist`);
    const body = await response.text();

    expect(assertUnknownPathResponse({ status: response.status, body }, emittedMissDocument)).toEqual(
      { ok: true, value: null },
    );
  }, 320_000);
});
