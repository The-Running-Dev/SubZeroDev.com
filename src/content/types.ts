// Content — the shared and Content-owned types.
//
// Content imports no other repository module (invariant C1). Every type here is
// a compile-time constant shape; nothing is persisted and nothing performs I/O.

declare const brandTag: unique symbol;

export type Branded<T, B extends string> = T & { readonly [brandTag]: B };

export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly errors: readonly [E, ...E[]] };

export type ProjectId = Branded<string, "ProjectId">;

export type Year = Branded<number, "Year">;

export type AbsoluteUrl = Branded<string, "AbsoluteUrl">;

export type RootRelativePath = Branded<string, "RootRelativePath">;

export type CommitId = Branded<string, "CommitId">;

export type Stage =
  | "Curiosity"
  | "Prototype"
  | "Architecture"
  | "Infrastructure"
  | "Reusable"
  | "Escaped";

export type Genre =
  | "Documentary"
  | "Status Page"
  | "Story"
  | "Evidence"
  | "Journal"
  | "Field Reports"
  | "Comedy";

export type Home =
  | { readonly kind: "own"; readonly url: AbsoluteUrl }
  | { readonly kind: "within"; readonly parent: ProjectId; readonly path: RootRelativePath }
  | { readonly kind: "none" };

export type Project = {
  readonly id: ProjectId;
  readonly name: string;
  readonly year: Year;
  readonly stage: Stage;
  readonly question?: string;
  readonly line: string;
  readonly home: Home;
  readonly genre?: Genre;
  readonly escapedFrom?: ProjectId;
};

// The one value only `validateInventory` can produce: a non-empty inventory.
// A raw `readonly Project[]` is deliberately not assignable to this, so the
// non-empty guarantee cannot be dropped without the typechecker noticing.
export type Inventory = readonly [Project, ...Project[]];

export type BuildContext = {
  readonly commit: CommitId;
  readonly utcYear: Year;
};

export type Testimonial = {
  readonly quote: string;
  readonly author: string;
  readonly role?: string;
  readonly organization?: string;
  readonly url?: string;
};

// The one value only `validateTestimonials` can produce: a non-empty collection.
export type Testimonials = readonly [Testimonial, ...Testimonial[]];

export type ResolvedHome = {
  readonly projectId: ProjectId;
  readonly url: AbsoluteUrl;
};

export type CheckedLink = {
  readonly label: string;
  readonly url: AbsoluteUrl;
};

export type StageCount = {
  readonly stage: Stage;
  readonly count: number;
};

export type EcosystemGroup = {
  readonly stage: Stage;
  readonly projects: readonly Project[];
};

export type EcosystemTree = readonly EcosystemGroup[];

export type ContaminationNode = {
  readonly project: Project;
  readonly escapes: readonly ContaminationNode[];
};

export type ContaminationForest = readonly ContaminationNode[];

export type CvLink = {
  readonly label: string;
  readonly href: AbsoluteUrl;
};

export type CvRole = {
  readonly company: string;
  readonly title: string;
  readonly period: string;
  readonly location: string;
  readonly website?: AbsoluteUrl;
  readonly summary: string;
  readonly achievements: readonly [string, ...string[]];
  readonly tech: readonly [string, ...string[]];
};

export type CvEducation = {
  readonly school: string;
  readonly degree: string;
  readonly details: string;
};

export type CvProject = {
  readonly title: string;
  readonly link: AbsoluteUrl;
  readonly description: string;
  readonly tech: readonly [string, ...string[]];
  readonly year: Year;
};

export type CvOpenSource = {
  readonly title: string;
  readonly link?: AbsoluteUrl;
  readonly description: string;
  readonly impact: string;
  readonly tech: readonly [string, ...string[]];
};

export type CvEra = {
  readonly period: string;
  readonly focus: string;
  readonly projects: readonly [string, ...string[]];
};

export type CvDocument = {
  readonly header: {
    readonly name: string;
    readonly title: string;
    readonly email: string;
    readonly phone: string;
    readonly links: readonly [CvLink, ...CvLink[]];
  };
  readonly about: { readonly title: string; readonly body: string };
  readonly badges: readonly [string, ...string[]];
  readonly chips: readonly [string, ...string[]];
  readonly timelineTitle: string;
  readonly roles: readonly [CvRole, ...CvRole[]];
  readonly educationTitle: string;
  readonly education: readonly [CvEducation, ...CvEducation[]];
  readonly projectsTitle: string;
  readonly projects: readonly [CvProject, ...CvProject[]];
  readonly openSourceTitle: string;
  readonly openSource: readonly [CvOpenSource, ...CvOpenSource[]];
  readonly timelineProjectsTitle: string;
  readonly timelineProjects: readonly [CvEra, ...CvEra[]];
  readonly quote: string;
};

// The one value only `validateCv` can produce.
export type CvData = Branded<CvDocument, "CvData">;

export type TechNode = {
  readonly name: string;
  readonly children?: readonly [TechNode, ...TechNode[]];
};

export type PortfolioCategory = {
  readonly category: string;
  readonly icon: string;
  readonly description: string;
};

export type PortfolioStat = {
  readonly value: string;
  readonly label: string;
};

export type PortfolioDocument = {
  readonly header: { readonly title: string; readonly subtitle: string };
  readonly technologies: readonly [TechNode, ...TechNode[]];
  readonly projects: readonly [PortfolioCategory, ...PortfolioCategory[]];
  readonly stats: readonly [PortfolioStat, ...PortfolioStat[]];
};

// The one value only `validatePortfolio` can produce.
export type PortfolioData = Branded<PortfolioDocument, "PortfolioData">;
