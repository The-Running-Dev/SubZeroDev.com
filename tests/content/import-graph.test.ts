import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { importViolations, listTsFiles, readEntries } from "../helpers/import-graph";

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = resolve(here, "../../src/content");

describe("S1.10 — Content imports no other repository module (invariant C1)", () => {
  it("no file under src/content imports outside the module", () => {
    const files = listTsFiles(contentDir);
    expect(files.length).toBeGreaterThan(0);
    expect(importViolations(contentDir, readEntries(files))).toEqual([]);
  });

  it("the check has teeth: an import escaping src/content is flagged", () => {
    const violations = importViolations(contentDir, [
      { file: resolve(contentDir, "types.ts"), source: 'import { tokens } from "../presentation/tokens";' },
    ]);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({ specifier: "../presentation/tokens" });
  });
});
