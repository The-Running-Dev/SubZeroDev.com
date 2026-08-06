// Composition — the miss route (contract's `composeMiss`).
//
// Deterministic and total: no argument, no I/O, and no Content derivation —
// `X1` makes any figure on the page a Content derivation, and the miss
// document carries none. The copy is owner-authored (S4's `Depends on`);
// every class referenced below is read from `primitives` rather than typed
// as a literal, so `stylesheetFor`'s output can never drift from what this
// body actually uses.

import { primitives, stylesheetFor } from "../presentation";
import type { BodyHtml } from "../presentation";
import type { ComposedRoute } from "./types";

const bodyHtml = [
  `<div class="${primitives.page.className}">`,
  `<div class="${primitives.stack.className}">`,
  `<p class="${primitives.meta.className}">404</p>`,
  `<h1>This page does not exist.</h1>`,
  `<p>It was never built. Every other page on this site was, eventually — this one just didn't happen.</p>`,
  `<p>Nothing is missing. There was nothing here to begin with.</p>`,
  `<p><a class="${primitives.link.className}" href="/">Back to the part that exists.</a></p>`,
  `</div>`,
  `</div>`,
].join("") as BodyHtml;

export function composeMiss(): ComposedRoute {
  return {
    bodyHtml,
    stylesheet: stylesheetFor(bodyHtml),
  };
}
