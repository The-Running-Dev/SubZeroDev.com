// Reads the real, finalized output of `npm run build` + globalSetup's
// finalizeArtifact call (S7.6, S7.9, S7.10) — same convention as
// emitted-document.test.ts: this suite's own vitest config is the only one
// that includes it, and global-setup.ts runs finalizeArtifact before any test
// file here executes.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { missRootEntry } from "../../src/artifact";
import type { CommitId } from "../../src/content";
import { assertEveryDocumentMarked, assertRootMissDocument } from "../../src/verification";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, "../../site/dist");

const commit = process.env.GITHUB_SHA as CommitId;

const documents = [
  { relativePath: "index.html", html: readFileSync(resolve(distDir, "index.html"), "utf8") },
  { relativePath: "404/index.html", html: readFileSync(resolve(distDir, "404/index.html"), "utf8") },
  { relativePath: missRootEntry, html: readFileSync(resolve(distDir, "404.html"), "utf8") },
];

describe("S7.6/S7.9 — every document in the finished tree carries the exact commit's marker", () => {
  it("assertEveryDocumentMarked returns ok: true", () => {
    expect(assertEveryDocumentMarked(documents, commit)).toEqual({ ok: true, value: null });
  });
});

describe("S7.10 — the root miss document is present in the finished tree", () => {
  it("assertRootMissDocument returns ok: true", () => {
    expect(assertRootMissDocument(documents)).toEqual({ ok: true, value: null });
  });
});
