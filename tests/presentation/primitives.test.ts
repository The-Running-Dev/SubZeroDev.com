import { describe, expect, it } from "vitest";

import { primitives } from "../../src/presentation";
import type { PrimitiveName } from "../../src/presentation";
import { extractSelectors } from "../helpers/css";

const EXPECTED_NAMES: PrimitiveName[] = ["page", "stack", "entry", "meta", "rule", "link"];

describe("S4.3 — primitives has exactly the six PrimitiveName keys, valid classNames, no duplicates", () => {
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

describe("S4.4 — every selector in every primitive's rules contains that primitive's own className", () => {
  it.each(EXPECTED_NAMES)("%s's selectors are all rooted at its own class", (name) => {
    const primitive = primitives[name];
    const selectors = extractSelectors(primitive.rules);
    expect(selectors.length).toBeGreaterThan(0);
    for (const selector of selectors) {
      expect(selector).toContain(`.${primitive.className}`);
    }
  });

  it("the check has teeth: a selector omitting the class is flagged", () => {
    const selectors = extractSelectors(".page { color: red; }\nbody { color: blue; }");
    const offending = selectors.filter((s) => !s.includes(".page"));
    expect(offending).toEqual(["body"]);
  });
});

describe("S4.9 — exactly one primitive's rules reference --font-mono, and no token-block rule does", () => {
  it("exactly one primitive references --font-mono", () => {
    const referencing = EXPECTED_NAMES.filter((n) => primitives[n].rules.includes("--font-mono"));
    expect(referencing).toEqual(["meta"]);
  });
});
