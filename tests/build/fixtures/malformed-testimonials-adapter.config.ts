// A deliberately malformed testimonial collection paired with a valid
// inventory. S11.12 runs the real package CLI against this Adapter-shaped
// fixture to prove a testimonial failure writes no route.

import { defineLandingPage } from "subzerodev-platform-ui-landing-page";

import { composeApex, composeMiss } from "../../../src/composition";
import { parseCommitId, validateInventory, validateTestimonials } from "../../../src/content";
import type { BuildContext, Project, Testimonial } from "../../../src/content";
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

const malformedTestimonials: readonly Testimonial[] = [{ quote: "", author: "" }];

const context: BuildContext = {
  commit: parseCommitId("a".repeat(40))!,
  utcYear: new Date().getUTCFullYear() as BuildContext["utcYear"],
};

const validatedInventory = validateInventory(validProjects, context);
const validatedTestimonials = validateTestimonials(malformedTestimonials);

if (!validatedInventory.ok || !validatedTestimonials.ok) {
  const errors = [
    ...(validatedInventory.ok ? [] : validatedInventory.errors),
    ...(validatedTestimonials.ok ? [] : validatedTestimonials.errors),
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
