import { describe, expect, it } from "vitest";

import { composeMiss } from "../../src/composition";
import { primitives } from "../../src/presentation";

describe("S4.13 — composeMiss() takes no argument and is deterministic", () => {
  it("returns byte-identical bodyHtml and stylesheet on repeated calls", () => {
    const first = composeMiss();
    const second = composeMiss();
    expect(first.bodyHtml).toBe(second.bodyHtml);
    expect(first.stylesheet).toBe(second.stylesheet);
  });
});

describe("S4.13 — composeMiss()'s bodyHtml contains no form, script, iframe or on* attribute (X3)", () => {
  const { bodyHtml } = composeMiss();

  it("no <form>", () => {
    expect(bodyHtml.toLowerCase()).not.toContain("<form");
  });

  it("no <script>", () => {
    expect(bodyHtml.toLowerCase()).not.toContain("<script");
  });

  it("no <iframe>", () => {
    expect(bodyHtml.toLowerCase()).not.toContain("<iframe");
  });

  it("no on* attribute", () => {
    expect(bodyHtml).not.toMatch(/\son[a-zA-Z]+\s*=/i);
  });
});

describe("S4.11 — the miss route's stylesheet omits link-current, which its body never uses", () => {
  it("carries link's rules but not link-current's", () => {
    const { stylesheet } = composeMiss();
    expect(stylesheet).toContain(primitives.link.rules);
    expect(stylesheet).not.toContain(primitives["link-current"].rules);
  });
});
