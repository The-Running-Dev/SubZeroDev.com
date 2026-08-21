// Content — the single validating entry point into the module's data.
//
// `validateInventory` reads a set of hand-authored project records and either
// hands back a checked `Inventory` or refuses it, listing every problem it
// found rather than stopping at the first (design: "Malformed or empty
// content"). It is the sole surface that can produce an `Inventory`; every
// derivation is total on that input.

import type { ContentError, ContentErrorCode } from "./errors";
import type {
  BuildContext,
  CvData,
  CvDocument,
  Inventory,
  PortfolioData,
  PortfolioDocument,
  Project,
  ProjectId,
  Result,
  TechNode,
  Testimonial,
  Testimonials,
} from "./types";

const PROJECT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function error(
  code: ContentErrorCode,
  projectId: ProjectId | null,
  field: string | null,
  detail: string,
): ContentError {
  return { code, projectId, field, detail };
}

function isValidProjectId(id: string): boolean {
  return id.length >= 1 && id.length <= 64 && PROJECT_ID_PATTERN.test(id);
}

function isAbsoluteHttpsUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return url.protocol === "https:";
}

function originOf(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function resolvesWithinOrigin(path: string, origin: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  try {
    return new URL(path, origin).origin === origin;
  } catch {
    return false;
  }
}

function checkYear(
  year: number,
  path: string,
  context: BuildContext,
  projectId: ProjectId | null,
  codes: { readonly invalid: ContentErrorCode; readonly afterBuild: ContentErrorCode },
  errors: ContentError[],
): void {
  if (!Number.isInteger(year) || year < 1000 || year > 9999) {
    errors.push(error(codes.invalid, projectId, path, `${path} ${year} is not a four-digit integer.`));
  } else if (year > context.utcYear) {
    errors.push(
      error(codes.afterBuild, projectId, path, `${path} ${year} is after the build's UTC year ${context.utcYear}.`),
    );
  }
}

function checkRequiredString(
  value: string,
  path: string,
  code: ContentErrorCode,
  errors: ContentError[],
): void {
  if (value.trim() === "") {
    errors.push(error(code, null, path, `${path} is empty after trimming.`));
  }
}

function checkNonEmptyCollection(
  list: readonly unknown[],
  path: string,
  code: ContentErrorCode,
  errors: ContentError[],
): void {
  if (list.length === 0) {
    errors.push(error(code, null, path, `${path} has no entries.`));
  }
}

function validateHome(
  project: Project,
  byId: ReadonlyMap<string, Project>,
  errors: ContentError[],
): void {
  const home = project.home;
  switch (home.kind) {
    case "own":
      if (!isAbsoluteHttpsUrl(home.url)) {
        errors.push(
          error(
            "HomeOwnUrlInvalid",
            project.id,
            "home.url",
            `home.url "${home.url}" is not an https absolute URL.`,
          ),
        );
      }
      return;
    case "within": {
      const parent = byId.get(home.parent);
      if (parent === undefined) {
        errors.push(
          error(
            "HomeWithinParentMissing",
            project.id,
            "home.parent",
            `home.parent "${home.parent}" names no project in the inventory.`,
          ),
        );
        return;
      }
      if (parent.home.kind !== "own") {
        errors.push(
          error(
            "HomeWithinParentNotOwn",
            project.id,
            "home.parent",
            `home.parent "${home.parent}" exists but its own home.kind is "${parent.home.kind}", not "own".`,
          ),
        );
        return;
      }
      const parentOrigin = originOf(parent.home.url);
      // A parent whose own url is invalid is reported against the parent as
      // HomeOwnUrlInvalid; the origin check for this child cannot run without a
      // parseable origin, so it is skipped here rather than double-reported.
      if (parentOrigin !== null && !resolvesWithinOrigin(home.path, parentOrigin)) {
        errors.push(
          error(
            "HomeWithinOriginEscape",
            project.id,
            "home.path",
            `home.path "${home.path}" is not a root-relative path within the parent origin ${parentOrigin}.`,
          ),
        );
      }
      return;
    }
    case "none":
      return;
  }
}

// A project is on a cycle iff following its single `escapedFrom` edge (over the
// subset of edges whose target exists and is not the source) returns to it.
function cycleMembers(
  projects: readonly Project[],
  presentIds: ReadonlySet<string>,
): Set<string> {
  const edge = new Map<string, string>();
  for (const project of projects) {
    const from = project.escapedFrom;
    if (from === undefined) continue;
    if (from === project.id) continue; // self-reference: reported separately
    if (!presentIds.has(from)) continue; // missing target: reported separately
    if (!edge.has(project.id)) edge.set(project.id, from);
  }

  const onCycle = new Set<string>();
  for (const start of edge.keys()) {
    const seen = new Set<string>();
    let current = edge.get(start);
    while (current !== undefined && !seen.has(current)) {
      if (current === start) {
        onCycle.add(start);
        break;
      }
      seen.add(current);
      current = edge.get(current);
    }
  }
  return onCycle;
}

export function validateInventory(
  projects: readonly Project[],
  context: BuildContext,
): Result<Inventory, ContentError> {
  if (projects.length === 0) {
    return {
      ok: false,
      errors: [error("EmptyInventory", null, null, "The inventory has no projects.")],
    };
  }

  const errors: ContentError[] = [];

  const byId = new Map<string, Project>();
  const idCounts = new Map<string, number>();
  for (const project of projects) {
    idCounts.set(project.id, (idCounts.get(project.id) ?? 0) + 1);
    if (!byId.has(project.id)) byId.set(project.id, project);
  }

  // Duplicate ids — one error per duplicated id value.
  for (const [id, count] of idCounts) {
    if (count > 1) {
      errors.push(
        error(
          "DuplicateProjectId",
          id as ProjectId,
          "id",
          `The id "${id}" is shared by ${count} projects.`,
        ),
      );
    }
  }

  for (const project of projects) {
    if (!isValidProjectId(project.id)) {
      errors.push(
        error(
          "MalformedProjectId",
          project.id,
          "id",
          `"${project.id}" is not a valid project id.`,
        ),
      );
    }

    checkYear(
      project.year,
      "year",
      context,
      project.id,
      { invalid: "InvalidYear", afterBuild: "YearAfterBuild" },
      errors,
    );

    if (project.name.trim() === "") {
      errors.push(error("EmptyField", project.id, "name", "name is empty after trimming."));
    }
    if (project.line.trim() === "") {
      errors.push(error("EmptyField", project.id, "line", "line is empty after trimming."));
    }
    if (project.question !== undefined && project.question.trim() === "") {
      errors.push(
        error("EmptyField", project.id, "question", "question is present but empty after trimming."),
      );
    }

    validateHome(project, byId, errors);

    if (project.escapedFrom !== undefined) {
      if (project.escapedFrom === project.id) {
        errors.push(
          error(
            "EscapedFromSelfReference",
            project.id,
            "escapedFrom",
            `${project.id} escapes from itself.`,
          ),
        );
      } else if (!idCounts.has(project.escapedFrom)) {
        errors.push(
          error(
            "EscapedFromTargetMissing",
            project.id,
            "escapedFrom",
            `escapedFrom names "${project.escapedFrom}", which is not in the inventory.`,
          ),
        );
      }
    }
  }

  for (const id of cycleMembers(projects, new Set(idCounts.keys()))) {
    errors.push(
      error(
        "EscapedFromCycle",
        id as ProjectId,
        "escapedFrom",
        `${id} is part of an escapedFrom cycle.`,
      ),
    );
  }

  if (errors.length > 0) {
    return { ok: false, errors: errors as [ContentError, ...ContentError[]] };
  }

  return { ok: true, value: projects as Inventory };
}

export function validateTestimonials(
  testimonials: readonly Testimonial[],
): Result<Testimonials, ContentError> {
  if (testimonials.length === 0) {
    return {
      ok: false,
      errors: [error("EmptyTestimonials", null, null, "The testimonial collection has no entries.")],
    };
  }

  const errors: ContentError[] = [];

  testimonials.forEach((testimonial, index) => {
    if (testimonial.quote.trim() === "") {
      errors.push(
        error("TestimonialQuoteEmpty", null, "quote", `quote at index ${index} is empty after trimming.`),
      );
    }
    if (testimonial.author.trim() === "") {
      errors.push(
        error(
          "TestimonialAuthorEmpty",
          null,
          "author",
          `author at index ${index} is empty after trimming.`,
        ),
      );
    }
    // Present-but-empty, on `Project.question`'s convention. Absent is valid;
    // an empty string is not, because `renderAttribution` guards on `undefined`
    // and would otherwise emit the empty metadata element `X8` forbids.
    if (testimonial.role !== undefined && testimonial.role.trim() === "") {
      errors.push(
        error("TestimonialRoleEmpty", null, "role", `role at index ${index} is empty after trimming.`),
      );
    }
    if (testimonial.organization !== undefined && testimonial.organization.trim() === "") {
      errors.push(
        error(
          "TestimonialOrganizationEmpty",
          null,
          "organization",
          `organization at index ${index} is empty after trimming.`,
        ),
      );
    }
    if (testimonial.url !== undefined && !isAbsoluteHttpsUrl(testimonial.url)) {
      errors.push(
        error(
          "TestimonialUrlInvalid",
          null,
          "url",
          `url at index ${index} is not an https absolute URL.`,
        ),
      );
    }
  });

  if (errors.length > 0) {
    return { ok: false, errors: errors as [ContentError, ...ContentError[]] };
  }

  return { ok: true, value: testimonials as Testimonials };
}

function checkCvRequiredString(value: string, path: string, errors: ContentError[]): void {
  checkRequiredString(value, path, "CvFieldEmpty", errors);
}

function checkCvCollection(list: readonly unknown[], path: string, errors: ContentError[]): void {
  checkNonEmptyCollection(list, path, "CvCollectionEmpty", errors);
}

function checkCvUrl(value: string, path: string, errors: ContentError[]): void {
  if (value !== value.trim() || !isAbsoluteHttpsUrl(value)) {
    errors.push(error("CvUrlInvalid", null, path, `${path} "${value}" is not an https absolute URL.`));
  }
}

function checkCvYear(year: number, path: string, context: BuildContext, errors: ContentError[]): void {
  checkYear(year, path, context, null, { invalid: "CvYearInvalid", afterBuild: "CvYearAfterBuild" }, errors);
}

export function validateCv(cv: CvDocument, context: BuildContext): Result<CvData, ContentError> {
  const errors: ContentError[] = [];

  checkCvRequiredString(cv.header.name, "header.name", errors);
  checkCvRequiredString(cv.header.title, "header.title", errors);
  checkCvRequiredString(cv.header.email, "header.email", errors);
  checkCvRequiredString(cv.header.phone, "header.phone", errors);
  checkCvCollection(cv.header.links, "header.links", errors);
  cv.header.links.forEach((link, i) => {
    checkCvRequiredString(link.label, `header.links[${i}].label`, errors);
    checkCvUrl(link.href, `header.links[${i}].href`, errors);
  });

  checkCvRequiredString(cv.about.title, "about.title", errors);
  checkCvRequiredString(cv.about.body, "about.body", errors);

  checkCvCollection(cv.badges, "badges", errors);
  cv.badges.forEach((badge, i) => checkCvRequiredString(badge, `badges[${i}]`, errors));

  checkCvCollection(cv.chips, "chips", errors);
  cv.chips.forEach((chip, i) => checkCvRequiredString(chip, `chips[${i}]`, errors));

  checkCvRequiredString(cv.timelineTitle, "timelineTitle", errors);

  checkCvCollection(cv.roles, "roles", errors);
  cv.roles.forEach((role, i) => {
    const p = `roles[${i}]`;
    checkCvRequiredString(role.company, `${p}.company`, errors);
    checkCvRequiredString(role.title, `${p}.title`, errors);
    checkCvRequiredString(role.period, `${p}.period`, errors);
    checkCvRequiredString(role.location, `${p}.location`, errors);
    if (role.website !== undefined) checkCvUrl(role.website, `${p}.website`, errors);
    checkCvRequiredString(role.summary, `${p}.summary`, errors);
    checkCvCollection(role.achievements, `${p}.achievements`, errors);
    role.achievements.forEach((a, j) => checkCvRequiredString(a, `${p}.achievements[${j}]`, errors));
    checkCvCollection(role.tech, `${p}.tech`, errors);
    role.tech.forEach((t, j) => checkCvRequiredString(t, `${p}.tech[${j}]`, errors));
  });

  checkCvRequiredString(cv.educationTitle, "educationTitle", errors);
  checkCvCollection(cv.education, "education", errors);
  cv.education.forEach((edu, i) => {
    const p = `education[${i}]`;
    checkCvRequiredString(edu.school, `${p}.school`, errors);
    checkCvRequiredString(edu.degree, `${p}.degree`, errors);
    checkCvRequiredString(edu.details, `${p}.details`, errors);
  });

  checkCvRequiredString(cv.projectsTitle, "projectsTitle", errors);
  checkCvCollection(cv.projects, "projects", errors);
  cv.projects.forEach((proj, i) => {
    const p = `projects[${i}]`;
    checkCvRequiredString(proj.title, `${p}.title`, errors);
    checkCvUrl(proj.link, `${p}.link`, errors);
    checkCvRequiredString(proj.description, `${p}.description`, errors);
    checkCvCollection(proj.tech, `${p}.tech`, errors);
    proj.tech.forEach((t, j) => checkCvRequiredString(t, `${p}.tech[${j}]`, errors));
    checkCvYear(proj.year, `${p}.year`, context, errors);
  });

  checkCvRequiredString(cv.openSourceTitle, "openSourceTitle", errors);
  checkCvCollection(cv.openSource, "openSource", errors);
  cv.openSource.forEach((os, i) => {
    const p = `openSource[${i}]`;
    checkCvRequiredString(os.title, `${p}.title`, errors);
    if (os.link !== undefined) checkCvUrl(os.link, `${p}.link`, errors);
    checkCvRequiredString(os.description, `${p}.description`, errors);
    checkCvRequiredString(os.impact, `${p}.impact`, errors);
    checkCvCollection(os.tech, `${p}.tech`, errors);
    os.tech.forEach((t, j) => checkCvRequiredString(t, `${p}.tech[${j}]`, errors));
  });

  checkCvRequiredString(cv.timelineProjectsTitle, "timelineProjectsTitle", errors);
  checkCvCollection(cv.timelineProjects, "timelineProjects", errors);
  cv.timelineProjects.forEach((era, i) => {
    const p = `timelineProjects[${i}]`;
    checkCvRequiredString(era.period, `${p}.period`, errors);
    checkCvRequiredString(era.focus, `${p}.focus`, errors);
    checkCvCollection(era.projects, `${p}.projects`, errors);
    era.projects.forEach((proj, j) => checkCvRequiredString(proj, `${p}.projects[${j}]`, errors));
  });

  checkCvRequiredString(cv.quote, "quote", errors);

  if (errors.length > 0) {
    return { ok: false, errors: errors as [ContentError, ...ContentError[]] };
  }
  return { ok: true, value: cv as CvData };
}

function checkPortfolioString(value: string, path: string, errors: ContentError[]): void {
  checkRequiredString(value, path, "PortfolioFieldEmpty", errors);
}

function checkPortfolioCollection(list: readonly unknown[], path: string, errors: ContentError[]): void {
  checkNonEmptyCollection(list, path, "PortfolioCollectionEmpty", errors);
}

// Depth is 1-indexed at the top-level `technologies` entries — the bound C18
// enforces is three levels, so a node introduced at depth 4 or deeper fails.
function checkTechNode(node: TechNode, path: string, depth: number, errors: ContentError[]): void {
  checkPortfolioString(node.name, `${path}.name`, errors);
  if (depth > 3) {
    errors.push(
      error(
        "PortfolioTechDepthExceeded",
        null,
        path,
        `${path} is nested ${depth} levels deep, exceeding the bound of 3.`,
      ),
    );
  }
  if (node.children !== undefined) {
    checkPortfolioCollection(node.children, `${path}.children`, errors);
    node.children.forEach((child, i) => checkTechNode(child, `${path}.children[${i}]`, depth + 1, errors));
  }
}

function countBy<T>(items: readonly T[], key: (item: T) => string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
}

export function validatePortfolio(portfolio: PortfolioDocument): Result<PortfolioData, ContentError> {
  const errors: ContentError[] = [];

  checkPortfolioString(portfolio.header.title, "header.title", errors);
  checkPortfolioString(portfolio.header.subtitle, "header.subtitle", errors);

  checkPortfolioCollection(portfolio.technologies, "technologies", errors);
  portfolio.technologies.forEach((node, i) => checkTechNode(node, `technologies[${i}]`, 1, errors));
  for (const [name, count] of countBy(portfolio.technologies, (node) => node.name.trim().toLowerCase())) {
    if (count > 1) {
      errors.push(
        error(
          "PortfolioDuplicateCategory",
          null,
          "technologies",
          `technologies entries share the name "${name}" (${count} times).`,
        ),
      );
    }
  }

  checkPortfolioCollection(portfolio.projects, "projects", errors);
  portfolio.projects.forEach((proj, i) => {
    const p = `projects[${i}]`;
    checkPortfolioString(proj.category, `${p}.category`, errors);
    checkPortfolioString(proj.icon, `${p}.icon`, errors);
    checkPortfolioString(proj.description, `${p}.description`, errors);
  });
  for (const [category, count] of countBy(portfolio.projects, (proj) => proj.category.trim().toLowerCase())) {
    if (count > 1) {
      errors.push(
        error(
          "PortfolioDuplicateCategory",
          null,
          "projects",
          `projects entries share the category "${category}" (${count} times).`,
        ),
      );
    }
  }

  checkPortfolioCollection(portfolio.stats, "stats", errors);
  portfolio.stats.forEach((stat, i) => {
    const p = `stats[${i}]`;
    checkPortfolioString(stat.value, `${p}.value`, errors);
    checkPortfolioString(stat.label, `${p}.label`, errors);
  });

  if (errors.length > 0) {
    return { ok: false, errors: errors as [ContentError, ...ContentError[]] };
  }
  return { ok: true, value: portfolio as PortfolioData };
}
