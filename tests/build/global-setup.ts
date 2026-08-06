// The build job's second duty (S7.13): runs finalizeArtifact against the
// package's real output, before any of this config's test files execute — so
// the offline assertions below (S6's self-contained/content checks, S7's
// marking/root-miss checks) read a genuinely finalized tree rather than one
// this suite fabricates for itself. Vitest's globalSetup runs once, ahead of
// test collection, in the same `npx vitest run --config vitest.build.config.ts`
// invocation `npm run build` already precedes in the build job — so the
// package build, finalizeArtifact and the offline assertions stay sequential
// in one job over one working directory.

import { resolve } from "node:path";

import { finalizeArtifact } from "../../src/artifact";

export default async function setup(): Promise<void> {
  const commit = process.env.GITHUB_SHA ?? "";
  const result = await finalizeArtifact({
    outputDir: resolve("site/dist"),
    serverConfigDir: resolve("site/server"),
    commit,
  });

  if (!result.ok) {
    for (const error of result.errors) {
      console.error(`${error.code} (entry: ${error.entry ?? "-"}): ${error.detail}`);
    }
    throw new Error("finalizeArtifact failed — see errors above.");
  }
}
