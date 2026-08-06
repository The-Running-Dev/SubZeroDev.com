// Composition — HTML-escaping for interpolated Content strings (X5).
//
// Every `Project` field composed into `bodyHtml` passes through this first.
// Order matters: `&` must be replaced before the entities it introduces are.

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
