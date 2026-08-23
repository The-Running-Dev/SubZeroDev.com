// Content — public surface delivered by S1 through S6.

export type {
  AbsoluteUrl,
  Branded,
  BuildContext,
  CheckedLink,
  CommitId,
  ContaminationForest,
  ContaminationNode,
  CvData,
  CvDocument,
  CvEducation,
  CvEra,
  CvLink,
  CvOpenSource,
  CvProject,
  CvRole,
  EcosystemGroup,
  EcosystemTree,
  Genre,
  Home,
  Inventory,
  LinkCheckExemption,
  PortfolioCategory,
  PortfolioData,
  PortfolioDocument,
  PortfolioStat,
  Project,
  ProjectId,
  ResolvedHome,
  Result,
  RootRelativePath,
  Stage,
  StageCount,
  TechNode,
  Testimonial,
  Testimonials,
  Year,
} from "./types";
export type { ContentError, ContentErrorCode } from "./errors";
export { stageOrder } from "./stage-order";
export { validateCv, validateInventory, validatePortfolio, validateTestimonials } from "./validate";
export { parseCommitId } from "./commit";
export {
  cvDocumentValidator,
  portfolioDocumentValidator,
  projectsDocumentValidator,
  testimonialsDocumentValidator,
} from "./documents";
export { resolvedHomes } from "./resolved-homes";
export { checkedLinks, cvOutboundLinks, linkCheckExemptions } from "./checked-links";
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
