import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  foreignImportsNamedOutside,
  importedNamesBySpecifier,
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
const artifactDir = resolve(here, "../../src/artifact");
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

describe("the adapter is the sole production importer of the projects document validator", () => {
  const targetFiles = [resolve(contentDir, "index.ts")];
  // The Adapter owns the production source boundary; test readers consume the
  // committed JSON directly and never import a production data collection.
  const callSites = [
    resolve(repoRoot, "site/landing.config.ts"),
    resolve(repoRoot, "tests/content/documents.test.ts"),
  ];

  it("the only importers are the Adapter and document-validator tests", () => {
    const files = listTsFiles(repoRoot);
    expect(files.length).toBeGreaterThan(0);
    const users = namedImportUsers(readEntries(files), targetFiles, "projectsDocumentValidator");
    expect(users.sort()).toEqual([...callSites].sort());
  });

  it("the check has teeth: an unrelated validator import is flagged", () => {
    const users = namedImportUsers(
      [
        {
          file: resolve(repoRoot, "src/composition/page.ts"),
          source: 'import { projectsDocumentValidator } from "../content";',
        },
      ],
      targetFiles,
      "projectsDocumentValidator",
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
      "projectsDocumentValidator",
    );
    expect(users).toEqual([]);
  });

  // Naming a validator in a clause is only one of the ways to reach it. Each of
  // these hands over the module's whole surface without writing the symbol
  // down, and each went unflagged until the check was widened to fail closed.
  const offender = resolve(repoRoot, "src/composition/page.ts");

  it.each([
    ["a namespace import", 'import * as content from "../content";\nconst p = content.projectsDocumentValidator;'],
    ["an export-star re-export", 'export * from "../content";'],
    ["a namespace re-export", 'export * as content from "../content";'],
    ["a dynamic import", 'const { projectsDocumentValidator } = await import("../content");'],
  ])("the check has teeth: %s reaching the validator is flagged", (_label, source) => {
    expect(namedImportUsers([{ file: offender, source }], targetFiles, "projectsDocumentValidator")).toEqual([
      offender,
    ]);
  });

  it.each([
    ["a side-effect-only import", 'import "../content";'],
    ["a namespace import of an unrelated module", 'import * as other from "../presentation/tokens";'],
  ])("%s is not flagged", (_label, source) => {
    expect(namedImportUsers([{ file: offender, source }], targetFiles, "projectsDocumentValidator")).toEqual([]);
  });
});

describe("the adapter is the sole production importer of the testimonials document validator", () => {
  const targetFiles = [resolve(contentDir, "index.ts")];
  const callSites = [
    resolve(repoRoot, "site/landing.config.ts"),
    resolve(repoRoot, "tests/content/documents.test.ts"),
  ];

  it("the only importers across the repository are the adapter and validator tests", () => {
    const files = listTsFiles(repoRoot);
    expect(files.length).toBeGreaterThan(0);
    const users = namedImportUsers(readEntries(files), targetFiles, "testimonialsDocumentValidator");
    expect(users.sort()).toEqual([...callSites].sort());
  });

  it("the check has teeth: an unrelated validator import is flagged", () => {
    const users = namedImportUsers(
      [
        {
          file: resolve(repoRoot, "src/composition/page.ts"),
          source: 'import { testimonialsDocumentValidator } from "../content";',
        },
      ],
      targetFiles,
      "testimonialsDocumentValidator",
    );
    expect(users).toEqual([resolve(repoRoot, "src/composition/page.ts")]);
  });
});

describe("the adapter is the sole production importer of the CV document validator", () => {
  const targetFiles = [resolve(contentDir, "index.ts")];
  const callSites = [
    resolve(repoRoot, "site/landing.config.ts"),
    resolve(repoRoot, "tests/content/documents.test.ts"),
  ];

  it("the only importers across the repository are the adapter and validator tests", () => {
    const files = listTsFiles(repoRoot);
    expect(files.length).toBeGreaterThan(0);
    const users = namedImportUsers(readEntries(files), targetFiles, "cvDocumentValidator");
    expect(users.sort()).toEqual([...callSites].sort());
  });

  it("the check has teeth: an unrelated validator import is flagged", () => {
    const users = namedImportUsers(
      [
        {
          file: resolve(repoRoot, "src/composition/page.ts"),
          source: 'import { cvDocumentValidator } from "../content";',
        },
      ],
      targetFiles,
      "cvDocumentValidator",
    );
    expect(users).toEqual([resolve(repoRoot, "src/composition/page.ts")]);
  });
});

describe("the adapter is the sole production importer of the portfolio document validator", () => {
  const targetFiles = [resolve(contentDir, "index.ts")];
  const callSites = [
    resolve(repoRoot, "site/landing.config.ts"),
    resolve(repoRoot, "tests/content/documents.test.ts"),
  ];

  it("the only importers across the repository are the adapter and validator tests", () => {
    const files = listTsFiles(repoRoot);
    expect(files.length).toBeGreaterThan(0);
    const users = namedImportUsers(readEntries(files), targetFiles, "portfolioDocumentValidator");
    expect(users.sort()).toEqual([...callSites].sort());
  });

  it("the check has teeth: an unrelated validator import is flagged", () => {
    const users = namedImportUsers(
      [
        {
          file: resolve(repoRoot, "src/composition/page.ts"),
          source: 'import { portfolioDocumentValidator } from "../content";',
        },
      ],
      targetFiles,
      "portfolioDocumentValidator",
    );
    expect(users).toEqual([resolve(repoRoot, "src/composition/page.ts")]);
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

describe("S6.13 — nothing imports Composition except Adapter (X2)", () => {
  // Scoped to non-test source: `src` plus Adapter's file, which lives outside
  // it at site/landing.config.ts because that path is the package CLI's own
  // convention. Tests import Composition directly for their own assertions
  // (tests/composition/*.test.ts, tests/content/inventory.test.ts), the same
  // exemption the Verification boundary check below takes.
  const srcDir = resolve(repoRoot, "src");
  const adapterFile = resolve(repoRoot, "site/landing.config.ts");

  it("only site/landing.config.ts imports Composition among non-test source", () => {
    const files = [...listTsFiles(srcDir), adapterFile];
    expect(files.length).toBeGreaterThan(0);
    const violations = importsIntoDir(compositionDir, readEntries(files));
    expect(violations.map((v) => v.file)).toEqual([adapterFile]);
  });

  it("the check has teeth: a second non-test importer of Composition is flagged", () => {
    const violations = importsIntoDir(compositionDir, [
      {
        file: resolve(contentDir, "rogue.ts"),
        source: 'import { composeApex } from "../composition";',
      },
    ]);
    expect(violations).toHaveLength(1);
  });

  it("a file inside src/composition importing another file inside it is not flagged", () => {
    const violations = importsIntoDir(compositionDir, [
      { file: resolve(compositionDir, "apex.ts"), source: 'import type { ComposedRoute } from "./types";' },
    ]);
    expect(violations).toEqual([]);
  });
});

describe("the adapter imports Composition, the external package, document validators and its local configuration dependencies", () => {
  const adapterFile = resolve(repoRoot, "site/landing.config.ts");
  // Composition and the external package may be imported by whichever names
  // they expose — A3 closes the module list, not which symbols travel from
  // Composition or the package. Content and Presentation each close to an
  // exact name list.
  const ALLOWED_ANY_NAMES = new Set([
    "subzerodev-platform-ui-landing-page",
    "../src/composition",
  ]);
  const ALLOWED_NAMES: Record<string, readonly string[]> = {
    "../src/content": [
      "projectsDocumentValidator",
      "testimonialsDocumentValidator",
      "cvDocumentValidator",
      "portfolioDocumentValidator",
      "BuildContext",
      "Inventory",
      "Testimonials",
      "CvData",
      "PortfolioData",
      "parseCommitId",
    ],
    "../src/presentation": ["themeColor", "iconDataUri"],
  };

  it("imports only the allowed specifiers, and only the allowed names from Content and Presentation", () => {
    const source = readFileSync(adapterFile, "utf8");
    const imports = importedNamesBySpecifier(source);
    const allowedSpecifiers = new Set([...ALLOWED_ANY_NAMES, ...Object.keys(ALLOWED_NAMES)]);

    expect([...imports.keys()].sort()).toEqual([...allowedSpecifiers].sort());

    for (const [specifier, allowedNames] of Object.entries(ALLOWED_NAMES)) {
      const names = [...(imports.get(specifier) ?? [])];
      expect(names.length).toBeGreaterThan(0);
      for (const name of names) expect(allowedNames).toContain(name);
    }
  });

  it("the check has teeth: an extra Content import is flagged", () => {
    const imports = importedNamesBySpecifier(
      'import { sinceYear } from "../src/content";\nimport { projects } from "../src/content";',
    );
    const names = [...(imports.get("../src/content") ?? [])];
    const allowed = ALLOWED_NAMES["../src/content"]!;
    expect(names.some((n) => !allowed.includes(n))).toBe(true);
  });

  it("the check has teeth: an import from an unlisted specifier is flagged", () => {
    const imports = importedNamesBySpecifier('import { checkLinks } from "../src/verification";');
    const allowedSpecifiers = new Set([...ALLOWED_ANY_NAMES, ...Object.keys(ALLOWED_NAMES)]);
    expect([...imports.keys()].some((s) => !allowedSpecifiers.has(s))).toBe(true);
  });
});

describe("S7.12 — Artifact imports exactly CommitId, parseCommitId and Result from Content, and nothing else from this repository", () => {
  it("no file under src/artifact imports anything but CommitId, parseCommitId or Result from Content, or escapes to another module", () => {
    const files = listTsFiles(artifactDir);
    expect(files.length).toBeGreaterThan(0);
    const violations = foreignImportsNamedOutside(artifactDir, readEntries(files), contentDir, [
      "CommitId",
      "parseCommitId",
      "Result",
    ]);
    expect(violations).toEqual([]);
  });

  it("the check has teeth: an extra Content import is flagged", () => {
    const violations = foreignImportsNamedOutside(
      artifactDir,
      [{ file: resolve(artifactDir, "types.ts"), source: 'import type { CommitId, ProjectId } from "../content";' }],
      contentDir,
      ["CommitId", "parseCommitId", "Result"],
    );
    expect(violations).toHaveLength(1);
  });

  it("the check has teeth: a namespace import of Content is flagged", () => {
    const violations = foreignImportsNamedOutside(
      artifactDir,
      [{ file: resolve(artifactDir, "types.ts"), source: 'import * as content from "../content";' }],
      contentDir,
      ["CommitId", "parseCommitId", "Result"],
    );
    expect(violations).toHaveLength(1);
  });

  it("the check has teeth: an import escaping to a third module is flagged", () => {
    const violations = foreignImportsNamedOutside(
      artifactDir,
      [{ file: resolve(artifactDir, "types.ts"), source: 'import { checkLinks } from "../verification";' }],
      contentDir,
      ["CommitId", "parseCommitId", "Result"],
    );
    expect(violations).toHaveLength(1);
  });

  it("an import of only the three allowed names from Content is not flagged", () => {
    const violations = foreignImportsNamedOutside(
      artifactDir,
      [
        {
          file: resolve(artifactDir, "types.ts"),
          source: 'import type { CommitId, Result } from "../content";\nimport { parseCommitId } from "../content";',
        },
      ],
      contentDir,
      ["CommitId", "parseCommitId", "Result"],
    );
    expect(violations).toEqual([]);
  });
});

describe("S14.7 — checkLinks is called only by the live link-check shard and its own unit test (C17)", () => {
  const targetFiles = [resolve(verificationDir, "index.ts")];
  const callSites = [
    resolve(repoRoot, "tests/verification/live/link-check.test.ts"),
    resolve(repoRoot, "tests/verification/check-links.test.ts"),
  ];

  it("the only callers across the repository are the live shard and the direct unit test", () => {
    const files = listTsFiles(repoRoot);
    expect(files.length).toBeGreaterThan(0);
    const users = namedImportUsers(readEntries(files), targetFiles, "checkLinks");
    expect(users.sort()).toEqual([...callSites].sort());
  });

  it("the check has teeth: an unrelated caller is flagged", () => {
    const users = namedImportUsers(
      [
        {
          file: resolve(compositionDir, "apex.ts"),
          source: 'import { checkLinks } from "../verification";',
        },
      ],
      targetFiles,
      "checkLinks",
    );
    expect(users).toEqual([resolve(compositionDir, "apex.ts")]);
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
