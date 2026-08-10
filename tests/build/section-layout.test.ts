// Browser-driven geometry coverage for the apex's section stack — reads the
// real output of `npm run build` off disk and drives Chromium against it, the
// same convention enhancement.test.ts and emitted-document.test.ts already
// use.
//
// This exists because the defect it guards was invisible to every other gate.
// While the CSS fold hid all but one section, `composeApex` could wrap the
// sections in a `row` and never show two visible children, so the row read as
// a single column. Removing the fold made the row's real geometry apparent —
// 02 rendered beside 01 and 03 — and no assertion over markup, class names or
// text could see it, because the markup was unchanged and correct. Only a
// laid-out page has an answer. Position, not presence, is the whole subject
// here; what each section *contains* is enhancement.test.ts's and
// emitted-document.test.ts's.

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
// export of the section anchors. In the order their `NN /` index labels
// claim, which is the order this file is about.
const anchors = ["effortless-action", "echo-system", "contamination", "testimonials"] as const;

type Box = { readonly x: number; readonly y: number; readonly width: number; readonly height: number };

// Passed to `page.evaluate` as a string, the form enhancement.test.ts already
// uses — the project's `lib` is ES2022 with no `dom`, so a callback naming
// `document` would not typecheck. The only interpolation is this file's own
// anchor constants.
const measure = `(() => {
  return ${JSON.stringify(anchors)}.map((id) => {
    const element = document.getElementById(id);
    if (element === null) throw new Error("no element with id " + id);
    const rect = element.getBoundingClientRect();
    return {
      x: Math.round(rect.x),
      y: Math.round(rect.y + window.scrollY),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  });
})()`;

async function boxes(width: number, height: number): Promise<readonly Box[]> {
  const page = await browser.newPage({ viewport: { width, height } });
  try {
    await page.goto(server.url + "/", { waitUntil: "networkidle" });
    return (await page.evaluate(measure)) as readonly Box[];
  } finally {
    await page.close();
  }
}

// Two desktop widths and one just above the 720px breakpoint at which the
// primitives collapse to a column anyway — the failure was widest where the
// viewport was widest, and a single width would not have caught it moving.
const widths = [1440, 1280, 900] as const;

describe("the apex's four sections stack in one column, in their numbered order", () => {
  for (const width of widths) {
    it(`at ${width}px every section starts at the same left edge and spans the same width`, async () => {
      const laidOut = await boxes(width, 900);
      const [first] = laidOut;
      if (first === undefined) throw new Error("no sections were measured");

      for (const box of laidOut) {
        expect(box.x).toBe(first.x);
        expect(box.width).toBe(first.width);
      }
    });

    it(`at ${width}px no section overlaps the one before it vertically`, async () => {
      const laidOut = await boxes(width, 900);

      for (let index = 1; index < laidOut.length; index += 1) {
        const previous = laidOut[index - 1];
        const current = laidOut[index];
        if (previous === undefined || current === undefined) {
          throw new Error("a section was not measured");
        }
        // `>=` rather than `>`: sections abut when the gap resolves to zero,
        // which is a stack; what this rejects is one starting before the
        // previous one has ended, which is a column split.
        expect(current.y).toBeGreaterThanOrEqual(previous.y + previous.height);
      }
    });

    it(`at ${width}px the sections appear top to bottom in the order 01, 02, 03, 04`, async () => {
      const laidOut = await boxes(width, 900);
      const tops = laidOut.map((box) => box.y);

      expect(tops).toStrictEqual([...tops].sort((a, b) => a - b));
    });
  }
});
