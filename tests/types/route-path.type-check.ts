// Issue #52 / A4 — a type-level assertion, checked by `tsc --noEmit`. If
// `RoutePath` were ever widened past the two values `A4` permits, the
// `@ts-expect-error` directive below would have nothing to suppress and the
// typecheck would fail. This file is compiled, never run.

import type { RoutePath } from "../../site/landing.config";

// The two values A4 permits are valid.
const apex: RoutePath = "/";
const miss: RoutePath = "/404/";
void apex;
void miss;

// A third route path is not.
// @ts-expect-error "/blog/" is not one of the two values RoutePath permits.
const third: RoutePath = "/blog/";
void third;
