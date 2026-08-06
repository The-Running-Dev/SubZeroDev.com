// A small brace-aware CSS selector extractor, used to check that every
// selector in a primitive's `rules` is rooted at that primitive's own class
// (P6/S4.4). Regex alone cannot walk nested `@media` blocks correctly, so
// this scans balanced braces instead. It assumes CSS text with no string
// literal containing a brace, which holds for everything this repository
// writes.

export function extractSelectors(css: string): string[] {
  const selectors: string[] = [];
  let i = 0;
  while (i < css.length) {
    const braceIdx = css.indexOf("{", i);
    if (braceIdx === -1) break;
    const prelude = css.slice(i, braceIdx).trim();

    let depth = 1;
    let j = braceIdx + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") depth--;
      j++;
    }
    const body = css.slice(braceIdx + 1, j - 1);

    if (prelude.startsWith("@")) {
      selectors.push(...extractSelectors(body));
    } else {
      for (const sel of prelude.split(",")) {
        const trimmed = sel.trim();
        if (trimmed !== "") selectors.push(trimmed);
      }
    }
    i = j;
  }
  return selectors;
}
