import { describe, expect, it } from "vitest";

import { palette, primitives, stylesheetFor } from "../../src/presentation";
import type { HexColor, PrimitiveName } from "../../src/presentation";
import { bodyHtml } from "./fixtures";

const ALL_TEN = bodyHtml(
  '<div class="page"><nav class="bar"></nav><div class="row"><div class="stack"><div class="entry"><span class="meta"></span><hr class="rule" /><a class="link">x</a></div></div></div><div class="grid"><figure class="card"></figure></div></div>',
);

// The contract's token-block table: property name and expected literal value
// for the fixed (non-palette) entries. The five palette-derived properties
// are checked separately, against `palette` itself.
const FIXED_PROPERTIES: Record<string, string> = {
  "--step--1": "0.8rem",
  "--step-0": "1rem",
  "--step-1": "1.25rem",
  "--step-2": "1.563rem",
  "--step-3": "1.953rem",
  "--space-0": "0.75rem",
  "--space-1": "1.17rem",
  "--space-2": "1.83rem",
  "--space-3": "2.86rem",
  "--space-4": "4.47rem",
  "--measure": "34rem",
};

const PALETTE_PROPERTIES = ["--bg", "--fg", "--fg-muted", "--rule", "--link"];

function customPropertyNames(sheet: string): string[] {
  return [...sheet.matchAll(/--[a-zA-Z0-9-]+(?=:)/g)].map((m) => m[0]);
}

describe("S4.5 — stylesheetFor on a body with no primitive class returns the token block alone", () => {
  const sheet = stylesheetFor(bodyHtml("<div>nothing here</div>"));

  it("declares exactly the contract's token-block properties, and no others", () => {
    const names = customPropertyNames(sheet);
    const expected = [...Object.keys(FIXED_PROPERTIES), "--font-sans", "--font-mono", ...PALETTE_PROPERTIES];
    expect(new Set(names)).toEqual(new Set(expected));
    expect(names.length).toBe(expected.length);
  });

  it.each(Object.entries(FIXED_PROPERTIES))("%s: %s", (prop, value) => {
    expect(sheet).toContain(`${prop}: ${value};`);
  });

  it("emits the five colour values from palette", () => {
    for (const [token, prop] of [
      ["bg", "--bg"],
      ["fg", "--fg"],
      ["fg-muted", "--fg-muted"],
      ["rule", "--rule"],
      ["link", "--link"],
    ] as const) {
      expect(sheet).toContain(`${prop}: ${palette[token]};`);
    }
  });

  it("carries one further :root rule applying --bg and --fg, and no primitive rules", () => {
    expect(sheet).toContain("background-color: var(--bg);");
    expect(sheet).toContain("color: var(--fg);");
    for (const name of Object.keys(primitives) as PrimitiveName[]) {
      expect(sheet).not.toContain(primitives[name].rules);
    }
  });

  it("changing a palette value changes the block with it", () => {
    const original = palette.bg;
    try {
      (palette as { bg: HexColor }).bg = "#123456" as HexColor;
      const changed = stylesheetFor(bodyHtml("<div>nothing here</div>"));
      expect(changed).toContain("--bg: #123456;");
    } finally {
      (palette as { bg: HexColor }).bg = original;
    }
  });
});

describe("S4.6 — stylesheetFor on a two-primitive body returns the token block plus exactly those rules, in declaration order", () => {
  it("includes page and link, in PrimitiveName order, and excludes the rest", () => {
    const sheet = stylesheetFor(bodyHtml('<div class="page"><a class="link">x</a></div>'));
    expect(sheet).toContain(primitives.page.rules);
    expect(sheet).toContain(primitives.link.rules);
    expect(sheet.indexOf(primitives.page.rules)).toBeLessThan(sheet.indexOf(primitives.link.rules));
    for (const name of ["stack", "entry", "meta", "rule", "row", "bar", "grid", "card"] as PrimitiveName[]) {
      expect(sheet).not.toContain(primitives[name].rules);
    }
  });

  it("a class belonging to no primitive contributes nothing", () => {
    const withUnrelated = stylesheetFor(bodyHtml('<div class="page unrelated-thing"></div>'));
    const withoutUnrelated = stylesheetFor(bodyHtml('<div class="page"></div>'));
    expect(withUnrelated).toBe(withoutUnrelated);
  });
});

describe("S4.7 — no StylesheetText contains </style in any case", () => {
  it("composeMiss()'s stylesheet carries none", async () => {
    const { composeMiss } = await import("../../src/composition");
    expect(composeMiss().stylesheet.toLowerCase()).not.toContain("</style");
  });

  it("a fixture body referencing all eleven primitives carries none", () => {
    expect(stylesheetFor(ALL_TEN).toLowerCase()).not.toContain("</style");
  });
});

describe("S4.8 — the stylesheet for a body referencing all eleven primitives carries no forbidden construct", () => {
  const sheet = stylesheetFor(ALL_TEN);

  it("no @font-face", () => {
    expect(sheet).not.toMatch(/@font-face/i);
  });

  it("no gradient function", () => {
    expect(sheet).not.toMatch(/(linear|radial|conic)-gradient\(/i);
  });

  it("no url() naming a scheme other than data:", () => {
    const urls = [...sheet.matchAll(/url\(([^)]*)\)/gi)].map((m) => m[1]!.trim());
    for (const url of urls) {
      expect(url.startsWith("data:")).toBe(true);
    }
  });

  it("neither --font-sans nor --font-mono names a webfont (no url(), no @font-face reference)", () => {
    const fontSans = sheet.match(/--font-sans:\s*([^;]+);/)?.[1] ?? "";
    const fontMono = sheet.match(/--font-mono:\s*([^;]+);/)?.[1] ?? "";
    expect(fontSans).not.toMatch(/url\(/i);
    expect(fontMono).not.toMatch(/url\(/i);
  });
});
