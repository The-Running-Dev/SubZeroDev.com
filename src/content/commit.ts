// Content — the commit id parser (contract's `parseCommitId`; C15).
//
// The only implementation of the forty-hex pattern in the repository — Artifact
// and Adapter both parse the environment's commit through this rather than
// each carrying their own copy of the regular expression.

import type { CommitId } from "./types";

const COMMIT_ID_PATTERN = /^[0-9a-f]{40}$/;

export function parseCommitId(value: string): CommitId | null {
  return COMMIT_ID_PATTERN.test(value) ? (value as CommitId) : null;
}
