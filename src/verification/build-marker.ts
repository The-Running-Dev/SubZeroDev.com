// Verification — `readBuildMarker` (contract's Verification § public
// signatures). Reads the format Artifact owns, through Artifact's exported
// constants — it never restates the pattern.

import { buildMarkerPrefix, buildMarkerSuffix } from "../artifact";
import { parseCommitId } from "../content";
import type { CommitId, Result } from "../content";
import type { VerificationError } from "./errors";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Captures generically rather than to a commit-id shape — parseCommitId below
// is what validates it, so this stays the only implementation of the
// forty-hex pattern (C15, src/content/commit.ts).
const MARKER_PATTERN = new RegExp(
  `${escapeRegExp(buildMarkerPrefix)}(.*?)${escapeRegExp(buildMarkerSuffix)}`,
  "g",
);

export function readBuildMarker(documentHtml: string): Result<CommitId, VerificationError> {
  const matches = [...documentHtml.matchAll(MARKER_PATTERN)];

  if (matches.length === 0) {
    return {
      ok: false,
      errors: [
        {
          code: "MarkerAbsent",
          detail: "the document carries no build marker.",
          observed: null,
          expected: null,
        },
      ],
    };
  }

  if (matches.length > 1) {
    return {
      ok: false,
      errors: [
        {
          code: "MarkerDuplicate",
          detail: `the document carries ${matches.length} build markers.`,
          observed: null,
          expected: null,
        },
      ],
    };
  }

  const raw = matches[0]![1]!;
  const commit = parseCommitId(raw);
  if (commit === null) {
    return {
      ok: false,
      errors: [
        {
          code: "MarkerAbsent",
          detail: `the document's marker carries "${raw}", which is not a valid commit id.`,
          observed: raw,
          expected: null,
        },
      ],
    };
  }

  return { ok: true, value: commit };
}
