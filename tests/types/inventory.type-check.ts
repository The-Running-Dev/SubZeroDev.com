// S1.5 — a type-level assertion, checked by `tsc --noEmit`. If `Inventory`ever
// widened to accept a raw `readonly Project[]` (dropping the non-empty
// guarantee), the `@ts-expect-error` directives below would have nothing to
// suppress and the typecheck would fail. This file is compiled, never run.

import type { Inventory, Project } from "../../src/content";

declare const rawArray: readonly Project[];
declare const nonEmpty: readonly [Project, ...Project[]];
declare function needsInventory(inventory: Inventory): void;

// A non-empty tuple is a valid Inventory.
const good: Inventory = nonEmpty;
void good;

// A raw readonly Project[] is not — in binding position …
// @ts-expect-error readonly Project[] is not assignable to Inventory.
const bad: Inventory = rawArray;
void bad;

// … and in argument position.
// @ts-expect-error readonly Project[] is not a valid Inventory argument.
needsInventory(rawArray);
