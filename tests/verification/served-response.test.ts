import { describe, expect, it } from "vitest";

import { assertServedBytesMatchEmitted, assertUnknownPathResponse } from "../../src/verification";
import type { ServedResponse } from "../../src/verification";

const MISS_DOCUMENT = "<!doctype html><html><body>404</body></html>";

describe("S9.5 — assertUnknownPathResponse", () => {
  it("returns ok: true for a 404 whose body equals the emitted miss document", () => {
    const response: ServedResponse = { status: 404, body: MISS_DOCUMENT };
    expect(assertUnknownPathResponse(response, MISS_DOCUMENT)).toEqual({ ok: true, value: null });
  });

  it("a 200 carrying the miss document returns UnknownPathStatusWrong", () => {
    const response: ServedResponse = { status: 200, body: MISS_DOCUMENT };
    const result = assertUnknownPathResponse(response, MISS_DOCUMENT);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toEqual(["UnknownPathStatusWrong"]);
  });

  it("a 404 wrapping the miss document in other markup returns UnknownPathBodyWrong, because the body must equal rather than contain it", () => {
    const response: ServedResponse = { status: 404, body: `<html>${MISS_DOCUMENT}</html>` };
    const result = assertUnknownPathResponse(response, MISS_DOCUMENT);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toEqual(["UnknownPathBodyWrong"]);
  });

  it("a 200 with a different body returns both faults in one Result", () => {
    const response: ServedResponse = { status: 200, body: "not the miss document" };
    const result = assertUnknownPathResponse(response, MISS_DOCUMENT);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code).sort()).toEqual(
      ["UnknownPathBodyWrong", "UnknownPathStatusWrong"].sort(),
    );
  });
});

describe("S9.4 — assertServedBytesMatchEmitted", () => {
  it("returns ok: true when the served bytes equal the emitted bytes", () => {
    const bytes = new TextEncoder().encode("<!doctype html>hello");
    expect(assertServedBytesMatchEmitted(bytes, bytes.slice())).toEqual({
      ok: true,
      value: null,
    });
  });

  it("a single altered byte returns ServedBytesMismatch", () => {
    const emitted = new TextEncoder().encode("<!doctype html>hello");
    const served = emitted.slice();
    served[served.length - 1] = served[served.length - 1]! + 1;
    const result = assertServedBytesMatchEmitted(served, emitted);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toEqual(["ServedBytesMismatch"]);
  });

  it("a different length returns ServedBytesMismatch", () => {
    const emitted = new TextEncoder().encode("<!doctype html>hello");
    const served = new TextEncoder().encode("<!doctype html>hello!");
    const result = assertServedBytesMatchEmitted(served, emitted);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((e) => e.code)).toEqual(["ServedBytesMismatch"]);
  });
});
