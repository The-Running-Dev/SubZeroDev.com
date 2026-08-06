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
  sinceYear,
} from "../content";
import type { ContaminationNode, Inventory, Project } from "../content";
import { primitives, stylesheetFor } from "../presentation";
import type { BodyHtml } from "../presentation";
import { escapeHtml } from "./escape-html";
import type { ComposedRoute } from "./types";

// Idea.md lines 556-579 — the "Effortless Action" full essay, one of three
// unresolved drafts at Idea.md lines 540-604. Chosen by the owner; the other
// two remain unimplemented in that transcript.
const manifestoParagraphs: readonly string[] = [
  "SubZeroDev wasn't built from a business plan.",
  "None of our products were.",
  "We don't force ideas into existence.",
  "We follow curiosity.",
  "One problem becomes a solution.",
  "One solution becomes infrastructure.",
  "Infrastructure becomes a platform.",
  "Sometimes it becomes an entirely different product.",
  "We don't chase outcomes.",
  "We do the next interesting thing well.",
  "The rest tends to happen on its own.",
];

function renderManifesto(): string {
  return [
    `<div class="${primitives.stack.className}">`,
    `<p class="${primitives.meta.className}">01 / Effortless Action</p>`,
    `<h2>Effortless Action</h2>`,
    ...manifestoParagraphs.map((sentence) => `<p>${sentence}</p>`),
    `<p><em>Effortless Action.</em></p>`,
    `</div>`,
  ].join("");
}

function renderProjectEntry(project: Project): string {
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
    `<h4>${escapeHtml(project.name)}</h4>`,
    `<p class="${primitives.meta.className}">${escapeHtml(project.id)} · ${project.year} · ${escapeHtml(project.stage)}${edge}</p>`,
    `<p>${escapeHtml(project.line)}</p>`,
    question,
    `</div>`,
  ].join("");
}

function renderEcosystem(inventory: Inventory): string {
  const groups = ecosystemTree(inventory);
  const counts = countByStage(inventory);
  const byStage = new Map(counts.map((c) => [c.stage, c.count] as const));

  const groupHtml = groups.map((group) => {
    const count = byStage.get(group.stage) ?? 0;
    const body =
      group.projects.length > 0
        ? `<div class="${primitives.stack.className}">${group.projects.map(renderProjectEntry).join("")}</div>`
        : `<p class="${primitives.meta.className}">No projects here yet.</p>`;

    return [
      `<div class="${primitives.stack.className}">`,
      `<h3>${escapeHtml(group.stage)} (${count})</h3>`,
      body,
      `</div>`,
    ].join("");
  });

  return [
    `<div class="${primitives.stack.className}">`,
    `<p class="${primitives.meta.className}">02 / The Ecosystem</p>`,
    `<h2>The Ecosystem</h2>`,
    `<p class="${primitives.meta.className}">${projectTotal(inventory)} projects.</p>`,
    ...groupHtml,
    `</div>`,
  ].join("");
}

function renderContaminationNode(node: ContaminationNode): string {
  const edge =
    node.project.escapedFrom !== undefined
      ? `${escapeHtml(node.project.escapedFrom)} → `
      : "";
  const children =
    node.escapes.length > 0
      ? `<div class="${primitives.stack.className}">${node.escapes.map(renderContaminationNode).join("")}</div>`
      : "";

  return [
    `<div class="${primitives.entry.className}">`,
    `<p class="${primitives.meta.className}">${edge}${escapeHtml(node.project.id)}</p>`,
    `<h4>${escapeHtml(node.project.name)}</h4>`,
    children,
    `</div>`,
  ].join("");
}

function renderContamination(inventory: Inventory): string {
  const forest = contaminationForest(inventory);

  return [
    `<div class="${primitives.stack.className}">`,
    `<p class="${primitives.meta.className}">03 / Contamination</p>`,
    `<h2>Contamination</h2>`,
    ...forest.map(renderContaminationNode),
    `</div>`,
  ].join("");
}

export function composeApex(inventory: Inventory): ComposedRoute {
  const bodyHtml = [
    `<div class="${primitives.page.className}">`,
    `<div class="${primitives.stack.className}">`,
    `<header class="${primitives.stack.className}">`,
    `<h1>SubZeroDev</h1>`,
    `<p class="${primitives.meta.className}">Professional uncertainty since ${sinceYear(inventory)}.</p>`,
    `<p>${primarySlogan}</p>`,
    `</header>`,
    `<hr class="${primitives.rule.className}" />`,
    renderManifesto(),
    `<hr class="${primitives.rule.className}" />`,
    renderEcosystem(inventory),
    `<hr class="${primitives.rule.className}" />`,
    renderContamination(inventory),
    `<hr class="${primitives.rule.className}" />`,
    `<footer class="${primitives.stack.className}">`,
    `<p>${apexFooterQuote}</p>`,
    `</footer>`,
    `</div>`,
    `</div>`,
  ].join("") as BodyHtml;

  return {
    bodyHtml,
    stylesheet: stylesheetFor(bodyHtml),
  };
}
