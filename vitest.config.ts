// The default config — the network-free typecheck-and-test job (S1.9). Excludes
// the live link-check test, which reaches the real network and runs only under
// `vitest.link-check.config.ts`'s own job (S3.7); the build-verification
// suite, which asserts against a package build's output and runs only under
// `vitest.build.config.ts`'s own job (S6.14) after that build has run; and the
// image-gate suite, which asserts against a running container and runs only
// under `vitest.image-gate.config.ts`'s own job (S9.7).

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [
      ...configDefaults.exclude,
      "tests/verification/live/**",
      "tests/build/**",
      "tests/image-gate/**",
    ],
  },
});
