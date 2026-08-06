import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { parseCommitId } from "../../src/content";
import { listTsFiles, readEntries } from "../helpers/import-graph";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");

describe("S6.2 — parseCommitId", () => {
  it("returns a CommitId for a forty-character lowercase hex string", () => {
    const value = "a".repeat(40);
    expect(parseCommitId(value)).toBe(value);
  });

  it("returns null for a thirty-nine-character string", () => {
    expect(parseCommitId("a".repeat(39))).toBeNull();
  });

  it("returns null for a forty-one-character string", () => {
    expect(parseCommitId("a".repeat(41))).toBeNull();
  });

  it("returns null for an uppercase value", () => {
    expect(parseCommitId("A".repeat(40))).toBeNull();
  });

  it("returns null for a non-hex value", () => {
    expect(parseCommitId("g".repeat(40))).toBeNull();
  });
});

describe("S6.2 — parseCommitId is the only implementation of the forty-hex pattern (C15)", () => {
  // The pattern's own definition (src/content/commit.ts) is excluded; every
  // other repository source file is scanned for the same regular expression
  // text, in either character-class order.
  const PATTERN_TEXT = [/\[0-9a-f\]\{40\}/, /\[a-f0-9\]\{40\}/];

  it("no file other than src/content/commit.ts contains the forty-hex pattern", () => {
    const ownFile = resolve(repoRoot, "src/content/commit.ts");
    // This test file's own literal copy of the pattern text (used to search for
    // it) is excluded from the search — it names the pattern, it does not
    // implement it.
    const thisFile = resolve(here, "commit.test.ts");
    const files = listTsFiles(repoRoot).filter((f) => f !== ownFile && f !== thisFile);
    expect(files.length).toBeGreaterThan(0);

    const offenders = readEntries(files).filter(({ source }) =>
      PATTERN_TEXT.some((pattern) => pattern.test(source)),
    );
    expect(offenders.map((o) => o.file)).toEqual([]);
  });
});
