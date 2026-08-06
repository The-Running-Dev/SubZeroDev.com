// Verification — assertUnknownPathResponse and assertServedBytesMatchEmitted
// (contract's Verification § public signatures, V11 and V12's container half).

import type { Result } from "../content";
import type { VerificationError } from "./errors";
import type { ServedResponse } from "./types";

// Requires equality, not containment: a host that serves the right
// composition wrapped in its own error chrome is a different page from the
// one that was built and verified (contract's Verification § public
// signatures, note on `assertUnknownPathResponse`).
export function assertUnknownPathResponse(
  response: ServedResponse,
  emittedMissDocument: string,
): Result<null, VerificationError> {
  const errors: VerificationError[] = [];

  if (response.status !== 404) {
    errors.push({
      code: "UnknownPathStatusWrong",
      detail: `a unique unknown path answered with status ${response.status}, not 404.`,
      observed: String(response.status),
      expected: "404",
    });
  }

  if (response.body !== emittedMissDocument) {
    errors.push({
      code: "UnknownPathBodyWrong",
      detail:
        "the response body for a unique unknown path does not equal the emitted miss document.",
      observed: response.body,
      expected: emittedMissDocument,
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors: errors as [VerificationError, ...VerificationError[]] };
  }
  return { ok: true, value: null };
}

// Compares bytes rather than parsed documents: the failure this exists to
// catch is a transform applied on one publication path and not the other,
// and a transform that preserves the parse tree still changes what a
// crawler receives (contract's Verification § public signatures, note on
// `assertServedBytesMatchEmitted`).
export function assertServedBytesMatchEmitted(
  served: Uint8Array,
  emitted: Uint8Array,
): Result<null, VerificationError> {
  const matches =
    served.length === emitted.length && served.every((byte, index) => byte === emitted[index]);

  if (!matches) {
    return {
      ok: false,
      errors: [
        {
          code: "ServedBytesMismatch",
          detail: `what the running image serves for "/" (${served.length} bytes) differs from the emitted document (${emitted.length} bytes).`,
          observed: `${served.length} bytes`,
          expected: `${emitted.length} bytes`,
        },
      ],
    };
  }
  return { ok: true, value: null };
}
