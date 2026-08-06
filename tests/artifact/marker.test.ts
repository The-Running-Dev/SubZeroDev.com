import { describe, expect, it } from "vitest";

import type { CommitId } from "../../src/content";
import { buildMarker, buildMarkerPrefix, buildMarkerSuffix, injectBuildMarker } from "../../src/artifact";

const COMMIT = "a".repeat(40) as CommitId;
const OTHER_COMMIT = "b".repeat(40) as CommitId;

describe("S7.1 — buildMarker", () => {
  it("equals buildMarkerPrefix + commit + buildMarkerSuffix exactly", () => {
    expect(buildMarker(COMMIT)).toBe(`${buildMarkerPrefix}${COMMIT}${buildMarkerSuffix}`);
  });

  it("buildMarkerPrefix and buildMarkerSuffix equal the contract's literals", () => {
    expect(buildMarkerPrefix).toBe("<!-- build-commit: ");
    expect(buildMarkerSuffix).toBe(" -->");
  });
});

describe("S7.2 — injectBuildMarker", () => {
  it("inserts the marker immediately before the first </head> and nowhere else", () => {
    const html = "<html><head><title>x</title></head><body></body></html>";
    const result = injectBuildMarker(html, COMMIT);
    expect(result).toEqual({
      ok: true,
      value: `<html><head><title>x</title>${buildMarker(COMMIT)}</head><body></body></html>`,
    });
  });

  it("inserts before the first </head> when the string 'head' recurs in the body", () => {
    const html = "<html><head></head><body>head start, </head> too</body></html>";
    const result = injectBuildMarker(html, COMMIT);
    if (!result.ok) throw new Error("expected ok");
    // Only the first "</head>" gains the marker before it.
    expect(result.value.indexOf(buildMarker(COMMIT))).toBe(html.indexOf("</head>"));
    expect(result.value.split(buildMarker(COMMIT))).toHaveLength(2);
  });

  it("returns MarkerInsertionPointMissing for a document with no </head>", () => {
    const html = "<html><body>no head close here</body></html>";
    expect(injectBuildMarker(html, COMMIT)).toEqual({
      ok: false,
      errors: [
        {
          code: "MarkerInsertionPointMissing",
          entry: null,
          detail: "the document contains no </head>.",
        },
      ],
    });
  });

  it("returns MarkerAlreadyPresent for a document already carrying a marker, and gains no second one", () => {
    const html = `<html><head>${buildMarker(COMMIT)}</head><body></body></html>`;
    const result = injectBuildMarker(html, OTHER_COMMIT);
    expect(result).toEqual({
      ok: false,
      errors: [
        {
          code: "MarkerAlreadyPresent",
          entry: null,
          detail: "the document already carries a build marker.",
        },
      ],
    });
  });
});
