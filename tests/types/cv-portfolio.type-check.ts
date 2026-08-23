// S20 — type-level assertions, checked by `tsc --noEmit`. This file is
// compiled, never run.

import type {
  CvData,
  CvDocument,
  CvEra,
  CvOpenSource,
  CvProject,
  CvRole,
  PortfolioData,
  PortfolioDocument,
  RawCvDocument,
  RawCvEra,
  RawCvOpenSource,
  RawCvProject,
  RawCvRole,
  RawPortfolioDocument,
  RawTechNode,
  TechNode,
} from "../../src/content";

// S20.2 — the seven `Raw` twins carry exactly the key set of the shape they
// twin, asserted by `keyof` equality in both directions.
type KeysEqual<A, B> = keyof A extends keyof B ? (keyof B extends keyof A ? true : false) : false;

function assertKeysEqual<A, B>(_value: KeysEqual<A, B> extends true ? true : never): void {}

assertKeysEqual<RawCvRole, CvRole>(true);
assertKeysEqual<RawCvProject, CvProject>(true);
assertKeysEqual<RawCvOpenSource, CvOpenSource>(true);
assertKeysEqual<RawCvEra, CvEra>(true);
assertKeysEqual<RawCvDocument, CvDocument>(true);
assertKeysEqual<RawTechNode, TechNode>(true);
assertKeysEqual<RawPortfolioDocument, PortfolioDocument>(true);

// S20.1 — every list on CvDocument and PortfolioDocument is
// `readonly [T, ...T[]]`; an empty array fails assignment at each of the
// seventeen positions, each with its own `@ts-expect-error`.

// 1. CvDocument.header.links
// @ts-expect-error an empty array is not CvDocument["header"]["links"].
const emptyLinks: CvDocument["header"]["links"] = [];
void emptyLinks;

// 2. CvDocument.badges
// @ts-expect-error an empty array is not CvDocument["badges"].
const emptyBadges: CvDocument["badges"] = [];
void emptyBadges;

// 3. CvDocument.chips
// @ts-expect-error an empty array is not CvDocument["chips"].
const emptyChips: CvDocument["chips"] = [];
void emptyChips;

// 4. CvDocument.roles
// @ts-expect-error an empty array is not CvDocument["roles"].
const emptyRoles: CvDocument["roles"] = [];
void emptyRoles;

// 5. CvRole.achievements
// @ts-expect-error an empty array is not CvRole["achievements"].
const emptyAchievements: CvRole["achievements"] = [];
void emptyAchievements;

// 6. CvRole.tech
// @ts-expect-error an empty array is not CvRole["tech"].
const emptyRoleTech: CvRole["tech"] = [];
void emptyRoleTech;

// 7. CvDocument.education
// @ts-expect-error an empty array is not CvDocument["education"].
const emptyEducation: CvDocument["education"] = [];
void emptyEducation;

// 8. CvDocument.projects
// @ts-expect-error an empty array is not CvDocument["projects"].
const emptyCvProjects: CvDocument["projects"] = [];
void emptyCvProjects;

// 9. CvProject.tech
// @ts-expect-error an empty array is not CvProject["tech"].
const emptyProjectTech: CvProject["tech"] = [];
void emptyProjectTech;

// 10. CvDocument.openSource
// @ts-expect-error an empty array is not CvDocument["openSource"].
const emptyOpenSource: CvDocument["openSource"] = [];
void emptyOpenSource;

// 11. CvOpenSource.tech
// @ts-expect-error an empty array is not CvOpenSource["tech"].
const emptyOpenSourceTech: CvOpenSource["tech"] = [];
void emptyOpenSourceTech;

// 12. CvDocument.timelineProjects
// @ts-expect-error an empty array is not CvDocument["timelineProjects"].
const emptyTimelineProjects: CvDocument["timelineProjects"] = [];
void emptyTimelineProjects;

// 13. CvEra.projects
// @ts-expect-error an empty array is not CvEra["projects"].
const emptyEraProjects: CvEra["projects"] = [];
void emptyEraProjects;

// 14. PortfolioDocument.technologies
// @ts-expect-error an empty array is not PortfolioDocument["technologies"].
const emptyTechnologies: PortfolioDocument["technologies"] = [];
void emptyTechnologies;

// 15. TechNode.children (when present)
// @ts-expect-error an empty array is not TechNode["children"] when present.
const emptyChildren: readonly [TechNode, ...TechNode[]] = [];
void emptyChildren;

// 16. PortfolioDocument.projects
// @ts-expect-error an empty array is not PortfolioDocument["projects"].
const emptyPortfolioProjects: PortfolioDocument["projects"] = [];
void emptyPortfolioProjects;

// 17. PortfolioDocument.stats
// @ts-expect-error an empty array is not PortfolioDocument["stats"].
const emptyStats: PortfolioDocument["stats"] = [];
void emptyStats;

// S20.4 — the optional fields survive the Omit-based derivation:
// RawCvRole.website, RawCvOpenSource.link and RawTechNode.children are each
// still optional, asserted by a value omitting all three satisfying its Raw
// shape.
const roleWithoutWebsite: RawCvRole = {
  company: "",
  title: "",
  period: "",
  location: "",
  summary: "",
  achievements: [],
  tech: [],
};
void roleWithoutWebsite;

const openSourceWithoutLink: RawCvOpenSource = {
  title: "",
  description: "",
  impact: "",
  tech: [],
};
void openSourceWithoutLink;

const techNodeWithoutChildren: RawTechNode = { name: "" };
void techNodeWithoutChildren;

// S20.3 — widening holds and narrowing does not: CvDocument is assignable to
// RawCvDocument and PortfolioDocument to RawPortfolioDocument as plain
// assignments, while each reverse fails under @ts-expect-error.

declare const cvDoc: CvDocument;
declare const rawCv: RawCvDocument;
declare const portfolioDoc: PortfolioDocument;
declare const rawPortfolio: RawPortfolioDocument;

const cvAsRaw: RawCvDocument = cvDoc;
void cvAsRaw;

const portfolioAsRaw: RawPortfolioDocument = portfolioDoc;
void portfolioAsRaw;

// @ts-expect-error RawCvDocument is not assignable to CvDocument.
const rawAsCv: CvDocument = rawCv;
void rawAsCv;

// @ts-expect-error RawPortfolioDocument is not assignable to PortfolioDocument.
const rawAsPortfolio: PortfolioDocument = rawPortfolio;
void rawAsPortfolio;

// S20.8 — S15.9's brand assertion holds against the new pair: a
// RawCvDocument is not a CvData and a RawPortfolioDocument is not a
// PortfolioData, in binding position and in argument position, each caught
// below. The brand still gates provenance; what changed is that it now also
// carries shape.

declare function needsCvData(cv: CvData): void;
declare function needsPortfolioData(portfolio: PortfolioData): void;

// @ts-expect-error RawCvDocument is not assignable to CvData.
const badCv: CvData = rawCv;
void badCv;

// @ts-expect-error RawCvDocument is not a valid CvData argument.
needsCvData(rawCv);

// @ts-expect-error RawPortfolioDocument is not assignable to PortfolioData.
const badPortfolio: PortfolioData = rawPortfolio;
void badPortfolio;

// @ts-expect-error RawPortfolioDocument is not a valid PortfolioData argument.
needsPortfolioData(rawPortfolio);
