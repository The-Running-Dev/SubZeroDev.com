// Content — the hand-authored project inventory (contract's `projects` export).
//
// The sole unvalidated entry point into the module's data (`C14`): nothing but
// the `validateInventory` call site and Verification's inventory assertion may
// import this. `validateInventory` earns every guarantee at runtime; this file
// carries none on its own.

import type { AbsoluteUrl, Project, ProjectId, RootRelativePath, Year } from "./types";

const id = (s: string): ProjectId => s as ProjectId;
const yr = (n: number): Year => n as Year;
const url = (s: string): AbsoluteUrl => s as AbsoluteUrl;
const rrp = (s: string): RootRelativePath => s as RootRelativePath;

const FOUNDED = yr(2026);

export const projects: readonly Project[] = [
  {
    id: id("documentation"),
    name: "Documentation",
    year: FOUNDED,
    stage: "Prototype",
    line: "Documentation infrastructure for projects that would otherwise eventually contain a README written under duress.",
    question: "I wonder if documentation could maintain itself.",
    home: {
      kind: "own",
      url: url("https://docs-template.subzerodev.com"),
    },
    genre: "Evidence",
  },
  {
    id: id("data-json-provider"),
    name: "JSON Data Provider",
    year: FOUNDED,
    stage: "Reusable",
    line: "Loads structured data from HTTP or files. Started inside Docs Template and escaped into its own package when apparently reading JSON needed infrastructure.",
    question: "Why does every project eventually need to load the same JSON in a slightly different way?",
    home: { kind: "none" },
    escapedFrom: id("documentation"),
  },
  {
    id: id("publishing"),
    name: "Publishing",
    year: FOUNDED,
    stage: "Reusable",
    line: "Started as somewhere to publish a blog post. Acquired workflows, automation and infrastructure before anyone intervened.",
    question: "I need somewhere to publish my blog.",
    home: {
      kind: "own",
      url: url("https://blog.subzerodev.com"),
    },
    genre: "Journal",
  },
  {
    id: id("blog-mcp"),
    name: "Blog MCP",
    year: FOUNDED,
    stage: "Infrastructure",
    line: "A control plane for publishing because apparently writing a blog post eventually requires a server protocol.",
    question: "Why shouldn't an agent be able to publish this?",
    home: {
      kind: "own",
      url: url("https://blogging.subzerodev.com"),
    },
    escapedFrom: id("publishing"),
  },
  {
    id: id("lucifer-chronicles"),
    name: "Lucifer Chronicles",
    year: FOUNDED,
    stage: "Escaped",
    line: "Field reports from reality, narrated by Lucifer because ordinary documentation proved inadequate.",
    question: "What if the absurd parts of life were documented completely seriously?",
    home: {
      kind: "within",
      parent: id("publishing"),
      path: rrp("/lucifer-chronicles"),
    },
    genre: "Field Reports",
    escapedFrom: id("publishing"),
  },
  {
    id: id("game-engine"),
    name: "Game Engine",
    year: FOUNDED,
    stage: "Reusable",
    line: "Started with one question about an old game. Somehow became a deterministic engine for building mechanics once and games repeatedly.",
    question: "I wonder how Jones in the Fast Lane actually works.",
    home: {
      kind: "own",
      url: url("https://game-engine.subzerodev.com"),
    },
    genre: "Documentary",
    escapedFrom: id("lucifer-chronicles"),
  },
  {
    id: id("suntrap"),
    name: "Sun Trap",
    year: FOUNDED,
    stage: "Prototype",
    line: "A resort-management satire where guests, plumbing, weather and basic geometry have formed an alliance against management.",
    question: "What happens when a resort simulation is allowed to behave like an actual resort?",
    home: {
      kind: "own",
      url: url("https://suntrap.subzerodev.com"),
    },
    escapedFrom: id("game-engine"),
  },
  {
    id: id("build-agent"),
    name: "Build Agent",
    year: FOUNDED,
    stage: "Infrastructure",
    line: "Build and release automation extracted from repeatedly teaching repositories how to perform the same ceremony.",
    question: "Why does every repository need to relearn how to build itself?",
    home: {
      kind: "own",
      url: url("https://build-agent.subzerodev.com"),
    },
  },
  {
    id: id("psgenerator"),
    name: "PSGenerator",
    year: FOUNDED,
    stage: "Reusable",
    line: "Turns container commands into PowerShell modules because remembering docker run arguments is not a personality trait.",
    question: "Why am I typing this command again?",
    home: {
      kind: "own",
      url: url("https://psgenerator.subzerodev.com"),
    },
  },
  {
    id: id("plugins-github"),
    name: "GitHub Plugin",
    year: FOUNDED,
    stage: "Infrastructure",
    line: "The first implementation of the plugin contract, subsequently sentenced to becoming the template for all the others.",
    question: "What if GitHub were just another capability behind a contract?",
    home: {
      kind: "own",
      url: url("https://plugins-github.subzerodev.com"),
    },
  },
  {
    id: id("platform"),
    name: "Platform",
    year: FOUNDED,
    stage: "Infrastructure",
    line: "Hosting, configuration, identity, notifications and observability extracted when several unrelated projects independently demanded the same machinery.",
    question: "Why am I building this again?",
    home: {
      kind: "own",
      url: url("https://platform.subzerodev.com"),
    },
    genre: "Status Page",
  },
  {
    id: id("workspace"),
    name: "Workspace",
    year: FOUNDED,
    stage: "Reusable",
    line: "The environment every new machine receives before it's trusted with repositories, tools or opinions.",
    question: "Why does setting up a development machine still involve archaeology?",
    home: {
      kind: "own",
      url: url("https://workspace.subzerodev.com"),
    },
  },
  {
    id: id("agentkit"),
    name: "AgentKit",
    year: FOUNDED,
    stage: "Reusable",
    line: "Repository-installed agent infrastructure that eventually became capable of finding bugs in itself and filing the paperwork.",
    question: "What if the repository could tell the agent how to work here?",
    home: {
      kind: "own",
      url: url("https://agentkit.subzerodev.com"),
    },
  },
  {
    id: id("git-service"),
    name: "Git Service",
    year: FOUNDED,
    stage: "Prototype",
    line: "Turns Git repositories into an API, workflow surface and MCP capability because apparently Git needed another abstraction layer.",
    question: "What if agents didn't need direct filesystem access to work with repositories?",
    home: { kind: "none" },
  },
  {
    id: id("review-agent"),
    name: "Review Agent",
    year: FOUNDED,
    stage: "Curiosity",
    line: "An attempt to replace an increasingly expensive stream of automated code reviews with an increasingly elaborate stream of our own.",
    question: "Why am I paying this much for something an agent can probably do?",
    home: { kind: "none" },
  },
  {
    id: id("container-manager"),
    name: "Container Manager",
    year: FOUNDED,
    stage: "Prototype",
    line: "Container management tooling for the point where remembering which machine is running what stops being a viable operating model.",
    question: "What's actually running where?",
    home: { kind: "none" },
  },
  {
    id: id("docker-watchdog"),
    name: "Docker Watchdog",
    year: FOUNDED,
    stage: "Reusable",
    line: "Watches containers because apparently keeping software alive also became software.",
    question: "Who watches the containers?",
    home: { kind: "none" },
  },
  {
    id: id("winget"),
    name: "WinGet",
    year: FOUNDED,
    stage: "Reusable",
    line: "A C# wrapper around the WinGet COM API because parsing winget.exe output was never going to become less ridiculous.",
    question: "There is a COM API. Why are we parsing console output?",
    home: {
      kind: "own",
      url: url("https://winget.subzerodev.com"),
    },
  },
  {
    id: id("portfolio"),
    name: "Portfolio",
    year: FOUNDED,
    stage: "Curiosity",
    line: "Evidence that a conventional portfolio was considered before considerably less conventional things happened.",
    question: "I suppose I should have a portfolio?",
    home: {
      kind: "own",
      url: url("https://portfolio.subzerodev.com"),
    },
  },
  {
    id: id("ogres-kitchen"),
    name: "Ogre's Kitchen",
    year: FOUNDED,
    stage: "Curiosity",
    line: "No repository. No subdomain. No implementation. The name has nevertheless survived every opportunity to kill it.",
    question: "I wonder what happens if an ogre opens a restaurant.",
    home: { kind: "none" },
  },
];