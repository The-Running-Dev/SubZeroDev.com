// Test scaffolding for S8's browser capture (S8.2, S8.3). Not part of the
// public contract — CI-only harness that serves the finalized `site/dist`
// tree over http(s) rather than `file://` (90-decisions.md, 2026-08-06).
//
// Mirrors `serverConfig()`'s `try_files $uri $uri/ =404` shape closely enough
// for the capture to observe the document under roughly the serving
// semantics it is actually published under: an exact file, then
// `<path>/index.html`, then the root miss document with a 404 status.

import { createServer } from "node:http";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

async function readIfExists(path: string): Promise<Buffer | null> {
  try {
    return await readFile(path);
  } catch {
    return null;
  }
}

async function handleRequest(rootDir: string, url: string, res: ServerResponse<IncomingMessage>): Promise<void> {
  let requestPath: string;
  try {
    requestPath = decodeURIComponent(url.split("?")[0]!);
  } catch {
    res.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }

  const safePath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const candidates = [join(rootDir, safePath), join(rootDir, safePath, "index.html")];

  for (const candidate of candidates) {
    if (!candidate.startsWith(rootDir + sep) && candidate !== rootDir) continue;
    const body = await readIfExists(candidate);
    if (body !== null) {
      res.writeHead(200, { "content-type": MIME_TYPES[extname(candidate)] ?? "application/octet-stream" });
      res.end(body);
      return;
    }
  }

  const missBody = await readIfExists(join(rootDir, "404.html"));
  res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
  res.end(missBody ?? "Not found");
}

export type StaticServer = {
  readonly url: string;
  close(): Promise<void>;
};

export async function startStaticServer(rootDir: string): Promise<StaticServer> {
  const server: Server = createServer((req, res) => {
    handleRequest(rootDir, req.url ?? "/", res).catch(() => {
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("static server did not bind to a TCP port.");
  }

  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}
