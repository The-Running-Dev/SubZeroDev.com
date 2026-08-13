// Presentation — the per-route stylesheet (contract's `stylesheetFor`).
//
// The token block is fixed text, built from `palette` rather than a second
// copy of its values. The twelve primitives are appended only when their class
// is present in `body` — the referenced set is observed, not declared — in
// `PrimitiveName` declaration order (P6). That is what leaves
// `assertStyleAgreement`'s `ClassWithoutRule` half checkable against markup
// Composition wrote by hand, and makes `SelectorWithoutUser` structurally
// true over the primitives.

import { palette } from "./palette";
import { primitives } from "./primitives";
import type { BodyHtml, StylesheetText } from "./types";

function tokenBlock(): string {
  return `:root {
  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "Cascadia Code", Consolas, monospace;
  --step--1: 0.8rem;
  --step-0: 1rem;
  --step-1: 1.25rem;
  --step-2: 1.563rem;
  --step-3: 1.953rem;
  --space-0: 0.75rem;
  --space-1: 1.17rem;
  --space-2: 1.83rem;
  --space-3: 2.86rem;
  --space-4: 4.47rem;
  --measure: 34rem;
  --bg: ${palette.bg};
  --fg: ${palette.fg};
  --fg-muted: ${palette["fg-muted"]};
  --rule: ${palette.rule};
  --link: ${palette.link};
}

:root {
  background-color: var(--bg);
  color: var(--fg);
}`;
}

const CLASS_ATTR_PATTERN = /(?:^|\s)class="([^"]*)"/g;

function referencedClasses(body: string): Set<string> {
  const found = new Set<string>();
  for (const match of body.matchAll(CLASS_ATTR_PATTERN)) {
    for (const token of match[1]!.split(/\s+/)) {
      if (token !== "") found.add(token);
    }
  }
  return found;
}

export function stylesheetFor(body: BodyHtml): StylesheetText {
  const referenced = referencedClasses(body);
  const parts = [tokenBlock()];
  for (const primitive of Object.values(primitives)) {
    if (referenced.has(primitive.className)) parts.push(primitive.rules);
  }
  return parts.join("\n\n") as StylesheetText;
}
