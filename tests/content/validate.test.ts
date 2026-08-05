import { describe, expect, it } from "vitest";

import { validateInventory } from "../../src/content";
import type { ContentError, ContentErrorCode, Project } from "../../src/content";
import { context, makeProject, pid, rrp, url, yr } from "./fixtures";

function errorsOf(projects: readonly Project[]): readonly ContentError[] {
  const result = validateInventory(projects, context);
  if (result.ok) throw new Error("expected validation to fail, but it succeeded");
  return result.errors;
}

function only(projects: readonly Project[], code: ContentErrorCode): ContentError {
  const matching = errorsOf(projects).filter((e) => e.code === code);
  expect(matching, `expected exactly one ${code}`).toHaveLength(1);
  return matching[0]!;
}

describe("S1.2 — EmptyInventory", () => {
  it("returns exactly one error with null projectId and field", () => {
    const result = validateInventory([], context);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatchObject({
      code: "EmptyInventory",
      projectId: null,
      field: null,
    });
  });
});

describe("S1.3 — every remaining ContentErrorCode maps to its Error-semantics row", () => {
  it("MalformedProjectId — projectId is the raw value, field 'id'", () => {
    const e = only([makeProject({ id: pid("Bad Id") })], "MalformedProjectId");
    expect(e.projectId).toBe("Bad Id");
    expect(e.field).toBe("id");
  });

  it("DuplicateProjectId — projectId is the duplicate, field 'id'", () => {
    const projects = [
      makeProject({ id: pid("dup") }),
      makeProject({ id: pid("dup"), name: "Second" }),
    ];
    const e = only(projects, "DuplicateProjectId");
    expect(e.projectId).toBe("dup");
    expect(e.field).toBe("id");
  });

  it("InvalidYear — projectId set, field 'year'", () => {
    const e = only([makeProject({ id: pid("p"), year: yr(999) })], "InvalidYear");
    expect(e.projectId).toBe("p");
    expect(e.field).toBe("year");
  });

  it("YearAfterBuild — projectId set, field 'year'", () => {
    const e = only([makeProject({ id: pid("p"), year: yr(2027) })], "YearAfterBuild");
    expect(e.projectId).toBe("p");
    expect(e.field).toBe("year");
  });

  it("EmptyField — projectId set, field is the offending field", () => {
    const e = only([makeProject({ id: pid("p"), name: "   " })], "EmptyField");
    expect(e.projectId).toBe("p");
    expect(e.field).toBe("name");
  });

  it("HomeOwnUrlInvalid — projectId set, field 'home.url'", () => {
    const projects = [
      makeProject({ id: pid("p"), home: { kind: "own", url: url("http://insecure.example") } }),
    ];
    const e = only(projects, "HomeOwnUrlInvalid");
    expect(e.projectId).toBe("p");
    expect(e.field).toBe("home.url");
  });

  it("HomeWithinParentMissing — projectId set, field 'home.parent'", () => {
    const projects = [
      makeProject({ id: pid("child"), home: { kind: "within", parent: pid("ghost"), path: rrp("/x") } }),
    ];
    const e = only(projects, "HomeWithinParentMissing");
    expect(e.projectId).toBe("child");
    expect(e.field).toBe("home.parent");
  });

  it("HomeWithinParentNotOwn — projectId set, field 'home.parent'", () => {
    const projects = [
      makeProject({ id: pid("parent"), home: { kind: "none" } }),
      makeProject({
        id: pid("child"),
        home: { kind: "within", parent: pid("parent"), path: rrp("/x") },
      }),
    ];
    const e = only(projects, "HomeWithinParentNotOwn");
    expect(e.projectId).toBe("child");
    expect(e.field).toBe("home.parent");
  });

  it("HomeWithinOriginEscape — projectId set, field 'home.path'", () => {
    const projects = [
      makeProject({ id: pid("blog"), home: { kind: "own", url: url("https://blog.subzerodev.com") } }),
      makeProject({
        id: pid("series"),
        home: { kind: "within", parent: pid("blog"), path: rrp("//example.com/x") },
      }),
    ];
    const e = only(projects, "HomeWithinOriginEscape");
    expect(e.projectId).toBe("series");
    expect(e.field).toBe("home.path");
  });

  it("EscapedFromTargetMissing — projectId set, field 'escapedFrom'", () => {
    const e = only(
      [makeProject({ id: pid("p"), escapedFrom: pid("ghost") })],
      "EscapedFromTargetMissing",
    );
    expect(e.projectId).toBe("p");
    expect(e.field).toBe("escapedFrom");
  });

  it("EscapedFromSelfReference — projectId set, field 'escapedFrom'", () => {
    const e = only(
      [makeProject({ id: pid("p"), escapedFrom: pid("p") })],
      "EscapedFromSelfReference",
    );
    expect(e.projectId).toBe("p");
    expect(e.field).toBe("escapedFrom");
  });

  it("EscapedFromCycle — projectId set, field 'escapedFrom'", () => {
    const projects = [
      makeProject({ id: pid("a"), escapedFrom: pid("b") }),
      makeProject({ id: pid("b"), escapedFrom: pid("a") }),
    ];
    const matching = errorsOf(projects).filter((e) => e.code === "EscapedFromCycle");
    expect(matching).toHaveLength(2);
    for (const e of matching) {
      expect(e.field).toBe("escapedFrom");
      expect(["a", "b"]).toContain(e.projectId);
    }
  });
});

describe("S1.4 — all failures reported in one Result", () => {
  it("a project with three distinct faults yields three errors", () => {
    const projects = [makeProject({ id: pid("Bad Id"), year: yr(999), name: "  " })];
    const errors = errorsOf(projects);
    const codes = errors.map((e) => e.code).sort();
    expect(errors).toHaveLength(3);
    expect(codes).toEqual(["EmptyField", "InvalidYear", "MalformedProjectId"]);
  });
});

describe("S1.5 — a valid inventory validates", () => {
  it("returns ok:true and carries the projects through", () => {
    const projects = [
      makeProject({ id: pid("alpha"), year: yr(2018) }),
      makeProject({ id: pid("beta"), year: yr(2026), home: { kind: "own", url: url("https://beta.subzerodev.com") } }),
    ];
    const result = validateInventory(projects, context);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(2);
  });
});

describe("S1.6 — EscapedFromCycle over a → b → c → a", () => {
  it("reports one error per project on the cycle", () => {
    const projects = [
      makeProject({ id: pid("a"), escapedFrom: pid("b") }),
      makeProject({ id: pid("b"), escapedFrom: pid("c") }),
      makeProject({ id: pid("c"), escapedFrom: pid("a") }),
    ];
    const cycleErrors = errorsOf(projects).filter((e) => e.code === "EscapedFromCycle");
    expect(cycleErrors).toHaveLength(3);
    expect(cycleErrors.map((e) => e.projectId).sort()).toEqual(["a", "b", "c"]);
    for (const e of cycleErrors) expect(e.field).toBe("escapedFrom");
  });

  it("does not flag a node that only points into a cycle", () => {
    const projects = [
      makeProject({ id: pid("a"), escapedFrom: pid("b") }),
      makeProject({ id: pid("b"), escapedFrom: pid("a") }),
      makeProject({ id: pid("d"), escapedFrom: pid("a") }),
    ];
    const cycleErrors = errorsOf(projects).filter((e) => e.code === "EscapedFromCycle");
    expect(cycleErrors.map((e) => e.projectId).sort()).toEqual(["a", "b"]);
  });
});

describe("S1.7 — Home.Within resolution", () => {
  const blog = makeProject({
    id: pid("blog"),
    home: { kind: "own", url: url("https://blog.subzerodev.com") },
  });

  it("a within home with path /blog/lucifer under the blog origin validates", () => {
    const lucifer = makeProject({
      id: pid("lucifer"),
      home: { kind: "within", parent: pid("blog"), path: rrp("/blog/lucifer") },
    });
    const result = validateInventory([blog, lucifer], context);
    expect(result.ok).toBe(true);
  });

  it("a path of //example.com/x returns HomeWithinOriginEscape", () => {
    const escaping = makeProject({
      id: pid("lucifer"),
      home: { kind: "within", parent: pid("blog"), path: rrp("//example.com/x") },
    });
    const e = only([blog, escaping], "HomeWithinOriginEscape");
    expect(e.projectId).toBe("lucifer");
    expect(e.field).toBe("home.path");
  });

  it("a parent whose own home.kind is 'within' returns HomeWithinParentNotOwn", () => {
    const grand = makeProject({
      id: pid("grand"),
      home: { kind: "own", url: url("https://grand.subzerodev.com") },
    });
    const parent = makeProject({
      id: pid("parent"),
      home: { kind: "within", parent: pid("grand"), path: rrp("/p") },
    });
    const child = makeProject({
      id: pid("child"),
      home: { kind: "within", parent: pid("parent"), path: rrp("/c") },
    });
    const e = only([grand, parent, child], "HomeWithinParentNotOwn");
    expect(e.projectId).toBe("child");
    expect(e.field).toBe("home.parent");
  });
});

describe("S1.8 — year against the build's UTC year", () => {
  it("year equal to utcYear validates", () => {
    const result = validateInventory([makeProject({ id: pid("p"), year: yr(2026) })], context);
    expect(result.ok).toBe(true);
  });

  it("utcYear + 1 returns YearAfterBuild", () => {
    const e = only([makeProject({ id: pid("p"), year: yr(2027) })], "YearAfterBuild");
    expect(e.field).toBe("year");
  });

  it("999 returns InvalidYear", () => {
    only([makeProject({ id: pid("p"), year: yr(999) })], "InvalidYear");
  });

  it("2026.5 returns InvalidYear", () => {
    only([makeProject({ id: pid("p"), year: yr(2026.5) })], "InvalidYear");
  });
});
