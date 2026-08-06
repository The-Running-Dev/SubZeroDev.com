// The in-CI image gate (design/30-slices.md § S9.3–S9.6). Runs only under
// `vitest.image-gate.config.ts`'s own job, against a container the
// `image-gate` CI job has already built from `site/dist` and
// `site/server/default.conf` and started at `SERVED_BASE_URL` — same
// convention as `vitest.build.config.ts` and `vitest.link-check.config.ts`:
// a plain `vitest run` never reaches a container or the network.
//
// S9.6 — no cookie, no application-chosen cache-control directive, no
// tracking or rewrite header — is asserted here directly over the response's
// headers (R4 observed rather than argued from `serverConfig()`'s text); it
// has no dedicated contract function.

import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { missRootEntry } from "../../src/artifact";
import type { CommitId } from "../../src/content";
import {
  assertImageIdentity,
  assertServedBytesMatchEmitted,
  assertUnknownPathResponse,
  readBuildMarker,
} from "../../src/verification";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, "../../site/dist");

const commit = process.env.GITHUB_SHA as CommitId;
const imageTag = process.env.GITHUB_SHA as string;
const baseUrl = process.env.SERVED_BASE_URL ?? "http://localhost:8080";

describe("S9.3/S9.4 — the running image serves the emitted apex byte for byte, tagged with its commit", () => {
  it("assertServedBytesMatchEmitted and assertImageIdentity both return ok: true", async () => {
    const emitted = readFileSync(resolve(distDir, "index.html"));
    const response = await fetch(`${baseUrl}/`);
    const servedBytes = new Uint8Array(await response.arrayBuffer());
    const servedHtml = new TextDecoder().decode(servedBytes);

    expect(assertServedBytesMatchEmitted(servedBytes, new Uint8Array(emitted))).toEqual({
      ok: true,
      value: null,
    });

    const marker = readBuildMarker(servedHtml);
    expect(marker.ok).toBe(true);
    if (!marker.ok) return;

    expect(assertImageIdentity(imageTag, marker.value, commit)).toEqual({
      ok: true,
      value: null,
    });
  });
});

describe("S9.5/S9.6 — a unique unknown path answers the emitted miss document with a bare 404", () => {
  it("assertUnknownPathResponse returns ok: true, and the response carries no cookie, cache-control or tracking header", async () => {
    const emittedMissDocument = readFileSync(resolve(distDir, missRootEntry), "utf8");
    const response = await fetch(`${baseUrl}/${randomUUID()}-does-not-exist`);
    const body = await response.text();

    expect(assertUnknownPathResponse({ status: response.status, body }, emittedMissDocument)).toEqual({
      ok: true,
      value: null,
    });

    expect(response.headers.has("set-cookie")).toBe(false);
    expect(response.headers.has("cache-control")).toBe(false);
    for (const name of response.headers.keys()) {
      expect(name.toLowerCase().startsWith("x-")).toBe(false);
    }
  });
});
