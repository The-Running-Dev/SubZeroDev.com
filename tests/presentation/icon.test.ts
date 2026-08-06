import { describe, expect, it } from "vitest";

import { iconDataUri, palette } from "../../src/presentation";

describe("S4.10 — iconDataUri begins with data: and decodes to SVG whose only colour literals are palette.fg and palette.bg", () => {
  it("begins with data:", () => {
    expect(iconDataUri.startsWith("data:")).toBe(true);
  });

  it("decodes to an <svg> document", () => {
    const decoded = decodeURIComponent(iconDataUri.replace(/^data:[^,]*,/, ""));
    expect(decoded).toMatch(/^<svg[\s>]/);
    expect(decoded).toContain("</svg>");
  });

  it("carries no colour literal other than palette.fg and palette.bg", () => {
    const decoded = decodeURIComponent(iconDataUri.replace(/^data:[^,]*,/, ""));
    const literals = new Set([...decoded.matchAll(/#[0-9A-Fa-f]{6}/g)].map((m) => m[0]));
    expect(literals).toEqual(new Set([palette.fg, palette.bg]));
  });
});
