// Shared by preview-read-back.test.ts and release-read-back.test.ts: both
// need an unknown path resolved against a base URL that may or may not carry
// a trailing slash (Pages' page_url always does; the release job's
// SITE_URL default does not). `new URL(suffix, base)` joins correctly either
// way; naive string concatenation does not.

import type { AbsoluteUrl } from "../../src/content";

export function unknownPathUrl(base: AbsoluteUrl, suffix: string): URL {
  return new URL(suffix, base);
}
