// The build job's own vitest config (S6.14). Kept separate from the default
// config so a plain `vitest run` — the network-free typecheck-and-test job —
// never picks up a test that reads the package build's output or spawns the
// package CLI as a subprocess. `npm run build` must run before this config.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/build/**/*.test.ts"],
    testTimeout: 30000,
  },
});
