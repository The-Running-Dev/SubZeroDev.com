// S11.1, S11.2 — validateTestimonials and testimonialTotal, including the
// committed collection (C16's call site for `testimonials`, until Adapter's
// own call is the production path).

import { describe, expect, it } from "vitest";

import { testimonialTotal, testimonials, validateTestimonials } from "../../src/content";
import type { Testimonial } from "../../src/content";

describe("S11.1 — the committed testimonials validate", () => {
  it("validateTestimonials(testimonials) returns ok: true", () => {
    const result = validateTestimonials(testimonials);
    if (!result.ok) {
      throw new Error(
        `testimonials failed to validate: ${result.errors.map((e) => `${e.code} (${e.field ?? "-"}): ${e.detail}`).join(", ")}`,
      );
    }
    expect(result.ok).toBe(true);
  });
});

describe("S11.1 — validateTestimonials rejects malformed input", () => {
  it("rejects an empty collection with EmptyTestimonials", () => {
    const result = validateTestimonials([]);
    expect(result).toEqual({
      ok: false,
      errors: [
        { code: "EmptyTestimonials", projectId: null, field: null, detail: expect.any(String) },
      ],
    });
  });

  it("rejects an empty (or whitespace-only) quote with TestimonialQuoteEmpty naming its index", () => {
    const fixture: Testimonial[] = [{ quote: "   ", author: "Someone" }];
    const result = validateTestimonials(fixture);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({ code: "TestimonialQuoteEmpty", field: "quote" });
      expect(result.errors[0].detail).toContain("0");
    }
  });

  it("rejects an empty author with TestimonialAuthorEmpty naming its index", () => {
    const fixture: Testimonial[] = [
      { quote: "Fine.", author: "Someone" },
      { quote: "Also fine.", author: "" },
    ];
    const result = validateTestimonials(fixture);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({ code: "TestimonialAuthorEmpty", field: "author" });
      expect(result.errors[0].detail).toContain("1");
    }
  });

  it("reports all failures in one Result for a fixture carrying two bad records", () => {
    const fixture: Testimonial[] = [
      { quote: "", author: "Someone" },
      { quote: "Fine.", author: "" },
    ];
    const result = validateTestimonials(fixture);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.map((e) => e.code).sort()).toEqual(
        ["TestimonialAuthorEmpty", "TestimonialQuoteEmpty"].sort(),
      );
    }
  });
});

describe("S11.2 — testimonialTotal is a Content derivation, not a typed literal (X1)", () => {
  it("equals the array length over the committed collection", () => {
    const validated = validateTestimonials(testimonials);
    if (!validated.ok) throw new Error("committed testimonials failed to validate");
    expect(testimonialTotal(validated.value)).toBe(testimonials.length);
  });

  it("changes when a record is removed", () => {
    const fixture: Testimonial[] = [
      { quote: "One.", author: "A" },
      { quote: "Two.", author: "B" },
    ];
    const full = validateTestimonials(fixture);
    const reduced = validateTestimonials(fixture.slice(0, 1));
    if (!full.ok || !reduced.ok) throw new Error("fixture failed to validate");
    expect(testimonialTotal(full.value)).toBe(2);
    expect(testimonialTotal(reduced.value)).toBe(1);
  });
});
