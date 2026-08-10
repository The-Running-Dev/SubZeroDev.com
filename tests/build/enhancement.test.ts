// S12's browser-driven coverage — reads the real output of `npm run build`
// off disk and drives Chromium against it, the same convention
// request-capture.test.ts and emitted-document.test.ts already use.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import type { Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { projects, testimonials, validateInventory, validateTestimonials } from "../../src/content";
import { context } from "../content/fixtures";
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
// tests/build/emitted-document.test.ts already names — Composition's public
// surface carries no manifesto export.
const manifestoSentences = [
  "SubZeroDev was always meant to be a business.",
  "There was no master plan.",
] as const;

describe("S12.5 — loading / with the enhancement script executing still triggers exactly one request", () => {
  it("the apex", async () => {
    const page = await browser.newPage();
    try {
      const requests: string[] = [];
      page.on("request", (r) => requests.push(r.url()));
      await page.goto(server.url + "/", { waitUntil: "networkidle" });
      expect(requests).toHaveLength(1);
    } finally {
      await page.close();
    }
  });
});

describe("with scripting disabled, the tab switch still selects one section at a time", () => {
  it("every project, manifesto sentence and testimonial is in the document, and each tab shows its own section with no script running", async () => {
    const noScriptContext = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await noScriptContext.newPage();
      const ids = ["effortless-action", "echo-system", "contamination", "testimonials"];

      // The switch is Presentation's `view` primitive, in CSS, so it holds
      // with this context's JavaScript disabled. Untargeted, the document
      // opens on the first tab; each anchor then selects its own and only
      // its own.
      await page.goto(server.url + "/");
      for (const id of ids) {
        expect(await page.locator(`#${id}`).isVisible()).toBe(id === "effortless-action");
      }

      for (const selected of ids) {
        await page.goto(server.url + "/#" + selected);
        for (const id of ids) {
          expect(await page.locator(`#${id}`).isVisible()).toBe(id === selected);
        }
      }

      await page.goto(server.url + "/");

      const html = await page.content();
      for (const sentence of manifestoSentences) {
        expect(html).toContain(sentence);
      }
      const validatedInventory = validateInventory(projects, context);
      if (!validatedInventory.ok) throw new Error("committed inventory failed to validate");
      for (const project of validatedInventory.value) {
        expect(html).toContain(project.name);
      }
      const validatedTestimonials = validateTestimonials(testimonials);
      if (!validatedTestimonials.ok) throw new Error("committed testimonials failed to validate");
      for (const testimonial of validatedTestimonials.value) {
        expect(html).toContain(testimonial.quote);
        expect(html).toContain(testimonial.author);
      }
    } finally {
      await noScriptContext.close();
    }
  });
});

describe("S12.7 — the search box and stage chips only ever hide or reveal ecosystem entries already in the DOM", () => {
  it("a filter matching nothing leaves every entry in the DOM, hidden, with the empty-result sentence visible", async () => {
    const page = await browser.newPage();
    try {
      await page.goto(server.url + "/#echo-system");
      const entries = page.locator("#echo-system .entry");
      const before = await entries.count();
      expect(before).toBeGreaterThan(0);

      const search = page.locator("#echo-system input[type='search']");
      await search.fill("no project on earth matches this string");

      const after = await entries.count();
      expect(after).toBe(before);

      const visibleAfter = await entries.evaluateAll(
        (els: readonly { hidden: boolean }[]) => els.filter((e) => !e.hidden).length,
      );
      expect(visibleAfter).toBe(0);
    } finally {
      await page.close();
    }
  });

  it("a matching search reveals only the matching entries, and clearing it reveals all of them again", async () => {
    const page = await browser.newPage();
    try {
      await page.goto(server.url + "/#echo-system");
      const entries = page.locator("#echo-system .entry");
      const total = await entries.count();

      const search = page.locator("#echo-system input[type='search']");
      await search.fill("documentation");
      const visible = await entries.evaluateAll(
        (els: readonly { hidden: boolean }[]) => els.filter((e) => !e.hidden).length,
      );
      expect(visible).toBeGreaterThan(0);
      expect(visible).toBeLessThan(total);

      await search.fill("");
      const visibleAgain = await entries.evaluateAll(
        (els: readonly { hidden: boolean }[]) => els.filter((e) => !e.hidden).length,
      );
      expect(visibleAgain).toBe(total);
    } finally {
      await page.close();
    }
  });
});

describe("S12.8 — the detail overlay is keyboard-reachable, returns focus on close, closes on Escape, and traps focus", () => {
  it("opens on click, traps Tab within itself, closes on Escape, and returns focus to the trigger", async () => {
    const page = await browser.newPage();
    try {
      await page.goto(server.url + "/#echo-system");
      // The prototype binds its detail handler to the entry itself rather
      // than to a button, so the entry is the control that opens the overlay.
      const trigger = page.locator("#echo-system .entry").first();
      await trigger.click();

      const dialog = page.locator('[role="dialog"]');
      expect(await dialog.count()).toBe(1);

      const activeIsButton = await page.evaluate(
        "document.activeElement instanceof HTMLButtonElement",
      );
      expect(activeIsButton).toBe(true);

      for (let i = 0; i < 8; i++) {
        await page.keyboard.press("Tab");
      }
      const stillInsideDialog = await page.evaluate(`(() => {
        const overlay = document.querySelector('[role="dialog"]');
        return overlay !== null && overlay.contains(document.activeElement);
      })()`);
      expect(stillInsideDialog).toBe(true);

      await page.keyboard.press("Escape");
      expect(await page.locator('[role="dialog"]').count()).toBe(0);

      const focusReturned = await trigger.evaluate(
        (el: unknown) =>
          el === (globalThis as unknown as { document: { activeElement: unknown } }).document.activeElement,
      );
      expect(focusReturned).toBe(true);
    } finally {
      await page.close();
    }
  });
});

describe("S12.9 — under prefers-reduced-motion: reduce, the script applies no transform, translation, scale, rotation, position change or scroll behaviour", () => {
  it("filtering and opening the overlay introduce no CSS transition or transform on any element the script touches", async () => {
    const page = await browser.newPage();
    try {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(server.url + "/#echo-system");

      const search = page.locator("#echo-system input[type='search']");
      await search.fill("documentation");

      const trigger = page.locator("#echo-system .entry").first();
      await trigger.click();

      const motionFound = await page.evaluate(`(() => {
        const elements = Array.from(document.querySelectorAll("body *"));
        return elements.some((el) => {
          const style = getComputedStyle(el);
          const transitionsMotion =
            style.transitionDuration !== "0s" &&
            (style.transitionProperty.includes("transform") ||
              style.transitionProperty.includes("top") ||
              style.transitionProperty.includes("left") ||
              style.transitionProperty.includes("all"));
          const hasTransform = style.transform !== "none";
          return transitionsMotion || hasTransform;
        });
      })()`);
      expect(motionFound).toBe(false);
    } finally {
      await page.close();
    }
  });
});

describe("S12.10 — with the script's own initialisation forced to throw, the document still renders in full", () => {
  it("degrades to the plain server-rendered page rather than a broken one", async () => {
    const brokenContext = await browser.newContext();
    try {
      // Forces the enhancement script's very first DOM call to throw, before
      // it registers any listener or touches the document.
      await brokenContext.addInitScript(
        `document.querySelector = () => { throw new Error("forced failure for S12.10"); };`,
      );
      const page = await brokenContext.newPage();
      await page.goto(server.url + "/");

      const html = await page.content();
      for (const sentence of manifestoSentences) {
        expect(html).toContain(sentence);
      }
      const validatedInventory = validateInventory(projects, context);
      if (!validatedInventory.ok) throw new Error("committed inventory failed to validate");
      for (const project of validatedInventory.value) {
        expect(html).toContain(project.name);
      }
      const validatedTestimonials = validateTestimonials(testimonials);
      if (!validatedTestimonials.ok) throw new Error("committed testimonials failed to validate");
      for (const testimonial of validatedTestimonials.value) {
        expect(html).toContain(testimonial.quote);
      }

      // The tab switch is CSS, so a broken script cannot leave the document
      // showing nothing: it opens on the first tab, and the other three stay
      // reachable by their anchors.
      for (const id of ["effortless-action", "echo-system", "contamination", "testimonials"]) {
        expect(await page.locator(`#${id}`).isVisible()).toBe(id === "effortless-action");
      }
      await page.goto(server.url + "/#contamination");
      expect(await page.locator("#contamination").isVisible()).toBe(true);
    } finally {
      await brokenContext.close();
    }
  });
});
