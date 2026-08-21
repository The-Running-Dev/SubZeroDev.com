// Reads the committed JSON documents for assertions without reintroducing a
// production TypeScript data module. Production reaches these documents only
// through the Landing Page build-time source map.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { CvDocument, PortfolioDocument, Project, Testimonial } from "../../src/content";

const repoRoot = resolve(import.meta.dirname, "../..");

function readDocument(file: string): Record<string, unknown> {
  return JSON.parse(readFileSync(resolve(repoRoot, "site", file), "utf8")) as Record<string, unknown>;
}

const projectsDocument = readDocument("projects.json");
const testimonialsDocument = readDocument("testimonials.json");
const cvDocument = readDocument("cv.json");
const portfolioDocument = readDocument("portfolio.json");

export const projects = projectsDocument.projects as readonly Project[];
export const testimonials = testimonialsDocument.testimonials as readonly Testimonial[];
export const rawProjectsDocument = projectsDocument;
export const rawTestimonialsDocument = testimonialsDocument;
export const rawCvDocument = cvDocument;
export const rawPortfolioDocument = portfolioDocument;
// Envelope fields (`version`, `provenance`) stripped, matching the structural
// schema's own transform — for tests that exercise validateCv/validatePortfolio
// directly, below the document validator.
export const cv = (({ version: _v, provenance: _p, ...rest }) => rest as unknown as CvDocument)(cvDocument);
export const portfolio = (({ version: _v, provenance: _p, ...rest }) =>
  rest as unknown as PortfolioDocument)(portfolioDocument);
