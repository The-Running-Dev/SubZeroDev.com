// S6.8 — run against a deliberately malformed fixture inventory, the build
// reports every ContentError rather than the first, exits non-zero, and
// leaves the output directory with no document in it (A5).
//
// Runs the real package CLI as a subprocess against
// tests/build/fixtures/malformed-adapter.config.ts, rather than importing
// Adapter's failure path in-process — that path ends in `process.exit`, which
// would take the test runner down with it.

import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");
const cliPath = resolve(
  repoRoot,
  "node_modules/subzerodev-platform-ui-landing-page/dist/cli.js",
);

let outDir: string;

beforeEach(() => {
  outDir = mkdtempSync(join(tmpdir(), "szd-s6-8-"));
});

afterEach(() => {
  rmSync(outDir, { recursive: true, force: true });
});

describe("S6.8 — a malformed inventory fails the build with every ContentError, and writes no document", () => {
  it("exits non-zero, reports every fault, and leaves the output directory empty", () => {
    const result = spawnSync(
      process.execPath,
      [
        cliPath,
        "build",
        "--adapter",
        "tests/build/fixtures/malformed-adapter.config.ts",
        "--out-dir",
        outDir,
      ],
      { cwd: repoRoot, encoding: "utf8" },
    );

    expect(result.status).not.toBe(0);

    const stderr = result.stderr;
    expect(stderr).toContain("MalformedProjectId");
    expect(stderr).toContain("EmptyField");
    expect(stderr).toContain("InvalidYear");
    // EmptyField is raised twice (name and line) — both distinct occurrences
    // are present rather than deduplicated, which is what proves every fault
    // was reported rather than only the first.
    expect(stderr.split("EmptyField").length - 1).toBe(2);

    const emitted = existsSync(outDir) ? readdirSync(outDir, { recursive: true }) : [];
    expect(emitted.filter((entry) => String(entry).endsWith(".html"))).toEqual([]);
  });
});
