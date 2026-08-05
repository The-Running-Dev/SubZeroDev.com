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
    line: "The thing every project needs and nobody enjoys writing, generated instead of authored.",
    question: "I wonder if documentation could write itself.",
    home: { kind: "own", url: url("https://docs-template.subzerodev.com") },
    genre: "Evidence",
  },
  {
    id: id("publishing"),
    name: "Publishing",
    year: FOUNDED,
    stage: "Reusable",
    line: "Started as somewhere to put one blog post. Never really stopped.",
    question: "I need somewhere to publish my blog.",
    home: { kind: "own", url: url("https://blog.subzerodev.com") },
    genre: "Journal",
    escapedFrom: id("documentation"),
  },
  {
    id: id("automation"),
    name: "Automation",
    year: FOUNDED,
    stage: "Prototype",
    line: "The automation publishing turned out to require, once doing it by hand stopped being funny.",
    question: "I wonder how many times a publish script gets copy-pasted before it becomes a product.",
    home: { kind: "own", url: url("https://build-agent.subzerodev.com") },
    escapedFrom: id("publishing"),
  },
  {
    id: id("lucifer-chronicles"),
    name: "Lucifer Chronicles",
    year: FOUNDED,
    stage: "Escaped",
    line: "Dialogue that walked out of the blog's comment section and never came back.",
    home: { kind: "within", parent: id("publishing"), path: rrp("/lucifer-chronicles") },
    genre: "Field Reports",
    escapedFrom: id("publishing"),
  },
  {
    id: id("game-engine"),
    name: "Game Engine",
    year: FOUNDED,
    stage: "Reusable",
    line: "Built to answer one question about a driving game, and generalized because stopping seemed like more work.",
    question: "I wonder how Jones in the Fast Lane actually works.",
    home: { kind: "own", url: url("https://game-engine.subzerodev.com") },
    genre: "Documentary",
    escapedFrom: id("lucifer-chronicles"),
  },
  {
    id: id("suntrap"),
    name: "Sun Trap",
    year: FOUNDED,
    stage: "Prototype",
    line: "A resort-management satire in which people, plumbing, weather and basic geometry have formed an alliance against the player.",
    question: "I wonder how a resort simulation survives contact with actual players.",
    home: { kind: "own", url: url("https://suntrap.subzerodev.com") },
    escapedFrom: id("game-engine"),
  },
  {
    id: id("psgenerator"),
    name: "PSGenerator",
    year: FOUNDED,
    stage: "Reusable",
    line: "Turns a container image and a command list into a PowerShell module, so nobody has to remember the docker run line.",
    home: { kind: "own", url: url("https://psgenerator.subzerodev.com") },
    escapedFrom: id("automation"),
  },
  {
    id: id("plugins-github"),
    name: "GitHub Plugin",
    year: FOUNDED,
    stage: "Infrastructure",
    line: "The first plugin under the contract, and the one every later plugin gets scaffolded from.",
    home: { kind: "own", url: url("https://plugins-github.subzerodev.com") },
    escapedFrom: id("automation"),
  },
  {
    id: id("blog-mcp"),
    name: "Blog MCP",
    year: FOUNDED,
    stage: "Infrastructure",
    line: "The blog's own control room, exposed as a server because one blog post needed managing and then several did.",
    home: { kind: "own", url: url("https://blogging.subzerodev.com") },
    escapedFrom: id("publishing"),
  },
  {
    id: id("platform"),
    name: "Platform",
    year: FOUNDED,
    stage: "Infrastructure",
    line: "The hosting, configuration, identity and observability layer two unrelated products needed at the same time, extracted before either noticed.",
    home: { kind: "own", url: url("https://platform.subzerodev.com") },
    genre: "Status Page",
  },
  {
    id: id("workspace"),
    name: "Workspace",
    year: FOUNDED,
    stage: "Reusable",
    line: "The setup script every new machine runs before it's trusted with an opinion.",
    home: { kind: "own", url: url("https://workspace.subzerodev.com") },
  },
  {
    id: id("winget"),
    name: "WinGet",
    year: FOUNDED,
    stage: "Reusable",
    line: "A C# wrapper around the WinGet COM API, so nobody has to parse winget.exe's console output again.",
    home: { kind: "own", url: url("https://winget.subzerodev.com") },
  },
  {
    id: id("portfolio"),
    name: "Portfolio",
    year: FOUNDED,
    stage: "Curiosity",
    line: "Exists mainly to establish that a portfolio was considered.",
    home: { kind: "own", url: url("https://portfolio.subzerodev.com") },
  },
  {
    id: id("ogres-kitchen"),
    name: "Ogre's Kitchen",
    year: FOUNDED,
    stage: "Curiosity",
    line: "No repository. No subdomain. Only the name has escaped containment so far.",
    question: "I wonder what happens if an ogre opens a restaurant.",
    home: { kind: "none" },
  },
];
