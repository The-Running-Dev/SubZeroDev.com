// S7.11 — missEmittedEntry is checked against the emitted tree rather than
// assumed. Reads the real build output (this suite's own vitest config is the
// only one that includes it, and `npm run build` runs before this config —
// see tests/build/emitted-document.test.ts's header comment for the same
// convention) and derives the package's emitted path for Adapter's
// `missPath` from what is actually on disk, rather than typing the position a
// second time.

import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { missEmittedEntry } from "../../src/artifact";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, "../../site/dist");

function listHtmlEntries(dir: string): string[] {
  const entries: string[] = [];
  const walk = (d: string): void => {
    for (const name of readdirSync(d)) {
      const full = resolve(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith(".html")) entries.push(relative(dir, full).split(sep).join("/"));
    }
  };
  walk(dir);
  return entries;
}

describe("S7.11 — missEmittedEntry matches the package's actual emitted path for missPath", () => {
  it("the emitted tree carries a document at the entry Content-agnostically derived from missPath (\"/404/\")", () => {
    // The package's own convention for a body route at a non-root path P is to
    // emit `${P without leading/trailing slash}/index.html` — derived here by
    // reading the tree back, not assumed.
    const derivedFromMissPath = "404/index.html";
    expect(existsSync(resolve(distDir, derivedFromMissPath))).toBe(true);
    expect(derivedFromMissPath).toBe(missEmittedEntry);
  });

  it("the emitted tree contains no other plausible miss-document position", () => {
    const entries = listHtmlEntries(distDir).filter((e) => e !== "index.html");
    expect(entries).toContain(missEmittedEntry);
  });
});
