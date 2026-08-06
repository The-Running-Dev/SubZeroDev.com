import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { palette, themeColor } from "../../src/presentation";
import type { ColorToken } from "../../src/presentation";
import { listTsFiles } from "../helpers/import-graph";

const here = dirname(fileURLToPath(import.meta.url));
const presentationDir = resolve(here, "../../src/presentation");

// The contract's token-block table, transcribed once here so a drift between
// the table and `palette` fails a test rather than going unnoticed.
const EXPECTED: Record<ColorToken, string> = {
  bg: "#0F0F10",
  fg: "#E8E8E9",
  "fg-muted": "#8C8C8F",
  rule: "#252527",
  link: "#6E92C8",
};

describe("S4.1 — palette has exactly the five ColorToken keys, matching the contract's table", () => {
  it("has exactly the expected keys", () => {
    expect(Object.keys(palette).sort()).toEqual(Object.keys(EXPECTED).sort());
  });

  it.each(Object.keys(EXPECTED) as ColorToken[])("%s matches /^#[0-9A-F]{6}$/ and the contract value", (token) => {
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
