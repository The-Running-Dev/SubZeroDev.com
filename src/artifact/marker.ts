// Artifact — the build marker (contract's Artifact § Public signatures,
// "The marker format").
//
// An HTML comment carrying the full forty-character commit id, inserted
// immediately before the first `</head>` and nowhere else. A comment, not a
// `<meta name>` element — an unregistered `meta` name is flagged by a
// conforming HTML validator. Extractable from a raw response body by a fixed
// pattern, with nothing parsed and nothing executed.

import type { CommitId, Result } from "../content";
import type { ArtifactError } from "./errors";

export const buildMarkerPrefix = "<!-- build-commit: " as const;

export const buildMarkerSuffix = " -->" as const;

export function buildMarker(commit: CommitId): string {
  return `${buildMarkerPrefix}${commit}${buildMarkerSuffix}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const HEAD_CLOSE_PATTERN = /<\/head>/i;

// Matches any build marker already present, regardless of which commit it
// carries — Artifact ran twice, or the package emitted one of its own, are
// both "already present" and neither should gain a second marker. Matches the
// comment shape rather than a commit-id-shaped capture, so this stays the
// only implementation of the forty-hex pattern (C15, src/content/commit.ts).
const MARKER_PATTERN = new RegExp(
  `${escapeRegExp(buildMarkerPrefix)}.*?${escapeRegExp(buildMarkerSuffix)}`,
);

export function injectBuildMarker(
  documentHtml: string,
  commit: CommitId,
): Result<string, ArtifactError> {
  if (MARKER_PATTERN.test(documentHtml)) {
    return {
      ok: false,
      errors: [
        {
          code: "MarkerAlreadyPresent",
          entry: null,
          detail: "the document already carries a build marker.",
        },
      ],
    };
  }

  const headIndex = documentHtml.search(HEAD_CLOSE_PATTERN);
  if (headIndex === -1) {
    return {
      ok: false,
      errors: [
        {
          code: "MarkerInsertionPointMissing",
          entry: null,
          detail: "the document contains no </head>.",
        },
      ],
    };
  }

  const marked = documentHtml.slice(0, headIndex) + buildMarker(commit) + documentHtml.slice(headIndex);
  return { ok: true, value: marked };
}
