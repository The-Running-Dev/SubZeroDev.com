import { describe, expect, it } from "vitest";

import { serverConfig } from "../../src/artifact";

describe("S7.7 — serverConfig", () => {
  const text = serverConfig();

  it("resolves an unknown path to the root miss document with status 404", () => {
    expect(text).toContain("try_files $uri $uri/ =404;");
    expect(text).toContain("error_page 404 /404.html;");
  });

  it("names no path the build does not emit", () => {
    // Every `location` block is "/" (via try_files) — no third path, no
    // upstream, no proxy target. `error_page` names only the root miss
    // document. The `root` directive's filesystem mount path is not a URL
    // path the build emits and is not what this criterion constrains.
    const locations = [...text.matchAll(/location\s+(\S+)\s*\{/g)].map((m) => m[1]);
    expect(locations).toEqual(["/"]);

    const errorPages = [...text.matchAll(/error_page\s+\d+\s+(\S+);/g)].map((m) => m[1]);
    for (const path of errorPages) expect(path).toBe("/404.html");
  });

  it("sets no cookie", () => {
    expect(text.toLowerCase()).not.toContain("cookie");
  });

  it("sets no application-chosen cache-control directive", () => {
    expect(text.toLowerCase()).not.toContain("cache-control");
    expect(text.toLowerCase()).not.toContain("expires");
    expect(text.toLowerCase()).not.toContain("add_header");
  });

  it("sets no tracking or rewrite header, and executes nothing per request", () => {
    expect(text).not.toMatch(/\brewrite\b/);
    expect(text).not.toMatch(/\bproxy_pass\b/);
    expect(text).not.toMatch(/\bfastcgi_pass\b/);
    expect(text).not.toMatch(/\breturn\b/);
  });

  it("is deterministic — no filesystem, container or network is involved", () => {
    expect(serverConfig()).toBe(text);
  });
});
