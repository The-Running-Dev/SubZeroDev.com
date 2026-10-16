#!/usr/bin/env bash
# The preview read-back, run by the shared Pages workflow after the Pages
# deployment (design/30-slices.md § S10.8, S10.9; contract's V8).
#
# Reads the deployed Pages apex back against the emitted tree the `build` job
# produced (`tests/publish/preview-read-back.test.ts`), then announces the
# preview URL. Nothing else announces it, so a failed read-back leaves no
# URL in the run summary.
#
# Given by the workflow: PAGES_URL (the deployed site), GITHUB_SHA, and the
# `publishable-tree` artifact downloaded into site/.
set -euo pipefail

: "${PAGES_URL:?PAGES_URL is not set}"
: "${GITHUB_SHA:?GITHUB_SHA is not set}"

cd "$(dirname "${BASH_SOURCE[0]}")/../.."

npm ci

npm run publish-preview-gate

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  {
    echo "### Preview published"
    echo "$PAGES_URL"
  } >> "$GITHUB_STEP_SUMMARY"
fi
