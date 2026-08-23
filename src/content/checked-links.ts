// Content — `checkedLinks` (contract's Content § derived shapes / C17, C19).
//
// The single enumeration of `V4`'s target set: the inventory's resolved
// homes, `sourceUrl`, and the CV's four link-bearing field paths — less the
// addresses `linkCheckExemptions` names.
//
// Deliberately does not deduplicate: two records naming the same URL yield
// two entries, because both are places an author would need to edit.
//
// The subtraction happens here and nowhere else (C17) — replacing the
// informal `.filter()` accepted in session on 2026-08-21 and recorded
// nowhere. See design/20-contract.md and design/90-decisions.md.

import { sourceUrl } from "./links";
import { resolvedHomes } from "./resolved-homes";
import type { AbsoluteUrl, CheckedLink, CvData, Inventory, LinkCheckExemption } from "./types";

// https://derivco.com answers 403 to every automated request (curl, with or
// without a browser user-agent) while remaining a real, human-reachable
// site — observed by hand on 2026-08-21. Bot-blocking, not a dead link.
export const linkCheckExemptions: readonly LinkCheckExemption[] = [
  {
    url: "https://derivco.com" as AbsoluteUrl,
    reason: "Answers 403 to every automated request (observed by hand, 2026-08-21) while remaining reachable by a person; bot-blocking, not a dead link.",
  },
];

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

  const exempt = new Set(linkCheckExemptions.map((e) => e.url));
  const all = [{ label: "sourceUrl", url: sourceUrl }, ...fromHomes, ...cvOutboundLinks(cv)];

  // sourceUrl is unconditional and no exemption may name it (C19), so the
  // subtraction can never empty the tuple.
  return all.filter((link) => !exempt.has(link.url)) as [CheckedLink, ...CheckedLink[]];
}
