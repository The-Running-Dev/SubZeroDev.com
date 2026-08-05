// Fixture builders for Content tests. Brands are compile-time only, so branded
// values are cast at the authoring site here — exactly as the `projects` source
// will be. `validateInventory` is what earns the guarantees at runtime.

import type {
  AbsoluteUrl,
  BuildContext,
  CommitId,
  Project,
  ProjectId,
  RootRelativePath,
  Year,
} from "../../src/content";

export const pid = (s: string): ProjectId => s as ProjectId;
export const yr = (n: number): Year => n as Year;
export const url = (s: string): AbsoluteUrl => s as AbsoluteUrl;
export const rrp = (s: string): RootRelativePath => s as RootRelativePath;
export const commit = (s: string): CommitId => s as CommitId;

export const context: BuildContext = {
  commit: commit("0".repeat(40)),
  utcYear: yr(2026),
};

export function makeProject(overrides: Partial<Project> = {}): Project {
  const base: Project = {
    id: pid("base"),
    name: "Base",
    year: yr(2020),
    stage: "Prototype",
    line: "A base project, valid in every field.",
    home: { kind: "none" },
  };
  return { ...base, ...overrides };
}
