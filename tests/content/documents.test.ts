import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  cvDocumentValidator,
  portfolioDocumentValidator,
  projectsDocumentValidator,
  testimonialsDocumentValidator,
} from "../../src/content";
import type { BuildContext, CommitId, Year } from "../../src/content";
import {
  rawCvDocument,
  rawPortfolioDocument,
  rawProjectsDocument,
  rawTestimonialsDocument,
} from "../helpers/site-data";

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

describe("S15.1/S15.3 — the CV and portfolio documents", () => {
  it("carry version 1 and a non-empty provenance string naming their source", () => {
    expect(rawCvDocument.version).toBe(1);
    expect(rawCvDocument.provenance).toBe("Portfolio/config/cvData.yml");
    expect(rawPortfolioDocument.version).toBe(1);
    expect(rawPortfolioDocument.provenance).toBe("Docusaurus-Template/data/portfolioData.json");
  });

  it("projects.json and testimonials.json carry no provenance field", () => {
    expect(rawProjectsDocument.provenance).toBeUndefined();
    expect(rawTestimonialsDocument.provenance).toBeUndefined();
  });

  it("decode successfully through their site-owned validators (positive count: 2)", () => {
    expect(cvDocumentValidator(context)(rawCvDocument).ok).toBe(true);
    expect(portfolioDocumentValidator(rawPortfolioDocument).ok).toBe(true);
  });
});

describe("S15.1 — a fixture with provenance absent fails the schema", () => {
  it("rejects a CV document with no provenance field", () => {
    const { provenance: _provenance, ...withoutProvenance } = rawCvDocument as Record<string, unknown>;
    expect(cvDocumentValidator(context)(withoutProvenance).ok).toBe(false);
  });

  it("rejects a portfolio document with no provenance field", () => {
    const { provenance: _provenance, ...withoutProvenance } = rawPortfolioDocument as Record<string, unknown>;
    expect(portfolioDocumentValidator(withoutProvenance).ok).toBe(false);
  });
});

describe("S15.4 — CV and portfolio document structure (negative count: 4)", () => {
  it.each([
    ["an unsupported version", { ...rawCvDocument, version: 2 }],
    ["an unknown envelope field", { ...rawCvDocument, extra: true }],
  ])("rejects the CV document with %s", (_label, document) => {
    expect(cvDocumentValidator(context)(document).ok).toBe(false);
  });

  it.each([
    ["an unsupported version", { ...rawPortfolioDocument, version: 2 }],
    ["an unknown envelope field", { ...rawPortfolioDocument, extra: true }],
  ])("rejects the portfolio document with %s", (_label, document) => {
    expect(portfolioDocumentValidator(document).ok).toBe(false);
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

describe("S15.10 — neither committed document carries an image URL, icon-font token or src", () => {
  const repoRoot = resolve(import.meta.dirname, "../..");
  const cvText = readFileSync(resolve(repoRoot, "site/cv.json"), "utf8");
  const portfolioText = readFileSync(resolve(repoRoot, "site/portfolio.json"), "utf8");

  it.each([
    ["cv.json", () => cvText],
    ["portfolio.json", () => portfolioText],
  ])("%s carries no \"src\" key, no shields.io badge and no icon-font token", (_label, text) => {
    const raw = text();
    expect(raw).not.toContain('"src"');
    expect(raw).not.toContain("shields.io");
    expect(raw).not.toMatch(/\bfa[A-Z]\w*/); // e.g. faRocket
    expect(raw).not.toMatch(/\bfa-[a-z0-9-]+/); // e.g. fa-rocket, fas fa-rocket
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
