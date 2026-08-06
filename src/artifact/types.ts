// Artifact — data shapes (contract's Artifact § Types).
//
// `ArtifactInput.commit` is the raw value read from the build environment and
// is not a `CommitId` — validating it is `finalizeArtifact`'s first act.

import type { CommitId } from "../content";

export type EmittedDocument = {
  readonly relativePath: string;
  readonly html: string;
};

export type ArtifactInput = {
  readonly outputDir: string;
  readonly serverConfigDir: string;
  readonly commit: string;
};

export type ArtifactReport = {
  readonly commit: CommitId;
  readonly markedEntries: readonly string[];
  readonly rootMissEntry: string;
  readonly serverConfigPath: string;
};
