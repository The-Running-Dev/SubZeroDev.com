import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");
const PACKAGE_NAME = "subzerodev-platform-ui-landing-page";
const PINNED_VERSION = "0.3.0";

describe("S6.1 — the landing-page package is pinned at 0.3.0 exactly", () => {
  const pkg = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const declared = pkg.dependencies?.[PACKAGE_NAME] ?? pkg.devDependencies?.[PACKAGE_NAME];

  it("package.json names it with no range prefix", () => {
    expect(declared).toBe(PINNED_VERSION);
  });

  it("package-lock.json resolves exactly that version", () => {
    const lock = JSON.parse(readFileSync(resolve(repoRoot, "package-lock.json"), "utf8")) as {
      packages?: Record<string, { version?: string }>;
    };
    const resolved = lock.packages?.[`node_modules/${PACKAGE_NAME}`]?.version;
    expect(resolved).toBe(PINNED_VERSION);
  });
});
