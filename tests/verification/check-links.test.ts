import { createServer, type Server } from "node:http";
import { createServer as createTcpServer, type Server as TcpServer } from "node:net";
import type { AddressInfo } from "node:net";

import { afterEach, describe, expect, it } from "vitest";

import { checkLinks } from "../../src/verification";
import type { LinkCheckResult, RetryPolicy } from "../../src/verification";
import type { ResolvedHome } from "../../src/content";

// A policy structurally identical to `linkCheckRetry` (S3.2 owns testing its
// exact values) but with short delays, so the retry-exhaustion cases here run
// in milliseconds rather than seconds.
const fastPolicy: RetryPolicy = {
  attempts: 3,
  backoff: "exponential",
  initialDelayMs: 5,
  maxDelayMs: 10,
  attemptTimeoutMs: 300,
};

let server: Server | undefined;
let tcpServer: TcpServer | undefined;

afterEach(async () => {
  if (server !== undefined) {
    await new Promise<void>((resolve) => server!.close(() => resolve()));
    server = undefined;
  }
  if (tcpServer !== undefined) {
    await new Promise<void>((resolve) => tcpServer!.close(() => resolve()));
    tcpServer = undefined;
  }
});

function startStub(status: number, onRequest?: () => void): Promise<{ target: ResolvedHome }> {
  return new Promise((resolvePromise) => {
    server = createServer((_req, res) => {
      onRequest?.();
      res.writeHead(status);
      res.end();
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server!.address() as AddressInfo;
      resolvePromise({
        target: {
          projectId: "stub" as ResolvedHome["projectId"],
          url: `http://127.0.0.1:${port}` as ResolvedHome["url"],
        },
      });
    });
  });
}

async function refusedTarget(): Promise<ResolvedHome> {
  const { target } = await startStub(200);
  await new Promise<void>((resolve) => server!.close(() => resolve()));
  server = undefined;
  return target; // nothing listens on this port anymore
}

describe("S3.3 — a 200 response", () => {
  it("returns ok: true with one result carrying status 200 and attempts 1", async () => {
    const { target } = await startStub(200);
    const result = await checkLinks([target], fastPolicy);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(1);
    expect(result.value[0]).toMatchObject<Partial<LinkCheckResult>>({ status: 200, attempts: 1 });
  });
});

describe("S3.4 — a 301 response", () => {
  it("returns ok: true for that target", async () => {
    const { target } = await startStub(301);
    const result = await checkLinks([target], fastPolicy);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value[0]).toMatchObject<Partial<LinkCheckResult>>({ status: 301, attempts: 1 });
  });
});

describe("S3.5 — a 500 response", () => {
  it("returns ok: false with a LinkNotOk error naming the target, not retried", async () => {
    let requestCount = 0;
    const { target } = await startStub(500, () => {
      requestCount += 1;
    });

    const result = await checkLinks([target], fastPolicy);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.code).toBe("LinkNotOk");
    expect(result.errors[0]!.detail).toContain("stub");
    expect(requestCount).toBe(1);
  });
});

describe("S3.6 — a refused connection", () => {
  it("returns ok: false with a LinkUnreachable error naming the target", async () => {
    const target = await refusedTarget();

    const result = await checkLinks([target], fastPolicy);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.code).toBe("LinkUnreachable");
    expect(result.errors[0]!.detail).toContain("stub");
  });

  it("retries exactly policy.attempts times before giving up", async () => {
    // A refused connection settles instantly and carries nothing to count
    // attempts with. A server that accepts the TCP connection but never
    // responds exercises the identical no-response branch in `checkOneTarget`
    // (settled via the request's `timeout` handler rather than its `error`
    // handler) and lets the attempt count be observed directly.
    let connectionCount = 0;
    const sockets = new Set<import("node:net").Socket>();
    tcpServer = createTcpServer((socket) => {
      connectionCount += 1;
      sockets.add(socket);
      socket.on("close", () => sockets.delete(socket));
      socket.on("error", () => {
        // ignore — the client aborts the socket once its timeout fires
      });
    });
    const address = await new Promise<AddressInfo>((resolvePromise) => {
      tcpServer!.listen(0, "127.0.0.1", () => resolvePromise(tcpServer!.address() as AddressInfo));
    });

    const target: ResolvedHome = {
      projectId: "stub" as ResolvedHome["projectId"],
      url: `http://127.0.0.1:${address.port}` as ResolvedHome["url"],
    };
    const result = await checkLinks([target], { ...fastPolicy, attemptTimeoutMs: 50 });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]!.code).toBe("LinkUnreachable");
    expect(connectionCount).toBe(3);

    // `server.close()` waits for existing connections to end on their own;
    // the client's timeout-triggered `destroy()` doesn't reliably do that
    // promptly enough for `afterEach`, so this test ends its own sockets.
    for (const socket of sockets) socket.destroy();
  });
});
