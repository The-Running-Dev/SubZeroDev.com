// Fixture builders for Presentation tests. Brands are compile-time only, so
// branded values are cast at the authoring site here, the same way
// tests/content/fixtures.ts does for Content.

import type { BodyHtml, ClassName, HexColor } from "../../src/presentation";

export const bodyHtml = (s: string): BodyHtml => s as BodyHtml;
export const className = (s: string): ClassName => s as ClassName;
export const hex = (s: string): HexColor => s as HexColor;
