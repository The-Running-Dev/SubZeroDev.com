// The attestation CI job (design/30-slices.md § S10.5). Runs only under
// `vitest.attestation.config.ts`'s own job, after the job's protected
// GitHub Environment has recorded a human approval and a workflow step has
// read that approval record via the GitHub API — same convention as
// `vitest.image-gate.config.ts`: a plain `vitest run` never reaches the
// network.

import { describe, expect, it } from "vitest";

import type { CommitId } from "../../src/content";
import { assertAttestation } from "../../src/verification";

const commit = process.env.GITHUB_SHA as CommitId;
const approver = process.env.ATTESTATION_APPROVER;

describe("S10.5 — the run's approval record satisfies V5", () => {
  it("assertAttestation returns ok: true for an approval bound to this run's commit", () => {
    const attestation = approver !== undefined && approver !== "" ? { commit, approver } : null;

    expect(assertAttestation(attestation, commit)).toEqual({ ok: true, value: null });
  });
});
