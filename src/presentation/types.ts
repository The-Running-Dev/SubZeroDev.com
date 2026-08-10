// Presentation — the shared and Presentation-owned types.
//
// Presentation imports `Branded` from Content and nothing else from this
// repository (contract's Presentation § types; asserted by S4.14's
// import-graph check). `StylesheetText` and `BodyHtml` live here rather than
// in Composition because `stylesheetFor` takes a `BodyHtml` — Composition
// owning it would put Presentation above Composition and cycle the graph.

import type { Branded } from "../content";

export type HexColor = Branded<string, "HexColor">;

export type DataUri = Branded<string, "DataUri">;

export type ClassName = Branded<string, "ClassName">;

export type ColorToken = "bg" | "fg" | "fg-muted" | "rule" | "link";

export type Palette = { readonly [T in ColorToken]: HexColor };

export type PrimitiveName =
  | "page"
  | "stack"
  | "entry"
  | "meta"
  | "rule"
  | "link"
  | "row"
  | "bar"
  | "grid"
  | "view"
  | "card";

export type Primitive = {
  readonly className: ClassName;
  readonly rules: string;
};

export type PrimitiveSet = { readonly [N in PrimitiveName]: Primitive };

export type StylesheetText = Branded<string, "StylesheetText">;

export type BodyHtml = Branded<string, "BodyHtml">;
