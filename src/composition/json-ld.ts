// Composition — the apex's JSON-LD `Organization` block (contract's `X6`).
//
// `JSON.stringify` already string-escapes every value (X5's carve-out for
// this block). The `<` escape on top of that is what makes X6's "no
// `</script` sequence in any case" guarantee hold: with no `<` character left
// in the output, `</script` cannot appear in any case, so there is nothing
// case-sensitive left to check.

export function organizationJsonLd(name: string, description: string, url: string): string {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    description,
    url,
  };
  return JSON.stringify(organization).replaceAll("<", "\\u003c");
}
