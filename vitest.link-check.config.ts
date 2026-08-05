// The networked CI job's own vitest config (S3.7). Kept separate from the
// default config so a plain `vitest run` — the network-free build job — never
// picks up a test that reaches the network.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/verification/live/**/*.test.ts"],
  },
});
