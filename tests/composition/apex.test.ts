// The committed-inventory cases for S5.5 and S5.9 live in
// tests/content/inventory.test.ts — `projects` may be imported only at that
// call site and Verification's inventory assertion (C14); composeApex's
// tests supply their own fixture Inventory rather than reading `projects`
// from Composition (S5's own scope note).

import { describe, expect, it } from "vitest";

import { composeApex } from "../../src/composition";
import { apexFooterQuote, primarySlogan } from "../../src/content";
import type { Inventory, Project } from "../../src/content";
import { assertStyleAgreement } from "../../src/verification";
import { makeProject, pid } from "../content/fixtures";

function inventory(...projects: readonly [Project, ...Project[]]): Inventory {
  return projects;
}

const alpha = makeProject({ id: pid("alpha"), name: "Alpha", stage: "Prototype" });
const bravo = makeProject({
  id: pid("bravo"),
  name: "Bravo",
  stage: "Reusable",
  escapedFrom: pid("alpha"),
});
const sample: Inventory = inventory(alpha, bravo);

describe("S5.5 — composeApex's bodyHtml carries project names, the slogan and the footer quote", () => {
  const { bodyHtml } = composeApex(sample);

  it.each(sample.map((p) => p.name))("contains project name %s", (name) => {
    expect(bodyHtml).toContain(name);
  });

  it("contains primarySlogan", () => {
    expect(bodyHtml).toContain(primarySlogan);
  });

  it("contains apexFooterQuote", () => {
    expect(bodyHtml).toContain(apexFooterQuote);
  });
});

describe("S5.6 — composeApex is deterministic", () => {
  it("returns byte-identical bodyHtml and stylesheet for the same inventory on repeated calls", () => {
    const first = composeApex(sample);
    const second = composeApex(sample);
    expect(first.bodyHtml).toBe(second.bodyHtml);
    expect(first.stylesheet).toBe(second.stylesheet);
  });
});

describe("S5.7 — no figure on the page is a typed literal (X1)", () => {
  it("removing a project changes the total, its stage count and the ecosystem grouping", () => {
    const full = composeApex(sample).bodyHtml;
    const reduced = composeApex(inventory(bravo)).bodyHtml;

    expect(reduced).not.toBe(full);
    expect(reduced).not.toContain(alpha.name);
    expect(full).toContain(`${sample.length} projects.`);
    expect(reduced).toContain("1 projects.");
  });
});

describe("S5.8 — interpolated Content strings are escaped (X5)", () => {
  const dangerous = `<b>&"'>`;
  const inv = inventory(
    makeProject({
      id: pid("hazard"),
      name: `Name ${dangerous}`,
      line: `Line ${dangerous}`,
      question: `Question ${dangerous}`,
    }),
  );
  const { bodyHtml } = composeApex(inv);

  it("does not carry the raw fixture text in text position", () => {
    expect(bodyHtml).not.toContain(`Name ${dangerous}`);
    expect(bodyHtml).not.toContain(`Line ${dangerous}`);
    expect(bodyHtml).not.toContain(`Question ${dangerous}`);
  });

  it("carries the escaped equivalents", () => {
    const escaped = "&lt;b&gt;&amp;&quot;&#39;&gt;";
    expect(bodyHtml).toContain(`Name ${escaped}`);
    expect(bodyHtml).toContain(`Line ${escaped}`);
    expect(bodyHtml).toContain(`Question ${escaped}`);
  });
});

describe("S5.9 — assertStyleAgreement holds for composeApex", () => {
  it("returns ok: true for a fixture inventory", () => {
    const { bodyHtml, stylesheet } = composeApex(sample);
    expect(assertStyleAgreement(bodyHtml, stylesheet)).toEqual({ ok: true, value: null });
  });
});

describe("S5.10 — composeApex's bodyHtml contains no form, script, iframe or on* attribute (X3)", () => {
  const { bodyHtml } = composeApex(sample);

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
