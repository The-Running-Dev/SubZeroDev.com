// The publish-preview job's Pages read-back (design/30-slices.md § S10.8).
// Runs only under `vitest.publish.config.ts`'s own job, after
// `publish-preview` has deployed to Pages — same convention as
// `vitest.build.config.ts`, `vitest.link-check.config.ts` and
// `vitest.image-gate.config.ts`: a plain `vitest run` never reaches the
// network.

import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { missRootEntry } from "../../src/artifact";
import type { AbsoluteUrl, CommitId } from "../../src/content";
import {
  assertServedBytesMatchEmitted,
  assertUnknownPathResponse,
  deploymentPollRetry,
  pollForCommit,
} from "../../src/verification";
import { unknownPathUrl } from "./unknown-path-url";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, "../../site/dist");

const commit = process.env.GITHUB_SHA as CommitId;
const pagesUrl = process.env.PAGES_URL as AbsoluteUrl;

describe("S10.8 — the deployed Pages apex serves the exact commit byte for byte and answers an unknown path with 404", () => {
  it("pollForCommit, assertServedBytesMatchEmitted and assertUnknownPathResponse all return ok: true", async () => {
    const result = await pollForCommit(pagesUrl, commit, deploymentPollRetry);
    expect(result.ok).toBe(true);

    const emitted = readFileSync(resolve(distDir, "index.html"));
    const rootResponse = await fetch(pagesUrl);
    const servedBytes = new Uint8Array(await rootResponse.arrayBuffer());

    expect(assertServedBytesMatchEmitted(servedBytes, new Uint8Array(emitted))).toEqual({
      ok: true,
      value: null,
    });

    const emittedMissDocument = readFileSync(resolve(distDir, missRootEntry), "utf8");
    const response = await fetch(unknownPathUrl(pagesUrl, `${randomUUID()}-does-not-exist`));
    const body = await response.text();

    expect(assertUnknownPathResponse({ status: response.status, body }, emittedMissDocument)).toEqual(
      { ok: true, value: null },
    );
  }, 320_000);
});

// S17.12 — V11's Pages-read-back half covers the CV and portfolio routes
// too, each compared against its own emitted document. No further poll is
// needed: S10.8's poll above already confirmed this exact commit is live.
describe.each([
  ["the CV", "cv/", "cv/index.html"],
  ["the portfolio", "portfolio/", "portfolio/index.html"],
] as const)("S17.12 — the deployed Pages %s route serves the exact commit byte for byte", (_name, routePath, emittedPath) => {
  it("assertServedBytesMatchEmitted returns ok: true", async () => {
    const emitted = readFileSync(resolve(distDir, emittedPath));
    const response = await fetch(unknownPathUrl(pagesUrl, routePath));
    const servedBytes = new Uint8Array(await response.arrayBuffer());

    expect(assertServedBytesMatchEmitted(servedBytes, new Uint8Array(emitted))).toEqual({
      ok: true,
      value: null,
    });
  }, 320_000);
});
