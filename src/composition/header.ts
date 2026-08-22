// Composition — the shared apex-style header: wordmark, tagline, slogan and
// the two-row nav bar. Isolated from `apex.ts` so a future route in this
// repository can reuse the same identity block and outbound-link/
// current-site logic without re-deriving it.

import { primarySlogan, sourceUrl } from "../content";
import type { AbsoluteUrl, ProjectId, Year } from "../content";
import { primitives } from "../presentation";
import { escapeHtml } from "./escape-html";

export type InPageLink = {
  readonly anchor: string;
  readonly label: string;
};

type NavTarget = {
  readonly label: string;
  readonly url: AbsoluteUrl;
  readonly current: boolean;
};

// Blog is the inventory's own home, found by id rather than restated — that
// URL has one home, in the projects JSON document. Renaming that record
// drops its link silently, because Composition is total and cannot fail.
// Two tests go red instead: `tests/composition/apex-navigation.test.ts` pins
// the drop-not-fake behaviour, and `tests/content/inventory.test.ts` asserts
// the committed inventory still carries the id (C14's call site).
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
  return url === undefined ? null : { label, url, current: false };
}

// SubZeroDev.com, Portfolio and CV are this site's own three routes rather
// than inventory lookups — each carries its own path here rather than
// importing `RoutePath` from Adapter, which Composition may not do (X2). The
// current route travels in as a plain string and a target is current when
// its own path equals it (S18.3): exactly one of the three, on whichever of
// the three documents composes this header.
function ownTarget(label: string, path: string, origin: string, currentPath: string): NavTarget {
  return { label, url: `${origin}${path}` as AbsoluteUrl, current: path === currentPath };
}

export const ownRoutePaths = {
  apex: "/",
  cv: "/cv/",
  portfolio: "/portfolio/",
} as const;

// `sourceUrl` addresses the account rather than a project, so it produces no
// `ResolvedHome`. It is checked by `V4` all the same since S14: `checkedLinks`
// carries it directly rather than through `resolvedHomes`.
function outboundTargets(
  hrefById: ReadonlyMap<ProjectId, AbsoluteUrl>,
  origin: string,
  currentPath: string,
): readonly NavTarget[] {
  return [
    ownTarget("SubZeroDev.com", ownRoutePaths.apex, origin, currentPath),
    target("Blog", homeOf(hrefById, "publishing")),
    target("Projects", sourceUrl),
    ownTarget("Portfolio", ownRoutePaths.portfolio, origin, currentPath),
    ownTarget("CV", ownRoutePaths.cv, origin, currentPath),
  ].filter((t): t is NavTarget => t !== null);
}

function renderLink(href: string, text: string, current?: boolean): string {
  const classAttr = current
    ? `${primitives.link.className} ${primitives["link-current"].className}`
    : primitives.link.className;
  const currentAttr = current ? ` aria-current="page"` : "";
  return `<a class="${classAttr}" href="${href}"${currentAttr}>${text}</a>`;
}

// Exported on its own — each route's footer repeats the outbound group
// without the in-page links, so every call site shares this rather than
// each restating the outbound derivation.
export function renderOutbound(
  hrefById: ReadonlyMap<ProjectId, AbsoluteUrl>,
  origin: string,
  currentPath: string,
): string {
  return outboundTargets(hrefById, origin, currentPath)
    .map((t) => renderLink(escapeHtml(t.url), t.label, t.current))
    .join("");
}

function renderNav(
  inPageLinks: readonly InPageLink[],
  hrefById: ReadonlyMap<ProjectId, AbsoluteUrl>,
  origin: string,
  currentPath: string,
): string {
  const inPage = inPageLinks.map((l) => renderLink(`#${l.anchor}`, l.label)).join("");

  return [
    `<nav class="${primitives.bar.className}">`,
    `<p class="${primitives.meta.className}">${inPage}</p>`,
    `<p class="${primitives.meta.className}">${renderOutbound(hrefById, origin, currentPath)}</p>`,
    `</nav>`,
  ].join("");
}

// The wordmark, tagline and slogan, followed by the nav bar — the whole of
// what a route puts above its first `<hr>`. `sinceYear` is passed in as a
// value rather than an `Inventory`, so this module depends on Content only
// for its two site-identity constants (`primarySlogan`, `sourceUrl`) and the
// branded types, never on the derivation itself.
export function renderHeader(
  inPageLinks: readonly InPageLink[],
  hrefById: ReadonlyMap<ProjectId, AbsoluteUrl>,
  origin: string,
  sinceYear: Year,
  currentPath: string,
): string {
  return [
    `<header class="${primitives.stack.className}">`,
    `<h1>SubZeroDev</h1>`,
    `<p class="${primitives.meta.className}">Professional uncertainty since ${sinceYear}.</p>`,
    `<p>${primarySlogan}</p>`,
    `</header>`,
    renderNav(inPageLinks, hrefById, origin, currentPath),
  ].join("");
}
