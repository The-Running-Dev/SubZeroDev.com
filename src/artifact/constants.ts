// Artifact — tree-position constants (contract's Artifact § Public
// signatures). `missEmittedEntry` and `missRootEntry` are positions inside the
// emitted output tree, expressed with `/` separators — not filesystem paths.

export const missEmittedEntry = "404/index.html" as const;

export const missRootEntry = "404.html" as const;
