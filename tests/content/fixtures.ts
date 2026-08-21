// Fixture builders for Content tests. Brands are compile-time only, so branded
// values are cast at the authoring site here — exactly as the `projects` source
// will be. `validateInventory` is what earns the guarantees at runtime.

import type {
  AbsoluteUrl,
  BuildContext,
  CommitId,
  CvDocument,
  PortfolioDocument,
  Project,
  ProjectId,
  RootRelativePath,
  Testimonial,
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

export const TEST_ORIGIN = "https://subzerodev.com";

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

export function makeTestimonial(overrides: Partial<Testimonial> = {}): Testimonial {
  const base: Testimonial = {
    quote: "A base testimonial, valid in every field.",
    author: "Base Author",
  };
  return { ...base, ...overrides };
}

// A CV document valid in every field, for tests that mutate one path to
// provoke a single ContentError. `year` sits at 2020 so it never fails
// CvYearAfterBuild against `context.utcYear` (2026) by coincidence.
export function makeCv(): CvDocument {
  return {
    header: {
      name: "Base Person",
      title: "Base Title",
      email: "base@example.com",
      phone: "+1 555 0100",
      links: [{ label: "GitHub", href: url("https://github.com/example") }],
    },
    about: { title: "About", body: "A base bio." },
    badges: ["TypeScript"],
    chips: ["Builder"],
    timelineTitle: "Experience",
    roles: [
      {
        company: "Base Co",
        title: "Engineer",
        period: "2020 – Present",
        location: "Remote",
        website: url("https://base.example.com"),
        summary: "Did base things.",
        achievements: ["Shipped a base feature"],
        tech: ["TypeScript"],
      },
    ],
    educationTitle: "Education",
    education: [{ school: "Base University", degree: "B.S.", details: "Base details." }],
    projectsTitle: "Projects",
    projects: [
      {
        title: "Base Project",
        link: url("https://github.com/example/base"),
        description: "A base project.",
        tech: ["TypeScript"],
        year: yr(2020),
      },
    ],
    openSourceTitle: "Open Source",
    openSource: [
      {
        title: "Base Contribution",
        link: url("https://github.com/example/contrib"),
        description: "A base contribution.",
        impact: "Base impact.",
        tech: ["TypeScript"],
      },
    ],
    timelineProjectsTitle: "Timeline",
    timelineProjects: [{ period: "2020", focus: "Base focus", projects: ["Base Project"] }],
    quote: "A base quote.",
  };
}

// A portfolio document valid in every field.
export function makePortfolio(): PortfolioDocument {
  return {
    header: { title: "Portfolio", subtitle: "Base subtitle" },
    technologies: [
      { name: "Backend", children: [{ name: "TypeScript" }] },
      { name: "Frontend", children: [{ name: "React" }] },
    ],
    projects: [{ category: "Web", icon: "🌐", description: "Base web projects." }],
    stats: [{ value: "1+", label: "Base Stat" }],
  };
}
