// A test helper that inspects a module's import graph. It exists so the Content
// import boundary (invariant C1) is asserted by a check that fails when an
// import escapes the module, rather than by convention alone.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

export type ImportViolation = { readonly file: string; readonly specifier: string };

export type SourceEntry = { readonly file: string; readonly source: string };

// `import ... from "x"`, `export ... from "x"`, and side-effect `import "x"`.
const FROM_RE = /(?:import|export)\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]/g;
const SIDE_EFFECT_RE = /\bimport\s*['"]([^'"]+)['"]/g;

export function importSpecifiers(source: string): string[] {
  const specifiers: string[] = [];
  for (const match of source.matchAll(FROM_RE)) specifiers.push(match[1]!);
  for (const match of source.matchAll(SIDE_EFFECT_RE)) specifiers.push(match[1]!);
  return specifiers;
}

export function listTsFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...listTsFiles(full));
    else if (entry.endsWith(".ts")) files.push(full);
  }
  return files;
}

export function readEntries(files: readonly string[]): SourceEntry[] {
  return files.map((file) => ({ file, source: readFileSync(file, "utf8") }));
}

// A violation is a relative import that resolves outside `root`. Bare specifiers
// (node builtins, external packages) are not repository modules and are ignored.
export function importViolations(
  root: string,
  entries: readonly SourceEntry[],
): ImportViolation[] {
  const rootAbs = resolve(root);
  const violations: ImportViolation[] = [];
  for (const { file, source } of entries) {
    for (const specifier of importSpecifiers(source)) {
      if (!specifier.startsWith(".")) continue;
      const resolved = resolve(dirname(file), specifier);
      if (relative(rootAbs, resolved).startsWith("..")) {
        violations.push({ file, specifier });
      }
    }
  }
  return violations;
}
