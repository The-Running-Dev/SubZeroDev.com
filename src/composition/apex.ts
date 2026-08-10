// Composition — the apex route (contract's `composeApex`).
//
// Deterministic and total on `Inventory`: every count, grouping and chain is
// a Content derivation rather than a typed literal (X1), so removing a
// project from the inventory changes the total, its stage's count and the
// ecosystem grouping the next call produces. The manifesto and footer quote
// are the exception `10-design.md`'s *Copy* section names — authored prose
// living here rather than modelled as data — and every interpolated Content
// string is escaped before it reaches text position (X5). Every class
// referenced below is read from `primitives`, exactly as `composeMiss` does,
// so `stylesheetFor`'s output can never drift from what this body uses.

import {
  apexFooterQuote,
  contaminationForest,
  countByStage,
  ecosystemTree,
  primarySlogan,
  projectTotal,
  resolvedHomes,
  sinceYear,
  sourceUrl,
} from "../content";
import type {
  AbsoluteUrl,
  ContaminationNode,
  Inventory,
  Project,
  ProjectId,
  Testimonials,
} from "../content";
import { primitives, stylesheetFor } from "../presentation";
import type { BodyHtml } from "../presentation";
import { enhancementScript } from "./enhancement";
import { escapeHtml } from "./escape-html";
import { organizationJsonLd } from "./json-ld";
import { renderTestimonials, testimonialsHeading } from "./testimonials";
import type { ComposedRoute } from "./types";

// X10 — one inline, src-free, request-free enhancement script, in addition
// to the ld+json block (X6). Built once: `enhancementScript()` is pure.
const ENHANCEMENT_SCRIPT_TAG = `<script>${enhancementScript()}</script>`;

// PLACEHOLDER COPY: the Organization block's `name` and `description` are
// placeholders, started on the owner's explicit instruction ahead of final
// copy — the same precedent as S6's route titles and descriptions
// (design/90-decisions.md, 2026-08-06). Replace before publication.
const organizationName = "SubZeroDev (placeholder name — replace before publication)";
const organizationDescription =
  "Placeholder description for the SubZeroDev organisation — replace before publication.";

// A section's anchor, its `meta` index label and its heading, in one place.
// The header nav links to the same three headings, and a second copy of the
// heading text is a promise the nav and the h2 will drift. `navLabel` is the
// one deliberate exception: the testimonials section's own heading is the
// long joke sentence, and the nav needs a short tab-shaped label distinct
// from it, exactly as the imported prototype (`SubZeroDev Landing.dc.html`)
// gives it a "Testimonials" tab pointing at a different heading string.
type Section = {
  readonly anchor: string;
  readonly label: string;
  readonly heading: string;
  readonly navLabel?: string;
};

const manifestoSection: Section = {
  anchor: "effortless-action",
  label: "01 / Effortless Action",
  heading: "Effortless Action",
};

const ecosystemSection: Section = {
  anchor: "echo-system",
  label: "02 / The Ecosystem",
  heading: "The Echo System",
};

const contaminationSection: Section = {
  anchor: "contamination",
  label: "03 / Contamination",
  heading: "Contamination",
};

const testimonialsSection: Section = {
  anchor: "testimonials",
  label: "04 / Testimonials",
  heading: testimonialsHeading,
  navLabel: "Testimonials",
};

const sections: readonly Section[] = [
  manifestoSection,
  ecosystemSection,
  contaminationSection,
  testimonialsSection,
];

// Owner-supplied copy, not a transcription from Idea.md — see 90-decisions.md,
// 2026-08-07, "the manifesto supersedes the Idea.md draft".
const manifestoParagraphs: readonly string[] = [
  "SubZeroDev was always meant to be a business.",
  "We just never decided what kind.",
  "There was no master plan.",
  "No product roadmap.",
  "We built things because they were useful, interesting, or both.",
  "One problem became a solution.",
  "One solution became infrastructure.",
  "Infrastructure became a platform.",
  "Some things became products.",
  "Others escaped and became entirely different things.",
  "We don't force ideas to fit the business.",
  "We let the business follow the ideas.",
  "We do the next interesting thing well.",
  "Then we see what happened.",
  "The absence of a plan is the plan.",
];

// Opens a top-level section: the anchor the nav targets, the index label and
// the heading, all from the one `Section` record.
function openSection(section: Section): string {
  return [
    `<div class="${primitives.stack.className}" id="${section.anchor}">`,
    `<p class="${primitives.meta.className}">${section.label}</p>`,
    `<h2>${section.heading}</h2>`,
  ].join("");
}

type NavTarget = {
  readonly label: string;
  readonly url: AbsoluteUrl;
};

// Blog and Portfolio are the inventory's own homes, found by id rather than
// restated — those URLs have one home, in `projects.ts`. Renaming either
// record drops its link silently, because Composition is total and cannot
// fail. Two tests go red instead: `tests/composition/apex-navigation.test.ts`
// pins the drop-not-fake behaviour, and `tests/content/inventory.test.ts`
// asserts the committed inventory still carries both ids (C14's call site).
function homeOf(
  hrefById: ReadonlyMap<ProjectId, AbsoluteUrl>,
  projectId: string,
): AbsoluteUrl | undefined {
  for (const [id, url] of hrefById) {
    if (id === projectId) return url;
  }
  return undefined;
}

function target(label: string, url: AbsoluteUrl | undefined): NavTarget | null {
  return url === undefined ? null : { label, url };
}

// `sourceUrl` addresses the account rather than a project, so it produces no
// `ResolvedHome` and no gate checks it — the cost `20-contract.md` states.
function outboundTargets(hrefById: ReadonlyMap<ProjectId, AbsoluteUrl>): readonly NavTarget[] {
  return [
    target("Blog", homeOf(hrefById, "publishing")),
    target("Projects", sourceUrl),
    target("Portfolio", homeOf(hrefById, "portfolio")),
  ].filter((t): t is NavTarget => t !== null);
}

function renderLink(href: string, text: string): string {
  return `<a class="${primitives.link.className}" href="${href}">${text}</a>`;
}

function renderOutbound(hrefById: ReadonlyMap<ProjectId, AbsoluteUrl>): string {
  return outboundTargets(hrefById)
    .map((t) => renderLink(escapeHtml(t.url), t.label))
    .join(" · ");
}

function renderNav(hrefById: ReadonlyMap<ProjectId, AbsoluteUrl>): string {
  const inPage = sections.map((s) => renderLink(`#${s.anchor}`, s.navLabel ?? s.heading)).join(" · ");

  return [
    `<nav class="${primitives.bar.className}">`,
    `<p class="${primitives.meta.className}">${inPage}</p>`,
    `<p class="${primitives.meta.className}">${renderOutbound(hrefById)}</p>`,
    `</nav>`,
  ].join("");
}

function renderManifesto(): string {
  return [
    openSection(manifestoSection),
    ...manifestoParagraphs.map((sentence) => `<p>${sentence}</p>`),
    `<p><em>Effortless Action.</em></p>`,
    `</div>`,
  ].join("");
}

function renderProjectName(project: Project, hrefById: ReadonlyMap<ProjectId, AbsoluteUrl>): string {
  const href = hrefById.get(project.id);
  return href !== undefined
    ? `<a class="${primitives.link.className}" href="${escapeHtml(href)}">${escapeHtml(project.name)}</a>`
    : escapeHtml(project.name);
}

function renderProjectEntry(project: Project, hrefById: ReadonlyMap<ProjectId, AbsoluteUrl>): string {
  const edge =
    project.escapedFrom !== undefined
      ? ` · escaped from ${escapeHtml(project.escapedFrom)}`
      : "";
  const question =
    project.question !== undefined
      ? `<p><em>${escapeHtml(project.question)}</em></p>`
      : "";

  return [
    `<div class="${primitives.entry.className}">`,
    `<h4>${renderProjectName(project, hrefById)}</h4>`,
    `<p class="${primitives.meta.className}">${escapeHtml(project.id)} · ${project.year} · ${escapeHtml(project.stage)}${edge}</p>`,
    `<p>${escapeHtml(project.line)}</p>`,
    question,
    `</div>`,
  ].join("");
}

function renderEcosystem(inventory: Inventory, hrefById: ReadonlyMap<ProjectId, AbsoluteUrl>): string {
  const groups = ecosystemTree(inventory);
  const counts = countByStage(inventory);
  const byStage = new Map(counts.map((c) => [c.stage, c.count] as const));

  const groupHtml = groups.filter((group) => group.projects.length > 0).map((group) => {
    const count = byStage.get(group.stage) ?? 0;
    const body = `<div class="${primitives.stack.className}">${group.projects.map((p) => renderProjectEntry(p, hrefById)).join("")}</div>`;

    return [
      `<div class="${primitives.stack.className}">`,
      `<h3>${escapeHtml(group.stage)} (${count})</h3>`,
      body,
      `</div>`,
    ].join("");
  });

  return [
    openSection(ecosystemSection),
    `<p class="${primitives.meta.className}">${projectTotal(inventory)} projects.</p>`,
    ...groupHtml,
    `</div>`,
  ].join("");
}

function renderContaminationNode(
  node: ContaminationNode,
  hrefById: ReadonlyMap<ProjectId, AbsoluteUrl>,
): string {
  const edge =
    node.project.escapedFrom !== undefined
      ? `${escapeHtml(node.project.escapedFrom)} → `
      : "";
  const children =
    node.escapes.length > 0
      ? `<div class="${primitives.stack.className}">${node.escapes.map((e) => renderContaminationNode(e, hrefById)).join("")}</div>`
      : "";

  return [
    `<div class="${primitives.entry.className}">`,
    `<p class="${primitives.meta.className}">${edge}${escapeHtml(node.project.id)}</p>`,
    `<h4>${renderProjectName(node.project, hrefById)}</h4>`,
    children,
    `</div>`,
  ].join("");
}

function renderContamination(inventory: Inventory, hrefById: ReadonlyMap<ProjectId, AbsoluteUrl>): string {
  const forest = contaminationForest(inventory);

  return [
    openSection(contaminationSection),
    ...forest.map((n) => renderContaminationNode(n, hrefById)),
    `</div>`,
  ].join("");
}

function renderTestimonialsSection(testimonials: Testimonials): string {
  return [openSection(testimonialsSection), renderTestimonials(testimonials), `</div>`].join("");
}

export function composeApex(
  inventory: Inventory,
  testimonials: Testimonials,
  origin: string,
): ComposedRoute {
  const hrefById = new Map(resolvedHomes(inventory).map((h) => [h.projectId, h.url] as const));

  const bodyHtml = [
    `<div class="${primitives.page.className}">`,
    `<div class="${primitives.stack.className}">`,
    `<header class="${primitives.stack.className}">`,
    `<h1>SubZeroDev</h1>`,
    `<p class="${primitives.meta.className}">Professional uncertainty since ${sinceYear(inventory)}.</p>`,
    `<p>${primarySlogan}</p>`,
    `</header>`,
    renderNav(hrefById),
    `<hr class="${primitives.rule.className}" />`,
    // The four sections stack in their own numbered order — 01 through 04 —
    // rather than sharing a `row`. The row was survivable only while the CSS
    // fold hid all but one section, so it never had two visible children;
    // with every section always visible it put 02 beside 01 and 03, which
    // reads out of order and leaves a column of void next to the ecosystem.
    renderManifesto(),
    renderEcosystem(inventory, hrefById),
    renderContamination(inventory, hrefById),
    renderTestimonialsSection(testimonials),
    `<hr class="${primitives.rule.className}" />`,
    `<footer class="${primitives.stack.className}">`,
    `<div class="${primitives.bar.className}">`,
    `<p>${apexFooterQuote}</p>`,
    `<p class="${primitives.meta.className}">${renderOutbound(hrefById)}</p>`,
    `</div>`,
    `</footer>`,
    `</div>`,
    `</div>`,
    `<script type="application/ld+json">${organizationJsonLd(organizationName, organizationDescription, origin)}</script>`,
    ENHANCEMENT_SCRIPT_TAG,
  ].join("") as BodyHtml;

  return {
    bodyHtml,
    stylesheet: stylesheetFor(bodyHtml),
  };
}
