// Content — `checkedLinks` (contract's Content § derived shapes / C17).
//
// The single enumeration of `V4`'s target set. At this slice it covers the
// inventory's resolved homes plus `sourceUrl`; the CV's four link-bearing
// field paths are S15's, where `CvData` exists to type the second parameter
// the finished contract signature carries.
//
// Deliberately does not deduplicate: two records naming the same URL yield
// two entries, because both are places an author would need to edit.

import { sourceUrl } from "./links";
import { resolvedHomes } from "./resolved-homes";
import type { CheckedLink, Inventory } from "./types";

export function checkedLinks(inventory: Inventory): readonly [CheckedLink, ...CheckedLink[]] {
  const fromHomes: CheckedLink[] = resolvedHomes(inventory).map((home) => ({
    label: home.projectId,
    url: home.url,
  }));

  return [{ label: "sourceUrl", url: sourceUrl }, ...fromHomes];
}
