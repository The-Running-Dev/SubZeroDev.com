import { describe, expect, it } from "vitest";

import { buildMarker, missEmittedEntry, missRootEntry } from "../../src/artifact";
import type { EmittedDocument } from "../../src/artifact";
import type { CommitId } from "../../src/content";
import {
  assertEveryDocumentMarked,
  assertMissEntryRemoved,
  assertRootMissDocument,
  readBuildMarker,
} from "../../src/verification";

const COMMIT = "a".repeat(40) as CommitId;
const OTHER_COMMIT = "b".repeat(40) as CommitId;

function doc(relativePath: string, html: string): EmittedDocument {
  return { relativePath, html };
}

describe("readBuildMarker", () => {
  it("returns the commit for a document carrying one marker", () => {
    const html = `<head>${buildMarker(COMMIT)}</head>`;
    expect(readBuildMarker(html)).toEqual({ ok: true, value: COMMIT });
  });

  it("returns MarkerAbsent for a document carrying no marker", () => {
    const result = readBuildMarker("<head></head>");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].code).toBe("MarkerAbsent");
  });

  it("returns MarkerDuplicate for a document carrying two markers", () => {
    const html = `<head>${buildMarker(COMMIT)}${buildMarker(OTHER_COMMIT)}</head>`;
    const result = readBuildMarker(html);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].code).toBe("MarkerDuplicate");
  });
});

describe("S7.9 — assertEveryDocumentMarked", () => {
  it("returns ok: true when every document carries the expected commit's marker", () => {
    const documents = [
      doc("index.html", `<head>${buildMarker(COMMIT)}</head>`),
      doc("404/index.html", `<head>${buildMarker(COMMIT)}</head>`),
      doc(missRootEntry, `<head>${buildMarker(COMMIT)}</head>`),
    ];
    expect(assertEveryDocumentMarked(documents, COMMIT)).toEqual({ ok: true, value: null });
  });

  it("a document with no marker returns MarkerAbsent", () => {
    const documents = [doc("index.html", "<head></head>")];
    const result = assertEveryDocumentMarked(documents, COMMIT);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toEqual(["MarkerAbsent"]);
  });

  it("a document carrying two markers returns MarkerDuplicate", () => {
    const documents = [doc("index.html", `<head>${buildMarker(COMMIT)}${buildMarker(COMMIT)}</head>`)];
    const result = assertEveryDocumentMarked(documents, COMMIT);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toEqual(["MarkerDuplicate"]);
  });

  it("a document carrying a different valid commit returns MarkerMismatch", () => {
    const documents = [doc("index.html", `<head>${buildMarker(OTHER_COMMIT)}</head>`)];
    const result = assertEveryDocumentMarked(documents, COMMIT);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toEqual([
      {
        code: "MarkerMismatch",
        detail: "index.html carries a different commit's marker.",
        observed: OTHER_COMMIT,
        expected: COMMIT,
      },
    ]);
  });

  it("a tree carrying all three faults returns three errors in one Result", () => {
    const documents = [
      doc("absent.html", "<head></head>"),
      doc("duplicate.html", `<head>${buildMarker(COMMIT)}${buildMarker(COMMIT)}</head>`),
      doc("mismatch.html", `<head>${buildMarker(OTHER_COMMIT)}</head>`),
    ];
    const result = assertEveryDocumentMarked(documents, COMMIT);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code).sort()).toEqual(
      ["MarkerAbsent", "MarkerDuplicate", "MarkerMismatch"].sort(),
    );
  });
});

describe("S7.10 — assertRootMissDocument", () => {
  it("returns ok: true when missRootEntry is present", () => {
    const documents = [doc("index.html", "..."), doc(missRootEntry, "...")];
    expect(assertRootMissDocument(documents)).toEqual({ ok: true, value: null });
  });

  it("returns RootMissDocumentAbsent when missRootEntry is absent", () => {
    const documents = [doc("index.html", "..."), doc("404/index.html", "...")];
    const result = assertRootMissDocument(documents);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].code).toBe("RootMissDocumentAbsent");
  });
});

describe("R2 — assertMissEntryRemoved", () => {
  it("returns ok: true when missEmittedEntry is absent", () => {
    const documents = [doc("index.html", "..."), doc(missRootEntry, "...")];
    expect(assertMissEntryRemoved(documents)).toEqual({ ok: true, value: null });
  });

  it("returns MissEntryStillPresent when missEmittedEntry survives", () => {
    const documents = [
      doc("index.html", "..."),
      doc(missRootEntry, "..."),
      doc(missEmittedEntry, "..."),
    ];
    const result = assertMissEntryRemoved(documents);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toEqual([
      {
        code: "MissEntryStillPresent",
        detail: `"${missEmittedEntry}" survives into the finished tree, so the miss composition is reachable at a 200.`,
        observed: missEmittedEntry,
        expected: null,
      },
    ]);
  });
});
