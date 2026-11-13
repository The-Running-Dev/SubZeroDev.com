// Artifact — tree-position constants (contract's Artifact § Public
// signatures). `missEmittedEntry` and `missRootEntry` are positions inside the
// emitted output tree, expressed with `/` separators — not filesystem paths.

export const missEmittedEntry = "404/index.html" as const;

export const missRootEntry = "404.html" as const;

// The one published file that is not an HTML document: `{"revision":"<commit>"}`, written by
// `finalizeArtifact` so the deployment pipeline can ask the running site which commit it serves
// without parsing a document (contract's `R7`).
export const healthEntry = "__health.json" as const;
