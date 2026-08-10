// Composition — folds the apex and testimonials routes into one shared shell
// with no executable script (design/90-decisions.md, 2026-08-08 — "the testimonials
// fold").
//
// `composeApex` and `composeTestimonials` are untouched: this module takes
// their already-composed `ComposedRoute`s and re-wraps them, so every S5/S11
// test keeps asserting the real, unfolded output those functions produce.
// The fold itself is CSS-only — `:target`/`:has()` — because `X6`/`V13` cap
// this design at exactly one script element (the apex's JSON-LD block) and
// that cap is not this module's to lift. Switching between the two views is
// therefore same-document, same-request navigation: a `#testimonials` or
// `#apex` fragment link, never a second page load.
//
// Both routes emit the *same two views*; they differ only in which view is
// visible with no fragment present — `defaultView` below — so `/` reads
// correctly with JS and CSS both absent, and so does `/testimonials/`.

import { primitives, stylesheetFor } from "../presentation";
import type { BodyHtml } from "../presentation";
import type { Inventory, Testimonials } from "../content";
import { composeApex } from "./apex";
import { composeTestimonials } from "./testimonials";
import type { ComposedRoute } from "./types";

const PAGE_PREFIX = `<div class="${primitives.page.className}">`;
const STACK_PREFIX = `<div class="${primitives.stack.className}">`;
const STACK_AND_PAGE_CLOSE = "</div></div>";
const OLD_TESTIMONIALS_HREF = 'href="/testimonials/">Testimonials</a>';
const NEW_TESTIMONIALS_HREF = 'href="#testimonials">Testimonials</a>';
const OLD_BACK_HREF = 'href="/">Back to';
const NEW_BACK_HREF = 'href="#apex">Back to';

// Splits a `ComposedRoute` produced with the `<div class="page"><div
// class="stack">…</div></div>` shape every composer in this module uses —
// asserted, not assumed, so a shape drift in `composeApex`/`composeTestimonials`
// fails loudly here rather than silently folding the wrong markup.
function splitPageStack(bodyHtml: string): { inner: string; trailer: string } {
  const prefix = PAGE_PREFIX + STACK_PREFIX;
  if (!bodyHtml.startsWith(prefix)) {
    throw new Error("fold: expected bodyHtml to open with page > stack, shape has drifted.");
  }
  const rest = bodyHtml.slice(prefix.length);
  const scriptIndex = rest.indexOf("<script");
  const beforeScript = scriptIndex === -1 ? rest : rest.slice(0, scriptIndex);
  const trailer = scriptIndex === -1 ? "" : rest.slice(scriptIndex);
  if (!beforeScript.endsWith(STACK_AND_PAGE_CLOSE)) {
    throw new Error("fold: expected bodyHtml to close stack then page, shape has drifted.");
  }
  return { inner: beforeScript.slice(0, -STACK_AND_PAGE_CLOSE.length), trailer };
}

function extractNav(apexInner: string): string {
  const match = /<nav class="[^"]*">[\s\S]*?<\/nav>/.exec(apexInner);
  if (match === null) {
    throw new Error("fold: expected composeApex's body to carry a <nav>, none found.");
  }
  return match[0];
}

export type FoldedRoutes = {
  readonly apex: ComposedRoute;
  readonly testimonials: ComposedRoute;
};

// Folds `composeApex(inventory, origin)` and `composeTestimonials(testimonials)`
// into two documents that carry both views — the apex's own nav, reused
// verbatim, is what gives the testimonials view "the same heading menu"; the
// fragment-only hrefs are what make switching between them replace the root
// content in place rather than navigate.
export function foldRoutes(
  inventory: Inventory,
  testimonialsData: Testimonials,
  origin: string,
): FoldedRoutes {
  const apexRoute = composeApex(inventory, origin);
  const testimonialsRoute = composeTestimonials(testimonialsData);

  const { inner: apexInner, trailer: script } = splitPageStack(apexRoute.bodyHtml);
  const { inner: testimonialsInner } = splitPageStack(testimonialsRoute.bodyHtml);

  const nav = extractNav(apexInner);
  const foldedNav = nav.replace(OLD_TESTIMONIALS_HREF, NEW_TESTIMONIALS_HREF);
  if (foldedNav === nav) {
    throw new Error("fold: expected the apex nav to link to the testimonials route, it did not.");
  }

  const apexView = `<div class="${primitives.stack.className}" id="apex" data-view="apex">${apexInner.replace(nav, foldedNav)}</div>`;

  const testimonialsWithNav = testimonialsInner.replace("</header>", `</header>${foldedNav}`);
  if (testimonialsWithNav === testimonialsInner) {
    throw new Error("fold: expected the testimonials body to carry a </header>, none found.");
  }
  const testimonialsWithBackLink = testimonialsWithNav.replace(OLD_BACK_HREF, NEW_BACK_HREF);
  if (testimonialsWithBackLink === testimonialsWithNav) {
    throw new Error("fold: expected the testimonials body to carry a back-link, none found.");
  }
  const testimonialsView = `<div class="${primitives.stack.className}" id="testimonials" data-view="testimonials">${testimonialsWithBackLink}</div>`;

  function shellFor(defaultView: "apex" | "testimonials"): ComposedRoute {
    const defaultClass = defaultView === "apex" ? "default-apex" : "default-testimonials";
    const apexHidden = defaultView === "testimonials" ? " hidden" : "";
    const testimonialsHidden = defaultView === "apex" ? " hidden" : "";
    const bodyHtml = [
      `<div class="${primitives.page.className} ${defaultClass}">`,
      apexView.replace("data-view=\"apex\">", `data-view="apex"${apexHidden}>`),
      testimonialsView.replace(
        "data-view=\"testimonials\">",
        `data-view="testimonials"${testimonialsHidden}>`,
      ),
      `</div>`,
      script,
    ].join("") as BodyHtml;

    return { bodyHtml, stylesheet: stylesheetFor(bodyHtml) };
  }

  return { apex: shellFor("apex"), testimonials: shellFor("testimonials") };
}
