#!/usr/bin/env bash
# The release read-back, run by the shared container workflow after the
# Portainer redeploy (design/30-slices.md § S10.11; contract's V15).
#
# Polls the live site until it serves this run's commit, then checks that an
# unknown path answers the emitted miss document with a 404
# (`tests/publish/release-read-back.test.ts`). The emitted tree the test
# compares against is copied out of the image that was just pushed, so no
# build is repeated here.
#
# Given by the workflow: IMAGE and DIGEST (the pushed image, public on GHCR).
# Optional: SITE_URL, the endpoint to read back (default https://subzerodev.com).
set -euo pipefail

: "${IMAGE:?IMAGE is not set}"
: "${DIGEST:?DIGEST is not set}"

export SITE_URL="${SITE_URL:-https://subzerodev.com}"

cd "$(dirname "${BASH_SOURCE[0]}")/../.."

npm ci

rm -rf site/dist
mkdir -p site/dist
container="$(docker create "$IMAGE@$DIGEST")"
trap 'docker rm --force "$container" > /dev/null' EXIT
docker cp "$container:/usr/share/nginx/html/." site/dist

npm run publish-release-gate
