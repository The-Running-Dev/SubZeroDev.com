// Browser-driven coverage for the apex's tab switch — reads the real output
// of `npm run build` off disk and drives Chromium against it, the same
// convention enhancement.test.ts and emitted-document.test.ts already use.
//
// This measures rendered state rather than markup, because markup cannot see
// what this guards. All four sections are always in the document; which one
// a reader can see is decided by CSS `:target` and by nothing an assertion
// over class names or text could reach. The defect that produced this file
// was exactly that shape — the sections rendered correctly and all at once,
// and every existing gate stayed green while the page did the wrong thing.
//
// enhancement.test.ts covers the same switch with JavaScript disabled. This
// file covers it as a reader meets it: clicking the tabs.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import type { Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { startStaticServer } from "./static-server";
import type { StaticServer } from "./static-server";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, "../../site/dist");

let server: StaticServer;
let browser: Browser;

beforeAll(async () => {
  server = await startStaticServer(distDir);
  browser = await chromium.launch();
});

afterAll(async () => {
  await browser.close();
  await server.close();
});

// Duplicated from src/composition/apex.ts, the same accepted exception
// enhancement.test.ts already names — Composition's public surface carries no
// export of the section anchors. First is the tab the document opens on.
const anchors = ["effortless-action", "echo-system", "contamination", "testimonials"] as const;

// Passed to `page.evaluate` as a string, the form enhancement.test.ts already
// uses — the project's `lib` is ES2022 with no `dom`, so a callback naming
// `document` would not typecheck. The only interpolation is this file's own
// anchor constants.
const probe = `(() => {
  const ids = ${JSON.stringify(anchors)};
  return {
    visible: ids.filter((id) => document.getElementById(id).offsetParent !== null),
    scrollY: Math.round(window.scrollY),
    navColors: ids.map((id) =>
      getComputedStyle(document.querySelector('nav [href="#' + id + '"]')).color,
    ),
  };
})()`;

type Probe = {
  readonly visible: readonly string[];
  readonly scrollY: number;
  readonly navColors: readonly string[];
};

// --fg and --link, resolved. Named here rather than imported because this
// reads what the browser computed, not what Presentation declared — a test
// that took both sides from `palette` could not see the two diverge.
const ACTIVE = "rgb(243, 241, 236)";
const INACTIVE = "rgb(111, 211, 255)";

describe("the apex is a tab switch: one section visible at a time", () => {
  it("opens on the first tab, with only that tab active", async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    try {
      await page.goto(server.url + "/", { waitUntil: "networkidle" });
      const state = (await page.evaluate(probe)) as Probe;

      expect(state.visible).toStrictEqual(["effortless-action"]);
      expect(state.navColors).toStrictEqual([ACTIVE, INACTIVE, INACTIVE, INACTIVE]);
    } finally {
      await page.close();
    }
  });

  for (const [index, anchor] of anchors.entries()) {
    it(`clicking ${anchor} shows only ${anchor}, marks only its tab active, and does not scroll`, async () => {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      try {
        await page.goto(server.url + "/", { waitUntil: "networkidle" });
        await page.click(`nav a[href="#${anchor}"]`);
        // Off the link and past the 120ms `.link` transition: a cursor left
        // resting on the tab reads as `--fg` through `:hover` and would make
        // the active-tab assertion below pass for the wrong reason.
        await page.mouse.move(0, 0);
        await page.waitForTimeout(250);
        const state = (await page.evaluate(probe)) as Probe;

        expect(state.visible).toStrictEqual([anchor]);
        expect(state.navColors).toStrictEqual(
          anchors.map((_, i) => (i === index ? ACTIVE : INACTIVE)),
        );
        // A tab is a view change, not a jump to a place further down the
        // page: the masthead stays where it is.
        expect(state.scrollY).toBe(0);
      } finally {
        await page.close();
      }
    });
  }
});
