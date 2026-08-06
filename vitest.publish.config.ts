// The publish CI job's own vitest config (S10.8). Kept separate from the
// default config so a plain `vitest run` never picks up a test that reaches
// the deployed Pages target — same convention as `vitest.build.config.ts`,
// `vitest.link-check.config.ts` and `vitest.image-gate.config.ts`.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/publish/**/*.test.ts"],
    testTimeout: 320000,
  },
});
