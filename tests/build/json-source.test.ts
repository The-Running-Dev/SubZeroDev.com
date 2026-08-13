import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");
const cliPath = resolve(repoRoot, "node_modules/subzerodev-platform-ui-landing-page/dist/cli.js");
const adapterPath = "tests/build/fixtures/json-source-adapter.config.ts";

let directory: string;

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "szd-json-data-"));
});

afterEach(() => {
  rmSync(directory, { recursive: true, force: true });
});

it("reports both invalid source documents, skips composition, and emits no HTML", () => {
  const projects = join(directory, "projects.json").replaceAll("\\", "/");
  const testimonials = join(directory, "testimonials.json").replaceAll("\\", "/");
  const sourceMap = join(directory, "sources.public.yml");
  const outDir = join(directory, "dist");
  const marker = join(directory, "composed");

  writeFileSync(projects, JSON.stringify({ version: 1, projects: [{ id: "Bad Id", name: "", year: 10000, stage: "Prototype", line: "", home: { kind: "none" } }] }));
  writeFileSync(testimonials, JSON.stringify({ version: 1, testimonials: [{ quote: "", author: "" }] }));
  writeFileSync(sourceMap, `version: 1\nsources:\n  projects:\n    at: build\n    path: ${projects}\n    cache: manual\n  testimonials:\n    at: build\n    path: ${testimonials}\n    cache: manual\n`);

  const result = spawnSync(process.execPath, [cliPath, "build", "--adapter", adapterPath, "--source-map", sourceMap, "--out-dir", outDir], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, CONFIG_MARKER: marker },
  });

  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain("Adapter source 'projects' ('projects') failed");
  expect(result.stderr).toContain("MalformedProjectId");
  expect(result.stderr).toContain("Adapter source 'testimonials' ('testimonials') failed");
  expect(result.stderr).toContain("TestimonialQuoteEmpty");
  expect(existsSync(marker)).toBe(false);
  const emitted = existsSync(outDir) ? readdirSync(outDir, { recursive: true }) : [];
  expect(emitted.filter((entry) => String(entry).endsWith(".html"))).toEqual([]);
});
