// Test scaffolding for S8's browser capture (S8.2, S8.3). Not part of the
// public contract — CI-only harness. Chromium, driven by Playwright,
// navigating to a URL served by `startStaticServer` (90-decisions.md,
// 2026-08-06). The navigation request itself is recorded with
// `initiatedByTester: true`; every other request the load triggers is
// recorded with `initiatedByTester: false`, which is what
// `assertNoAdditionalRequests` inspects.

import { chromium } from "playwright";
import type { RequestRecord } from "../../src/verification";

export async function captureRequests(url: string): Promise<RequestRecord[]> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const records: RequestRecord[] = [];

    page.on("request", (request) => {
      records.push({
        url: request.url(),
        resourceType: request.resourceType(),
        initiatedByTester: request.isNavigationRequest() && request.url() === url,
      });
    });

    await page.goto(url, { waitUntil: "networkidle" });
    return records;
  } finally {
    await browser.close();
  }
}
