// Presentation — the colour palette (contract's `palette`, `themeColor`).
//
// The only file in this module permitted to carry a six-digit hex literal
// (S4.2): every other colour reference in Presentation reads `palette` back
// rather than re-typing a value, so one colour has exactly one spelling.

import type { HexColor, Palette } from "./types";

const hex = (value: string): HexColor => value as HexColor;

export const palette: Palette = {
  bg: hex("#111113"),
  fg: hex("#F3F1EC"),
  "fg-muted": hex("#9A989F"),
  rule: hex("#2B2B31"),
  link: hex("#6FD3FF"),
};

// Derived from `--bg` rather than chosen separately (U2's ruling): the
// document's background colour and the browser chrome colour are the same
// fact, not two.
export const themeColor: HexColor = palette.bg;
