import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { finalizeArtifact, missEmittedEntry, missRootEntry, serverConfigFilename } from "../../src/artifact";
import { readBuildMarker } from "../../src/verification";
import type { CommitId } from "../../src/content";

const COMMIT = "c".repeat(40) as CommitId;

let root: string;
let outputDir: string;
let serverConfigDir: string;

function writeTree(entries: Record<string, string>): void {
  for (const [entry, html] of Object.entries(entries)) {
    const filePath = join(outputDir, ...entry.split("/"));
    mkdirSync(join(filePath, ".."), { recursive: true });
    writeFileSync(filePath, html, "utf8");
  }
}

function listHtmlFilesRecursively(dir: string): string[] {
  const found: string[] = [];
  const walk = (d: string): void => {
    for (const name of readdirSync(d)) {
      const full = join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith(".html")) found.push(full);
    }
  };
  try {
    walk(dir);
  } catch {
    // absent tree — nothing to list
  }
  return found;
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "szd-s7-"));
  outputDir = join(root, "dist");
  serverConfigDir = join(root, "server");
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

const APEX_HTML = "<html><head><title>apex</title></head><body>apex body</body></html>";
const MISS_HTML = "<html><head><title>miss</title></head><body>miss body</body></html>";

describe("S7.3 — finalizeArtifact validates input.commit before anything else", () => {
  it("a non-forty-hex commit returns CommitIdMalformed with entry: null, and modifies no file", async () => {
    writeTree({ "index.html": APEX_HTML, "404/index.html": MISS_HTML });
    const before = readFileSync(join(outputDir, "index.html"), "utf8");

    const result = await finalizeArtifact({ outputDir, serverConfigDir, commit: "not-a-commit" });
    expect(result).toEqual({
      ok: false,
      errors: [
        {
          code: "CommitIdMalformed",
          entry: null,
          detail: '"not-a-commit" is not a forty-character lowercase hex commit id.',
        },
      ],
    });
    expect(readFileSync(join(outputDir, "index.html"), "utf8")).toBe(before);
    expect(listHtmlFilesRecursively(outputDir)).toHaveLength(2);
  });
});

describe("S7.4 — a missing output tree, or a tree missing the miss document", () => {
  it("a tree with no .html document returns OutputTreeMissing with entry: null", async () => {
    mkdirSync(outputDir, { recursive: true });
    const result = await finalizeArtifact({ outputDir, serverConfigDir, commit: COMMIT });
    expect(result).toEqual({
      ok: false,
      errors: [
        {
          code: "OutputTreeMissing",
          entry: null,
          detail: `"${outputDir}" does not exist, or contains no .html document.`,
        },
      ],
    });
  });

  it("an absent output directory also returns OutputTreeMissing", async () => {
    const result = await finalizeArtifact({ outputDir, serverConfigDir, commit: COMMIT });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].code).toBe("OutputTreeMissing");
  });

  it("a tree with documents but no 404/index.html returns MissDocumentMissing naming missEmittedEntry", async () => {
    writeTree({ "index.html": APEX_HTML });
    const result = await finalizeArtifact({ outputDir, serverConfigDir, commit: COMMIT });
    expect(result).toEqual({
      ok: false,
      errors: [
        {
          code: "MissDocumentMissing",
          entry: missEmittedEntry,
          detail: `"${missEmittedEntry}" is absent from the output tree.`,
        },
      ],
    });
  });
});

describe("S7.5/S7.6/S7.14 — a successful run over a well-formed tree", () => {
  it("marks every document, copies the root miss document byte-identically, and each document differs from its pre-Artifact form by exactly the marker", async () => {
    writeTree({ "index.html": APEX_HTML, "404/index.html": MISS_HTML });

    const result = await finalizeArtifact({ outputDir, serverConfigDir, commit: COMMIT });
    if (!result.ok) throw new Error(`expected ok, got ${JSON.stringify(result.errors)}`);

    expect(result.value.commit).toBe(COMMIT);
    expect(result.value.rootMissEntry).toBe(missRootEntry);
    expect([...result.value.markedEntries].sort()).toEqual(
      ["index.html", "404/index.html", "404.html"].sort(),
    );

    const apexAfter = readFileSync(join(outputDir, "index.html"), "utf8");
    const missAfter = readFileSync(join(outputDir, "404/index.html"), "utf8");
    const rootAfter = readFileSync(join(outputDir, "404.html"), "utf8");

    // S7.5 — byte-identical.
    expect(rootAfter).toBe(missAfter);

    // S7.6 — readBuildMarker returns the input commit for each marked entry.
    for (const html of [apexAfter, missAfter, rootAfter]) {
      expect(readBuildMarker(html)).toEqual({ ok: true, value: COMMIT });
    }

    // S7.14 — removing the marker from each finished document reproduces its
    // pre-Artifact form byte for byte.
    const marker = readBuildMarker(apexAfter);
    if (!marker.ok) throw new Error("expected a marker");
    const markerText = apexAfter.slice(
      apexAfter.indexOf("<!-- build-commit:"),
      apexAfter.indexOf("-->") + 3,
    );
    expect(apexAfter.replace(markerText, "")).toBe(APEX_HTML);
    expect(missAfter.replace(markerText, "")).toBe(MISS_HTML);
    expect(rootAfter.replace(markerText, "")).toBe(MISS_HTML);
  });
});

describe("finalizeArtifact wraps injectBuildMarker's error with the failing document's tree-relative entry", () => {
  it("a document with no </head> fails with MarkerInsertionPointMissing naming that document", async () => {
    writeTree({ "index.html": "<html><body>no head close</body></html>", "404/index.html": MISS_HTML });
    const result = await finalizeArtifact({ outputDir, serverConfigDir, commit: COMMIT });
    expect(result).toEqual({
      ok: false,
      errors: [
        {
          code: "MarkerInsertionPointMissing",
          entry: "index.html",
          detail: "the document contains no </head>.",
        },
      ],
    });
  });
});

describe("S7.8 — the server configuration is written outside outputDir", () => {
  it("serverConfigPath is outside outputDir, and no file named serverConfigFilename exists inside the finished tree", async () => {
    writeTree({ "index.html": APEX_HTML, "404/index.html": MISS_HTML });
    const result = await finalizeArtifact({ outputDir, serverConfigDir, commit: COMMIT });
    if (!result.ok) throw new Error(`expected ok, got ${JSON.stringify(result.errors)}`);

    expect(result.value.serverConfigPath.startsWith(outputDir)).toBe(false);
    expect(readFileSync(result.value.serverConfigPath, "utf8").length).toBeGreaterThan(0);

    const insideTree = (function walk(dir: string): string[] {
      const found: string[] = [];
      for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) found.push(...walk(full));
        else found.push(name);
      }
      return found;
    })(outputDir);
    expect(insideTree).not.toContain(serverConfigFilename);
  });
});
