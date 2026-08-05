// Content — public surface delivered by S1, S2 and S3.
//
// The copy constants and the remaining derivation functions arrive in later
// slices; only what S1, S2 and S3 deliver is re-exported here.

export type {
  AbsoluteUrl,
  Branded,
  BuildContext,
  CommitId,
  Genre,
  Home,
  Inventory,
  Project,
  ProjectId,
  ResolvedHome,
  Result,
  RootRelativePath,
  Stage,
  Year,
} from "./types";
export type { ContentError, ContentErrorCode } from "./errors";
export { stageOrder } from "./stage-order";
export { validateInventory } from "./validate";
export { resolvedHomes } from "./resolved-homes";
export { projects } from "./projects";
