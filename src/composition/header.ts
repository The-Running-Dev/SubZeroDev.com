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
  readonly current?: boolean;
};

// Blog and Portfolio are the inventory's own homes, found by id rather than
// restated — those URLs have one home, in the projects JSON document. Renaming either
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
//
// The self entry is built directly rather than through `target()`, which
// exists to drop an *optional* inventory lookup — this entry is always
// present, so there is nothing for it to drop.
function outboundTargets(
  hrefById: ReadonlyMap<ProjectId, AbsoluteUrl>,
  origin: string,
): readonly NavTarget[] {
  return [
    { label: "SubZeroDev.com", url: `${origin}/` as AbsoluteUrl, current: true },
    target("Blog", homeOf(hrefById, "publishing")),
    target("Projects", sourceUrl),
    target("Portfolio", homeOf(hrefById, "portfolio")),
  ].filter((t): t is NavTarget => t !== null);
}

function renderLink(href: string, text: string, current?: boolean): string {
  const classAttr = current
    ? `${primitives.link.className} ${primitives["link-current"].className}`
    : primitives.link.className;
  const currentAttr = current ? ` aria-current="page"` : "";
  return `<a class="${classAttr}" href="${href}"${currentAttr}>${text}</a>`;
}

// Exported on its own — `apex.ts`'s footer repeats the outbound group
// without the in-page links, so the two call sites share this rather than
// each restating the outbound derivation.
export function renderOutbound(hrefById: ReadonlyMap<ProjectId, AbsoluteUrl>, origin: string): string {
  return outboundTargets(hrefById, origin)
    .map((t) => renderLink(escapeHtml(t.url), t.label, t.current))
    .join("");
}

function renderNav(
  inPageLinks: readonly InPageLink[],
  hrefById: ReadonlyMap<ProjectId, AbsoluteUrl>,
  origin: string,
): string {
  const inPage = inPageLinks.map((l) => renderLink(`#${l.anchor}`, l.label)).join("");

  return [
    `<nav class="${primitives.bar.className}">`,
    `<p class="${primitives.meta.className}">${inPage}</p>`,
    `<p class="${primitives.meta.className}">${renderOutbound(hrefById, origin)}</p>`,
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
): string {
  return [
    `<header class="${primitives.stack.className}">`,
    `<h1>SubZeroDev</h1>`,
    `<p class="${primitives.meta.className}">Professional uncertainty since ${sinceYear}.</p>`,
    `<p>${primarySlogan}</p>`,
    `</header>`,
    renderNav(inPageLinks, hrefById, origin),
  ].join("");
}
