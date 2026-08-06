// Verification — `assertStyleAgreement` (contract's Verification § public
// signatures, `X4`).
//
// Checked independently of Presentation's `primitives`: the invariant is
// that a class token in `bodyHtml` has a matching selector in `stylesheet`,
// and a class selector in `stylesheet` has a user in `bodyHtml`. The token
// block's `:root` rules carry no class selector, so they raise nothing
// without a special case — the class-selector pattern below cannot match a
// custom-property declaration or a bare `:root` rule.

import type { Result } from "../content";
import type { BodyHtml, StylesheetText } from "../presentation";
import type { VerificationError } from "./errors";

const CLASS_ATTR_PATTERN = /(?:^|\s)class="([^"]*)"/g;
const CLASS_SELECTOR_PATTERN = /\.([a-zA-Z][a-zA-Z0-9-]*)/g;
const RULE_PRELUDE_PATTERN = /([^{}]*)\{/g;

function bodyClasses(body: string): Set<string> {
  const found = new Set<string>();
  for (const match of body.matchAll(CLASS_ATTR_PATTERN)) {
    for (const token of match[1]!.split(/\s+/)) {
      if (token !== "") found.add(token);
    }
  }
  return found;
}

function stylesheetClassSelectors(stylesheet: string): Set<string> {
  const found = new Set<string>();
  for (const preludeMatch of stylesheet.matchAll(RULE_PRELUDE_PATTERN)) {
    const prelude = preludeMatch[1]!;
    for (const match of prelude.matchAll(CLASS_SELECTOR_PATTERN)) {
      found.add(match[1]!);
    }
  }
  return found;
}

export function assertStyleAgreement(
  bodyHtml: BodyHtml,
  stylesheet: StylesheetText,
): Result<null, VerificationError> {
  const classesInBody = bodyClasses(bodyHtml);
  const selectorsInStylesheet = stylesheetClassSelectors(stylesheet);

  const errors: VerificationError[] = [];

  for (const cls of classesInBody) {
    if (!selectorsInStylesheet.has(cls)) {
      errors.push({
        code: "ClassWithoutRule",
        detail: `class "${cls}" is used in bodyHtml but has no selector in stylesheet.`,
        observed: cls,
        expected: null,
      });
    }
  }

  for (const cls of selectorsInStylesheet) {
    if (!classesInBody.has(cls)) {
      errors.push({
        code: "SelectorWithoutUser",
        detail: `selector ".${cls}" appears in stylesheet but has no user in bodyHtml.`,
        observed: cls,
        expected: null,
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors: errors as [VerificationError, ...VerificationError[]] };
  }
  return { ok: true, value: null };
}
