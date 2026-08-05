// Content — `resolvedHomes` (contract's Content § derived shapes / C13).
//
// Total on `Inventory`: `own` and `within` homes each yield one entry, `none`
// yields none. A `within` home's parent is guaranteed by `validateInventory`
// (C6) to exist with `home.kind === "own"`, so no error branch is needed here.

import type { AbsoluteUrl, Home, Inventory, ResolvedHome } from "./types";

export function resolvedHomes(inventory: Inventory): readonly ResolvedHome[] {
  const byId = new Map(inventory.map((project) => [project.id, project] as const));
  const result: ResolvedHome[] = [];

  for (const project of inventory) {
    const home = project.home;
    if (home.kind === "own") {
      result.push({ projectId: project.id, url: home.url });
    } else if (home.kind === "within") {
      const parent = byId.get(home.parent)!;
      const parentUrl = (parent.home as Extract<Home, { kind: "own" }>).url;
      const resolved = new URL(home.path, parentUrl).toString() as AbsoluteUrl;
      result.push({ projectId: project.id, url: resolved });
    }
  }

  return result;
}
