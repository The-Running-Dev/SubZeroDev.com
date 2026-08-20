import { describe, expect, it } from "vitest";

import { primitives } from "../../src/presentation";
import type { PrimitiveName } from "../../src/presentation";
import { extractSelectors } from "../helpers/css";

const EXPECTED_NAMES: PrimitiveName[] = [
  "page",
  "stack",
  "entry",
  "meta",
  "rule",
  "link",
  "link-current",
  "row",
  "bar",
  "grid",
  "view",
  "card",
];

describe("S4.3/S11.3 — primitives has exactly the twelve PrimitiveName keys, valid classNames, no duplicates", () => {
  it("has exactly the expected keys", () => {
    expect(Object.keys(primitives).sort()).toEqual([...EXPECTED_NAMES].sort());
  });

  it.each(EXPECTED_NAMES)("%s's className matches /^[a-z][a-z0-9-]*$/", (name) => {
    expect(primitives[name].className).toMatch(/^[a-z][a-z0-9-]*$/);
  });

  it("no two primitives share a className", () => {
    const classNames = EXPECTED_NAMES.map((n) => primitives[n].className);
    expect(new Set(classNames).size).toBe(classNames.length);
  });
});

// `Primitive.rules` admits two forms, and this checks for both rather than
// for the `contains` S4.4 was written with: a selector either **begins with**
// the primitive's class selector — bounding every match to a subtree rooted at
// the class, which is how `page` reaches an `h1` and `row` a `> *` — or carries
// it in the **subject compound**, bounding the match to an element that has the
// class. `contains` admits neither-form selectors: `.page:has(...) nav [href]`
// mentions `.view` inside a `:has()` while matching a nav link that has no
// `.view` on it, and that is exactly what shipped unflagged from 2026-08-10 to
// 2026-08-20. The five such selectors are `view`'s named exception
// (design/20-contract.md § Types, `view`; 90-decisions.md, 2026-08-20); a sixth,
// or a first in any other primitive, fails here.
const NAV_COLOURING_EXCEPTION: readonly string[] = [
  '.page:not(:has(.view:target)) nav [href="#effortless-action"]',
  '.page:has(#effortless-action.view:target) nav [href="#effortless-action"]',
  '.page:has(#echo-system.view:target) nav [href="#echo-system"]',
  '.page:has(#contamination.view:target) nav [href="#contamination"]',
  '.page:has(#testimonials.view:target) nav [href="#testimonials"]',
];

// The rightmost compound: everything after the last combinator that is not
// nested inside `(` or `[`, so `:not(:has(.view:target))` and
// `[href="#a b"]` are never split through.
function subjectCompound(selector: string): string {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i]!;
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    else if (depth === 0 && (ch === " " || ch === ">" || ch === "+" || ch === "~")) start = i + 1;
  }
  return selector.slice(start).trim();
}

function carriesClass(fragment: string, className: string): boolean {
  return new RegExp(`\\.${className}(?![\\w-])`).test(fragment);
}

function beginsWithClass(selector: string, className: string): boolean {
  // `.view-toggle` starts with the characters of `.view` and is a different
  // class, so the boundary is checked on this half too, not only the subject's.
  return new RegExp(`^\\.${className}(?![\\w-])`).test(selector);
}

export function isAnchored(selector: string, className: string): boolean {
  return (
    beginsWithClass(selector, className) || carriesClass(subjectCompound(selector), className)
  );
}

describe("S4.4 — every selector in every primitive's rules is anchored at that primitive's own className", () => {
  it.each(EXPECTED_NAMES)("%s's selectors all begin with, or end at, its own class", (name) => {
    const primitive = primitives[name];
    const selectors = extractSelectors(primitive.rules);
    expect(selectors.length).toBeGreaterThan(0);
    const unanchored = selectors.filter((s) => !isAnchored(s, primitive.className));
    expect(unanchored).toEqual(name === "view" ? [...NAV_COLOURING_EXCEPTION] : []);
  });

  it("the check has teeth: a selector omitting the class is flagged", () => {
    const selectors = extractSelectors(".page { color: red; }\nbody { color: blue; }");
    const offending = selectors.filter((s) => !isAnchored(s, "page"));
    expect(offending).toEqual(["body"]);
  });

  it("the check has teeth: mentioning the class without anchoring on it is flagged", () => {
    // The exact shape `toContain` admitted, and the reason this check changed.
    expect(isAnchored('.page:has(#echo-system.view:target) nav [href="#echo-system"]', "view")).toBe(
      false,
    );
  });

  it("a subject compound carrying the class is anchored, wherever the selector starts", () => {
    expect(isAnchored(".stack > .view", "view")).toBe(true);
    expect(isAnchored("#effortless-action.view:target", "view")).toBe(true);
    expect(isAnchored(".page:not(:has(.view:target)) #effortless-action.view", "view")).toBe(true);
  });

  it("an opening anchor reaching an unnamed descendant is anchored", () => {
    expect(isAnchored(".page h1", "page")).toBe(true);
    expect(isAnchored(".row > *", "row")).toBe(true);
  });

  it("a class the selector only prefixes is not a match", () => {
    expect(isAnchored(".view-toggle", "view")).toBe(false);
  });
});

describe("S4.9/S11.4 — exactly one primitive's rules reference --font-mono, and no token-block rule does", () => {
  it("exactly one primitive references --font-mono", () => {
    const referencing = EXPECTED_NAMES.filter((n) => primitives[n].rules.includes("--font-mono"));
    expect(referencing).toEqual(["meta"]);
  });
});
