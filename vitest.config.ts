// The default config — the network-free typecheck-and-test job (S1.9). Excludes
// the live link-check test, which reaches the real network and runs only under
// `vitest.link-check.config.ts`'s own job (S3.7).

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "tests/verification/live/**"],
  },
});
