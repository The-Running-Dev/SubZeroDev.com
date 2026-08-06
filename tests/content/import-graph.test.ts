import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  foreignImportsNamedOutside,
  importsIntoDir,
  importViolations,
  importViolationsAllowing,
  listTsFiles,
  namedImportUsers,
  readEntries,
} from "../helpers/import-graph";

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = resolve(here, "../../src/content");
const presentationDir = resolve(here, "../../src/presentation");
const compositionDir = resolve(here, "../../src/composition");
const verificationDir = resolve(here, "../../src/verification");
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

describe("S2.8/S3.7 — nothing imports `projects` except validateInventory's call site and Verification's inventory assertion (invariant C14)", () => {
  const targetFiles = [resolve(contentDir, "projects.ts"), resolve(contentDir, "index.ts")];
  // C14's closed importer set: the S2 call site that validates the inventory,
  // and S3's live link-check test — the "Verification's inventory assertion"
  // the contract names as C14's other permitted importer.
  const callSites = [
    resolve(repoRoot, "tests/content/inventory.test.ts"),
    resolve(repoRoot, "tests/verification/live/link-check.test.ts"),
  ];

  it("the only importers across the repository are those two call sites", () => {
    const files = listTsFiles(repoRoot);
    expect(files.length).toBeGreaterThan(0);
    const users = namedImportUsers(readEntries(files), targetFiles, "projects");
    expect(users.sort()).toEqual([...callSites].sort());
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

  // Naming `projects` in a clause is only one of the ways to reach it. Each of
  // these hands over the module's whole surface without writing the symbol
  // down, and each went unflagged until the check was widened to fail closed.
  const offender = resolve(repoRoot, "src/composition/page.ts");

  it.each([
    ["a namespace import", 'import * as content from "../content";\nconst p = content.projects;'],
    ["an export-star re-export", 'export * from "../content";'],
    ["a namespace re-export", 'export * as content from "../content";'],
    ["a dynamic import", 'const { projects } = await import("../content");'],
  ])("the check has teeth: %s reaching `projects` is flagged", (_label, source) => {
    expect(namedImportUsers([{ file: offender, source }], targetFiles, "projects")).toEqual([
      offender,
    ]);
  });

  it.each([
    ["a side-effect-only import", 'import "../content";'],
    ["a namespace import of an unrelated module", 'import * as other from "../presentation/tokens";'],
  ])("%s is not flagged", (_label, source) => {
    expect(namedImportUsers([{ file: offender, source }], targetFiles, "projects")).toEqual([]);
  });
});

describe("S4.14 — Presentation imports Branded from Content, and nothing else from this repository", () => {
  it("no file under src/presentation imports anything but Branded from Content, or escapes to another module", () => {
    const files = listTsFiles(presentationDir);
    expect(files.length).toBeGreaterThan(0);
    const violations = foreignImportsNamedOutside(presentationDir, readEntries(files), contentDir, [
      "Branded",
    ]);
    expect(violations).toEqual([]);
  });

  it("the check has teeth: importing a second name from Content is flagged", () => {
    const violations = foreignImportsNamedOutside(
      presentationDir,
      [
        {
          file: resolve(presentationDir, "types.ts"),
          source: 'import type { Branded, ProjectId } from "../content";',
        },
      ],
      contentDir,
      ["Branded"],
    );
    expect(violations).toHaveLength(1);
  });

  it("the check has teeth: a namespace import of Content is flagged", () => {
    const violations = foreignImportsNamedOutside(
      presentationDir,
      [{ file: resolve(presentationDir, "types.ts"), source: 'import * as content from "../content";' }],
      contentDir,
      ["Branded"],
    );
    expect(violations).toHaveLength(1);
  });

  it("the check has teeth: a dynamic import of Content is flagged", () => {
    const violations = foreignImportsNamedOutside(
      presentationDir,
      [{ file: resolve(presentationDir, "types.ts"), source: 'const c = await import("../content");' }],
      contentDir,
      ["Branded"],
    );
    expect(violations).toHaveLength(1);
  });

  it("the check has teeth: an import escaping to a third module is flagged", () => {
    const violations = foreignImportsNamedOutside(
      presentationDir,
      [{ file: resolve(presentationDir, "types.ts"), source: 'import { checkLinks } from "../verification";' }],
      contentDir,
      ["Branded"],
    );
    expect(violations).toHaveLength(1);
  });

  it("an import of only Branded from Content is not flagged", () => {
    const violations = foreignImportsNamedOutside(
      presentationDir,
      [{ file: resolve(presentationDir, "types.ts"), source: 'import type { Branded } from "../content";' }],
      contentDir,
      ["Branded"],
    );
    expect(violations).toEqual([]);
  });
});

describe("S4.14 — Composition imports only Content and Presentation", () => {
  it("no file under src/composition imports outside Content or Presentation", () => {
    const files = listTsFiles(compositionDir);
    expect(files.length).toBeGreaterThan(0);
    const violations = importViolationsAllowing(compositionDir, readEntries(files), [
      contentDir,
      presentationDir,
    ]);
    expect(violations).toEqual([]);
  });

  it("the check has teeth: an import escaping to Verification is flagged", () => {
    const violations = importViolationsAllowing(
      compositionDir,
      [{ file: resolve(compositionDir, "miss.ts"), source: 'import { checkLinks } from "../verification";' }],
      [contentDir, presentationDir],
    );
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({ specifier: "../verification" });
  });

  it("an import from Content or Presentation is not flagged", () => {
    const violations = importViolationsAllowing(
      compositionDir,
      [
        {
          file: resolve(compositionDir, "miss.ts"),
          source: 'import { projects } from "../content";\nimport { palette } from "../presentation";',
        },
      ],
      [contentDir, presentationDir],
    );
    expect(violations).toEqual([]);
  });
});

describe("S3.7 — nothing imports Verification", () => {
  // Scoped to `src`, which is the boundary the contract states: no repository
  // module imports Verification, and its own tests necessarily do.
  const srcDir = resolve(repoRoot, "src");

  it("no source file outside src/verification imports it", () => {
    const files = listTsFiles(srcDir);
    expect(files.length).toBeGreaterThan(0);
    expect(importsIntoDir(verificationDir, readEntries(files))).toEqual([]);
  });

  it("the check has teeth: an import into src/verification from elsewhere is flagged", () => {
    const violations = importsIntoDir(verificationDir, [
      { file: resolve(contentDir, "types.ts"), source: 'import { checkLinks } from "../verification";' },
    ]);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({ specifier: "../verification" });
  });

  it("a file inside src/verification importing another file inside it is not flagged", () => {
    const violations = importsIntoDir(verificationDir, [
      { file: resolve(verificationDir, "check-links.ts"), source: 'import type { RetryPolicy } from "./types";' },
    ]);
    expect(violations).toEqual([]);
  });
});
