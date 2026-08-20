// S3.7 — the networked CI job. Runs only under `vitest.link-check.config.ts`,
// never under the default `npm test` (S1.9's network-free job) — see that
// config and `vitest.config.ts`'s exclude.
//
// This is also S3.8's fixture: a temporary bad-host entry added to
// committed projects JSON document and validated to turn this job red — see the
// slice report for how that was verified and reverted.
//
// S14.6 — the target set is read from `checkedLinks`, not `resolvedHomes`:
// this now also reaches `sourceUrl`, the one outbound link no earlier gate
// checked.

import { describe, expect, it } from "vitest";

import { checkedLinks, validateInventory } from "../../../src/content";
import type { BuildContext, CommitId, Year } from "../../../src/content";
import { checkLinks, linkCheckRetry } from "../../../src/verification";
import { projects } from "../../helpers/site-data";

const context: BuildContext = {
  commit: "0".repeat(40) as CommitId,
  utcYear: new Date().getUTCFullYear() as Year,
};

describe("S14.6 — every checked link in the committed inventory answers", () => {
  it("checkLinks(checkedLinks(inventory), linkCheckRetry) returns ok: true", async () => {
    const inventory = validateInventory(projects, context);
    if (!inventory.ok) {
      throw new Error(
        `inventory failed to validate: ${inventory.errors.map((e) => e.code).join(", ")}`,
      );
    }

    const result = await checkLinks(checkedLinks(inventory.value), linkCheckRetry);

    if (!result.ok) {
      throw new Error(
        result.errors.map((e) => `${e.code}: ${e.detail}`).join("; "),
      );
    }
    expect(result.ok).toBe(true);
  }, 60_000);
});
