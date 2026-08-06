// Composition — the shared and Composition-owned types.
//
// `ComposedRoute` is Composition's, not Presentation's, even though its two
// fields carry Presentation-branded strings — see the contract's
// Presentation § types note on why the edge runs that way.

import type { BodyHtml, StylesheetText } from "../presentation/types";

export type ComposedRoute = {
  readonly bodyHtml: BodyHtml;
  readonly stylesheet: StylesheetText;
};
