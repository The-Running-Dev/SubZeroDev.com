// Content — public surface delivered by S1 and S2.
//
// The copy constants and the derivation functions arrive in later slices; only
// what S1 and S2 deliver is re-exported here.

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
  Result,
  RootRelativePath,
  Stage,
  Year,
} from "./types";
export type { ContentError, ContentErrorCode } from "./errors";
export { stageOrder } from "./stage-order";
export { validateInventory } from "./validate";
export { projects } from "./projects";
