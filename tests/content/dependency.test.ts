import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");
const PACKAGE_NAME = "subzerodev-platform-ui-landing-page";
const PINNED_VERSION = "0.4.1";
const DATA_JSON_PACKAGE_NAME = "subzerodev-data-json";
const DATA_JSON_PINNED_VERSION = "0.2.0";
const ZOD_PACKAGE_NAME = "zod";
const ZOD_PINNED_VERSION = "4.4.3";

describe("the build-time data dependencies are pinned exactly", () => {
  const pkg = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };

  it("package.json names every package with no range prefix", () => {
    expect(dependencies[PACKAGE_NAME]).toBe(PINNED_VERSION);
    expect(dependencies[DATA_JSON_PACKAGE_NAME]).toBe(DATA_JSON_PINNED_VERSION);
    expect(dependencies[ZOD_PACKAGE_NAME]).toBe(ZOD_PINNED_VERSION);
  });

  it("package-lock.json resolves every declared version exactly", () => {
    const lock = JSON.parse(readFileSync(resolve(repoRoot, "package-lock.json"), "utf8")) as {
      packages?: Record<string, { version?: string }>;
    };
    expect(lock.packages?.[`node_modules/${PACKAGE_NAME}`]?.version).toBe(PINNED_VERSION);
    expect(lock.packages?.[`node_modules/${DATA_JSON_PACKAGE_NAME}`]?.version).toBe(
      DATA_JSON_PINNED_VERSION,
    );
    expect(lock.packages?.[`node_modules/${ZOD_PACKAGE_NAME}`]?.version).toBe(ZOD_PINNED_VERSION);
  });
});
