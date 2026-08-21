// Content's JSON document decoders. Structural decoding is deliberately kept
// separate from Content's semantic validators: JSON makes strings and numbers
// available, while validateInventory and validateTestimonials earn their
// domain guarantees.

import type { Validator } from "subzerodev-data-json";
import { zodValidator } from "subzerodev-data-json/zod";
import { z } from "zod";

import type {
  BuildContext,
  CvData,
  CvDocument,
  Inventory,
  PortfolioData,
  PortfolioDocument,
  Project,
  Testimonials,
  Testimonial,
} from "./types";
import { validateCv, validateInventory, validatePortfolio, validateTestimonials } from "./validate";

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

// `S` ties the structural decoder's output to the semantic validator's input, so
// pairing one document's decoder with the other's validator fails to typecheck
// rather than relying on the two call sites below being written carefully.
function semanticValidator<S, T>(
  structural: Validator<S>,
  validate: (value: S) =>
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
    validateInventory(projects, context),
  );
}

export const testimonialsDocumentValidator: Validator<Testimonials> = semanticValidator(
  zodValidator(testimonialsDocumentSchema),
  (testimonials) => validateTestimonials(testimonials),
);

const cvLinkSchema = z.object({ label: z.string(), href: z.string() }).strict();

const cvRoleSchema = z
  .object({
    company: z.string(),
    title: z.string(),
    period: z.string(),
    location: z.string(),
    website: z.string().optional(),
    summary: z.string(),
    achievements: z.array(z.string()),
    tech: z.array(z.string()),
  })
  .strict();

const cvEducationSchema = z.object({ school: z.string(), degree: z.string(), details: z.string() }).strict();

const cvProjectSchema = z
  .object({
    title: z.string(),
    link: z.string(),
    description: z.string(),
    tech: z.array(z.string()),
    year: z.number(),
  })
  .strict();

const cvOpenSourceSchema = z
  .object({
    title: z.string(),
    link: z.string().optional(),
    description: z.string(),
    impact: z.string(),
    tech: z.array(z.string()),
  })
  .strict();

const cvEraSchema = z
  .object({ period: z.string(), focus: z.string(), projects: z.array(z.string()) })
  .strict();

const cvDocumentSchema = z
  .object({
    version: z.literal(1),
    provenance: z.string().min(1),
    header: z
      .object({
        name: z.string(),
        title: z.string(),
        email: z.string(),
        phone: z.string(),
        links: z.array(cvLinkSchema),
      })
      .strict(),
    about: z.object({ title: z.string(), body: z.string() }).strict(),
    badges: z.array(z.string()),
    chips: z.array(z.string()),
    timelineTitle: z.string(),
    roles: z.array(cvRoleSchema),
    educationTitle: z.string(),
    education: z.array(cvEducationSchema),
    projectsTitle: z.string(),
    projects: z.array(cvProjectSchema),
    openSourceTitle: z.string(),
    openSource: z.array(cvOpenSourceSchema),
    timelineProjectsTitle: z.string(),
    timelineProjects: z.array(cvEraSchema),
    quote: z.string(),
  })
  .strict()
  .transform(({ version: _version, provenance: _provenance, ...cv }) => cv as unknown as CvDocument);

// Recursive to match the source's own nesting; C18's depth bound is enforced
// by validatePortfolio's semantic pass, not by the structural schema.
const techNodeSchema: z.ZodTypeAny = z.lazy(() =>
  z
    .object({ name: z.string(), children: z.array(techNodeSchema).optional() })
    .strict(),
);

const portfolioCategorySchema = z
  .object({ category: z.string(), icon: z.string(), description: z.string() })
  .strict();

const portfolioStatSchema = z.object({ value: z.string(), label: z.string() }).strict();

const portfolioDocumentSchema = z
  .object({
    version: z.literal(1),
    provenance: z.string().min(1),
    header: z.object({ title: z.string(), subtitle: z.string() }).strict(),
    technologies: z.array(techNodeSchema),
    projects: z.array(portfolioCategorySchema),
    stats: z.array(portfolioStatSchema),
  })
  .strict()
  .transform(
    ({ version: _version, provenance: _provenance, ...portfolio }) => portfolio as unknown as PortfolioDocument,
  );

export function cvDocumentValidator(context: BuildContext): Validator<CvData> {
  return semanticValidator(zodValidator(cvDocumentSchema), (cv) => validateCv(cv, context));
}

export const portfolioDocumentValidator: Validator<PortfolioData> = semanticValidator(
  zodValidator(portfolioDocumentSchema),
  (portfolio) => validatePortfolio(portfolio),
);
