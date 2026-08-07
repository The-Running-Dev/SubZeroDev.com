import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { checkFiles, checkText } from "../../tools/check-design-counts.mjs";

describe("issue #17 — check-design-counts", () => {
  it("passes a bullet list whose count matches its numeral", () => {
    const text = "Four audiences, deliberately unranked:\n\n- a\n- b\n- c\n- d\n";
    expect(checkText(text, "fixture")).toEqual([]);
  });

  it("flags a bullet list whose count no longer matches its numeral", () => {
    const text = "Four audiences, deliberately unranked:\n\n- a\n- b\n- c\n";
    const findings = checkText(text, "fixture");
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ expected: 4, actual: 3, kind: "bullet list" });
  });

  it("counts a numbered list item's wrapped continuation lines as part of that item", () => {
    const text = "Three things are settled here:\n\n1. first item\n   continuing onto a second line\n2. second\n3. third\n";
    expect(checkText(text, "fixture")).toEqual([]);
  });

  it("flags a numbered list whose count no longer matches its numeral", () => {
    const text = "Three things are settled here:\n\n1. a\n2. b\n";
    const findings = checkText(text, "fixture");
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ expected: 3, actual: 2, kind: "numbered list" });
  });

  it("passes a table whose row count matches its numeral", () => {
    const text = ["Five things resemble persistence and are not:", "", "| A | B |", "|---|---|", "| 1 | 2 |", "| 3 | 4 |", "| 5 | 6 |", "| 7 | 8 |", "| 9 | 10 |"].join("\n");
    expect(checkText(text, "fixture")).toEqual([]);
  });

  it("flags a table whose row count no longer matches its numeral", () => {
    const text = ["Five things resemble persistence and are not:", "", "| A | B |", "|---|---|", "| 1 | 2 |", "| 3 | 4 |"].join(
      "\n",
    );
    const findings = checkText(text, "fixture");
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ expected: 5, actual: 2, kind: "table" });
  });

  it("says nothing about an inline colon clause — not checkable this way, not flagged", () => {
    const text = "Two things are not asset references: an outbound link, and the canonical link. More prose follows.";
    expect(checkText(text, "fixture")).toEqual([]);
  });

  it("says nothing about a numeral with no following list — not checkable, not flagged", () => {
    const text = "This is one of two targets and neither is a list.";
    expect(checkText(text, "fixture")).toEqual([]);
  });

  it("does not cross a sentence boundary to find an unrelated colon", () => {
    const text = "Two, and no more. `/` is the document. The miss is the second. A `Route` carries:\n\n- path\n- body\n- stylesheet\n- head metadata\n";
    expect(checkText(text, "fixture")).toEqual([]);
  });

  it("the real design documents currently have no stale counting phrase", () => {
    const findings = checkFiles(
      [
        "design/00-brief.md",
        "design/10-design.md",
        "design/20-contract.md",
        "design/30-slices.md",
      ],
      (p) => readFileSync(p, "utf8"),
    );
    expect(findings).toEqual([]);
  });
});
