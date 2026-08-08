// Issue #52 / A4 — a type-level assertion, checked by `tsc --noEmit`. This
// file is compiled, never run.
//
// The equality check below is an exact assertion rather than a sampled
// negative: a check that only asserts one arbitrary string is excluded
// (e.g. `"/blog/"`) would still pass if a third member were added to the
// union — that string just isn't one of the (now three) members either.
// Mutual-assignability between `RoutePath` and the literal union named here
// is what actually pins the set: if a member is ever added or removed, this
// file fails to compile directly, with no `@ts-expect-error` to suppress it.

import type { RoutePath } from "../../site/landing.config";

type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? true
  : false;
type AssertTrue<T extends true> = T;

// RoutePath is exactly "/" | "/404/" | "/testimonials/" — no more, no fewer.
type _RoutePathIsExact = AssertTrue<Equals<RoutePath, "/" | "/404/" | "/testimonials/">>;

// The three values A4 permits are valid.
const apex: RoutePath = "/";
const testimonials: RoutePath = "/testimonials/";
const miss: RoutePath = "/404/";
void apex;
void testimonials;
void miss;

// A fourth route path is not.
// @ts-expect-error "/blog/" is not one of the three values RoutePath permits.
const fourth: RoutePath = "/blog/";
void fourth;
