// Verification — `assertSelfContained` (contract's Verification § public
// signatures, `V13`).
//
// Three faults, each independent of the other two: a `<script>` element, a
// linked stylesheet rather than an inlined one, and any other element that
// loads a resource by URL rather than by data URI. `<link rel="canonical">`
// is excluded — it names the document's own address and the browser never
// fetches it — and `<a href>` is excluded outright, since an outbound link a
// reader might click is not an asset the page loads. Every fault found is
// reported; the function never stops at the first.

import type { Result } from "../content";
import type { VerificationError } from "./errors";

const SCRIPT_PATTERN = /<script\b/i;
const LINK_TAG_PATTERN = /<link\b([^>]*)>/gi;
// Every other tag's own `src` attribute — a `<script src>` is excluded because
// it is already reported once as ScriptElementPresent, not a second time as an
// asset reference.
const OTHER_SRC_TAG_PATTERN = /<(?!script\b)[a-zA-Z][a-zA-Z0-9-]*\b([^>]*)>/gi;
const SRC_ATTR_PATTERN = /\bsrc=["']([^"']*)["']/i;
const REL_ATTR_PATTERN = /\brel=["']([^"']*)["']/i;
const HREF_ATTR_PATTERN = /\bhref=["']([^"']*)["']/i;

function isDataUri(value: string): boolean {
  return value.startsWith("data:");
}

export function assertSelfContained(documentHtml: string): Result<null, VerificationError> {
  const errors: VerificationError[] = [];

  if (SCRIPT_PATTERN.test(documentHtml)) {
    errors.push({
      code: "ScriptElementPresent",
      detail: "the document contains a <script> element.",
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
