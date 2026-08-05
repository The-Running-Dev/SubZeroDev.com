import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  importViolations,
  listTsFiles,
  namedImportUsers,
  readEntries,
} from "../helpers/import-graph";

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = resolve(here, "../../src/content");
const repoRoot = resolve(here, "../..");

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

  it("a dynamic import escaping src/content is flagged", () => {
    const violations = importViolations(contentDir, [
      { file: resolve(contentDir, "types.ts"), source: 'const t = await import("../presentation/tokens");' },
    ]);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({ specifier: "../presentation/tokens" });
  });

  it("an import-like sequence in a comment or string is not flagged", () => {
    const violations = importViolations(contentDir, [
      {
        file: resolve(contentDir, "types.ts"),
        source: [
          '// import { tokens } from "../presentation/tokens";',
          'const note = \'see import { x } from "../presentation/tokens"\';',
        ].join("\n"),
      },
    ]);
    expect(violations).toEqual([]);
  });
});

describe("S2.8 — nothing imports `projects` except the validateInventory call site (invariant C14)", () => {
  const targetFiles = [resolve(contentDir, "projects.ts"), resolve(contentDir, "index.ts")];
  const callSite = resolve(repoRoot, "tests/content/inventory.test.ts");

  it("the only importer across the repository is the validateInventory call site", () => {
    const files = listTsFiles(repoRoot);
    expect(files.length).toBeGreaterThan(0);
    const users = namedImportUsers(readEntries(files), targetFiles, "projects");
    expect(users).toEqual([callSite]);
  });

  it("the check has teeth: an unrelated file importing `projects` is flagged", () => {
    const users = namedImportUsers(
      [
        {
          file: resolve(repoRoot, "src/composition/page.ts"),
          source: 'import { projects } from "../content";',
        },
      ],
      targetFiles,
      "projects",
    );
    expect(users).toEqual([resolve(repoRoot, "src/composition/page.ts")]);
  });

  it("an import of a different named binding from the same module is not flagged", () => {
    const users = namedImportUsers(
      [
        {
          file: resolve(repoRoot, "src/composition/page.ts"),
          source: 'import { validateInventory } from "../content";',
        },
      ],
      targetFiles,
      "projects",
    );
    expect(users).toEqual([]);
  });
});
