// Presentation — the favicon (contract's `iconDataUri`).
//
// An inline SVG letterform — the glyph `0` — in `--fg` on `--bg`. Both
// colours are `palette` read back by interpolation (S4.10), so this file
// carries no hex literal of its own (S4.2).

import { palette } from "./palette";
import type { DataUri } from "./types";

const svg = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-hidden="true">',
  `<rect width="32" height="32" fill="${palette.bg}"/>`,
  `<text x="16" y="23" text-anchor="middle" font-family="ui-monospace, monospace" `,
  `font-size="22" fill="${palette.fg}">0</text>`,
  "</svg>",
].join("");

export const iconDataUri: DataUri = `data:image/svg+xml,${encodeURIComponent(svg)}` as DataUri;
