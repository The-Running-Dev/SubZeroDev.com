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

// A violation is a file outside `targetDir` whose relative import resolves
// inside it — the inverse of `importViolations`, which checks that a module
// stays inside its own boundary rather than that nothing reaches in. Used for
// "nothing imports Verification" (contract's Verification § public
// signatures), where the boundary is enforced on importers, not the module
// itself.
export function importsIntoDir(
  targetDir: string,
  entries: readonly SourceEntry[],
): ImportViolation[] {
  const targetAbs = resolve(targetDir);
  const isInsideTarget = (file: string): boolean =>
    !relative(targetAbs, resolve(file)).startsWith("..");

  const violations: ImportViolation[] = [];
  for (const { file, source } of entries) {
    if (isInsideTarget(file)) continue;
    for (const specifier of importSpecifiers(source)) {
      if (!specifier.startsWith(".")) continue;
      const resolved = resolve(dirname(file), specifier);
      if (isInsideTarget(resolved)) {
        violations.push({ file, specifier });
      }
    }
  }
  return violations;
}

// The original (pre-alias) names bound by a named clause, e.g. `{ projects }`
// or `{ projects as p }` both yield "projects".
export function namedBindingNames(clause: ts.NamedImports | ts.NamedExports): string[] {
  return clause.elements.map((e) => (e.propertyName ?? e.name).text);
}

// Maps each import specifier used in `source` to the set of names it binds —
// used for exact-surface checks like Adapter's import list (A3, S6.7). A
// namespace import binds the sentinel "*", since no finite name list could
// describe what it grants.
export function importedNamesBySpecifier(source: string): Map<string, Set<string>> {
  const sourceFile = ts.createSourceFile("source.ts", source, ts.ScriptTarget.Latest, true);
  const result = new Map<string, Set<string>>();

  const add = (specifier: string, names: readonly string[]): void => {
    const set = result.get(specifier) ?? new Set<string>();
    for (const name of names) set.add(name);
    result.set(specifier, set);
  };

  const visit = (node: ts.Node): void => {
    if (
      ts.isImportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const names: string[] = [];
      if (node.importClause?.name) names.push("default");
      const bindings = node.importClause?.namedBindings;
      if (bindings && ts.isNamespaceImport(bindings)) names.push("*");
      else if (bindings) names.push(...namedBindingNames(bindings));
      add(node.moduleSpecifier.text, names);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return result;
}

// A violation is a relative import from a file inside `dir` that escapes to
// somewhere outside both `dir` and every directory in `allowedDirs` — no
// restriction on which names are bound within an allowed directory. Used for
// X2's first half: Composition may import Content and Presentation, and
// nothing else.
export function importViolationsAllowing(
  dir: string,
  entries: readonly SourceEntry[],
  allowedDirs: readonly string[],
): ImportViolation[] {
  const roots = [dir, ...allowedDirs].map((d) => resolve(d));
  const violations: ImportViolation[] = [];
  for (const { file, source } of entries) {
    for (const specifier of importSpecifiers(source)) {
      if (!specifier.startsWith(".")) continue;
      const resolved = resolve(dirname(file), specifier);
      const insideAny = roots.some((root) => !relative(root, resolved).startsWith(".."));
      if (!insideAny) violations.push({ file, specifier });
    }
  }
  return violations;
}

// A violation is a relative import from a file inside `dir` that either
// escapes to somewhere outside both `dir` and `allowedDir`, or reaches into
// `allowedDir` but binds a name outside `allowedNames` — including a
// namespace import, a dynamic import or an `export *`, each of which grants
// the whole module rather than a name on the list. Used for Presentation's
// "imports `Branded` from Content and nothing else" (S4.14).
export function foreignImportsNamedOutside(
  dir: string,
  entries: readonly SourceEntry[],
  allowedDir: string,
  allowedNames: readonly string[],
): ImportViolation[] {
  const dirAbs = resolve(dir);
  const allowedAbs = resolve(allowedDir);
  const violations: ImportViolation[] = [];

  const boundNames = (
    node: ts.ImportDeclaration | ts.ExportDeclaration,
  ): readonly string[] | "namespace" => {
    if (ts.isImportDeclaration(node)) {
      const names: string[] = node.importClause?.name ? ["default"] : [];
      const nb = node.importClause?.namedBindings;
      if (nb && ts.isNamespaceImport(nb)) return "namespace";
      if (nb) names.push(...namedBindingNames(nb));
      return names;
    }
    if (!node.exportClause) return "namespace"; // export * from "x"
    if (ts.isNamespaceExport(node.exportClause)) return "namespace"; // export * as ns from "x"
    return namedBindingNames(node.exportClause);
  };

  for (const { file, source } of entries) {
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    const visit = (node: ts.Node): void => {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const specifier = node.moduleSpecifier.text;
        if (specifier.startsWith(".")) {
          const resolved = resolve(dirname(file), specifier);
          const insideOwn = !relative(dirAbs, resolved).startsWith("..");
          if (!insideOwn) {
            const insideAllowed = !relative(allowedAbs, resolved).startsWith("..");
            if (!insideAllowed) {
              violations.push({ file, specifier });
            } else {
              const names = boundNames(node);
              if (names === "namespace" || names.some((n) => !allowedNames.includes(n))) {
                violations.push({ file, specifier });
              }
            }
          }
        }
      } else if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.length > 0 &&
        ts.isStringLiteral(node.arguments[0]!)
      ) {
        const specifier = (node.arguments[0] as ts.StringLiteral).text;
        if (specifier.startsWith(".")) {
          const resolved = resolve(dirname(file), specifier);
          const insideOwn = !relative(dirAbs, resolved).startsWith("..");
          // A dynamic import grants the whole module namespace regardless of
          // how the caller destructures it, so it is always a violation once
          // it escapes `dir` — there is no name list it could satisfy.
          if (!insideOwn) violations.push({ file, specifier });
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
  return violations;
}

// Whether a declaration whose specifier resolves to a target module grants the
// importing file access to `symbolName`. Naming it is only one of the ways:
// `import * as ns` grants it as `ns.<symbolName>`, and `export *` re-exports it
// without ever naming it. Both reach the value, so both are users. This fails
// closed — an unrecognised clause shape is not silently treated as safe.
function grantsAccess(
  node: ts.ImportDeclaration | ts.ExportDeclaration,
  symbolName: string,
): boolean {
  if (ts.isImportDeclaration(node)) {
    const bindings = node.importClause?.namedBindings;
    if (!bindings) return false; // `import "x"` or a default-only import
    if (ts.isNamespaceImport(bindings)) return true; // import * as ns from "x"
    return namedBindingNames(bindings).includes(symbolName);
  }
  if (!node.exportClause) return true; // export * from "x"
  if (ts.isNamespaceExport(node.exportClause)) return true; // export * as ns from "x"
  return namedBindingNames(node.exportClause).includes(symbolName);
}

// Files that can reach `symbolName` from a specifier resolving to one of
// `targetFiles` (C14: who imports `projects`). `targetFiles` themselves are
// excluded — the module defining and re-exporting its own export is not a
// "user" of it, only every other consumer is.
//
// "Can reach" is deliberately wider than "names in a clause". A namespace
// import, an `export *` re-export and a dynamic `import()` each hand over the
// module's whole surface, so each is a user even though none writes the symbol
// down. An invariant check that only understood named clauses would report a
// clean graph while `import * as content` read the same value.
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
    const targets = (specifier: string): boolean =>
      specifier.startsWith(".") && targetAbs.has(resolveModuleFile(file, specifier));
    const visit = (node: ts.Node): void => {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        if (targets(node.moduleSpecifier.text) && grantsAccess(node, symbolName)) {
          users.add(file);
        }
      } else if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.length > 0 &&
        ts.isStringLiteral(node.arguments[0]!)
      ) {
        // A dynamic import resolves to the whole module namespace, so it reaches
        // every export regardless of how the caller destructures the result.
        if (targets((node.arguments[0] as ts.StringLiteral).text)) users.add(file);
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
  return [...users];
}
