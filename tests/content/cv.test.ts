// S15.5, S15.7-S15.9 — validateCv's own semantic checks, below the document
// validator. Fixtures are deep-cloned plain JSON, typed loosely so a single
// dotted path can be mutated without fighting CvDocument's readonly tuples —
// validateCv is the function under test, not the type system.

import { describe, expect, it } from "vitest";

import { validateCv } from "../../src/content";
import type { CvDocument } from "../../src/content";
import { context, makeCv } from "./fixtures";

function clone(): any {
  return JSON.parse(JSON.stringify(makeCv()));
}

function codesOf(cv: any): string[] {
  const result = validateCv(cv as CvDocument, context);
  if (result.ok) return [];
  return result.errors.map((e) => e.code);
}

describe("S15.3 — validateCv accepts a well-formed document", () => {
  it("returns ok: true for the base fixture", () => {
    expect(validateCv(makeCv(), context).ok).toBe(true);
  });
});

describe("S15.5 — validateCv raises CvFieldEmpty, CvCollectionEmpty, CvUrlInvalid, CvYearInvalid and CvYearAfterBuild", () => {
  it("CvFieldEmpty on an empty required string, naming its dotted path", () => {
    const cv = clone();
    cv.about.title = "  ";
    const result = validateCv(cv as CvDocument, context);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({ code: "CvFieldEmpty", projectId: null, field: "about.title" });
    }
  });

  it("CvCollectionEmpty on an empty non-empty-typed list", () => {
    const cv = clone();
    cv.badges = [];
    const result = validateCv(cv as CvDocument, context);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({ code: "CvCollectionEmpty", field: "badges" });
    }
  });

  it("CvUrlInvalid on a malformed required URL", () => {
    const cv = clone();
    cv.projects[0].link = "not a url";
    const result = validateCv(cv as CvDocument, context);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({ code: "CvUrlInvalid", field: "projects[0].link" });
    }
  });

  it("CvUrlInvalid on a malformed optional URL that is present", () => {
    const cv = clone();
    cv.roles[0].website = "not a url";
    const result = validateCv(cv as CvDocument, context);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({ code: "CvUrlInvalid", field: "roles[0].website" });
    }
  });

  it("an absent optional URL raises nothing", () => {
    const cv = clone();
    delete cv.roles[0].website;
    expect(validateCv(cv as CvDocument, context).ok).toBe(true);
  });

  it("CvYearInvalid on a non-four-digit year", () => {
    const cv = clone();
    cv.projects[0].year = 99999;
    expect(codesOf(cv)).toEqual(["CvYearInvalid"]);
  });

  it("CvYearAfterBuild on a year after the build's UTC year", () => {
    const cv = clone();
    cv.projects[0].year = context.utcYear + 1;
    expect(codesOf(cv)).toEqual(["CvYearAfterBuild"]);
  });
});

describe("S15.7 — every fault is reported in one Result, not the first", () => {
  it("a fixture with four independent faults yields four ContentErrors", () => {
    const cv = clone();
    cv.about.title = "";
    cv.badges = [];
    cv.projects[0].link = "not a url";
    cv.projects[0].year = 99999;
    expect(codesOf(cv).sort()).toEqual(
      ["CvFieldEmpty", "CvCollectionEmpty", "CvUrlInvalid", "CvYearInvalid"].sort(),
    );
  });
});

describe("S15.8 — CvYearInvalid takes precedence over CvYearAfterBuild", () => {
  it("a year of 99999 yields one error, not two", () => {
    const cv = clone();
    cv.projects[0].year = 99999;
    expect(codesOf(cv)).toEqual(["CvYearInvalid"]);
  });
});

// S15.9 — CvData is constructible only by validateCv: the brand is
// compile-time only, so the assertion is a type-level one and lives in
// tests/types/cv-portfolio.type-check.ts.
