// The default config — the network-free typecheck-and-test job (S1.9). Excludes
// the live link-check test, which reaches the real network and runs only under
// `vitest.link-check.config.ts`'s own job (S3.7), and the build-verification
// suite, which asserts against a package build's output and runs only under
// `vitest.build.config.ts`'s own job (S6.14) after that build has run.

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "tests/verification/live/**", "tests/build/**"],
  },
});
