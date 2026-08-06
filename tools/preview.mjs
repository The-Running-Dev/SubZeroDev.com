// Builds `site/dist` and serves it locally, without Docker, rebuilding on
// every source change. Reuses the S8 browser-capture harness's static server
// (tests/build/static-server.ts) rather than a second implementation — same
// try_files/404 semantics serverConfig() gives nginx (design/90-decisions.md,
// 2026-08-06). The server itself never needs restarting: it reads site/dist
// fresh off disk per request, so a rebuild is all a change needs — refresh
// the browser tab afterward.
//
// GITHUB_SHA defaults to the current commit if unset — a dev convenience;
// the package's build refuses to run without a forty-hex commit id.

import { execFileSync } from "node:child_process";
import { watch } from "node:fs";
import { fileURLToPath } from "node:url";

import { startStaticServer } from "../tests/build/static-server.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const distDir = fileURLToPath(new URL("../site/dist", import.meta.url));

if (!process.env.GITHUB_SHA) {
  process.env.GITHUB_SHA = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
}

const cli = fileURLToPath(
  new URL("../node_modules/subzerodev-platform-ui-landing-page/dist/cli.js", import.meta.url),
);

function build() {
  const startedAt = Date.now();
  try {
    execFileSync(process.execPath, [cli, "build"], { cwd: root, stdio: "inherit" });
    console.log(`Built in ${Date.now() - startedAt}ms.`);
  } catch {
    console.error("Build failed — see above. Serving the last successful build.");
  }
}

build();
const server = await startStaticServer(distDir);
console.log(`Preview at ${server.url} (site/dist)`);
console.log("Watching src/ and site/landing.config.ts — rebuilds on change. Ctrl+C to stop.");

let pending = null;
function scheduleRebuild() {
  clearTimeout(pending);
  pending = setTimeout(build, 150);
}

const watchers = [
  watch(fileURLToPath(new URL("../src", import.meta.url)), { recursive: true }, scheduleRebuild),
  watch(fileURLToPath(new URL("../site/landing.config.ts", import.meta.url)), scheduleRebuild),
];

process.on("SIGINT", async () => {
  clearTimeout(pending);
  for (const watcher of watchers) watcher.close();
  await server.close();
  process.exit(0);
});
