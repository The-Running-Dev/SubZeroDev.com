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
