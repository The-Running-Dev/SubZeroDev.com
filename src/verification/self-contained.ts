// Verification — `assertSelfContained` (contract's Verification § public
// signatures, `V13`).
//
// Three faults, each independent of the other two: a `<script>` element that
// is not the single permitted `application/ld+json` block, a linked
// stylesheet rather than an inlined one, and any other element that loads a
// resource by URL rather than by data URI. `<link rel="canonical">` is
// excluded — it names the document's own address and the browser never
// fetches it — and `<a href>` is excluded outright, since an outbound link a
// reader might click is not an asset the page loads. Every fault found is
// reported; the function never stops at the first.

import type { Result } from "../content";
import type { VerificationError } from "./errors";

// Matched non-greedily against a closing tag so a malformed or unclosed
// `<script>` still surfaces: its opening tag is counted by
// `SCRIPT_OPEN_PATTERN` but produces no match here, so the two counts
// disagree and the loop below flags it as an extra script element (V13, X6).
const SCRIPT_TAG_PATTERN = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const SCRIPT_OPEN_PATTERN = /<script\b/gi;
const LINK_TAG_PATTERN = /<link\b([^>]*)>/gi;
// Every other tag's own `src` attribute — a `<script src>` is excluded because
// it is already reported once as ScriptElementPresent, not a second time as an
// asset reference.
const OTHER_SRC_TAG_PATTERN = /<(?!script\b)[a-zA-Z][a-zA-Z0-9-]*\b([^>]*)>/gi;
const SRC_ATTR_PATTERN = /\bsrc=["']([^"']*)["']/i;
const TYPE_ATTR_PATTERN = /\btype=["']([^"']*)["']/i;
const REL_ATTR_PATTERN = /\brel=["']([^"']*)["']/i;
const HREF_ATTR_PATTERN = /\bhref=["']([^"']*)["']/i;
const CLOSE_SCRIPT_SEQUENCE = /<\/script/i;
const LD_JSON_TYPE = "application/ld+json";

function isDataUri(value: string): boolean {
  return value.startsWith("data:");
}

export function assertSelfContained(documentHtml: string): Result<null, VerificationError> {
  const errors: VerificationError[] = [];

  const openCount = (documentHtml.match(SCRIPT_OPEN_PATTERN) ?? []).length;
  let matchedCount = 0;
  let permittedCount = 0;

  for (const match of documentHtml.matchAll(SCRIPT_TAG_PATTERN)) {
    matchedCount++;
    const attrs = match[1]!;
    const content = match[2]!;
    const type = TYPE_ATTR_PATTERN.exec(attrs)?.[1];
    const hasSrc = SRC_ATTR_PATTERN.test(attrs);
    const hasForbiddenCloseSequence = CLOSE_SCRIPT_SEQUENCE.test(content);
    const isPermitted = type === LD_JSON_TYPE && !hasSrc && !hasForbiddenCloseSequence;

    if (isPermitted) {
      permittedCount++;
    }
    if (!isPermitted || permittedCount > 1) {
      errors.push({
        code: "ScriptElementPresent",
        detail:
          "the document contains a <script> element that is not the single permitted application/ld+json block.",
        observed: null,
        expected: null,
      });
    }
  }

  if (matchedCount < openCount) {
    errors.push({
      code: "ScriptElementPresent",
      detail: "the document contains a <script> opening tag with no matching closing tag.",
      observed: null,
      expected: null,
    });
  }

  for (const match of documentHtml.matchAll(OTHER_SRC_TAG_PATTERN)) {
    const src = SRC_ATTR_PATTERN.exec(match[1]!)?.[1];
    if (src !== undefined && !isDataUri(src)) {
      errors.push({
        code: "ExternalAssetReference",
        detail: `an element references an asset by src other than a data URI: "${src}".`,
        observed: src,
        expected: null,
      });
    }
  }

  for (const match of documentHtml.matchAll(LINK_TAG_PATTERN)) {
    const attrs = match[1]!;
    const rel = REL_ATTR_PATTERN.exec(attrs)?.[1] ?? "";
    const href = HREF_ATTR_PATTERN.exec(attrs)?.[1];
    if (href === undefined) continue;

    if (rel === "stylesheet") {
      errors.push({
        code: "LinkedStylesheetPresent",
        detail: `the document links a stylesheet rather than inlining it: "${href}".`,
        observed: href,
        expected: null,
      });
      continue;
    }

    if (rel === "canonical") continue; // the document's own address, never fetched

    if (!isDataUri(href)) {
      errors.push({
        code: "ExternalAssetReference",
        detail: `a <link> references an asset by href other than a data URI: "${href}".`,
        observed: href,
        expected: null,
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors: errors as [VerificationError, ...VerificationError[]] };
  }
  return { ok: true, value: null };
}
