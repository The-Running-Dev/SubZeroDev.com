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
  width: min(100%, 1120px);
  min-height: 100vh;
  margin: 0 auto;
  padding: clamp(2rem, 5vw, 4rem) clamp(1.25rem, 5vw, 4rem)
    clamp(3rem, 6vw, 5rem);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  font-family: var(--font-sans);
  font-size: var(--step-0);
  line-height: 1.7;
}

.page > .stack {
  gap: clamp(1.5rem, 3vw, 2.5rem);
}

.page header {
  max-width: 880px;
  justify-content: center;
  gap: clamp(0.6rem, 1.5vw, 1.1rem);
}

.page h1,
.page h2,
.page h3,
.page h4,
.page p {
  margin: 0;
}

.page h1 {
  max-width: 16ch;
  font-size: clamp(1.9rem, 3.6vw, 2.75rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
  font-weight: 800;
}

.page h2 {
  max-width: 20ch;
  font-size: clamp(1.3rem, 1.7vw, 1.75rem);
  line-height: 1.15;
  letter-spacing: -0.02em;
  font-weight: 700;
}

.page h3 {
  font-size: clamp(1.15rem, 2vw, 1.5rem);
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.page h4 {
  font-size: clamp(1.05rem, 1.6vw, 1.1rem);
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.page header > p:not(.meta) {
  max-width: 40ch;
  font-size: clamp(1.05rem, 1.6vw, 1.2rem);
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.page section {
  max-width: 920px;
}

.page section > p,
.page article > p {
  max-width: 68ch;
}

.page footer {
  max-width: 760px;
  padding-bottom: var(--space-1);
}

.page footer p {
  font-size: clamp(0.95rem, 1.3vw, 1.1rem);
  line-height: 1.4;
}

@media (max-width: 720px) {
  .page {
    padding-top: 2rem;
  }

  .page > .stack {
    gap: 1.5rem;
  }
}`,
  },
  stack: {
    className: className("stack"),
    rules: `.stack {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 1.5vw, var(--space-1));
}

.stack > .stack {
  margin-top: clamp(0.6rem, 1.2vw, 1.1rem);
}`,
  },
  entry: {
    className: className("entry"),
    rules: `.entry {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0 0 clamp(1rem, 2vw, 1.5rem);
}

.entry + .entry {
  padding-top: clamp(1rem, 2vw, 1.5rem);
  border-top: 1px solid var(--rule);
}

.entry .stack {
  margin-top: clamp(0.6rem, 1.2vw, 1rem);
  padding-left: clamp(0.75rem, 2vw, 1.5rem);
  border-left: 1px solid var(--rule);
}`,
  },
  meta: {
    className: className("meta"),
    rules: `.meta {
  font-family: var(--font-mono);
  font-size: var(--step--1);
  color: var(--fg-muted);
  letter-spacing: 0.1em;
  line-height: 1.4;
  text-transform: uppercase;
}`,
  },
  rule: {
    className: className("rule"),
    rules: `.rule {
  width: 100%;
  border: none;
  border-top: 1px solid var(--rule);
  margin: 0;
}`,
  },
  link: {
    className: className("link"),
    // The `text-decoration` is what P2(b) requires: `--link` against `--fg`
    // is below 3:1, so a link must not rely on hue alone to read as a link.
    rules: `.link {
  color: var(--link);
  text-decoration: underline;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.2em;
  transition: color 120ms ease;
}

.link:hover,
.link:focus-visible {
  color: var(--fg);
}`,
  },
};
