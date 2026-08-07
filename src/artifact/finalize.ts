// Artifact — `finalizeArtifact` (contract's Artifact § Public signatures).
//
// Order of operations is part of the contract, not an implementation detail:
// validate `input.commit`, copy `missEmittedEntry` to `missRootEntry`, remove
// `missEmittedEntry`, inject the marker into every `.html` document in the
// tree — the copy included — then write `serverConfig()` last, outside
// `outputDir`. Copying before injecting is what makes R2 hold: both documents
// are marked in the same pass from identical pre-marker content and stay
// byte-identical. Removing between the copy and the injection pass is what
// makes R2's other half hold: the miss composition has exactly one surviving
// path, and `allEntries` below is built from `emittedEntries` filtered of the
// removed entry rather than the raw listing, so nothing tries to mark a file
// that is no longer there.

import { mkdir, readFile, readdir, rm, rmdir, writeFile } from "node:fs/promises";
import { lstatSync, readdirSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

import { parseCommitId } from "../content";
import type { Result } from "../content";
import type { ArtifactError } from "./errors";
import type { ArtifactInput, ArtifactReport } from "./types";
import { missEmittedEntry, missRootEntry } from "./constants";
import { injectBuildMarker } from "./marker";
import { serverConfig, serverConfigFilename } from "./server-config";

// Every `.html` file under `outputDir`, as tree-relative positions expressed
// with `/` separators (contract's `ArtifactReport` note) — never a filesystem
// path, and never dependent on the host platform's separator.
function listHtmlEntries(outputDir: string): string[] {
  const entries: string[] = [];
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const stat = lstatSync(full);
      if (stat.isSymbolicLink()) {
        continue;
      } else if (stat.isDirectory()) {
        walk(full);
      } else if (name.endsWith(".html")) {
        entries.push(relative(outputDir, full).split(sep).join("/"));
      }
    }
  };
  try {
    walk(outputDir);
  } catch {
    return [];
  }
  return entries;
}

function toPath(outputDir: string, entry: string): string {
  return join(outputDir, ...entry.split("/"));
}

function fail(code: ArtifactError["code"], entry: string | null, detail: string): {
  ok: false;
  errors: [ArtifactError];
} {
  return { ok: false, errors: [{ code, entry, detail }] };
}

export async function finalizeArtifact(
  input: ArtifactInput,
): Promise<Result<ArtifactReport, ArtifactError>> {
  const commit = parseCommitId(input.commit);
  if (commit === null) {
    return fail(
      "CommitIdMalformed",
      null,
      `"${input.commit}" is not a forty-character lowercase hex commit id.`,
    );
  }

  const emittedEntries = listHtmlEntries(input.outputDir);
  if (emittedEntries.length === 0) {
    return fail(
      "OutputTreeMissing",
      null,
      `"${input.outputDir}" does not exist, or contains no .html document.`,
    );
  }

  if (!emittedEntries.includes(missEmittedEntry)) {
    return fail(
      "MissDocumentMissing",
      missEmittedEntry,
      `"${missEmittedEntry}" is absent from the output tree.`,
    );
  }

  let missHtml: string;
  try {
    missHtml = await readFile(toPath(input.outputDir, missEmittedEntry), "utf8");
    await writeFile(toPath(input.outputDir, missRootEntry), missHtml, "utf8");
  } catch (cause) {
    return fail(
      "WriteFailed",
      missRootEntry,
      `failed to copy "${missEmittedEntry}" to "${missRootEntry}": ${String(cause)}`,
    );
  }

  try {
    const missEmittedPath = toPath(input.outputDir, missEmittedEntry);
    await rm(missEmittedPath);

    // A left-behind empty directory still answers `/404/` — nginx's
    // `try_files $uri $uri/` matches the directory and, with no index inside
    // it and autoindex off, serves a 403 rather than falling through to the
    // miss document at 404. Removing the file alone is not enough to make
    // R2's "no host can serve it with a 200" hold in spirit at a genuinely
    // unknown status, so the now-empty directory is removed too.
    const parentDir = dirname(missEmittedPath);
    if (parentDir !== input.outputDir && (await readdir(parentDir)).length === 0) {
      await rmdir(parentDir);
    }
  } catch (cause) {
    return fail(
      "RemoveFailed",
      missEmittedEntry,
      `failed to remove "${missEmittedEntry}" after copying it to "${missRootEntry}": ${String(cause)}`,
    );
  }

  const allEntries = [
    ...emittedEntries.filter((entry) => entry !== missEmittedEntry),
    missRootEntry,
  ];
  const markedEntries: string[] = [];

  for (const entry of allEntries) {
    const filePath = toPath(input.outputDir, entry);

    let html: string;
    try {
      html = await readFile(filePath, "utf8");
    } catch (cause) {
      return fail("WriteFailed", entry, `failed to read "${entry}": ${String(cause)}`);
    }

    const injected = injectBuildMarker(html, commit);
    if (!injected.ok) {
      return {
        ok: false,
        errors: injected.errors.map((error) => ({ ...error, entry })) as [
          ArtifactError,
          ...ArtifactError[],
        ],
      };
    }

    try {
      await writeFile(filePath, injected.value, "utf8");
    } catch (cause) {
      return fail("WriteFailed", entry, `failed to write "${entry}": ${String(cause)}`);
    }

    markedEntries.push(entry);
  }

  let serverConfigPath: string;
  try {
    await mkdir(input.serverConfigDir, { recursive: true });
    serverConfigPath = join(input.serverConfigDir, serverConfigFilename);
    await writeFile(serverConfigPath, serverConfig(), "utf8");
  } catch (cause) {
    return fail(
      "WriteFailed",
      serverConfigFilename,
      `failed to write the server configuration: ${String(cause)}`,
    );
  }

  return {
    ok: true,
    value: { commit, markedEntries, rootMissEntry: missRootEntry, serverConfigPath },
  };
}
