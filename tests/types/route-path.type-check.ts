// Issue #52 / A4 — a type-level assertion, checked by `tsc --noEmit`. This
// file is compiled, never run.
//
// The equality check below is an exact assertion rather than a sampled
// negative: a check that only asserts one arbitrary string is excluded
// (e.g. `"/blog/"`) would still pass if a further member were added to the
// union — that string just isn't one of the members either.
// Mutual-assignability between `RoutePath` and the literal union named here
// is what actually pins the set: if a member is ever added or removed, this
// file fails to compile directly, with no `@ts-expect-error` to suppress it.

import type { RoutePath } from "../../site/landing.config";

type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? true
  : false;
type AssertTrue<T extends true> = T;

// RoutePath is exactly "/" | "/cv/" | "/portfolio/" | "/404/" — no more, no
// fewer (S16.1).
type _RoutePathIsExact = AssertTrue<Equals<RoutePath, "/" | "/cv/" | "/portfolio/" | "/404/">>;

// The values A4 permits are valid.
const apex: RoutePath = "/";
const cv: RoutePath = "/cv/";
const miss: RoutePath = "/404/";
void apex;
void cv;
void miss;

// An undeclared route path is not.
// @ts-expect-error "/blog/" is not one of the values RoutePath permits.
const third: RoutePath = "/blog/";
void third;
