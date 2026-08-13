// Reads the committed JSON documents for assertions without reintroducing a
// production TypeScript data module. Production reaches these documents only
// through the Landing Page build-time source map.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { Project, Testimonial } from "../../src/content";

const repoRoot = resolve(import.meta.dirname, "../..");

function readDocument(file: string): Record<string, unknown> {
  return JSON.parse(readFileSync(resolve(repoRoot, "site", file), "utf8")) as Record<string, unknown>;
}

const projectsDocument = readDocument("projects.json");
const testimonialsDocument = readDocument("testimonials.json");

export const projects = projectsDocument.projects as readonly Project[];
export const testimonials = testimonialsDocument.testimonials as readonly Testimonial[];
export const rawProjectsDocument = projectsDocument;
export const rawTestimonialsDocument = testimonialsDocument;
