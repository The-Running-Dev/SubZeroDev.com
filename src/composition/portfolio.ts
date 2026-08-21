// Composition — the portfolio route (contract's `composePortfolio`).
//
// Deterministic and total on `PortfolioData`: every figure the body renders
// is read from the validated document rather than a typed literal (X1), and
// this composer renders no project entry, no stage grouping, no
// contamination chain and no count from `inventory` — that parameter exists
// only for the shared masthead, on the same footing `composeCv`'s own
// `Depends on` note describes. Every interpolated `PortfolioData` string is
// escaped before it reaches text position (X5). A linear document: no
// `view` class, no in-page anchors, nothing switched, and no `<script>`
// element at all — the portfolio has no JSON-LD subject (contract's
// Composition § "`composePortfolio` emits none").

import { resolvedHomes, sinceYear } from "../content";
import type { Inventory, PortfolioCategory, PortfolioData, PortfolioStat, TechNode } from "../content";
import { primitives, stylesheetFor } from "../presentation";
import type { BodyHtml } from "../presentation";
import { escapeHtml } from "./escape-html";
import { renderHeader, renderOutbound } from "./header";
import type { ComposedRoute } from "./types";

// One recursive function for every level of the tree (S17.3) — the source
// encodes three levels with three different shapes; this renders the one
// normalised `TechNode` shape regardless of depth.
function renderTechNode(node: TechNode): string {
  const children =
    node.children !== undefined
      ? `<div class="${primitives.stack.className}">${node.children.map(renderTechNode).join("")}</div>`
      : "";

  return [
    `<div class="${primitives.entry.className}">`,
    `<h4>${escapeHtml(node.name)}</h4>`,
    children,
    `</div>`,
  ].join("");
}

function renderTechnologies(technologies: readonly TechNode[]): string {
  return `<div class="${primitives.grid.className}">${technologies.map(renderTechNode).join("")}</div>`;
}

function renderProjectCategory(category: PortfolioCategory): string {
  return [
    `<div class="${primitives.card.className}">`,
    `<h4>${escapeHtml(category.icon)} ${escapeHtml(category.category)}</h4>`,
    `<p>${escapeHtml(category.description)}</p>`,
    `</div>`,
  ].join("");
}

function renderProjects(projects: readonly PortfolioCategory[]): string {
  return `<div class="${primitives.grid.className}">${projects.map(renderProjectCategory).join("")}</div>`;
}

function renderStat(stat: PortfolioStat): string {
  return [
    `<div class="${primitives.entry.className}">`,
    `<h3>${escapeHtml(stat.value)}</h3>`,
    `<p class="${primitives.meta.className}">${escapeHtml(stat.label)}</p>`,
    `</div>`,
  ].join("");
}

function renderStats(stats: readonly PortfolioStat[]): string {
  return `<div class="${primitives.row.className}">${stats.map(renderStat).join("")}</div>`;
}

export function composePortfolio(
  inventory: Inventory,
  portfolio: PortfolioData,
  origin: string,
): ComposedRoute {
  const hrefById = new Map(resolvedHomes(inventory).map((h) => [h.projectId, h.url] as const));

  const bodyHtml = [
    `<div class="${primitives.page.className}">`,
    `<div class="${primitives.stack.className}">`,
    renderHeader([], hrefById, origin, sinceYear(inventory)),
    `<hr class="${primitives.rule.className}" />`,
    `<div class="${primitives.stack.className}">`,
    `<h1>${escapeHtml(portfolio.header.title)}</h1>`,
    `<p class="${primitives.meta.className}">${escapeHtml(portfolio.header.subtitle)}</p>`,
    `</div>`,
    `<div class="${primitives.stack.className}">`,
    renderStats(portfolio.stats),
    `</div>`,
    `<div class="${primitives.stack.className}">`,
    renderTechnologies(portfolio.technologies),
    `</div>`,
    `<div class="${primitives.stack.className}">`,
    renderProjects(portfolio.projects),
    `</div>`,
    `<hr class="${primitives.rule.className}" />`,
    `<footer class="${primitives.stack.className}">`,
    `<div class="${primitives.bar.className}">`,
    `<p class="${primitives.meta.className}">${renderOutbound(hrefById, origin)}</p>`,
    `</div>`,
    `</footer>`,
    `</div>`,
    `</div>`,
  ].join("") as BodyHtml;

  return {
    bodyHtml,
    stylesheet: stylesheetFor(bodyHtml),
  };
}
