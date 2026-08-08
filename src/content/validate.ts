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
  Inventory,
  Project,
  ProjectId,
  Result,
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

    if (!Number.isInteger(project.year) || project.year < 1000 || project.year > 9999) {
      errors.push(
        error(
          "InvalidYear",
          project.id,
          "year",
          `year ${project.year} is not a four-digit integer.`,
        ),
      );
    } else if (project.year > context.utcYear) {
      errors.push(
        error(
          "YearAfterBuild",
          project.id,
          "year",
          `year ${project.year} is after the build's UTC year ${context.utcYear}.`,
        ),
      );
    }

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
  });

  if (errors.length > 0) {
    return { ok: false, errors: errors as [ContentError, ...ContentError[]] };
  }

  return { ok: true, value: testimonials as Testimonials };
}
