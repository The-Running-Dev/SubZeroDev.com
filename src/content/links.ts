// Content — the address of the repositories behind the ecosystem (contract's
// `sourceUrl`).
//
// A constant rather than an inventory field because it addresses the account,
// not a project: modelling it as a `Project` to reach `Home` would put a row in
// the ecosystem list and force a `stage`, a `line` and a `question` onto
// something that is none of those.
//
// It produces no `ResolvedHome`, so `checkLinks` does not reach it and it sits
// outside `V4` — the one outbound link on the page that no gate checks. The
// contract states that cost rather than hiding it; see `20-contract.md`
// § Content and `90-decisions.md`, 2026-08-07.

import type { AbsoluteUrl } from "./types";

// `sourceUrl` produces no `ResolvedHome`, so `checkLinks` never reaches it (see
// the module comment above). This is the one check that stands in its place:
// a malformed or non-https literal throws at import time instead of reaching
// the rendered page unnoticed.
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
