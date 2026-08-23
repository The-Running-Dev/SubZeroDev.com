import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import * as fsp from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { finalizeArtifact, missEmittedEntry, missRootEntry, serverConfigFilename } from "../../src/artifact";
import { readBuildMarker } from "../../src/verification";
import type { CommitId } from "../../src/content";

// `node:fs/promises`'s named exports are non-configurable under Vitest's ESM
// module namespace, so `vi.spyOn` cannot wrap `rm` directly. This mock keeps
// every export's real implementation as the default (every other test in
// this file exercises the real filesystem) and lets the one test below
// override `rm` for a single call.
vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return { ...actual, rm: vi.fn(actual.rm) };
});

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
  it("marks every document, copies the root miss document byte-identically, removes the emitted miss entry, and each document differs from its pre-Artifact form by exactly the marker", async () => {
    writeTree({ "index.html": APEX_HTML, "404/index.html": MISS_HTML });

    const result = await finalizeArtifact({ outputDir, serverConfigDir, commit: COMMIT });
    if (!result.ok) throw new Error(`expected ok, got ${JSON.stringify(result.errors)}`);

    expect(result.value.commit).toBe(COMMIT);
    expect(result.value.rootMissEntry).toBe(missRootEntry);
    expect([...result.value.markedEntries].sort()).toEqual(["index.html", "404.html"].sort());

    // R2 — the emitted miss entry does not survive.
    expect(existsSync(join(outputDir, "404/index.html"))).toBe(false);

    const apexAfter = readFileSync(join(outputDir, "index.html"), "utf8");
    const rootAfter = readFileSync(join(outputDir, "404.html"), "utf8");

    // S7.6 — readBuildMarker returns the input commit for each marked entry.
    for (const html of [apexAfter, rootAfter]) {
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
    // S7.5 — the root copy was marked from the same pre-marker content as the
    // (now-removed) emitted entry, so it reproduces MISS_HTML byte for byte.
    expect(rootAfter.replace(markerText, "")).toBe(MISS_HTML);
  });
});

describe("R2 — finalizeArtifact removes missEmittedEntry after copying it", () => {
  it("removes the now-empty directory that held missEmittedEntry, not just the file", async () => {
    // issue #111 — R2's restated property ("/404/ resolves on no host") holds
    // only if the emptied directory itself is gone, not just the file it held.
    writeTree({ "index.html": APEX_HTML, "404/index.html": MISS_HTML });

    const result = await finalizeArtifact({ outputDir, serverConfigDir, commit: COMMIT });
    if (!result.ok) throw new Error(`expected ok, got ${JSON.stringify(result.errors)}`);

    expect(existsSync(join(outputDir, "404"))).toBe(false);
  });

  it("does not remove a sibling directory that shares outputDir with the miss entry's directory", async () => {
    writeTree({
      "index.html": APEX_HTML,
      "404/index.html": MISS_HTML,
      "projects/index.html": APEX_HTML,
    });

    const result = await finalizeArtifact({ outputDir, serverConfigDir, commit: COMMIT });
    if (!result.ok) throw new Error(`expected ok, got ${JSON.stringify(result.errors)}`);

    expect(existsSync(join(outputDir, "404"))).toBe(false);
    expect(existsSync(join(outputDir, "projects", "index.html"))).toBe(true);
  });

  it("a removal failure returns RemoveFailed naming missEmittedEntry", async () => {
    writeTree({ "index.html": APEX_HTML, "404/index.html": MISS_HTML });
    vi.mocked(fsp.rm).mockRejectedValueOnce(new Error("simulated removal failure"));

    const result = await finalizeArtifact({ outputDir, serverConfigDir, commit: COMMIT });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].code).toBe("RemoveFailed");
    expect(result.errors[0].entry).toBe(missEmittedEntry);
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

  it("injection runs, and fails, before removal — missEmittedEntry still exists on disk after the failure", async () => {
    // Injecting before removing (contract's stated order) is what keeps a
    // marker-insertion failure reported as itself: removing first and
    // failing injection afterward would leave the tree without
    // missEmittedEntry on top of the original failure, so a rerun would fail
    // early with MissDocumentMissing instead of surfacing what actually went
    // wrong.
    writeTree({
      "index.html": APEX_HTML,
      "404/index.html": "<html><body>no head close</body></html>",
    });
    const result = await finalizeArtifact({ outputDir, serverConfigDir, commit: COMMIT });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].code).toBe("MarkerInsertionPointMissing");
    expect(existsSync(join(outputDir, "404/index.html"))).toBe(true);
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
