// Verification — `assertEveryDocumentMarked`, `assertRootMissDocument` and
// `assertMissEntryRemoved` (contract's Verification § public signatures, V1
// and R2's read-back half).

import { missEmittedEntry, missRootEntry } from "../artifact";
import type { EmittedDocument } from "../artifact";
import type { CommitId, Result } from "../content";
import { readBuildMarker } from "./build-marker";
import type { VerificationError } from "./errors";

export function assertEveryDocumentMarked(
  documents: readonly EmittedDocument[],
  commit: CommitId,
): Result<null, VerificationError> {
  const errors: VerificationError[] = [];

  for (const document of documents) {
    const marker = readBuildMarker(document.html);
    if (!marker.ok) {
      for (const error of marker.errors) {
        errors.push({ ...error, detail: `${document.relativePath}: ${error.detail}` });
      }
      continue;
    }
    if (marker.value !== commit) {
      errors.push({
        code: "MarkerMismatch",
        detail: `${document.relativePath} carries a different commit's marker.`,
        observed: marker.value,
        expected: commit,
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors: errors as [VerificationError, ...VerificationError[]] };
  }
  return { ok: true, value: null };
}

export function assertRootMissDocument(
  documents: readonly EmittedDocument[],
): Result<null, VerificationError> {
  const present = documents.some((document) => document.relativePath === missRootEntry);
  if (!present) {
    return {
      ok: false,
      errors: [
        {
          code: "RootMissDocumentAbsent",
          detail: `"${missRootEntry}" is absent from the finished tree.`,
          observed: null,
          expected: missRootEntry,
        },
      ],
    };
  }
  return { ok: true, value: null };
}

export function assertMissEntryRemoved(
  documents: readonly EmittedDocument[],
): Result<null, VerificationError> {
  const present = documents.some((document) => document.relativePath === missEmittedEntry);
  if (present) {
    return {
      ok: false,
      errors: [
        {
          code: "MissEntryStillPresent",
          detail: `"${missEmittedEntry}" survives into the finished tree, so the miss composition is reachable at a 200.`,
          observed: missEmittedEntry,
          expected: null,
        },
      ],
    };
  }
  return { ok: true, value: null };
}
