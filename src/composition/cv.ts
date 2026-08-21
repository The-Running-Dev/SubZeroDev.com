// Composition — the CV route (contract's `composeCv`).
//
// Deterministic and total on `CvData`: every figure the body renders is read
// from the validated document rather than a typed literal (X1), and this
// composer renders no project entry, no stage grouping, no contamination
// chain and no count from `inventory` — that parameter exists only for the
// shared masthead (the Blog href and `sinceYear`), on the same footing
// `composeApex` and `composeMiss`'s own `Depends on` notes describe. Every
// interpolated `CvData` string is escaped before it reaches text or
// attribute position (X5); the `Person` block escapes through
// `personJsonLd`'s own `JSON.stringify` pass instead, exactly as `X6`'s
// `Organization` block already does. A linear document: no `view` class, no
// in-page anchors, nothing switched — `renderHeader` is called with no
// in-page links.

import { resolvedHomes, sinceYear } from "../content";
import type {
  CvData,
  CvEducation,
  CvEra,
  CvOpenSource,
  CvProject,
  CvRole,
  Inventory,
} from "../content";
import { primitives, stylesheetFor } from "../presentation";
import type { BodyHtml } from "../presentation";
import { escapeHtml } from "./escape-html";
import { renderHeader, renderOutbound } from "./header";
import { personJsonLd } from "./json-ld";
import type { ComposedRoute } from "./types";

function renderAchievements(achievements: readonly string[]): string {
  if (achievements.length === 0) return "";
  return `<ul>${achievements.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul>`;
}

function renderTechLine(tech: readonly string[]): string {
  return `<p class="${primitives.meta.className}">${tech.map(escapeHtml).join(" · ")}</p>`;
}

function renderCvLinks(cv: CvData): string {
  const links = cv.header.links
    .map(
      (link) =>
        `<a class="${primitives.link.className}" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`,
    )
    .join("");
  return `<p class="${primitives.meta.className}">${links}</p>`;
}

function renderRole(role: CvRole): string {
  const website =
    role.website !== undefined
      ? ` · <a class="${primitives.link.className}" href="${escapeHtml(role.website)}">${escapeHtml(role.website)}</a>`
      : "";

  return [
    `<div class="${primitives.entry.className}">`,
    `<h3>${escapeHtml(role.company)}</h3>`,
    `<p class="${primitives.meta.className}">${escapeHtml(role.title)} · ${escapeHtml(role.period)} · ${escapeHtml(role.location)}${website}</p>`,
    `<p>${escapeHtml(role.summary)}</p>`,
    renderAchievements(role.achievements),
    renderTechLine(role.tech),
    `</div>`,
  ].join("");
}

function renderEducation(education: CvEducation): string {
  return [
    `<div class="${primitives.entry.className}">`,
    `<h4>${escapeHtml(education.school)}</h4>`,
    `<p class="${primitives.meta.className}">${escapeHtml(education.degree)}</p>`,
    `<p>${escapeHtml(education.details)}</p>`,
    `</div>`,
  ].join("");
}

function renderProjectCard(project: CvProject): string {
  return [
    `<div class="${primitives.card.className}">`,
    `<h4><a class="${primitives.link.className}" href="${escapeHtml(project.link)}">${escapeHtml(project.title)}</a></h4>`,
    `<p class="${primitives.meta.className}">${project.year}</p>`,
    `<p>${escapeHtml(project.description)}</p>`,
    renderTechLine(project.tech),
    `</div>`,
  ].join("");
}

function renderOpenSourceCard(entry: CvOpenSource): string {
  const heading =
    entry.link !== undefined
      ? `<h4><a class="${primitives.link.className}" href="${escapeHtml(entry.link)}">${escapeHtml(entry.title)}</a></h4>`
      : `<h4>${escapeHtml(entry.title)}</h4>`;

  return [
    `<div class="${primitives.card.className}">`,
    heading,
    `<p>${escapeHtml(entry.description)}</p>`,
    `<p class="${primitives.meta.className}">${escapeHtml(entry.impact)}</p>`,
    renderTechLine(entry.tech),
    `</div>`,
  ].join("");
}

function renderEra(era: CvEra): string {
  return [
    `<div class="${primitives.entry.className}">`,
    `<h4>${escapeHtml(era.period)}</h4>`,
    `<p>${escapeHtml(era.focus)}</p>`,
    `<p class="${primitives.meta.className}">${era.projects.map(escapeHtml).join(" · ")}</p>`,
    `</div>`,
  ].join("");
}

export function composeCv(inventory: Inventory, cv: CvData, origin: string): ComposedRoute {
  const hrefById = new Map(resolvedHomes(inventory).map((h) => [h.projectId, h.url] as const));

  const personBlock = personJsonLd(
    cv.header.name,
    cv.header.title,
    origin,
    cv.header.links.map((link) => link.href),
  );

  const bodyHtml = [
    `<div class="${primitives.page.className}">`,
    `<div class="${primitives.stack.className}">`,
    renderHeader([], hrefById, origin, sinceYear(inventory)),
    `<hr class="${primitives.rule.className}" />`,
    `<div class="${primitives.stack.className}">`,
    `<h1>${escapeHtml(cv.header.name)}</h1>`,
    `<p class="${primitives.meta.className}">${escapeHtml(cv.header.title)}</p>`,
    `<p><a class="${primitives.link.className}" href="mailto:${escapeHtml(cv.header.email)}">${escapeHtml(cv.header.email)}</a> · ${escapeHtml(cv.header.phone)}</p>`,
    renderCvLinks(cv),
    `</div>`,
    `<div class="${primitives.stack.className}">`,
    `<h2>${escapeHtml(cv.about.title)}</h2>`,
    `<p>${escapeHtml(cv.about.body)}</p>`,
    `</div>`,
    `<div class="${primitives.stack.className}">`,
    renderTechLine(cv.badges),
    renderTechLine(cv.chips),
    `</div>`,
    `<div class="${primitives.stack.className}">`,
    `<h2>${escapeHtml(cv.timelineTitle)}</h2>`,
    cv.roles.map(renderRole).join(""),
    `</div>`,
    `<div class="${primitives.stack.className}">`,
    `<h2>${escapeHtml(cv.educationTitle)}</h2>`,
    cv.education.map(renderEducation).join(""),
    `</div>`,
    `<div class="${primitives.stack.className}">`,
    `<h2>${escapeHtml(cv.projectsTitle)}</h2>`,
    `<div class="${primitives.grid.className}">${cv.projects.map(renderProjectCard).join("")}</div>`,
    `</div>`,
    `<div class="${primitives.stack.className}">`,
    `<h2>${escapeHtml(cv.openSourceTitle)}</h2>`,
    `<div class="${primitives.grid.className}">${cv.openSource.map(renderOpenSourceCard).join("")}</div>`,
    `</div>`,
    `<div class="${primitives.stack.className}">`,
    `<h2>${escapeHtml(cv.timelineProjectsTitle)}</h2>`,
    cv.timelineProjects.map(renderEra).join(""),
    `</div>`,
    `<hr class="${primitives.rule.className}" />`,
    `<footer class="${primitives.stack.className}">`,
    `<div class="${primitives.bar.className}">`,
    `<p><em>${escapeHtml(cv.quote)}</em></p>`,
    `<p class="${primitives.meta.className}">${renderOutbound(hrefById, origin)}</p>`,
    `</div>`,
    `</footer>`,
    `</div>`,
    `</div>`,
    `<script type="application/ld+json">${personBlock}</script>`,
  ].join("") as BodyHtml;

  return {
    bodyHtml,
    stylesheet: stylesheetFor(bodyHtml),
  };
}
