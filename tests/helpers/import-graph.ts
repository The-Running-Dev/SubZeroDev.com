// A test helper that inspects a module's import graph. It exists so the Content
// import boundary (invariant C1) is asserted by a check that fails when an
// import escapes the module, rather than by convention alone.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

import ts from "typescript";

export type ImportViolation = { readonly file: string; readonly specifier: string };

export type SourceEntry = { readonly file: string; readonly source: string };

// Walks the AST rather than scanning text, so specifiers in comments or strings
// are never mistaken for imports, and dynamic `import("x")` is not missed.
export function importSpecifiers(source: string): string[] {
  const sourceFile = ts.createSourceFile("source.ts", source, ts.ScriptTarget.Latest, true);
  const specifiers: string[] = [];

  const visit = (node: ts.Node): void => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length > 0 &&
      ts.isStringLiteral(node.arguments[0]!)
    ) {
      specifiers.push((node.arguments[0] as ts.StringLiteral).text);
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return specifiers;
}

// Directories skipped when walking — dependency, VCS and build output, never
// this repository's own source.
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
]);

export function listTsFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
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

// Resolves a relative module specifier the same way Node/TS would for this
// repository's `.ts` sources: a directory resolves to its `index.ts`, an
// extensionless file gains `.ts`.
function resolveModuleFile(fromFile: string, specifier: string): string {
  const target = resolve(dirname(fromFile), specifier);
  try {
    if (statSync(target).isDirectory()) return join(target, "index.ts");
  } catch {
    // not a directory (or doesn't exist) — fall through to extension handling
  }
  return target.endsWith(".ts") ? target : `${target}.ts`;
}

// The original (pre-alias) names bound by an import or re-export declaration's
// named clause, e.g. `{ projects }` or `{ projects as p }` both yield "projects".
function namedBindingNames(node: ts.Node): string[] {
  if (ts.isImportDeclaration(node) && node.importClause?.namedBindings) {
    const bindings = node.importClause.namedBindings;
    if (ts.isNamedImports(bindings)) {
      return bindings.elements.map((e) => (e.propertyName ?? e.name).text);
    }
  }
  if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
    return node.exportClause.elements.map((e) => (e.propertyName ?? e.name).text);
  }
  return [];
}

// Files that import or re-export `symbolName` from a specifier resolving to
// one of `targetFiles` (C14: who imports `projects`). `targetFiles` themselves
// are excluded — the module defining and re-exporting its own export is not a
// "user" of it, only every other consumer is.
export function namedImportUsers(
  entries: readonly SourceEntry[],
  targetFiles: readonly string[],
  symbolName: string,
): string[] {
  const targetAbs = new Set(targetFiles.map((f) => resolve(f)));
  const users = new Set<string>();
  for (const { file, source } of entries) {
    if (targetAbs.has(resolve(file))) continue;
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    const visit = (node: ts.Node): void => {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const specifier = node.moduleSpecifier.text;
        if (specifier.startsWith(".")) {
          const resolved = resolveModuleFile(file, specifier);
          if (targetAbs.has(resolved) && namedBindingNames(node).includes(symbolName)) {
            users.add(file);
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
  return [...users];
}
