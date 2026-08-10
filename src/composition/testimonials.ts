// Composition — the testimonials section, rendered inline on the apex page
// rather than as its own route (design/90-decisions.md — "testimonials folds
// into the apex").
//
// Deterministic and content-agnostic: renders every entry in input order
// (X8) and knows nothing about who is being quoted — it takes the data as a
// parameter exactly as `composeApex` takes `Inventory` (C16), and carries no
// testimonial content of its own — the heading below is this site's words,
// not any quoted person's.

import { escapeHtml } from "./escape-html";
import { primitives } from "../presentation";
import { testimonialTotal } from "../content";
import type { Testimonial, Testimonials } from "../content";

const heading = "You Can Absolutely 1,000% Believe Something Written on a Page of Internet.";

function renderAttribution(testimonial: Testimonial): string {
  const lines = [
    `<p class="${primitives.meta.className}">${escapeHtml(testimonial.author)}</p>`,
    ...(testimonial.role !== undefined
      ? [`<p class="${primitives.meta.className}">${escapeHtml(testimonial.role)}</p>`]
      : []),
    ...(testimonial.organization !== undefined
      ? [`<p class="${primitives.meta.className}">${escapeHtml(testimonial.organization)}</p>`]
      : []),
    ...(testimonial.url !== undefined
      ? [
          `<p class="${primitives.meta.className}"><a class="${primitives.link.className}" href="${escapeHtml(testimonial.url)}">Source</a></p>`,
        ]
      : []),
  ];
  return `<figcaption>${lines.join("")}</figcaption>`;
}

function renderCard(testimonial: Testimonial): string {
  return [
    `<figure class="${primitives.card.className}">`,
    `<blockquote><p>${escapeHtml(testimonial.quote)}</p></blockquote>`,
    renderAttribution(testimonial),
    `</figure>`,
  ].join("");
}

// Renders the section's contents only — the `<div class="stack" id="...">`
// wrapper is `apex.ts`'s `openSection`, on the same footing every other
// section on the page uses, so the nav's fragment link and this section's id
// stay one fact rather than two.
export function renderTestimonials(testimonials: Testimonials): string {
  return [
    `<p class="${primitives.meta.className}">${testimonialTotal(testimonials)} testimonials.</p>`,
    `<div class="${primitives.grid.className}">`,
    testimonials.map(renderCard).join(""),
    `</div>`,
  ].join("");
}

export const testimonialsHeading = heading;
