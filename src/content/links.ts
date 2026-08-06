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

export const sourceUrl = "https://github.com/The-Running-Dev?tab=repositories" as AbsoluteUrl;
