// A type-level assertion, checked by `tsc --noEmit`. The contract requires
// `question`, `genre` and `escapedFrom` to be "absent, never `undefined`-valued".
// Nothing enforces that at runtime, and nothing needs to: these values come only
// from hand-authored source the compiler sees. `exactOptionalPropertyTypes` is
// therefore the whole of the enforcement, and this file is what fails if that
// flag is ever removed. Compiled, never run.

import type { Project } from "../../src/content";

declare const base: Project;

// Absent is the representable form …
const absent: Project = { ...base };
void absent;

// … an explicit `undefined` is not, for each of the three optional fields.
// @ts-expect-error question must be absent, never undefined-valued.
const withQuestion: Project = { ...base, question: undefined };
void withQuestion;

// @ts-expect-error genre must be absent, never undefined-valued.
const withGenre: Project = { ...base, genre: undefined };
void withGenre;

// @ts-expect-error escapedFrom must be absent, never undefined-valued.
const withEscapedFrom: Project = { ...base, escapedFrom: undefined };
void withEscapedFrom;
