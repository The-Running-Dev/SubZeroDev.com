// Verification — `assertNoAdditionalRequests` (contract's Verification §
// public signatures, `V2`).
//
// The navigation document itself is excluded (`record.initiatedByTester`) —
// it is the request under test, not a load it triggered. Every other record
// in the capture is a fault; all of them are reported, not just the first.

import type { Result } from "../content";
import type { VerificationError } from "./errors";
import type { RequestRecord } from "./types";

export function assertNoAdditionalRequests(
  records: readonly RequestRecord[],
): Result<null, VerificationError> {
  const errors: VerificationError[] = [];

  for (const record of records) {
    if (record.initiatedByTester) continue;
    errors.push({
      code: "UnexpectedRequest",
      detail: `the page triggered a request beyond the navigation document: "${record.url}".`,
      observed: record.url,
      expected: null,
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors: errors as [VerificationError, ...VerificationError[]] };
  }
  return { ok: true, value: null };
}
