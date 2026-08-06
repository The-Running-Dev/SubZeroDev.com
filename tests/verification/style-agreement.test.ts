import { describe, expect, it } from "vitest";

import { composeMiss } from "../../src/composition";
import { stylesheetFor } from "../../src/presentation";
import type { BodyHtml, StylesheetText } from "../../src/presentation";
import { assertStyleAgreement } from "../../src/verification";
import type { VerificationError, VerificationErrorCode } from "../../src/verification";

const bodyHtml = (s: string): BodyHtml => s as BodyHtml;
const stylesheetText = (s: string): StylesheetText => s as StylesheetText;

function codesOf(errors: readonly VerificationError[]): VerificationErrorCode[] {
  return errors.map((e) => e.code).sort();
}

describe("S4.11 — assertStyleAgreement", () => {
  it("returns ok:true for composeMiss()", () => {
    const { bodyHtml: body, stylesheet } = composeMiss();
    const result = assertStyleAgreement(body, stylesheet);
    expect(result).toEqual({ ok: true, value: null });
  });

  it("a class with no rule returns ClassWithoutRule naming that class", () => {
    const body = bodyHtml('<div class="orphan"></div>');
    const sheet = stylesheetText(":root { --bg: #000000; }");
    const result = assertStyleAgreement(body, sheet);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(codesOf(result.errors)).toEqual(["ClassWithoutRule"]);
    expect(result.errors[0]).toMatchObject({ code: "ClassWithoutRule", observed: "orphan" });
  });

  it("a stylesheet selector with no user returns SelectorWithoutUser", () => {
    const body = bodyHtml("<div></div>");
    const sheet = stylesheetText(".ghost { color: red; }");
    const result = assertStyleAgreement(body, sheet);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(codesOf(result.errors)).toEqual(["SelectorWithoutUser"]);
    expect(result.errors[0]).toMatchObject({ code: "SelectorWithoutUser", observed: "ghost" });
  });

  it("four unmatched classes return four errors in one Result", () => {
    const body = bodyHtml('<div class="a b"></div>');
    const sheet = stylesheetText(".c { color: red; } .d { color: blue; }");
    const result = assertStyleAgreement(body, sheet);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toHaveLength(4);
    expect(codesOf(result.errors)).toEqual([
      "ClassWithoutRule",
      "ClassWithoutRule",
      "SelectorWithoutUser",
      "SelectorWithoutUser",
    ]);
  });
});

describe("S4.12 — the token block alone raises no SelectorWithoutUser against a body with no class", () => {
  it("passes for the token block alone against a classless body", () => {
    const sheet = stylesheetFor(bodyHtml("<div>no classes here</div>"));
    const result = assertStyleAgreement(bodyHtml("<div>no classes here</div>"), sheet);
    expect(result).toEqual({ ok: true, value: null });
  });
});
