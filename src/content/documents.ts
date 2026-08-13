// Content's JSON document decoders. Structural decoding is deliberately kept
// separate from Content's semantic validators: JSON makes strings and numbers
// available, while validateInventory and validateTestimonials earn their
// domain guarantees.

import type { Validator } from "subzerodev-data-json";
import { zodValidator } from "subzerodev-data-json/zod";
import { z } from "zod";

import type { BuildContext, Inventory, Project, Testimonials, Testimonial } from "./types";
import { validateInventory, validateTestimonials } from "./validate";

const stageSchema = z.enum([
  "Curiosity",
  "Prototype",
  "Architecture",
  "Infrastructure",
  "Reusable",
  "Escaped",
]);

const genreSchema = z.enum([
  "Documentary",
  "Status Page",
  "Story",
  "Evidence",
  "Journal",
  "Field Reports",
  "Comedy",
]);

const homeSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("own"), url: z.string() }).strict(),
  z.object({ kind: z.literal("within"), parent: z.string(), path: z.string() }).strict(),
  z.object({ kind: z.literal("none") }).strict(),
]);

const projectSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    year: z.number(),
    stage: stageSchema,
    question: z.string().optional(),
    line: z.string(),
    home: homeSchema,
    genre: genreSchema.optional(),
    escapedFrom: z.string().optional(),
  })
  .strict();

const testimonialSchema = z
  .object({
    quote: z.string(),
    author: z.string(),
    role: z.string().optional(),
    organization: z.string().optional(),
    url: z.string().optional(),
  })
  .strict();

const projectsDocumentSchema = z
  .object({ version: z.literal(1), projects: z.array(projectSchema) })
  .strict()
  .transform(({ projects }) => projects as unknown as readonly Project[]);

const testimonialsDocumentSchema = z
  .object({ version: z.literal(1), testimonials: z.array(testimonialSchema) })
  .strict()
  .transform(({ testimonials }) => testimonials as readonly Testimonial[]);

function semanticValidator<T>(
  structural: Validator<readonly Project[]> | Validator<readonly Testimonial[]>,
  validate: (value: readonly Project[] | readonly Testimonial[]) =>
    | { readonly ok: true; readonly value: T }
    | { readonly ok: false; readonly errors: readonly { readonly code: string; readonly detail: string }[] },
): Validator<T> {
  return (raw) => {
    const decoded = structural(raw);
    if (!decoded.ok) return decoded;
    const result = validate(decoded.value);
    if (result.ok) return result;
    return { ok: false, message: result.errors.map((error) => `${error.code}: ${error.detail}`).join("\n") };
  };
}

export function projectsDocumentValidator(context: BuildContext): Validator<Inventory> {
  return semanticValidator(zodValidator(projectsDocumentSchema), (projects) =>
    validateInventory(projects as readonly Project[], context),
  );
}

export const testimonialsDocumentValidator: Validator<Testimonials> = semanticValidator(
  zodValidator(testimonialsDocumentSchema),
  (testimonials) => validateTestimonials(testimonials as readonly Testimonial[]),
);
