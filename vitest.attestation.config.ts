// The attestation CI job's own vitest config (S10.5). Kept separate from the
// default config so a plain `vitest run` never picks up a test that reads a
// live approval record — same convention as `vitest.image-gate.config.ts`.

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/attestation/**/*.test.ts"],
  },
});
