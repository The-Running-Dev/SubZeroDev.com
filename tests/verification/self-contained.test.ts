import { describe, expect, it } from "vitest";

import { assertSelfContained } from "../../src/verification";

const CLEAN_DOCUMENT =
  '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
  '<link rel="canonical" href="https://subzerodev.com/">' +
  '<link rel="icon" href="data:image/svg+xml,%3Csvg%2F%3E">' +
  "<style>:root{--bg:#0F0F10;}</style></head>" +
  '<body><p><a href="https://example.com">outbound</a></p></body></html>';

describe("S6.10 — assertSelfContained", () => {
  it("returns ok: true for a document with no script, no linked stylesheet and no external asset", () => {
    expect(assertSelfContained(CLEAN_DOCUMENT)).toEqual({ ok: true, value: null });
  });

  it("returns ScriptElementPresent for a document carrying a <script>", () => {
    const doc = `${CLEAN_DOCUMENT}<script type="module" src="/entry.js"></script>`;
    const result = assertSelfContained(doc);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((e) => e.code === "ScriptElementPresent")).toBe(true);
  });

  it('returns LinkedStylesheetPresent for a document carrying a <link rel="stylesheet">', () => {
    const doc = CLEAN_DOCUMENT.replace(
      "<style>",
      '<link rel="stylesheet" href="/style.css"><style>',
    );
    const result = assertSelfContained(doc);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((e) => e.code === "LinkedStylesheetPresent")).toBe(true);
  });

  it("returns ExternalAssetReference for a document carrying an https: asset URL", () => {
    const doc = `${CLEAN_DOCUMENT}<img src="https://example.com/pic.png">`;
    const result = assertSelfContained(doc);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((e) => e.code === "ExternalAssetReference")).toBe(true);
  });

  it("a canonical link to the document's own https address is not flagged", () => {
    // CLEAN_DOCUMENT already carries one; this asserts it specifically, so a
    // regression that widens the ExternalAssetReference check has a named test
    // failing rather than only the aggregate ok: true case above.
    const result = assertSelfContained(CLEAN_DOCUMENT);
    expect(result).toEqual({ ok: true, value: null });
  });

  it("an outbound <a href> is not flagged", () => {
    const doc = `${CLEAN_DOCUMENT}`; // already carries one
    expect(assertSelfContained(doc)).toEqual({ ok: true, value: null });
  });

  it("a document carrying all three faults returns three errors in one Result", () => {
    const doc =
      `${CLEAN_DOCUMENT}` +
      `<script src="/entry.js"></script>` +
      `<link rel="stylesheet" href="/style.css">` +
      `<img src="https://example.com/pic.png">`;
    const result = assertSelfContained(doc);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toHaveLength(3);
    expect(result.errors.map((e) => e.code).sort()).toEqual(
      ["ExternalAssetReference", "LinkedStylesheetPresent", "ScriptElementPresent"].sort(),
    );
  });
});
