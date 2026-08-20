// Content — `checkedLinks` (contract's Content § derived shapes / C17).
//
// The single enumeration of `V4`'s target set: the inventory's resolved
// homes, `sourceUrl`, and the CV's four link-bearing field paths.
//
// Deliberately does not deduplicate: two records naming the same URL yield
// two entries, because both are places an author would need to edit.

import { sourceUrl } from "./links";
import { resolvedHomes } from "./resolved-homes";
import type { CheckedLink, CvData, Inventory } from "./types";

export function cvOutboundLinks(cv: CvData): readonly CheckedLink[] {
  const links: CheckedLink[] = cv.header.links.map((link, i) => ({
    label: `header.links[${i}].href`,
    url: link.href,
  }));

  cv.roles.forEach((role, i) => {
    if (role.website !== undefined) {
      links.push({ label: `roles[${i}].website`, url: role.website });
    }
  });

  cv.projects.forEach((project, i) => {
    links.push({ label: `projects[${i}].link`, url: project.link });
  });

  cv.openSource.forEach((entry, i) => {
    if (entry.link !== undefined) {
      links.push({ label: `openSource[${i}].link`, url: entry.link });
    }
  });

  return links;
}

export function checkedLinks(
  inventory: Inventory,
  cv: CvData,
): readonly [CheckedLink, ...CheckedLink[]] {
  const fromHomes: CheckedLink[] = resolvedHomes(inventory).map((home) => ({
    label: home.projectId,
    url: home.url,
  }));

  return [{ label: "sourceUrl", url: sourceUrl }, ...fromHomes, ...cvOutboundLinks(cv)];
}
