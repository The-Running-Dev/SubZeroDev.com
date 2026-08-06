// Presentation — the colour palette (contract's `palette`, `themeColor`).
//
// The only file in this module permitted to carry a six-digit hex literal
// (S4.2): every other colour reference in Presentation reads `palette` back
// rather than re-typing a value, so one colour has exactly one spelling.

import type { HexColor, Palette } from "./types";

const hex = (value: string): HexColor => value as HexColor;

export const palette: Palette = {
  bg: hex("#0F0F10"),
  fg: hex("#E8E8E9"),
  "fg-muted": hex("#8C8C8F"),
  rule: hex("#252527"),
  link: hex("#6E92C8"),
};

// Derived from `--bg` rather than chosen separately (U2's ruling): the
// document's background colour and the browser chrome colour are the same
// fact, not two.
export const themeColor: HexColor = palette.bg;
