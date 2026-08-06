import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { palette, themeColor } from "../../src/presentation";
import type { ColorToken } from "../../src/presentation";
import { listTsFiles } from "../helpers/import-graph";

const here = dirname(fileURLToPath(import.meta.url));
const presentationDir = resolve(here, "../../src/presentation");
const contractPath = resolve(here, "../../design/20-contract.md");

// The contract's token-block table is *parsed*, not transcribed. A second copy
// of the table living here would only prove this file agrees with itself: a
// change that edits `palette.ts` and its expectations together goes green while
// `20-contract.md` stays stale, which is exactly how the 2026-08-07 palette
// drift reached a fully passing suite. Reading the table out of the document
// makes the contract a party to the check.
//
// The row shape this depends on is the five colour rows of § *Public
// signatures* → *Presentation* → *The token block*:
//
//   | `--bg` | `palette.bg`, `#111113` | |
//
// A reflow that breaks it must fail loudly rather than yield an empty table and
// pass vacuously, which is what the arity assertion below is for.
const TOKEN_ROW = /^\|\s*`--([a-z-]+)`\s*\|\s*`palette[^`]*`,\s*`(#[0-9A-F]{6})`\s*\|/gm;

function contractPalette(): Record<string, string> {
  const source = readFileSync(contractPath, "utf8");
  const table: Record<string, string> = {};
  for (const match of source.matchAll(TOKEN_ROW)) {
    table[match[1]!] = match[2]!;
  }
  return table;
}

const EXPECTED = contractPalette();

describe("S4.1 — palette has exactly the five ColorToken keys, matching the contract's table", () => {
  it("the contract's token-block table parsed five colour rows", () => {
    // Guards every assertion below: an unparseable table would otherwise make
    // each `it.each` case vacuous and the suite green against nothing.
    expect(Object.keys(EXPECTED)).toHaveLength(5);
  });

  it("has exactly the expected keys", () => {
    expect(Object.keys(palette).sort()).toEqual(Object.keys(EXPECTED).sort());
  });

  it.each(Object.keys(palette) as ColorToken[])("%s matches /^#[0-9A-F]{6}$/ and the contract value", (token) => {
    expect(palette[token]).toMatch(/^#[0-9A-F]{6}$/);
    expect(palette[token]).toBe(EXPECTED[token]);
  });
});

describe("S4.2 — themeColor is palette.bg, and no other six-digit hex literal exists in Presentation's source", () => {
  it("themeColor === palette.bg", () => {
    expect(themeColor).toBe(palette.bg);
  });

  it("no file under src/presentation other than palette.ts carries a six-digit hex literal", () => {
    const files = listTsFiles(presentationDir).filter((f) => !f.endsWith("palette.ts"));
    expect(files.length).toBeGreaterThan(0);
    const hexPattern = /#[0-9A-Fa-f]{6}\b/;
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, `${file} should carry no hex literal`).not.toMatch(hexPattern);
    }
  });

  it("palette.ts is exactly where the six hex literals for the five tokens live", () => {
    const source = readFileSync(resolve(presentationDir, "palette.ts"), "utf8");
    const matches = source.match(/#[0-9A-F]{6}\b/g) ?? [];
    expect(matches.sort()).toEqual(Object.values(EXPECTED).sort());
  });
});
