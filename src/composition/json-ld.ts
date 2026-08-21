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

// Composition — the CV's JSON-LD `Person` block (contract's `X6`, widened
// 2026-08-21 for the CV route). No `email` and no `telephone`: both are
// visible prose on the page already (`cv.header.email` as a `mailto:` link,
// `cv.header.phone` as text), and the omission is deliberate — see
// `20-contract.md`'s Composition section.
export function personJsonLd(
  name: string,
  jobTitle: string,
  url: string,
  sameAs: readonly string[],
): string {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle,
    url,
    sameAs,
  };
  return JSON.stringify(person).replaceAll("<", "\\u003c");
}
