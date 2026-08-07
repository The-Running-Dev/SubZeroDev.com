import { describe, expect, it } from "vitest";

import { sourceUrl } from "../../src/content";

describe("sourceUrl", () => {
  it("parses as an https absolute URL", () => {
    expect(new URL(sourceUrl).protocol).toBe("https:");
  });
});
