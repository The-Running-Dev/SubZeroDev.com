// S15.12 — a fixture adapter whose CV source is malformed produces no route
// body, stylesheet or document, extending A5's report-every-error-then-exit
// coverage to a third content collection (S6.8 covers the inventory,
// S11.12/malformed-testimonials-adapter.config.ts covers testimonials).
//
// Runs the real package CLI as a subprocess, on the same footing
// tests/build/malformed-inventory.test.ts already does.

import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");
const cliPath = resolve(repoRoot, "node_modules/subzerodev-platform-ui-landing-page/dist/cli.js");

let outDir: string;

beforeEach(() => {
  outDir = mkdtempSync(join(tmpdir(), "szd-s15-12-"));
});

afterEach(() => {
  rmSync(outDir, { recursive: true, force: true });
});

describe("S15.12 — a malformed CV fails the build with every ContentError, and writes no document", () => {
  it("exits non-zero, reports every CV fault, and leaves the output directory empty", () => {
    const result = spawnSync(
      process.execPath,
      [
        cliPath,
        "build",
        "--adapter",
        "tests/build/fixtures/malformed-cv-adapter.config.ts",
        "--out-dir",
        outDir,
      ],
      { cwd: repoRoot, encoding: "utf8" },
    );

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("CvFieldEmpty");
    expect(result.stderr).toContain("CvYearInvalid");
    expect(result.stderr).not.toContain("MalformedProjectId");
    expect(result.stderr).not.toContain("Testimonial");

    const emitted = existsSync(outDir) ? readdirSync(outDir, { recursive: true }) : [];
    expect(emitted.filter((entry) => String(entry).endsWith(".html"))).toEqual([]);
  });
});
