// Reads the real output of `npm run build` off disk, same as
// emitted-document.test.ts — this file's own vitest config
// (vitest.build.config.ts) is the only one that includes it.
//
// Drives Chromium against `site/dist` served over a local static server
// (90-decisions.md, 2026-08-06) to prove `V2`: a route document triggers
// zero requests beyond the navigation document itself.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { assertNoAdditionalRequests } from "../../src/verification";
import type { RequestRecord } from "../../src/verification";
import { captureRequests } from "./browser-capture";
import { startStaticServer } from "./static-server";
import type { StaticServer } from "./static-server";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, "../../site/dist");

let server: StaticServer;

beforeAll(async () => {
  server = await startStaticServer(distDir);
});

afterAll(async () => {
  await server.close();
});

describe("S8.2 — the emitted apex document triggers no request beyond its own navigation", () => {
  it("produces exactly one RequestRecord, the navigation, initiatedByTester true", async () => {
    const records = await captureRequests(server.url + "/");
    expect(records).toHaveLength(1);
    expect(records[0]!.initiatedByTester).toBe(true);
  });
});

describe("S8.3 — the emitted miss document triggers no request beyond its own navigation", () => {
  it("produces exactly one RequestRecord, the navigation, initiatedByTester true", async () => {
    const records = await captureRequests(server.url + "/404");
    expect(records).toHaveLength(1);
    expect(records[0]!.initiatedByTester).toBe(true);
  });
});

describe("S8.4 — assertNoAdditionalRequests", () => {
  const navigation: RequestRecord = {
    url: "http://127.0.0.1/",
    resourceType: "document",
    initiatedByTester: true,
  };

  it("returns ok: true for a capture with only the navigation record", () => {
    expect(assertNoAdditionalRequests([navigation])).toEqual({ ok: true, value: null });
  });

  it("returns UnexpectedRequest naming the extra record's url for one additional record", () => {
    const extra: RequestRecord = {
      url: "http://127.0.0.1/favicon.ico",
      resourceType: "other",
      initiatedByTester: false,
    };
    const result = assertNoAdditionalRequests([navigation, extra]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({ code: "UnexpectedRequest", observed: extra.url });
    }
  });

  it("returns three errors in one Result for three additional records", () => {
    const extras: RequestRecord[] = ["/a", "/b", "/c"].map((path) => ({
      url: `http://127.0.0.1${path}`,
      resourceType: "other",
      initiatedByTester: false,
    }));
    const result = assertNoAdditionalRequests([navigation, ...extras]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(3);
    }
  });
});
