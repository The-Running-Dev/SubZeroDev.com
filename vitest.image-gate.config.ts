// The image-gate CI job's own vitest config (S9.7). Kept separate from the
// default config so a plain `vitest run` never picks up a test that reaches
// a running container — same convention as `vitest.build.config.ts` and
// `vitest.link-check.config.ts`.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/image-gate/**/*.test.ts"],
    testTimeout: 30000,
  },
});
