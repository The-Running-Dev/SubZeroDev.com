// Composition — the testimonials route (contract's `composeTestimonials`).
//
// Deterministic and total on `Testimonials`: renders every entry in input
// order (X8) and knows nothing about who is being quoted — it takes the data
// as a parameter exactly as `composeApex` takes `Inventory` (C16), and
// carries no SubZeroDev-specific string. `testimonialTotal` is the one figure
// on the page, derived rather than typed (X1). No script element (X6): this
// route emits none.

import { escapeHtml } from "./escape-html";
import { primitives, stylesheetFor } from "../presentation";
import type { BodyHtml } from "../presentation";
import { testimonialTotal } from "../content";
import type { Testimonial, Testimonials } from "../content";
import type { ComposedRoute } from "./types";

const heading = "You Can Absolutely 1,000% Believe Something Written on a Page of Internet.";

function renderAttribution(testimonial: Testimonial): string {
  const lines = [
    escapeHtml(testimonial.author),
    ...(testimonial.role !== undefined ? [escapeHtml(testimonial.role)] : []),
    ...(testimonial.organization !== undefined ? [escapeHtml(testimonial.organization)] : []),
  ];
  return `<figcaption>${lines.map((line) => `<p class="${primitives.meta.className}">${line}</p>`).join("")}</figcaption>`;
}

function renderCard(testimonial: Testimonial): string {
  return [
    `<figure class="${primitives.card.className}">`,
    `<blockquote><p>${escapeHtml(testimonial.quote)}</p></blockquote>`,
    renderAttribution(testimonial),
    `</figure>`,
  ].join("");
}

export function composeTestimonials(testimonials: Testimonials): ComposedRoute {
  const bodyHtml = [
    `<div class="${primitives.page.className}">`,
    `<div class="${primitives.stack.className}">`,
    `<header class="${primitives.stack.className}">`,
    `<h1>${heading}</h1>`,
    `</header>`,
    `<hr class="${primitives.rule.className}" />`,
    `<div class="${primitives.stack.className}">`,
    `<h2>Testimonials</h2>`,
    `<p class="${primitives.meta.className}">${testimonialTotal(testimonials)} testimonials.</p>`,
    `<div class="${primitives.grid.className}">`,
    testimonials.map(renderCard).join(""),
    `</div>`,
    `</div>`,
    `<hr class="${primitives.rule.className}" />`,
    `<footer class="${primitives.stack.className}">`,
    `<p><a class="${primitives.link.className}" href="/">Back to SubZeroDev</a></p>`,
    `</footer>`,
    `</div>`,
    `</div>`,
  ].join("") as BodyHtml;

  return {
    bodyHtml,
    stylesheet: stylesheetFor(bodyHtml),
  };
}
