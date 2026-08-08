// Content — the apex page's numeric and structural derivations (contract's
// `sinceYear`, `projectTotal`, `countByStage`, `ecosystemTree` and
// `contaminationForest`; C10, C11, C12).
//
// Every function here is total on `Inventory` and returns no error — the
// non-empty, cross-referenced guarantee `validateInventory` earns is what
// makes that possible. Nothing here reads `projects` directly (C14).

import { stageOrder } from "./stage-order";
import type {
  ContaminationForest,
  ContaminationNode,
  EcosystemTree,
  Inventory,
  Project,
  StageCount,
  Testimonials,
  Year,
} from "./types";

export function sinceYear(inventory: Inventory): Year {
  return inventory.reduce(
    (min, project) => (project.year < min ? project.year : min),
    inventory[0].year,
  );
}

export function projectTotal(inventory: Inventory): number {
  return inventory.length;
}

export function testimonialTotal(testimonials: Testimonials): number {
  return testimonials.length;
}

export function countByStage(inventory: Inventory): readonly StageCount[] {
  return stageOrder.map((stage) => ({
    stage,
    count: inventory.filter((project) => project.stage === stage).length,
  }));
}

const byId = (a: Project, b: Project): number => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

export function ecosystemTree(inventory: Inventory): EcosystemTree {
  return stageOrder.map((stage) => ({
    stage,
    projects: inventory.filter((project) => project.stage === stage).slice().sort(byId),
  }));
}

export function contaminationForest(inventory: Inventory): ContaminationForest {
  const childrenOf = new Map<string, Project[]>();
  const roots: Project[] = [];

  for (const project of inventory) {
    if (project.escapedFrom === undefined) {
      roots.push(project);
      continue;
    }
    const siblings = childrenOf.get(project.escapedFrom);
    if (siblings) {
      siblings.push(project);
    } else {
      childrenOf.set(project.escapedFrom, [project]);
    }
  }

  const buildNode = (project: Project): ContaminationNode => ({
    project,
    escapes: (childrenOf.get(project.id) ?? []).slice().sort(byId).map(buildNode),
  });

  return roots.slice().sort(byId).map(buildNode);
}
