// The branch-head check shared by `publish-preview` and `publish-release`, at
// the top of each job's critical section (design/30-slices.md § S10.10). Runs
// only under `vitest.publish.config.ts`'s own job — same convention as this
// directory's other gate tests.

import { describe, expect, it } from "vitest";

import type { CommitId } from "../../src/content";
import { assertDeploymentCandidateCurrent } from "../../src/verification";

const commit = process.env.GITHUB_SHA as CommitId;
const branchHead = process.env.BRANCH_HEAD as CommitId;

describe("S10.10 — this run's commit is still the deployment branch's head", () => {
  it("assertDeploymentCandidateCurrent returns ok: true", () => {
    expect(assertDeploymentCandidateCurrent(commit, branchHead)).toEqual({ ok: true, value: null });
  });
});
