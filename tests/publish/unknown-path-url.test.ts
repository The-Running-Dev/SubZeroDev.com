import { describe, expect, it } from "vitest";

import type { AbsoluteUrl } from "../../src/content";
import { unknownPathUrl } from "./unknown-path-url";

describe("unknownPathUrl", () => {
  it("joins onto a base URL with no trailing slash", () => {
    const url = unknownPathUrl("https://subzerodev.com" as AbsoluteUrl, "abc-does-not-exist");
    expect(url.toString()).toBe("https://subzerodev.com/abc-does-not-exist");
  });

  it("joins onto a base URL with a trailing slash", () => {
    const url = unknownPathUrl(
      "https://example.github.io/repo/" as AbsoluteUrl,
      "abc-does-not-exist",
    );
    expect(url.toString()).toBe("https://example.github.io/repo/abc-does-not-exist");
  });
});
