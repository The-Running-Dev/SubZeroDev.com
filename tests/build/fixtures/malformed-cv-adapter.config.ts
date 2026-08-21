// A deliberately malformed CV paired with valid projects, testimonials and
// portfolio. S15.12 runs the real package CLI against this Adapter-shaped
// fixture to prove a CV failure writes no route, on the same footing
// tests/build/fixtures/malformed-testimonials-adapter.config.ts already
// proves for testimonials.

import { defineLandingPage } from "subzerodev-platform-ui-landing-page";

import { composeApex, composeMiss } from "../../../src/composition";
import {
  parseCommitId,
  validateCv,
  validateInventory,
  validatePortfolio,
  validateTestimonials,
} from "../../../src/content";
import type { BuildContext, CvDocument, PortfolioDocument, Project, Testimonial } from "../../../src/content";
import { iconDataUri, themeColor } from "../../../src/presentation";

const validProjects = [
  {
    id: "valid",
    name: "Valid",
    year: 2020,
    stage: "Prototype",
    line: "Valid fixture content.",
    home: { kind: "none" },
  },
] as unknown as readonly Project[];

const validTestimonials: readonly Testimonial[] = [{ quote: "Fine.", author: "Someone" }];

// Two faults at once: an empty header.name and an out-of-range project year —
// chosen to prove validateCv reports every failure rather than the first.
const malformedCv = {
  header: { name: "", title: "T", email: "e@example.com", phone: "p", links: [{ label: "L", href: "https://example.com" }] },
  about: { title: "About", body: "Body." },
  badges: ["X"],
  chips: ["X"],
  timelineTitle: "Timeline",
  roles: [
    {
      company: "C",
      title: "T",
      period: "P",
      location: "L",
      summary: "S",
      achievements: ["A"],
      tech: ["X"],
    },
  ],
  educationTitle: "Education",
  education: [{ school: "S", degree: "D", details: "D" }],
  projectsTitle: "Projects",
  projects: [
    { title: "T", link: "https://example.com", description: "D", tech: ["X"], year: 99999 },
  ],
  openSourceTitle: "Open Source",
  openSource: [{ title: "T", description: "D", impact: "I", tech: ["X"] }],
  timelineProjectsTitle: "Timeline Projects",
  timelineProjects: [{ period: "P", focus: "F", projects: ["X"] }],
  quote: "Q",
} as unknown as CvDocument;

const validPortfolio: PortfolioDocument = {
  header: { title: "Portfolio", subtitle: "Subtitle" },
  technologies: [{ name: "Backend" }],
  projects: [{ category: "Web", icon: "🌐", description: "D" }],
  stats: [{ value: "1+", label: "Stat" }],
};

const context: BuildContext = {
  commit: parseCommitId("a".repeat(40))!,
  utcYear: new Date().getUTCFullYear() as BuildContext["utcYear"],
};

const validatedInventory = validateInventory(validProjects, context);
const validatedTestimonials = validateTestimonials(validTestimonials);
const validatedCv = validateCv(malformedCv, context);
const validatedPortfolio = validatePortfolio(validPortfolio);

if (!validatedInventory.ok || !validatedTestimonials.ok || !validatedCv.ok || !validatedPortfolio.ok) {
  const errors = [
    ...(validatedInventory.ok ? [] : validatedInventory.errors),
    ...(validatedTestimonials.ok ? [] : validatedTestimonials.errors),
    ...(validatedCv.ok ? [] : validatedCv.errors),
    ...(validatedPortfolio.ok ? [] : validatedPortfolio.errors),
  ];
  for (const error of errors) {
    console.error(
      `${error.code} (project: ${error.projectId ?? "-"}, field: ${error.field ?? "-"}): ${error.detail}`,
    );
  }
  process.exit(1);
}

const apex = composeApex(validatedInventory.value, validatedTestimonials.value, "https://subzerodev.com");
const miss = composeMiss();

export default defineLandingPage({
  routes: [
    {
      path: "/",
      body: apex.bodyHtml,
      stylesheet: apex.stylesheet,
      metadata: { title: "unreachable", description: "unreachable", themeColor, icons: [{ rel: "icon", href: iconDataUri }] },
    },
    {
      path: "/404/",
      body: miss.bodyHtml,
      stylesheet: miss.stylesheet,
      metadata: { title: "unreachable", description: "unreachable", themeColor, icons: [{ rel: "icon", href: iconDataUri }] },
    },
  ],
});
