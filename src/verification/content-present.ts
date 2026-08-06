// Verification — `assertContentPresent` (contract's Verification § public
// signatures, `V3`).
//
// Both lists are compared as literal text against the document, with
// scripting never executed — a manifesto sentence or a project `name`
// containing `&`, `<` or `>` will have been HTML-escaped by Composition's
// `X5` and will therefore not match. Accepted per the contract: the failure
// is a red build naming the value, not a silent pass.

import type { Inventory, Result } from "../content";
import type { VerificationError } from "./errors";

export function assertContentPresent(
  documentHtml: string,
  manifestoSentences: readonly [string, ...string[]],
  inventory: Inventory,
): Result<null, VerificationError> {
  const errors: VerificationError[] = [];

  for (const sentence of manifestoSentences) {
    if (!documentHtml.includes(sentence)) {
      errors.push({
        code: "ManifestoAbsent",
        detail: `manifesto sentence not found in the document: "${sentence}"`,
        observed: null,
        expected: sentence,
      });
    }
  }

  for (const project of inventory) {
    if (!documentHtml.includes(project.name)) {
      errors.push({
        code: "ProjectNameAbsent",
        detail: `project name not found in the document: "${project.name}"`,
        observed: null,
        expected: project.name,
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors: errors as [VerificationError, ...VerificationError[]] };
  }
  return { ok: true, value: null };
}
