// Presentation — the eight layout primitives (contract's `primitives`).
//
// Every selector in a primitive's `rules` is rooted at that primitive's own
// `className` (P6/S4.4): a selector that could match without the class
// belongs in the token block, not here, because `stylesheetFor` emits a
// primitive's rules only when its class is present in the body.
//
// `meta` is the one primitive whose rules reference `--font-mono` (P7) — the
// monospace scale is reserved for the labels the token table names: year,
// stage, ProjectId and escapedFrom edges, never prose.
//
// `row` and `bar` are the two horizontal primitives and are not variants of
// one another: `row` divides a width into equal columns, `bar` leaves its
// children at content width and puts the free space between them. `row` is
// the only primitive whose rules reach a child it does not name.

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
  gap: clamp(1.1rem, 2.2vw, 1.9rem);
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
    gap: 1.1rem;
  }
}`,
  },
  stack: {
    className: className("stack"),
    rules: `.stack {
  display: flex;
  flex-direction: column;
  gap: clamp(0.55rem, 1.1vw, var(--space-0));
}

.stack > .stack {
  margin-top: clamp(0.5rem, 1vw, 0.9rem);
}`,
  },
  entry: {
    className: className("entry"),
    rules: `.entry {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0 0 clamp(0.75rem, 1.5vw, 1.1rem);
}

.entry + .entry {
  padding-top: clamp(0.75rem, 1.5vw, 1.1rem);
  border-top: 1px solid var(--rule);
}

.entry .stack {
  margin-top: clamp(0.5rem, 1vw, 0.8rem);
  padding-left: clamp(0.6rem, 1.6vw, 1.1rem);
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
  row: {
    className: className("row"),
    rules: `.row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: clamp(1.1rem, 2.4vw, var(--space-2));
}

.row > * {
  flex: 1 1 0;
  min-width: 0;
}

@media (max-width: 720px) {
  .row {
    flex-direction: column;
  }
}`,
  },
  bar: {
    className: className("bar"),
    // Children keep their content width — that is the flex default, and it is
    // the whole of what separates this from `row`. The gap is a floor while
    // unwrapped, since `space-between` supplies the actual separation.
    rules: `.bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
  gap: clamp(0.5rem, 1.5vw, var(--space-0));
}

@media (max-width: 720px) {
  .bar {
    flex-direction: column;
    align-items: flex-start;
  }
}`,
  },
  grid: {
    className: className("grid"),
    // `columns` rather than CSS Grid: a card's height is its own content, and
    // a grid track would force every row to its tallest cell. `break-inside`
    // is what keeps a card from splitting across the column break — the same
    // "reaches a child it does not name" shape `row` already has.
    rules: `.grid {
  columns: 3 300px;
  column-gap: clamp(1.1rem, 2.4vw, var(--space-2));
}

.grid > * {
  break-inside: avoid;
  margin-bottom: clamp(1.1rem, 2.4vw, var(--space-2));
}

@media (max-width: 720px) {
  .grid {
    columns: 1;
  }
}`,
  },
  card: {
    className: className("card"),
    rules: `.card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border: 1px solid var(--rule);
  border-radius: 0.4rem;
  padding: clamp(1rem, 2vw, 1.5rem);
}

.card blockquote {
  margin: 0;
}

.card figcaption {
  margin: 0;
}`,
  },
};
