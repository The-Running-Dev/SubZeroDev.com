// A deliberately malformed adapter, structurally identical to
// site/landing.config.ts, used only by S6.8's integration test
// (tests/build/malformed-inventory.test.ts) to prove the real CLI build
// reports every ContentError and writes nothing when the inventory fails to
// validate. Never loaded by the real build — it is not site/landing.config.ts
// and A5's importer rules do not apply to it.

import { defineLandingPage } from "subzerodev-platform-ui-landing-page";

import { composeApex, composeMiss } from "../../../src/composition";
import { parseCommitId, validateInventory, validateTestimonials } from "../../../src/content";
import type { BuildContext, Project, Testimonial } from "../../../src/content";
import { iconDataUri, themeColor } from "../../../src/presentation";

// Four faults at once: a malformed id, an empty name, an out-of-range year and
// an empty line — chosen to prove `validateInventory` reports every failure
// rather than the first.
const malformedProjects = [
  {
    id: "Not A Valid Id!!",
    name: "",
    year: 20260,
    stage: "Prototype",
    line: "",
    home: { kind: "none" },
  },
] as unknown as readonly Project[];

const validTestimonials: readonly Testimonial[] = [{ quote: "Fine.", author: "Someone" }];

const context: BuildContext = {
  commit: parseCommitId("a".repeat(40))!,
  utcYear: new Date().getUTCFullYear() as BuildContext["utcYear"],
};

const validatedInventory = validateInventory(malformedProjects, context);
const validatedTestimonials = validateTestimonials(validTestimonials);

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

const inventory = validatedInventory.value;
const apex = composeApex(inventory, validatedTestimonials.value, "https://subzerodev.com");
const miss = composeMiss();

export default defineLandingPage({
  routes: [
    {
      path: "/",
      body: apex.bodyHtml,
      stylesheet: apex.stylesheet,
      metadata: {
        title: "unreachable",
        description: "unreachable",
        themeColor,
        icons: [{ rel: "icon", href: iconDataUri }],
      },
    },
    {
      path: "/404/",
      body: miss.bodyHtml,
      stylesheet: miss.stylesheet,
      metadata: {
        title: "unreachable",
        description: "unreachable",
        themeColor,
        icons: [{ rel: "icon", href: iconDataUri }],
      },
    },
  ],
});
