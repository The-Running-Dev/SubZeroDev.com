// Content — public surface delivered by S1 through S6.

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
  Testimonial,
  Testimonials,
  Year,
} from "./types";
export type { ContentError, ContentErrorCode } from "./errors";
export { stageOrder } from "./stage-order";
export { validateInventory, validateTestimonials } from "./validate";
export { parseCommitId } from "./commit";
export { resolvedHomes } from "./resolved-homes";
export { projects } from "./projects";
export { testimonials } from "./testimonials";
export { primarySlogan, apexFooterQuote } from "./copy";
export { sourceUrl } from "./links";
export {
  contaminationForest,
  countByStage,
  ecosystemTree,
  projectTotal,
  sinceYear,
  testimonialTotal,
} from "./derivations";
