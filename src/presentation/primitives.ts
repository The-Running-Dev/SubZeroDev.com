// Presentation — the six layout primitives (contract's `primitives`).
//
// Every selector in a primitive's `rules` is rooted at that primitive's own
// `className` (P6/S4.4): a selector that could match without the class
// belongs in the token block, not here, because `stylesheetFor` emits a
// primitive's rules only when its class is present in the body.
//
// `meta` is the one primitive whose rules reference `--font-mono` (P7) — the
// monospace scale is reserved for the labels the token table names: year,
// stage, ProjectId and escapedFrom edges, never prose.

import type { ClassName, PrimitiveSet } from "./types";

const className = (value: string): ClassName => value as ClassName;

export const primitives: PrimitiveSet = {
  page: {
    className: className("page"),
    rules: `.page {
  min-height: 100vh;
  max-width: var(--measure);
  margin: 0 auto;
  padding: var(--space-3) var(--space-2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: var(--font-sans);
  font-size: var(--step-0);
  line-height: 1.6;
}`,
  },
  stack: {
    className: className("stack"),
    rules: `.stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}`,
  },
  entry: {
    className: className("entry"),
    rules: `.entry {
  display: flex;
  flex-direction: column;
  gap: var(--space-0);
}`,
  },
  meta: {
    className: className("meta"),
    rules: `.meta {
  font-family: var(--font-mono);
  font-size: var(--step--1);
  color: var(--fg-muted);
  letter-spacing: 0.02em;
}`,
  },
  rule: {
    className: className("rule"),
    rules: `.rule {
  border: none;
  border-top: 1px solid var(--rule);
  margin: 0;
}`,
  },
  link: {
    className: className("link"),
    // The `text-decoration` is what P2(b) requires: `--link` against `--fg`
    // is 2.60:1, so a link must not rely on hue alone to read as a link.
    rules: `.link {
  color: var(--link);
  text-decoration: underline;
}

.link:hover,
.link:focus-visible {
  color: var(--fg);
}`,
  },
};
