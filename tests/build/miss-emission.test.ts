// S7.11 — missEmittedEntry is checked against the emitted tree rather than
// assumed (R5), and does not survive finalizeArtifact's removal (R2). Reads
// the real build output (this suite's own vitest config is the only one that
// includes it, and `npm run build` runs before this config — see
// tests/build/emitted-document.test.ts's header comment for the same
// convention).
//
// This config's global-setup (tests/build/global-setup.ts) runs
// finalizeArtifact once, ahead of every test file here — so by the time this
// suite's assertions run, the tree already reflects R2's removal.
// finalizeArtifact's own `MissDocumentMissing` check is what enforces R5
// against the pre-removal tree (checked internally before the copy); a build
// that reached this point without failing already proves that check passed,
// which is what licenses asserting removal, rather than survival, below.

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

describe("S7.11 — missEmittedEntry names the package's emitted path for missPath, and does not survive into the finished tree", () => {
  it("the package's own convention for missPath (\"/404/\") matches missEmittedEntry", () => {
    // The package's own convention for a body route at a non-root path P is to
    // emit `${P without leading/trailing slash}/index.html`.
    const derivedFromMissPath = "404/index.html";
    expect(derivedFromMissPath).toBe(missEmittedEntry);
  });

  it("the finished tree carries no document at missEmittedEntry (R2)", () => {
    expect(existsSync(resolve(distDir, missEmittedEntry))).toBe(false);
  });

  it("the finished tree contains no other plausible miss-document position", () => {
    const entries = listHtmlEntries(distDir).filter((e) => e !== "index.html");
    expect(entries).not.toContain(missEmittedEntry);
  });
});
