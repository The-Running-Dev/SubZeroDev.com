// Issue #52 / A4 — a type-level assertion, checked by `tsc --noEmit`.
// This exact equality check fails if `RoutePath` gains or loses any value.
// This file is compiled, never run.

import type { RoutePath } from "../../site/landing.config";

type Equal<Left, Right> = [Left] extends [Right]
  ? [Right] extends [Left]
    ? true
    : false
  : false;

const routePathIsExact: Equal<RoutePath, "/" | "/404/"> = true;
void routePathIsExact;
