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

  it("a single application/ld+json script is not flagged (X6)", () => {
    const doc = `${CLEAN_DOCUMENT}<script type="application/ld+json">{"@type":"Organization"}</script>`;
    expect(assertSelfContained(doc)).toEqual({ ok: true, value: null });
  });

  it("a second application/ld+json script is flagged", () => {
    const oneBlock = `<script type="application/ld+json">{"@type":"Organization"}</script>`;
    const doc = `${CLEAN_DOCUMENT}${oneBlock}${oneBlock}`;
    const result = assertSelfContained(doc);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.filter((e) => e.code === "ScriptElementPresent")).toHaveLength(1);
  });

  it("an application/ld+json script whose content carries a </script sequence in any case is flagged", () => {
    // "</scriptTag>" is not itself a valid closing tag (the tag name does not
    // match), so the real </script> further on is what actually closes the
    // element — exercising the content check against a genuine </script
    // substring that survives inside the matched content, rather than one
    // that terminates the match early.
    const doc = `${CLEAN_DOCUMENT}<script type="application/ld+json">{"x":"</scriptTag>"}</script>`;
    const result = assertSelfContained(doc);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((e) => e.code === "ScriptElementPresent")).toBe(true);
  });

  it("an application/ld+json script carrying a src attribute is flagged", () => {
    const doc = `${CLEAN_DOCUMENT}<script type="application/ld+json" src="/data.json">{}</script>`;
    const result = assertSelfContained(doc);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((e) => e.code === "ScriptElementPresent")).toBe(true);
  });

  it("a single inline enhancement script with no type attribute is permitted (X10)", () => {
    const doc = `${CLEAN_DOCUMENT}<script>console.log("hi");</script>`;
    expect(assertSelfContained(doc)).toEqual({ ok: true, value: null });
  });

  it("the JSON-LD block and one inline enhancement script together are permitted (S12.3)", () => {
    const doc =
      `${CLEAN_DOCUMENT}` +
      `<script type="application/ld+json">{"@type":"Organization"}</script>` +
      `<script>console.log("hi");</script>`;
    expect(assertSelfContained(doc)).toEqual({ ok: true, value: null });
  });

  it("a second inline enhancement script is flagged — only one is permitted", () => {
    const oneScript = `<script>console.log("hi");</script>`;
    const doc = `${CLEAN_DOCUMENT}${oneScript}${oneScript}`;
    const result = assertSelfContained(doc);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.filter((e) => e.code === "ScriptElementPresent")).toHaveLength(1);
  });

  it("an inline enhancement script carrying a src attribute is flagged", () => {
    const doc = `${CLEAN_DOCUMENT}<script src="/enhance.js"></script>`;
    const result = assertSelfContained(doc);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((e) => e.code === "ScriptElementPresent")).toBe(true);
  });

  it("an inline enhancement script whose content carries a </script sequence in any case is flagged", () => {
    const doc = `${CLEAN_DOCUMENT}<script>var s = "</scriptTag>";</script>`;
    const result = assertSelfContained(doc);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.some((e) => e.code === "ScriptElementPresent")).toBe(true);
  });

  it("a third script element — beyond one ld+json and one enhancement script — is flagged", () => {
    const doc =
      `${CLEAN_DOCUMENT}` +
      `<script type="application/ld+json">{"@type":"Organization"}</script>` +
      `<script>console.log("hi");</script>` +
      `<script type="text/x-dc">{}</script>`;
    const result = assertSelfContained(doc);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.filter((e) => e.code === "ScriptElementPresent")).toHaveLength(1);
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
