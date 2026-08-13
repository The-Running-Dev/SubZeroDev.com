import { writeFileSync } from "node:fs";

import { defineLandingPage, defineLandingPageData } from "subzerodev-platform-ui-landing-page";

import {
  parseCommitId,
  projectsDocumentValidator,
  testimonialsDocumentValidator,
} from "../../../src/content";
import type { BuildContext } from "../../../src/content";

const context: BuildContext = {
  commit: parseCommitId("a".repeat(40))!,
  utcYear: new Date().getUTCFullYear() as BuildContext["utcYear"],
};

export default defineLandingPageData(
  {
    projects: { id: "projects", validate: projectsDocumentValidator(context) },
    testimonials: { id: "testimonials", validate: testimonialsDocumentValidator },
  },
  () => {
    writeFileSync(process.env.CONFIG_MARKER!, "called", "utf8");
    return defineLandingPage({ routes: [] });
  },
);
