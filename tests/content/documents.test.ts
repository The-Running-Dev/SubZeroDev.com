import { describe, expect, it } from "vitest";

import { projectsDocumentValidator, testimonialsDocumentValidator } from "../../src/content";
import type { BuildContext, CommitId, Year } from "../../src/content";
import { rawProjectsDocument, rawTestimonialsDocument } from "../helpers/site-data";

const context: BuildContext = {
  commit: "a".repeat(40) as CommitId,
  utcYear: new Date().getUTCFullYear() as Year,
};

describe("the committed JSON documents", () => {
  it("decode successfully through their site-owned validators", () => {
    expect(projectsDocumentValidator(context)(rawProjectsDocument).ok).toBe(true);
    expect(testimonialsDocumentValidator(rawTestimonialsDocument).ok).toBe(true);
  });
});

describe("projects document structure", () => {
  const validate = projectsDocumentValidator(context);

  it.each([
    ["an unsupported version", { version: 2, projects: [] }],
    ["an unknown envelope field", { version: 1, projects: [], extra: true }],
    ["a missing projects collection", { version: 1 }],
    [
      "a wrong primitive type",
      { version: 1, projects: [{ id: "one", name: "One", year: "2026", stage: "Prototype", line: "x", home: { kind: "none" } }] },
    ],
    [
      "an invalid stage discriminant",
      { version: 1, projects: [{ id: "one", name: "One", year: 2026, stage: "Live", line: "x", home: { kind: "none" } }] },
    ],
    [
      "an invalid home discriminant",
      { version: 1, projects: [{ id: "one", name: "One", year: 2026, stage: "Prototype", line: "x", home: { kind: "elsewhere" } }] },
    ],
  ])("rejects %s", (_label, document) => {
    expect(validate(document).ok).toBe(false);
  });

  it("reports every Zod issue in one malformed document", () => {
    const result = validate({
      version: 1,
      projects: [{ id: "one", name: "One", year: "2026", stage: "Live", line: "x", home: { kind: "none" } }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("year");
      expect(result.message).toContain("stage");
    }
  });
});

describe("testimonials document structure", () => {
  it.each([
    ["an unsupported version", { version: 2, testimonials: [] }],
    ["an unknown record field", { version: 1, testimonials: [{ quote: "Fine.", author: "Someone", extra: true }] }],
    ["a missing author", { version: 1, testimonials: [{ quote: "Fine." }] }],
    ["a malformed optional field", { version: 1, testimonials: [{ quote: "Fine.", author: "Someone", role: 1 }] }],
  ])("rejects %s", (_label, document) => {
    expect(testimonialsDocumentValidator(document).ok).toBe(false);
  });
});

describe("semantic validation after structural decoding", () => {
  it("preserves every inventory ContentError", () => {
    const result = projectsDocumentValidator(context)({
      version: 1,
      projects: [{ id: "Bad Id", name: "", year: 10000, stage: "Prototype", line: "", home: { kind: "none" } }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("MalformedProjectId");
      expect(result.message).toContain("InvalidYear");
      expect(result.message).toContain("EmptyField");
    }
  });

  it("preserves every testimonial ContentError", () => {
    const result = testimonialsDocumentValidator({ version: 1, testimonials: [{ quote: "", author: "", role: "" }] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("TestimonialQuoteEmpty");
      expect(result.message).toContain("TestimonialAuthorEmpty");
      expect(result.message).toContain("TestimonialRoleEmpty");
    }
  });
});
