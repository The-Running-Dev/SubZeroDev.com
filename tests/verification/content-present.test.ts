import { describe, expect, it } from "vitest";

import { assertContentPresent } from "../../src/verification";
import { makeProject, pid } from "../content/fixtures";

const alpha = makeProject({ id: pid("alpha"), name: "Alpha" });
const bravo = makeProject({ id: pid("bravo"), name: "Bravo" });
const inventory = [alpha, bravo] as const;
const manifesto = ["We follow curiosity.", "The rest tends to happen on its own."] as const;

describe("S6.11 — assertContentPresent", () => {
  it("returns ok: true when every manifesto sentence and every project name is present", () => {
    const doc = `<p>We follow curiosity.</p><p>Alpha</p><p>Bravo</p><p>The rest tends to happen on its own.</p>`;
    expect(assertContentPresent(doc, manifesto, inventory)).toEqual({ ok: true, value: null });
  });

  it("returns ManifestoAbsent for a missing manifesto sentence", () => {
    const doc = `<p>Alpha</p><p>Bravo</p><p>The rest tends to happen on its own.</p>`;
    const result = assertContentPresent(doc, manifesto, inventory);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toEqual([
      {
        code: "ManifestoAbsent",
        detail: expect.stringContaining("We follow curiosity."),
        observed: null,
        expected: "We follow curiosity.",
      },
    ]);
  });

  it("returns ProjectNameAbsent for a project whose name is absent", () => {
    const doc = `<p>We follow curiosity.</p><p>The rest tends to happen on its own.</p><p>Alpha</p>`;
    const result = assertContentPresent(doc, manifesto, inventory);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toEqual([
      {
        code: "ProjectNameAbsent",
        detail: expect.stringContaining("Bravo"),
        observed: null,
        expected: "Bravo",
      },
    ]);
  });

  it("reports every fault rather than the first", () => {
    const doc = `<p>nothing relevant here</p>`;
    const result = assertContentPresent(doc, manifesto, inventory);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toHaveLength(4);
  });
});
