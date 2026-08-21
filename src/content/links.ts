// Content — the address of the repositories behind the ecosystem (contract's
// `sourceUrl`).
//
// A constant rather than an inventory field because it addresses the account,
// not a project: modelling it as a `Project` to reach `Home` would put a row in
// the ecosystem list and force a `stage`, a `line` and a `question` onto
// something that is none of those.
//
// It produces no `ResolvedHome`, and until S14 that put it outside `V4` — the
// one outbound link on the page no gate checked. It is inside `V4` now:
// `checkedLinks` carries it directly rather than through `resolvedHomes`, so
// the 2026-08-07 ruling that accepted the exposure is reopened and closed. See
// `20-contract.md` § Content and `90-decisions.md`, 2026-08-07 and 2026-08-21.

import type { AbsoluteUrl } from "./types";

// This guard is unaffected by `V4`'s widening: it checks the literal's *shape*
// at module load, before any network exists, while `V4` checks whether the
// address *answers* — two faults, caught at two different times. A malformed or
// non-https literal therefore fails the build immediately rather than failing a
// networked gate minutes later.
function absoluteHttpsUrl(value: string): AbsoluteUrl {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`sourceUrl "${value}" is not a valid URL.`);
  }
  if (url.protocol !== "https:") {
    throw new Error(`sourceUrl "${value}" is not an https absolute URL.`);
  }
  return value as AbsoluteUrl;
}

export const sourceUrl = absoluteHttpsUrl("https://github.com/The-Running-Dev?tab=repositories");
