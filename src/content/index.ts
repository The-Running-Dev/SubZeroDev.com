// Content — public surface delivered by S1 through S5.

export type {
  AbsoluteUrl,
  Branded,
  BuildContext,
  CommitId,
  ContaminationForest,
  ContaminationNode,
  EcosystemGroup,
  EcosystemTree,
  Genre,
  Home,
  Inventory,
  Project,
  ProjectId,
  ResolvedHome,
  Result,
  RootRelativePath,
  Stage,
  StageCount,
  Year,
} from "./types";
export type { ContentError, ContentErrorCode } from "./errors";
export { stageOrder } from "./stage-order";
export { validateInventory } from "./validate";
export { resolvedHomes } from "./resolved-homes";
export { projects } from "./projects";
export { primarySlogan, apexFooterQuote } from "./copy";
export {
  contaminationForest,
  countByStage,
  ecosystemTree,
  projectTotal,
  sinceYear,
} from "./derivations";
