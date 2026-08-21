# Contract — SubZeroDev.com

Derived from [`10-design.md`](10-design.md). Where this document and the design disagree, one of them
is a defect; say which rather than reconciling.

Language: TypeScript. Established by the consumer pattern `SubZeroDev.Platform` proved and by
`SubZeroDev.Platform.UI.LandingPage`'s published `exports`.

Module names below — Content, Presentation, Composition, Adapter, Artifact, Verification — are the
design's module boundaries, not paths.

**Every interface on the render path is now written.** The external package released `0.3.0` carrying
all three capabilities [`U1`](#u1--the-package-cannot-accept-a-caller-supplied-body) asked for,
verified against the published source; the pin is now `0.4.1`, which adds the validated build-time
data sources this repository's content documents are declared through and changes none of the three.
Adapter's source declarations, route declarations and default export are therefore written
below — as is Artifact's server configuration, which
[`U7`](#u7--which-server-serves-the-container-tree) settled. The last of them,
[`U2`](#u2--presentations-token-set-and-primitives) — Presentation's token set, its primitives and
the per-route stylesheet assembly, with the two head-metadata values that are visual identity — was
answered on 2026-08-06 and is written below.

**One surface is still unwritten, and it is off the render path** — the Verification functions that
would check `P2`–`P4`, raised as [`U9`](#u9--accessibility-has-no-verification-surface). `U2`
discharged half of what that entry said `P2` was waiting for: there is now a palette to compute over,
and an authored definition of what legibility is measured as. What remains is the shape of the check,
which the design determines nothing about. It blocks nothing that emits a document.

What else is missing is content, not interface, and is owner-supplied rather than derivable: each
route's title and description, transcribed at slice time exactly as the inventory's `line` and
`question` were. Whether a social image exists is no longer open —
[`U6`](#u6--whether-a-social-image-asset-exists) settled it: none.

**Two routes were added on 2026-08-21 and this document is amended for them, not rewritten.** `/cv/`
and `/portfolio/` fold the CV and portfolio material into this site as first-class routes served from
two further versioned JSON documents. Everything that changed is an extension of a rule already here:
`RoutePath` and `A4` carry four paths, Content gains two documents and two validators, Composition
gains two total composers, `checkLinks` widens from `ResolvedHome` to `CheckedLink` so `V4` finally
reaches `sourceUrl`, and `X1`'s derivation clause narrows to the apex —
[`U11`](#u11--x1s-derivation-clause-is-narrowed-to-the-apex-pending-an-owner-edit-to-the-brief) is the
one brief conflict that creates. `PrimitiveName` is unchanged and stays closed at twelve; no new
dependency is introduced. `portfolio.subzerodev.com` is untouched and stays a separate live
deployment.

---

## Types

### Shared

```ts
declare const brandTag: unique symbol;

export type Branded<T, B extends string> = T & { readonly [brandTag]: B };

export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly errors: readonly [E, ...E[]] };
```

`Result` carries a non-empty error list, and no error is a string. **One** repository-owned surface
uses a bare exception instead: `sourceUrl`'s module-load guard. It is written out at its public
declaration and collected under *Error semantics*. Every other function in this contract returns its
failure or is total. There were two until 2026-08-10, the second being `foldRoutes`'s structural
guards; the fold is gone and so is that surface.

**`Shared` is a grouping, not a seventh module.** Both types live in **Content** and are exported from
it, which is why `C1` needs no exception: a module that owns them imports nothing to obtain them.
Every module returning a `Result` therefore imports it from Content, and the import lists below name
it where that applies. A separate module was rejected — it would buy a boundary around two type
aliases that carry no behaviour, at the cost of a carve-out in `C1`.

### Content

```ts
export type ProjectId = Branded<string, "ProjectId">;

export type Year = Branded<number, "Year">;

export type AbsoluteUrl = Branded<string, "AbsoluteUrl">;

export type RootRelativePath = Branded<string, "RootRelativePath">;

export type CommitId = Branded<string, "CommitId">;
```

| Type | Constraint |
|---|---|
| `ProjectId` | Matches `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`. Length 1–64. |
| `Year` | Integer, `1000 <= y <= 9999`, and `y <= BuildContext.utcYear`. |
| `AbsoluteUrl` | Parses through the `URL` constructor with no base argument, and `protocol === "https:"`. |
| `RootRelativePath` | Begins with `/`, does not begin with `//`, and for the parent origin `o`, `new URL(path, o).origin === o`. |
| `CommitId` | Matches `/^[0-9a-f]{40}$/`. |

```ts
export type Stage =
  | "Curiosity"
  | "Prototype"
  | "Architecture"
  | "Infrastructure"
  | "Reusable"
  | "Escaped";

export type Genre =
  | "Documentary"
  | "Status Page"
  | "Story"
  | "Evidence"
  | "Journal"
  | "Field Reports"
  | "Comedy";

export type Home =
  | { readonly kind: "own"; readonly url: AbsoluteUrl }
  | { readonly kind: "within"; readonly parent: ProjectId; readonly path: RootRelativePath }
  | { readonly kind: "none" };

export type Project = {
  readonly id: ProjectId;
  readonly name: string;
  readonly year: Year;
  readonly stage: Stage;
  readonly question?: string;
  readonly line: string;
  readonly home: Home;
  readonly genre?: Genre;
  readonly escapedFrom?: ProjectId;
};

export type Inventory = readonly [Project, ...Project[]];
```

`name`, `line`, and `question` where present are non-empty after trimming. `home` is required; the
absence of a home is `{ kind: "none" }`, not a missing property. `question`, `genre` and
`escapedFrom` are absent, never `undefined`-valued and never empty.

```ts
export type BuildContext = {
  readonly commit: CommitId;
  readonly utcYear: Year;
};
```

```ts
export type Testimonial = {
  readonly quote: string;
  readonly author: string;
  readonly role?: string;
  readonly organization?: string;
  readonly url?: string;
};

export type Testimonials = readonly [Testimonial, ...Testimonial[]];
```

`quote` and `author` are non-empty after trimming. `role`, `organization` and `url` are absent, never
`undefined`-valued and never empty, on the same convention as `Project.question`. No `avatar` field —
`10-design.md` § *Testimonial* states why, and that reasoning is untouched by `url` below.
`Testimonials` carries its committed order as data; nothing derives, sorts or ranks it.

**`url` is a citation, and the constraint the declaration cannot carry is *when it may be present*.**
A present `url` is an absolute `https:` URL — enforced by `validateTestimonials`, which raises
`TestimonialUrlInvalid` — and it is permitted **only on a quote that is genuinely a real line from a
real SubZeroDev repository**, used as itself. A fabricated attribution has nothing to cite and never
acquires the field. That is the whole of the rule, it is **authored rather than enforced**, and no
assertion in this document checks it: nothing in the tree can tell a real quote from an invented one,
so this is the one testimonial property a reader may not trust without checking the record. The
carve-out in `00-brief.md` § *Source material* item 4 is unchanged — the page still labels nothing on
it as fictional, and the field cannot become that label, because the quotes it would mark are exactly
the ones that never carry it.

**`url` is deliberately not `AbsoluteUrl`,** though it satisfies that type's constraint and is checked
by the same predicate as `Home.own.url`. `Testimonial` carries no branded field at all: a brand exists
here to gate a value into a derivation, and no derivation reads a testimonial — `testimonialTotal`
counts the collection and the renderer consumes each record whole. Branding `url` would buy a
guarantee nothing downstream demands and make `Testimonial` the one record shape that is half-branded,
which is harder to reason about than either end. `TestimonialUrlInvalid` is what earns the property
instead, at the same point every other testimonial guarantee is earned.

```ts
export type CvLink = {
  readonly label: string;
  readonly href: AbsoluteUrl;
};

export type CvRole = {
  readonly company: string;
  readonly title: string;
  readonly period: string;
  readonly location: string;
  readonly website?: AbsoluteUrl;
  readonly summary: string;
  readonly achievements: readonly [string, ...string[]];
  readonly tech: readonly [string, ...string[]];
};

export type CvEducation = {
  readonly school: string;
  readonly degree: string;
  readonly details: string;
};

export type CvProject = {
  readonly title: string;
  readonly link: AbsoluteUrl;
  readonly description: string;
  readonly tech: readonly [string, ...string[]];
  readonly year: Year;
};

export type CvOpenSource = {
  readonly title: string;
  readonly link?: AbsoluteUrl;
  readonly description: string;
  readonly impact: string;
  readonly tech: readonly [string, ...string[]];
};

export type CvEra = {
  readonly period: string;
  readonly focus: string;
  readonly projects: readonly [string, ...string[]];
};

export type CvDocument = {
  readonly header: {
    readonly name: string;
    readonly title: string;
    readonly email: string;
    readonly phone: string;
    readonly links: readonly [CvLink, ...CvLink[]];
  };
  readonly about: { readonly title: string; readonly body: string };
  readonly badges: readonly [string, ...string[]];
  readonly chips: readonly [string, ...string[]];
  readonly timelineTitle: string;
  readonly roles: readonly [CvRole, ...CvRole[]];
  readonly educationTitle: string;
  readonly education: readonly [CvEducation, ...CvEducation[]];
  readonly projectsTitle: string;
  readonly projects: readonly [CvProject, ...CvProject[]];
  readonly openSourceTitle: string;
  readonly openSource: readonly [CvOpenSource, ...CvOpenSource[]];
  readonly timelineProjectsTitle: string;
  readonly timelineProjects: readonly [CvEra, ...CvEra[]];
  readonly quote: string;
};

export type CvData = Branded<CvDocument, "CvData">;
```

**`CvData` is branded for the reason `Inventory` is: only `validateCv` can produce one.** A
`CvDocument` is the structural decoder's output and carries no domain guarantee; the brand is what a
composer's parameter type demands, so no route can be composed from records nothing checked. The same
holds of `PortfolioData` below. Every list above is non-empty, and that is a real constraint rather
than a convenience — a CV rendering a heading over nothing is the "silently empty section" failure
`10-design.md` already refuses for the inventory.

**Three fields of the source document are absent here, and each absence is load-bearing.**

| Absent | Why |
|---|---|
| A badge's image `src` | The source pairs each technology label with a shields.io image URL. `V13` forbids any `src` that is not a data URI and the brief's non-goal forbids the request it would trigger, so the URL cannot be carried at all. What survives is the label, which is why `badges` is a list of strings rather than a list of one-field records: with the image gone, a badge **is** its text |
| A role's `icon` | An icon-font token (`faRocket`). The font that resolves it is a linked asset `P1` and `V13` both forbid, and a token naming a glyph nothing can draw is a field that reads as a fact and is not one |
| The source's `seo` block | Route `title` and `description` are Adapter's, transcribed as owner-supplied copy exactly as every other route's are (`A3` — Adapter obtains nothing renderable or derived from Content). Carrying them as content would make head metadata flow out of a Content document, which is a different module owning the head |

**Field names follow the source document, except where the source name states something false about
the value.** The transcription is checkable only by eye — nothing in this build may read either source
— so a JSON document that reads like its source is the whole of what makes the comparison possible.
`href`, `website`, `link`, `period`, `tech`, `chips` and `badges` are the source's own words and stay.
Three names change and each is named here: `PortfolioStat.value` was `number`, which is untrue of a
field holding `"Open Source"`; `TechNode.children` was `subCategories`, which is accurate only at the
first level and calls a leaf technology a sub-category everywhere below it; and a badge is a string
rather than a record, so `alt` — the name of the text that stood in for an image — has nothing left to
name. `PortfolioDocument.projects` keeps the source's word while its entries are typed
`PortfolioCategory`, because they are project *categories* rather than projects and the type is where
that is worth saying.

**`header.name` is the one field with no counterpart in the source document.** The source CV names a
job title, an address and a phone line and never states whose CV it is, because the site it was
written for supplied that from elsewhere. It is required here — a CV that does not name its subject is
broken independently of any schema — and it is **owner-supplied at transcription time**. A slice
reaching it with no supplied value stops and asks; it does not infer one from a git author, a domain
or a repository name.

**`email` and `phone` are checked for emptiness and for nothing else.** `phone` is prose — the source
value is a country note and an availability statement, not a dialable number — and passes through
verbatim. `email` is rendered as a `mailto:` and carries no format constraint either: an address's
real validity cannot be established without sending mail, and a pattern strict enough to be worth
having rejects valid addresses while still accepting dead ones. Stated plainly, on the same footing as
`sourceUrl`'s: **these are the two CV fields whose shape nothing checks.** `V4` does not reach them —
it speaks HTTP, and neither is an HTTP URL.

**`tech` is a list, and the source's comma-separated prose is flattened once, by hand, at
transcription.** The alternative is a `string` split at render time, which puts a parser over prose
inside Composition and makes the page's chip boundaries a property of a regular expression rather than
of the record. The transcription is a single human act performed once; a split is code that runs on
every build and can be wrong every time.

**`period` is prose and must never be normalised into dates.** `"2023 – Present"`, `"2023-2024"` and
`"2019 – 2022"` all appear, and one of them has no end. A `Year` pair would have to invent a value for
`Present` and would lose the era labels `timelineProjects` carries (`"2023-Present (SubZeroDev Era)"`).
`Year` appears in exactly one place on this document — `CvProject.year` — which is why `validateCv`
takes a `BuildContext` and `cvDocumentValidator` is a factory, exactly as `projectsDocumentValidator`
is.

```ts
export type TechNode = {
  readonly name: string;
  readonly children?: readonly [TechNode, ...TechNode[]];
};

export type PortfolioCategory = {
  readonly category: string;
  readonly icon: string;
  readonly description: string;
};

export type PortfolioStat = {
  readonly value: string;
  readonly label: string;
};

export type PortfolioDocument = {
  readonly header: { readonly title: string; readonly subtitle: string };
  readonly technologies: readonly [TechNode, ...TechNode[]];
  readonly projects: readonly [PortfolioCategory, ...PortfolioCategory[]];
  readonly stats: readonly [PortfolioStat, ...PortfolioStat[]];
};

export type PortfolioData = Branded<PortfolioDocument, "PortfolioData">;
```

**`TechNode` is one shape where the source has three.** The source encodes its technology tree as a
top level of `{name, subCategories}`, a middle level that is either `{name}` or `{name, subCategories}`,
and a leaf level of bare strings — three encodings of one idea. Normalising them to a single recursive
node is transcription work done once, and it is what lets the renderer be one function rather than
three. `children` is absent, never `undefined`-valued and never empty, on the same convention
`Project.question` establishes.

**The tree is at most three levels deep, and that bound is enforced rather than observed.** It is what
makes a renderer total without unbounded recursion, and a fourth level would be a shape nobody designed
a presentation for. `PortfolioTechDepthExceeded` is what earns it. Acyclicity needs no rule: a JSON
document cannot express a cycle.

**`PortfolioStat.value` is a string, and that is the honest type.** The source carries `"20+"`,
`"50+"`, `"Open Source"` and the bare number `7` in one field. These are **authored display copy, not
counts of anything in the document** — nothing here holds fifty projects to count — so a numeric type
would be a claim the data cannot support and a union of `string | number` would push the same choice
onto every reader. This is the concrete reason `X1` narrows; see [`U11`](#u11--x1s-derivation-clause-is-narrowed-to-the-apex-pending-an-owner-edit-to-the-brief).

**Emoji ship verbatim.** `PortfolioCategory.icon` is a single emoji and several CV and portfolio
headings open with one. They are text, not assets: nothing is fetched, no icon font resolves them, and
`X5` escapes them like any other interpolated value. Neither `V13` nor `P1` is engaged.

**Neither document carries a URL that is not an `AbsoluteUrl`, and the portfolio document carries no
URL at all** — verified against all 379 lines of the source, which contains no `http` sequence. Every
outbound address on the two new routes therefore comes from the CV document or from the masthead, and
`checkedLinks` is where that set is enumerated.

### Content — derived shapes

```ts
export type StageCount = {
  readonly stage: Stage;
  readonly count: number;
};

export type EcosystemGroup = {
  readonly stage: Stage;
  readonly projects: readonly Project[];
};

export type EcosystemTree = readonly EcosystemGroup[];

export type ContaminationNode = {
  readonly project: Project;
  readonly escapes: readonly ContaminationNode[];
};

export type ContaminationForest = readonly ContaminationNode[];

export type ResolvedHome = {
  readonly projectId: ProjectId;
  readonly url: AbsoluteUrl;
};

export type CheckedLink = {
  readonly label: string;
  readonly url: AbsoluteUrl;
};
```

`EcosystemTree` carries exactly one group per `Stage`, in `stageOrder` order, including groups with
no projects. `ResolvedHome` is produced only for `own` and `within` homes; `none` yields no entry.

**`CheckedLink` is a URL and the name of what carries it, and it is Content's rather than
Verification's** even though `checkLinks` is its only consumer. `V4`'s set is derived from content —
the inventory's homes, `sourceUrl`, and the CV document's four link-bearing field paths — and a type
Content produces cannot live in a module Content may not import (`C1`). It is the widening of
`LinkCheckResult.target` from `ResolvedHome`, reopened on 2026-08-21; see
[`90-decisions.md`](90-decisions.md).

**`label` is diagnostic and carries no structure.** It names where the URL is written, so a failing
gate points at the record to fix — a `ProjectId` for an inventory home, a field path for a CV link.
It is deliberately not a `ProjectId`: most `CheckedLink`s belong to no project, and a synthetic id
naming nothing is the shape the 2026-08-07 ruling rejected when it left `sourceUrl` outside `V4`.
Nothing derives from a `label` and nothing matches on one.

### Presentation

```ts
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
  | "link-current"
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
```

| Type | Constraint |
|---|---|
| `HexColor` | Matches `/^#[0-9A-F]{6}$/`. Six digits, uppercase, no shorthand and no alpha — so one colour has exactly one spelling and two references to it cannot compare unequal |
| `DataUri` | Begins with `data:`. It is what makes `A2` a property of the value rather than a promise about it |
| `ClassName` | Matches `/^[a-z][a-z0-9-]*$/` |
| `Primitive.rules` | CSS text. Every selector in it either **begins with** that primitive's own class selector or carries it in the selector's **subject compound** — the rightmost compound, after the last top-level combinator — and each selector in a selector list is checked independently. The property that has to hold is that no rule reaches an element outside the class's reach, and the two forms establish it by different means: an opening anchor bounds every match to a subtree rooted at the class, which is what lets `page` style an `h1` and `row` size a `> *`; a subject compound bounds the match to an element carrying the class itself, which is what `.stack > .view` and `#effortless-action.view:target` do. This read *begins with* alone until 2026-08-20, which was never a statement of the property — it excluded both of those while admitting nothing safer, and the check written from it compared *contains* instead, which admits selectors that satisfy neither form. What follows an opening anchor is unconstrained: any pseudo-class, pseudo-element, combinator or universal selector. A reusable Presentation rule that could match without the class belongs in the token block, not in a primitive, because `stylesheetFor` emits a primitive's rules only when its class is present. **One exception, named rather than general** — `view`'s five nav-colouring selectors, described below. The fold's composition-wiring rules were a second until 2026-08-10, and `stylesheetFor` now emits the token block and matching primitive rules and nothing else. Rules may sit inside an `@media` block: `page`, `row`, `bar` and `grid` each wrap at `720px`, and `card` guards its hover lift behind `prefers-reduced-motion: no-preference`. Contains no `</style` sequence (`P5`) |

`PrimitiveName` is **closed at twelve**. The set reached ten with the 2026-08-08 amendment adding
`grid` and `card` for the testimonials route, which followed the 2026-08-07 amendment adding `bar`
and, before it, `row`; `view` and `link-current` were added by the two 2026-08-10 and 2026-08-13
amendments described below. See [`90-decisions.md`](90-decisions.md). Composition references a
primitive through `primitives`, so a further member is a contract amendment rather than a class
someone adds to markup. `rule` and `link` appear in both `ColorToken` and `PrimitiveName` and are
different things in each — a colour custom property in the first, a class in the second.

`view` is the apex's **tab switch**, and it is the reason the four apex sections are not all visible
at once. `.view` is hidden; `#<anchor>.view:target` is shown; a document with no fragment opens on the
first section. Each anchor id is repeated on the `:target` selector rather than written as a bare
`.view:target`, so the selected rule carries an id and outweighs the hiding rule. Further rules colour
the nav link whose section is selected `--fg` against the others at `--link`. **Being CSS, the switch
holds with the enhancement script absent or broken** — that is why it is not script behaviour, and it
is the same property the deleted fold rested on. It is its own primitive rather than part of `page`
because its selectors name the apex's four anchors and the miss route carries `.page` without them;
emitting them there would leave a selector with no user, which `assertStyleAgreement` rejects. This is
the one primitive whose rules name a **specific document's** ids rather than a reusable shape, and
that is a cost accepted rather than an oversight.

**It is also the one exception to `Primitive.rules`' anchoring constraint, and the exception is five
selectors rather than a category.** The nav-colouring rules — `.page:not(:has(.view:target)) nav
[href="#effortless-action"]` and the four `.page:has(#<anchor>.view:target) nav [href="#<anchor>"]`
— have a nav link as their subject, and that link carries `link`'s class and not `.view`. They
neither begin with `.view` nor carry it in the subject compound, so they can match an element the
class is absent from, which is the one thing the constraint exists to forbid. **This is the
`Primitive.rules` carve-out for composition-wiring CSS that the fold's `data-view` blocks had and
that this set was written to avoid**, taken deliberately on the owner's ruling of 2026-08-20 rather
than arrived at: CSS has no combinator reaching a section's `:target` state from its nav link, so a
selector anchored at the link cannot express the current-tab affordance at all, and the alternatives
were dropping the affordance or moving these five rules into the token block — where they would be
emitted into the miss document, naming four ids it does not have. **The cost, stated plainly:** the
anchoring constraint no longer bounds `view` by itself. What bounds it is the emission guard —
`stylesheetFor` reaches a primitive's rules only from a body already carrying its class — so these
five rules never enter a document without `.view` in it, but they are unbounded *within* one. A
sixth selector of this shape, or a first in any other primitive, is a contract amendment and not an
implementer's call; `tests/presentation/primitives.test.ts` enumerates exactly these five and fails
on a sixth. The alternatives and their costs are in [`90-decisions.md`](90-decisions.md),
2026-08-20 — *"`view`'s nav-colouring rules are a named exception to `Primitive.rules`"*.

`link-current` is `.link-current { color: var(--fg); }`, applied alongside `link`'s own class on the
outbound nav entry that names the current site, so that entry resolves to `--fg` rather than `--link`
by source order in `stylesheetFor`'s output. It carries no selector beyond that one declaration and
reaches no element `link` does not already reach.

`grid` lays its direct children out in a responsive multi-column flow — CSS `columns`, not `grid`
layout, chosen so a card's height is its own and the flow reads top-to-bottom within a column rather
than forcing every row to the tallest cell's height. It collapses to a single column at the same
`720px` breakpoint the rest of the set uses. It is, like `row`, a primitive that reaches a child it does
not name: each direct child gets `break-inside: avoid`, so a card is never split across the column
break, on the same footing `row`'s width rule already established for reaching an unnamed child.

`card` is a bordered, padded container for one attributed quote. It carries **no type rule of its
own** — a card's quote text and attribution reuse `page`'s and `meta`'s existing rules — and two
colour rules, both on its border: `--rule` at rest (`P2`(a)'s named exemption, on the same reasoning
`entry` already rests on) and `--fg-muted` on hover, which needs no exemption because it clears
`P2`(a) against `--bg` at 6.62:1. It is deliberately its own primitive rather than a `grid > *`
selector, because a card is meaningful outside a grid — a future consumer rendering one testimonial
needs the container without the multi-column flow.

**It is also the only primitive that moves**, and the only rule anywhere in this design that does: a
`translateY(-2px)` hover lift, with its transition, inside a `@media (prefers-reduced-motion:
no-preference)` block. `P3` is satisfied by construction rather than by inspection — the guard is
what makes the motion unreachable under `reduce`, so the rule is absent rather than overridden, and
nothing has to compute which declaration wins. It is retained on the owner's ruling of 2026-08-20;
the alternatives and their costs are in [`90-decisions.md`](90-decisions.md), 2026-08-20 —
*"`card`'s hover lift is retained, and is the only motion in the design"*. The hover
*colour* change is deliberately not inside the guard, so a reader under `reduce` still gets hover
feedback rather than none.

`row` lays its direct children out left-to-right, each taking an equal share of the available width,
wrapping to a single column at the same `720px` breakpoint `page` already uses. Its **one** spacing
rule is the gap between those columns. It carries no colour rule, no type rule and no spacing inside a
column — those come from whatever primitive each child already declares.

It **sizes** a child it does not name, through a child combinator on the universal selector. That is
what makes the equal share a property of the row rather than of what is put in it: a child needs no
cooperating class, so `row` composes with the rest of the set instead of constraining what may sit in
one. It read "the only primitive that sizes a child it does not name" until 2026-08-20, which `grid`'s
`break-inside` rule — added 2026-08-08 and described three paragraphs above — had already made untrue.

**`row` currently has no call site, and is retained deliberately.** Its last one went on 2026-08-10
when the apex's four sections stopped sharing a row and became siblings of the outer stack. It stays
because a two-column layout is a shape this design will plausibly want again, and because
`stylesheetFor` makes an unused primitive cost **nothing in the emitted output**: a primitive's rules
reach a stylesheet only when its class is already in a body, so `row` appears in no document and
`X4`'s `SelectorWithoutUser` half has nothing to catch. That is the whole of why this is not the
"permission with no user" [`10-design.md`](10-design.md) § *Alternatives considered* refuses elsewhere
— there, an unexercised permission widens what a document may contain; here it widens nothing, because
the emission is derived from the body rather than declared.

**The narrower verb is load-bearing.** This read "the only primitive whose rules reach elements it
does not name" until 2026-08-08, and that was never true of the set: `page` carries typography and
spacing rules for `header`, `h1`–`h4`, `p`, `section`, `article`, `footer` and `.stack`, and `entry`
carries rules for a nested `.stack`. Those reach a descendant to style it, which any primitive may do
within the `Primitive.rules` anchoring constraint. Imposing a *width* on an unnamed child is the thing
only `row` does, and it is the thing the paragraph was distinguishing. (The count in that sentence was
stale by the same amendments: it read "the other six", from before `row` and `bar` closed the set at
eight.)

`bar` lays its direct children left-to-right and pushes them to the **two ends** of its width,
wrapping to a single column at the same `720px` breakpoint `page` and `row` already use. Like `row` it
carries one spacing rule — a gap, which in the unwrapped state is a floor rather than the actual
separation — and no colour rule and no type rule.

**What distinguishes it from `row` is child sizing, and that is the whole of it.** `row` divides a
width between columns and gives each an equal share; `bar` leaves its children at their content width
and puts the free space *between* them. A row of two prose columns and a strip with a group at each
end are different layouts, and neither expresses the other: `row` cannot right-align its second child
without abandoning the equal share that is its purpose, and `bar` cannot give a column half the width
without abandoning the free space that is its. `bar` therefore needs **no** rule sizing a child it
does not name — content sizing is the flex default — which leaves `row` the only primitive that does.

**Presentation imports `Branded` from Content, and nothing else from this repository.** Every type
above is branded and `Branded` has one home; the 2026-08-05 ruling that put it in Content rejected
exempting type-only imports by name, so this is a real edge and
[`10-design.md`](10-design.md) § *Module boundaries* states it. `StylesheetText` and `BodyHtml` below
are **Presentation's** for the same reason the edge runs that way: `stylesheetFor` takes a `BodyHtml`,
so Composition owning it would put Presentation above Composition and cycle the graph.
`ComposedRoute` is Composition's.

### Presentation and Composition

```ts
export type StylesheetText = Branded<string, "StylesheetText">;

export type BodyHtml = Branded<string, "BodyHtml">;

export type ComposedRoute = {
  readonly bodyHtml: BodyHtml;
  readonly stylesheet: StylesheetText;
};
```

Both are branded because both are handed to the external package as strings, and an unbranded `string`
parameter there accepts any string at all — including a document fragment that was never composed.
`BodyHtml` is body **content**, not a `<body>` element: the package owns the shell. `StylesheetText`
is the text of a stylesheet with no `<style>` wrapper, because the package emits the element.

| Type | Constraint |
|---|---|
| `BodyHtml` | Every value interpolated from Content appears HTML-escaped in text position (`X5`). The package inserts this string into the document **unescaped**, so escaping is this repository's obligation and nothing downstream repairs it |
| `StylesheetText` | Contains no `</style` sequence in any case (`P5`). The package emits the text unescaped inside a `<style>` element and throws a bare `Error` on one, which is a failure this contract's error semantics cannot reach |

`ComposedRoute.stylesheet` is the stylesheet **that route's body requires**, not the union of every
rule Presentation can produce. That is what makes `X4` checkable per document rather than only across
the route set, and `P6` is what makes it true of every `ComposedRoute` rather than a habit. It is also
why four routes cost no new machinery: each derives its own stylesheet from its own body, so a route
added is a route checked.

### Route

```ts
export type RoutePath = "/" | "/cv/" | "/portfolio/" | "/404/";
```

The design's `Route` — path, prerendered body, required stylesheet, static head metadata — **is** the
external package's `LandingPageBodyRoute`, unchanged from `0.3.0` through the pinned `0.4.1`. This
repository declares no type of its own
around it and extends nothing.

The package's declaration is reproduced here so the fields this contract constrains are readable.
**The canonical copy is the package's `exports`**; it is not this repository's to change, and a
package upgrade that alters it changes this contract:

```ts
type LandingPageBodyRoute = {
  path: "/" | `/${string}/`;
  body: string;
  stylesheet?: string;
  metadata: LandingPageMetadata;
};
```

`RoutePath` narrows `path` to the four values `A4` permits. **The miss path is written last and that
ordering is not cosmetic**: it is the fallback route rather than a peer, and the union's order, the
`config.routes` order and `A4`'s enumeration all state the same thing in the same sequence, so a
reader meets one arrangement rather than three. `body` carries a `BodyHtml` and
`stylesheet` a `StylesheetText`; both cross the boundary as bare `string`, which is what the brands
exist to guard on this side. The metadata half is the package's `LandingPageMetadata` and needs no
addition — the icon set travels in its existing `icons[].href` as data URIs.

The package's other route form, `LandingPageEntryRoute`, is **never declared here**: it requires an
`entry` and emits `<script type="module">`, which `V13` forbids.

### Artifact

```ts
export type EmittedDocument = {
  readonly relativePath: string;
  readonly html: string;
};

export type ArtifactInput = {
  readonly outputDir: string;
  readonly serverConfigDir: string;
  readonly commit: string;
};

export type ArtifactReport = {
  readonly commit: CommitId;
  readonly markedEntries: readonly string[];
  readonly rootMissEntry: string;
  readonly serverConfigPath: string;
};
```

`ArtifactInput.commit` is the raw value read from the build environment and is **not** a `CommitId`
— validating it is Artifact's first act. `relativePath` and the `*Entry` values are positions inside
the emitted output tree, expressed with `/` separators; they are not repository source paths.

`serverConfigDir` is **not** inside `outputDir`, and `serverConfigPath` is therefore the one value in
this report that is not a position in the published tree. A file the server reads must not also be a
file the server serves: an in-tree configuration would be copied into the container's web root by the
same instruction that copies the documents, and Pages would publish it at the apex. `R6` asserts the
separation.

### Verification

```ts
export type RetryPolicy = {
  readonly attempts: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
  readonly backoff: "fixed" | "exponential";
  readonly attemptTimeoutMs: number;
};

export type Attestation = {
  readonly commit: CommitId;
  readonly approver: string;
};

export type LinkCheckResult = {
  readonly target: CheckedLink;
  readonly status: number | null;
  readonly attempts: number;
};

export type ReadBackResult = {
  readonly servedCommit: CommitId;
  readonly polls: number;
};

export type ServedResponse = {
  readonly status: number;
  readonly body: string;
};

export type RequestRecord = {
  readonly url: string;
  readonly resourceType: string;
  readonly initiatedByTester: boolean;
};

export type ModuleName =
  | "Content"
  | "Presentation"
  | "Composition"
  | "Adapter"
  | "Artifact"
  | "Verification";

export type ModuleImport = {
  readonly from: ModuleName;
  readonly to: ModuleName;
  readonly names: readonly string[];
};
```

`ModuleImport` carries the imported binding names because three of the rules it exists to check are
about *which* names cross an edge, not merely whether the edge exists: `A3` enumerates Adapter's Content
and Presentation imports, `C14` closes the set of modules that may import a document validator, and
Artifact is limited to `CommitId`, `parseCommitId` and `Result`. An edge-only graph would pass all three
while `Adapter` imported a derivation function.

`attempts >= 1`; `initialDelayMs >= 0`; `maxDelayMs >= initialDelayMs`; `attemptTimeoutMs > 0`.
`LinkCheckResult.status` is `null` where every attempt failed before a response.

**`Attestation` carries no timestamp**, and its absence is a decision rather than an omission: the
provider exposes no approval time to read, and the two fields here are the two that can be obtained
from the record without inference. The approval instant is still recorded — by GitHub, in the run and
the audit log — which is what the design requires of the *gate*. See
[`U3`](#u3--where-the-attestation-record-lives).

**The two publication targets are not a type.** Neither Pages nor the image is a value any module
holds; they are workflow configuration, distinguished only by which assertions run against which
address. Modelling them as a union would put a branch in code that has none.

---

## Persisted schemas

**None.** There is no database, no collection, no file this repository writes and reads back, and no
runtime state. Every value above is a compile-time constant materialised into HTML by the build.

Five things resemble persistence and are not:

| Thing | Where it lives | Migration story |
|---|---|---|
| `Project` inventory, `Testimonial` collection, `CvData` and `PortfolioData` | Four versioned JSON documents in this repository, read at build time | Re-read and re-validated on every build. There is **no migration path and none is planned**: the envelope carries a `version`, the schemas are strict, and a document at an unrecognised version or carrying an unknown key fails the build rather than being read leniently. That is the correct response to hand-edited content — the author is present and can fix it, which is exactly the condition under which lenient parsing is a liability. |
| Build marker | Injected by Artifact into each emitted document | No existing data. Every artifact is regenerated per commit; an older artifact is replaced, never migrated. |
| Server configuration | Emitted by Artifact beside the output tree, never into it (`R6`) | Regenerated per build from the same source. Nothing reads a previous build's copy, and it is never published. |
| Registry tags | The image registry | A commit tag is written once and never rewritten — the image it names is immutable. `latest` moves and is never an identity. No tag is ever migrated; an old tag stays resolvable, which is what makes a rollback expressible. |
| `Attestation` | A CI approval record, owned by the CI provider | Not read by the build and not read by any later run. An attestation is consumed by exactly one release and never re-read; Pages neither reads nor waits for it. |

`ProjectId` values are never reused and never renumbered, so no rename or remap path exists to
define.

---

## Public signatures

Internal helpers are out of scope. Only surfaces crossing a module boundary appear.

### Content

```ts
export const stageOrder: readonly Stage[];

export const primarySlogan: "Well… Why not?";

export const apexFooterQuote: "Trust us… It'll be fine. Or not.";

export const sourceUrl: AbsoluteUrl;

export function projectsDocumentValidator(context: BuildContext): Validator<Inventory>;

export const testimonialsDocumentValidator: Validator<Testimonials>;

export function cvDocumentValidator(context: BuildContext): Validator<CvData>;

export const portfolioDocumentValidator: Validator<PortfolioData>;

export function validateInventory(
  projects: readonly Project[],
  context: BuildContext,
): Result<Inventory, ContentError>;

export function validateTestimonials(
  testimonials: readonly Testimonial[],
): Result<Testimonials, ContentError>;

export function validateCv(
  cv: CvDocument,
  context: BuildContext,
): Result<CvData, ContentError>;

export function validatePortfolio(
  portfolio: PortfolioDocument,
): Result<PortfolioData, ContentError>;

export function testimonialTotal(testimonials: Testimonials): number;

export function parseCommitId(value: string): CommitId | null;

export function projectTotal(inventory: Inventory): number;

export function countByStage(inventory: Inventory): readonly StageCount[];

export function ecosystemTree(inventory: Inventory): EcosystemTree;

export function contaminationForest(inventory: Inventory): ContaminationForest;

export function sinceYear(inventory: Inventory): Year;

export function resolvedHomes(inventory: Inventory): readonly ResolvedHome[];

export function cvOutboundLinks(cv: CvData): readonly CheckedLink[];

export function checkedLinks(
  inventory: Inventory,
  cv: CvData,
): readonly [CheckedLink, ...CheckedLink[]];
```

**There is no unvalidated export in this contract.** There were two until 2026-08-11 — `projects` and
`testimonials`, hand-authored arrays in TypeScript — and both are gone. The hand-authored content now
lives in two versioned JSON documents outside the module graph (*The content documents*, below), and
the only way into it is a validator.

**The four document validators are Content's entry points, and each is two checks in sequence.**
`Validator<T>` is `subzerodev-data-json`'s type — `(raw: unknown) => { ok: true, value: T } | { ok:
false, message: string }` — and the package's loader is what calls one. Each validator first decodes
the document **structurally**, through a Zod schema over its envelope and record shapes, then hands the
decoded records to the **semantic** validator below it. That separation is the point: JSON makes
strings and numbers available, and `validateInventory`/`validateTestimonials` are what earn the domain
guarantees on top of them. A structural failure short-circuits; a semantic failure is flattened into
the single `message` the `Validator` contract permits, joining every `ContentError` rather than
reporting the first, so `A5`'s report-every-error property survives the narrower return type.

`projectsDocumentValidator` and `cvDocumentValidator` take a `BuildContext` and return a validator,
because `Year`'s constraint is relative to the build's UTC year and the context is not available where
a module constant would be — the inventory's `Project.year` and the CV's `CvProject.year` are the two
places that type appears. `testimonialsDocumentValidator` and `portfolioDocumentValidator` need none
and are constants.

**Every semantic validator remains exported and remains the semantic half.** They are still callable
directly and the tests do so; what changed on 2026-08-11, and holds for the two added on 2026-08-21, is
that **production reaches them only through a document validator**. Each is total over well-typed input
and returns every violation rather than the first. `validateTestimonials`'s violations are an empty
`quote`, an empty `author`, an empty collection and a malformed `url`. `validateCv`'s and
`validatePortfolio`'s are enumerated in *Error semantics*.

**`validateCv` and `validatePortfolio` return a branded value the caller could not otherwise
construct**, which is the same guarantee `Inventory` and `Testimonials` carry and the reason
`composeCv` and `composePortfolio` can be total. They are the only producers of `CvData` and
`PortfolioData`.

`testimonialTotal` takes the validated `Testimonials` and is what keeps the count on the apex a Content
derivation rather than a typed literal (`X1`), on the same footing as `projectTotal`. **Neither new
document has an equivalent**, and that is the narrowing `X1` records rather than an omission: the CV's
and the portfolio's figures are authored, not counted.

**The brands are still applied rather than earned**, which is why the *Error semantics* table
anticipates raw values that fail their own constraints: the Zod schemas decode to `readonly Project[]`
and `readonly Testimonial[]` by assertion at the transform, and the brands gate the derivations while
runtime validation stays the semantic validators' alone.

Every function other than the four semantic validators and `parseCommitId` takes a validated value —
an `Inventory`, a `Testimonials`, a `CvData` or a `PortfolioData` — and only the matching validator can
produce one. They are total on that input and return no error. The four semantic validators are the
validating entry points into the module's data.

**`checkedLinks` is the one derivation whose output leaves the render path**, and it is the single
definition of `V4`'s set: one entry per `ResolvedHome`, one for `sourceUrl`, and one per outbound URL
the CV document carries — `header.links[].href`, `roles[].website`, `projects[].link` and
`openSource[].link`, which are the four link-bearing field paths and the whole of them. It is non-empty
because `sourceUrl` is unconditional. `cvOutboundLinks` is the CV half, exported so it can be tested
against a fixture without an inventory; nothing else may enumerate CV links, because a second
enumeration is a second answer to what `V4` covers.

**It does not deduplicate, and that is deliberate.** `portfolio.subzerodev.com` is carried both by the
inventory's `portfolio` record and by the CV header's own Portfolio link, so a dead address there
raises two errors naming two different records — which is correct, because both are places an author
must edit. Deduplicating would report one and leave the other to be found later.

**A `CheckedLink` is not a promise the link is on the page.** `checkedLinks` enumerates what the
content documents carry; whether a composer renders a given one is Composition's, and `V4` is
deliberately the wider set. The reverse direction is the one that would be a defect — a rendered
outbound URL that `checkedLinks` does not enumerate is outside every gate, and the four field paths
above are named exhaustively so that a fifth added to `CvDocument` is a visible amendment rather than a
silent gap.

`parseCommitId` is here because Content owns `CommitId` and Artifact depends on Content for that type.
It returns `null` rather than an error variant: its one caller turns that into `CommitIdMalformed`, and
a second error vocabulary for a single-condition parse would buy nothing. It is the **only**
implementation of the 40-hex rule; a second one is the drift *Single ownership* forbids.

`stageOrder` is the lifecycle order, length 6, covering `Stage` exactly once.

**`sourceUrl` is the address of the repositories behind the ecosystem**, and is Content's for the
reason every other URL here is: a URL is data, and Content is where data has a home. It is a constant
rather than an inventory field because it addresses the **account**, not a project — modelling it as a
`Project` to reach `Home` would put a row in the ecosystem list and a `stage`, a `line` and a
`question` on something that is none of those. It is written once and Composition never restates it.

**It was deliberately outside `V4` until 2026-08-21, and it no longer is.** `checkLinks` ran over
`resolvedHomes(inventory)` alone, and `sourceUrl` produces no `ResolvedHome` — there is no project it
belongs to, and a synthetic `projectId` to carry it would be a `ProjectId` naming nothing. That cost
was accepted on 2026-08-07 and stated here plainly: it was the one outbound link on the page no gate
checked, verified `200` by hand on the day. **The decision is reopened rather than replaced**, on
evidence the original ruling could not have had: the CV route brings eighteen further outbound
addresses onto this site, so the exposure the 2026-08-07 ruling weighed as one link is nineteen. The
widening it declined — `checkLinks` over a `{ label, url }` shape rather than a `ResolvedHome` — is
what `CheckedLink` now is, and `sourceUrl` enters `V4` through `checkedLinks` with it. See
[`90-decisions.md`](90-decisions.md), 2026-08-07 and 2026-08-21.

What did **not** change is the brief's clause: *Definition of done* requires every outbound **project**
link to resolve, and neither a code-forge account page nor a CV's employer link is one. `V4` is now
wider than that clause rather than exactly it, which is the safe direction for a gate to be wrong in.

**It is still the one value in this contract guarded by a throw, and that is the exception the
*Types* section points at.** The throw is unaffected by the widening above: it checks the literal's
**shape** at module load, before any network exists and before `checkedLinks` can be called, while
`V4` checks whether the address **answers** — two different faults, caught at two different times.
`sourceUrl` is validated where it is declared — parsed through `URL`,
required to be `https:` — and a literal failing either check raises a bare `Error` at module load.
Content has no other throwing path and no `ContentErrorCode` covers this: a `Result` returned from a
module-level constant has no caller, which is the same shape that made `A5`'s handling a process exit
rather than a returned error. The consequence is stated rather than hidden — a malformed `sourceUrl`
fails the build through an uncaught exception during Adapter's module evaluation, **not** through
`A5`'s report-every-error-then-exit path, so it is the one content fault that does not arrive
alongside the others. The alternative was no check at all on a link no gate reached; with `V4` widened
that alternative is weaker still, because an unparseable literal would now reach `checkedLinks` and
fail a networked gate minutes later instead of the build immediately. Recorded on 2026-08-08 and
retained on 2026-08-21; see [`90-decisions.md`](90-decisions.md).

#### The content documents

Four files, declared to the package rather than imported by it. Their paths, ids and cache policy are
in [`site/sources.public.yml`](../site/sources.public.yml) and their shape is in the Zod schemas in
Content — **neither is restated here**, because both are in the tree and a copy in this document is the
one that rots. What this contract states is what the tree cannot:

- **The envelope carries a `version`, and the schemas are `.strict()`.** An unknown key is a failure,
  not an ignored field, and a document at an unrecognised version fails rather than being read
  leniently. Both are deliberate: this is hand-edited content with no migration story (*Persisted
  schemas*), so the only safe response to a shape nobody wrote on purpose is to refuse to build.
- **The documents are read at build time only.** `at: build` in the source map is what makes that
  checkable; nothing in the emitted artifact reads them, and the brief's no-network-in-the-build
  non-goal is what forbids any other origin for them.
- **The cache policy is `manual`.** The build is expected to re-read them every time. A time- or
  mtime-based policy would make a content edit's arrival on the page depend on a clock, which is the
  one thing an author changing a `line` must not have to reason about.
- **They are the *only* source of `Project`, `Testimonial`, CV and portfolio values.** No TypeScript
  module carries one, which is what makes `C14` a rule about validators rather than about records
  (*Invariants*).
- **`cv.json` and `portfolio.json` are transcriptions, and each names its source in a required
  `provenance` field on the envelope, beside `version`.** The canonical records live in sibling
  repositories — `Portfolio`'s `config/cvData.yml` and `Docusaurus-Template`'s
  `data/portfolioData.json` — and this build **cannot read either**: the brief's *no content derived
  from sibling repositories* and *no network in the build* non-goals are both binding, and neither is
  relaxed here. The transcription is therefore a one-time human act, and the copy here is
  authoritative for what this site serves.

  **It is a field rather than a comment, and that is forced twice over.** JSON has no comment syntax,
  and these schemas are `.strict()`, so a `_note` key would fail the build. Making provenance *data*
  is the better answer anyway: a comment is invisible to every check, while a field can be required,
  asserted, and read by anyone comparing the two documents by hand. `provenance` is a non-empty string
  and is the two documents' only envelope field beyond `version` — `projects.json` and
  `testimonials.json` do not carry one and are not being changed to, because their content is authored
  here and has no upstream to name.

  **Nothing checks that a transcription stays in step with its source, and nothing is claimed to.**
  The field records where the words came from so a later divergence is a question someone can ask
  rather than a mystery.

`site/dist/` is build output and is git-ignored; a stale document under it is not a content source and
nothing reads one.

### Presentation

```ts
export const palette: Palette;

export const primitives: PrimitiveSet;

export const themeColor: HexColor;

export const iconDataUri: DataUri;

export function stylesheetFor(body: BodyHtml): StylesheetText;
```

**`stylesheetFor` reads the referenced set out of the body rather than being told it.** It collects
which `primitives` class names occur in `body` **as a class token**, and starts with the token block
followed by exactly those primitives' `rules`, in `PrimitiveName` declaration order. **Nothing else is
emitted** — there is no non-primitive rule and no per-body extension. A class in the body that is not a
primitive contributes nothing, which is what
leaves `X4`'s
`ClassWithoutRule` half with teeth against a class Composition wrote by hand; the
`SelectorWithoutUser` half becomes structurally true **over the primitives**, because a primitive's
rules reach the stylesheet only when its class is already in the body. The token block is not covered
by that argument, and is not covered by the invariant either: `X4`'s second half is over class
selectors and the block carries none. That is the sense in which `X4` verifies a property rather
than enforcing one — `P6`.

It is pure and total: no body is malformed for its purposes, and an empty referenced set yields the
token block alone.

**The token block.** It declares exactly these custom properties on `:root`, and one further `:root`
rule applying `--bg` and `--fg` as the document's background and colour. That rule is the token
block's and not a primitive's for two reasons: a custom property on its own paints nothing, and a
dark-first page whose background is set inside a primitive has a light viewport gutter outside it.
Nothing else is in the block. The five colour values are emitted from `palette` rather than written a
second time.

| Property | Value | |
|---|---|---|
| `--font-sans` | a sans stack of locally-resolved faces | prose |
| `--font-mono` | a system mono stack | the **`meta` register**: record labels (`year`, `stage`, `ProjectId`, `escapedFrom` edges), section indices, derived counts, the header tagline and the link rows. Reserved to one primitive by `P7`. It is **not** the manifesto or a project's `line` — this row read "never prose" until 2026-08-08, which the composition's tagline, counts and navigation had never satisfied |
| `--step--1` | `0.8rem` | |
| `--step-0` | `1rem` | body |
| `--step-1` | `1.25rem` | |
| `--step-2` | `1.563rem` | the threshold `P2` names |
| `--step-3` | `1.953rem` | |
| `--space-0` | `0.75rem` | |
| `--space-1` | `1.17rem` | |
| `--space-2` | `1.83rem` | |
| `--space-3` | `2.86rem` | |
| `--space-4` | `4.47rem` | |
| `--measure` | `34rem` | |
| `--bg` | `palette.bg`, `#111113` | |
| `--fg` | `palette.fg`, `#F3F1EC` | |
| `--fg-muted` | `palette["fg-muted"]`, `#9A989F` | |
| `--rule` | `palette.rule`, `#2B2B31` | exempt from `P2`'s contrast half, by name |
| `--link` | `palette.link`, `#6FD3FF` | |

Both scales are the single 1.25 ratio the ruling settles, a spacing token advancing two steps of it.
**The step indices are fixed by two statements in that ruling and are not a free choice**: the measure
is "roughly 65 characters at `--step-0`", which puts `1rem` at index 0, and `P2` requires 3:1 at
`1.563rem` and above, which is WCAG's large-text threshold and therefore index 2 at a 16px root. The
`0.8rem` step takes `--step--1` as a consequence. The spacing indices run from 0 over the same five
values.

**The block declares the whole scale; a primitive draws on as much of it as it needs, and several
properties have no user.** `--step-1`, `--step-2`, `--step-3`, `--space-3`, `--space-4` and `--measure`
are emitted into every document and referenced by no rule, because the primitives express fluid sizing
and spacing as `clamp()` over the scale's endpoints rather than by naming a single step. That is
declaration, not drift: the scale is the authored ratio the ruling settles, and a step with no user
today is the next author's to reach for rather than a value to re-derive. `X4`'s `SelectorWithoutUser`
half does not reach the token block — it is over class selectors, and the block carries none — so
nothing here is asserted, and nothing is claimed to be. This paragraph was added on 2026-08-08, after a
`/reconcile` pass found the annotations in the table above describing users that several of these
properties did not have.

The two font properties are named here and their stacks are not, because no assertion turns on which
faces they list. A stack may name a face that is not installed anywhere by default — naming one is a
preference the browser resolves locally, not a load, so the stack simply falls through to the next
entry. What does turn on them is `P1` — neither may reference a webfont or an `@font-face` rule —
and `P7`, which reserves `--font-mono` to one primitive.

`themeColor` **is** `palette.bg`, not a second literal of the same colour, and Adapter reads it from
here (`A7`). `iconDataUri` is an inline SVG letterform — the glyph `0` — in `--fg` on `--bg`, encoded
as a data URI; being a `DataUri` is what discharges `A2`.

### Composition

```ts
export function composeApex(
  inventory: Inventory,
  testimonials: Testimonials,
  origin: string,
): ComposedRoute;

export function composeCv(
  inventory: Inventory,
  cv: CvData,
  origin: string,
): ComposedRoute;

export function composePortfolio(
  inventory: Inventory,
  portfolio: PortfolioData,
  origin: string,
): ComposedRoute;

export function composeMiss(): ComposedRoute;
```

These four functions and `ComposedRoute` above are the module's entire public surface. All four are
total and cannot fail: a validated document cannot be malformed by construction, and none performs
I/O.

**`composeCv` and `composePortfolio` take an `Inventory` for the masthead and for nothing else.**
Neither renders a project entry, a stage grouping, a contamination chain or a count. What the
inventory supplies is what the shared header needs — the outbound nav's Blog href, resolved through
`resolvedHomes` rather than restated, and the `sinceYear` in the tagline. **It must not acquire a
default and must not become optional**: a header composed without it would either drop the Blog link
silently or invent a year, and Composition is total and cannot report either. Deriving it inside the
composer rather than passing `hrefById` and `sinceYear` in is what keeps `A3` closed — Adapter imports
no Content derivation, so Adapter could not compute them.

The parameter order is the shared value, then the route's own document, then `origin` — the same shape
`composeApex(inventory, testimonials, origin)` already has, so the four signatures read as one family.

**`composeApex` composes the whole apex, testimonials included.** It takes a `Testimonials` for the
same reason it takes an `Inventory` — Composition holds no content of its own, and the testimonials
section is one of the apex document's four sections rather than a document of its own. It renders every
`Testimonial` in input order and knows nothing about who any of them are: no `author`, `quote`,
`role`, `organization` or `url` appears in Composition's source, which is what `X8` asserts. Site copy
it does carry, on the same footing as the manifesto's — the section heading and the fixed `Source`
link text are this site's words, and only the quoted people's words and their citation are
parameterised.

**The four sections are selected, not stacked.** All four are in the emitted body; the `view` primitive
is what shows one at a time, in CSS, with no script (*Types* § *Presentation*). That is
a Presentation rule reached through a class Composition writes, not a Composition mechanism, so nothing
in this section describes it beyond naming where it lives.

Each composer produces its `bodyHtml` first, referencing classes only through `primitives`, and obtains
`stylesheet` by calling `stylesheetFor` on that same body. Composition therefore never states which
primitives it used, and a route whose stylesheet describes a primitive its body does not carry is not
expressible (`P6`).

`composeMiss` takes no inventory because the miss document displays nothing derived from one — it is
the one route with no masthead. If it ever must — a project count, the since year, the shared header —
that is a contract amendment, not an implementer's call, because a composition with no data cannot
carry a derived figure.

**Adapter supplies every validated document.** Each composer takes what it needs as parameters;
Composition never validates, never imports a document validator and never reads the environment. See
*Adapter* below and [`U8`](#u8--the-validateinventory-call-site-and-load-time-failure).

**Neither new composer writes `view`'s class, and that is a constraint a signature cannot carry.**
`view`'s rules name the apex's four section anchors by id (*Types* § *Presentation*), and
`stylesheetFor` emits a primitive's rules whenever its class is present in the body — so a `.view` on
the CV or the portfolio document would emit five selectors naming ids that document does not have.
`assertStyleAgreement` would not catch it: its `SelectorWithoutUser` half is over class selectors, and
`nav [href="#effortless-action"]` carries none. The apex's tab switch stays the apex's; the two new
routes are linear documents and select nothing.

**Every class either new body carries is one of the other eleven primitives**, referenced through
`primitives` exactly as `composeApex` and `composeMiss` reference theirs. `PrimitiveName` is unchanged
by this amendment and stays closed at twelve — a CV timeline is `entry` records with `meta` lines, and
a portfolio technology tree is a `grid` of `card`s, both of which the existing set expresses. A
thirteenth member is a contract amendment, on the same footing every previous addition was.

**The `Source`-link asymmetry does not repeat here.** `X8` fixes the testimonial citation's link text
because that word is Composition's rather than the quoted person's. A CV link carries its own `label`
and a project its own `title`, so those are content and are interpolated, escaped, like any other
value.

**`composeApex` also emits the JSON-LD block (`X6`), which is why it gained an `origin` parameter on
2026-08-07.** The block is in the **body**, not the head, because the package owns the head and its
metadata set is closed — there is no field for an arbitrary element, the same fact that made the build
marker Artifact's. `<script>` is flow content and is conforming in `<body>`, so this needs no exception
to the output-shape rules the design asserts about itself. `composeMiss` emits none: a not-found
document is not an `Organization`, and `X6` says so rather than leaving it to taste.

**`composeCv` emits a second JSON-LD block, holding a `Person`, and `composePortfolio` emits none.**
This was left open by the 2026-08-20 design pass and is settled here. The CV is the one document on
this site whose subject is a person, and every value in the block is already visible prose on the same
page read out of the same validated `CvData` — which is the exact justification the `Organization`
block rests on, applied to the other entity this site describes. The portfolio has no such subject:
`CollectionPage` or `ItemList` would describe the **page** rather than an entity, which is a different
kind of claim from the one the apex makes, and a technology tree is not a thing schema.org has a type
for. Two costs are accepted rather than hidden — a second escaping surface, guarded by the same
`</script` check `X6` already applies, and a second block whose `name` is owner-supplied copy that no
gate can check. The rejected alternatives are in [`90-decisions.md`](90-decisions.md), 2026-08-21.

**The `Person` block omits the email address, and the omission is the decision.** `cv.header.email` is
rendered as a visible `mailto:` — a deliberate, human-facing affordance, and the whole of the contact
story the brief's no-forms non-goal leaves — while a JSON-LD `email` is a machine-readable restatement
harvested by anything that fetches the page. It widens exposure and buys nothing the brief asks for.
`phone` is omitted for the same reason and a second: its value is prose, not a dialable number, so a
consumer parsing it would be parsing a sentence.

`origin` is a **parameter rather than an import** because `X2` confines Composition to Content and
Presentation, and the site origin is Adapter's (`A1`). Passing it keeps that edge closed. It is typed
`string` and not `AbsoluteUrl` deliberately: Adapter's `origin` is declared as a string literal so
`A1` can assert the concatenation, and branding it would ripple through every metadata field for a
value that never crosses into the package on this path. The brands exist to guard the package
boundary, and this is not one. What the object's `name` and `description` say is owner-supplied copy,
transcribed at slice time like every other route string.

### Adapter

```ts
export const origin: "https://subzerodev.com";

export type RoutePath = "/" | "/cv/" | "/portfolio/" | "/404/";

export const apexPath: "/";

export const cvPath: "/cv/";

export const portfolioPath: "/portfolio/";

export const missPath: "/404/";

declare const config: LandingPageDataConfig<{
  projects: Inventory;
  testimonials: Testimonials;
  cv: CvData;
  portfolio: PortfolioData;
}>;
export default config;
```

`RoutePath` is declared **here**, not in Content or Composition, because the set of paths this site
declares is Adapter's alone. Each path constant is written `satisfies RoutePath`, which is
what makes an undeclared path a compile error rather than a review finding; `tests/types/route-path.type-check.ts`
pins the union by mutual assignability so that adding or removing a member fails the typecheck with no
`@ts-expect-error` available to suppress it.

**`cvPath` and `portfolioPath` are this site's own paths, and that is the whole of why the masthead
changed.** `portfolio.subzerodev.com` remains a live deployment of its own and remains the inventory's
`portfolio` record with an `own` home, so `resolvedHomes` still yields it, `checkedLinks` still carries
it and `V4` still checks it — nothing about that subdomain is withdrawn, replaced or fronted by this
repository. What changed is only which address the **nav entry labelled Portfolio** points at, and it
now points here.

**The default export is a `LandingPageDataConfig`, not a `LandingPageConfig`** — this changed with the
2026-08-11 migration to JSON content and is the largest interface consequence of it. Adapter no longer
*holds* a configuration; it declares four build-time **sources**, each paired with the validator that
gives it a type, and a **`compose` callback** the package invokes with the validated data. `config`
therefore exists only as that callback's return value, once per build, after validation has already
succeeded. The package's `defineLandingPageData(sources, config)` is what constructs it, and
`LandingPageDataSource<T>` makes the validator **required**: `T` is this repository's claim about JSON
the package never authored, and an unchecked cast would make the type a lie. Verified against the
published `0.4.1` source.

`config.routes` is exactly four `LandingPageBodyRoute` values, in this order — the apex at `apexPath`
carrying `composeApex(projects, testimonials, origin)`, the CV at `cvPath` carrying
`composeCv(projects, cv, origin)`, the portfolio at `portfolioPath` carrying
`composePortfolio(projects, portfolio, origin)`, and the miss at `missPath` carrying `composeMiss()`.
Each route's `body` and `stylesheet` come from its own `ComposedRoute`. The miss stays
last: it is the fallback route, not a peer, and the order documents that.

**Only the miss route's emitted document is relocated.** The package emits `cv/index.html` and
`portfolio/index.html` alongside `404/index.html`, and Artifact removes only the last of the three —
a directory index served with a **200** is correct at `/cv/` and at `/portfolio/`, and is a soft 404
at `/404/`. `R2`'s removal is about what that one path means, not about directory indexes, and
extending it would delete two documents the site is for.

No repository module imports Adapter — Verification's assertions over `A4` and `A6` necessarily do,
which is the same reading Verification's own boundary rule takes.

**Adapter no longer calls a validator, and that is the other half of the same change.** It *declares*
`projectsDocumentValidator(context)`, `testimonialsDocumentValidator`, `cvDocumentValidator(context)`
and `portfolioDocumentValidator` against the four source ids;
the package's loader invokes each exactly once, before `compose` runs, and refuses to call `compose`
at all if any fails. The build's entry conditions are still read in exactly one place and the build
can still refuse to produce anything — the refusal simply belongs to the loader now, executing a
validator this module handed it. That is what `A5` asserts, and it is why the contract no longer names
Adapter as a *call site* (`C14`).

**What Adapter still owns at build time is `BuildContext`.** It reads `GITHUB_SHA` from the
environment, parses it with Content's `parseCommitId`, and exits non-zero on a malformed value before
any source is resolved. `projectsDocumentValidator` and `cvDocumentValidator` take that context, which
is why each is a factory rather than a constant. **One `BuildContext` is read once and handed to
both** — two reads of the same environment could disagree across a UTC midnight, and a build whose two
`Year` ceilings differ is a build whose failure depends on when it started.

Five fields are declared **absent**, in four groups, and each absence is load-bearing rather than a
default:

| Field | Absent because |
|---|---|
| `config.styles` | The package declares it and **reads it nowhere** — verified against the published source at `0.3.0` and re-verified at the pinned `0.4.1` on 2026-08-20, where only a body route's own `stylesheet` is read. `hydrate` is declared and unread in the same way; at `0.4.1` it is read only as a type check during data validation, never to hydrate anything. Presentation's output therefore travels in each route's own `stylesheet`, which is also what makes `X4` a per-document check rather than a check across the route set |
| `config.publicDir`, `config.allow` | This repository emits no public asset and imports nothing from outside the site root. Note that omitting `publicDir` does not disable it — the package falls back to a `public` directory beside the adapter, which this repository does not create. A public directory is the one path by which a linked asset could enter the tree, and `V13` is what catches one that does |
| `metadata.noScript` | [`U5`](#u5--noscript-is-withdrawn-pending-an-owner-edit-to-the-brief). For a body route the package appends it **inside the body**, so a declaration here would put a false sentence in the document's prose |
| `metadata.repositoryUrl` | The package's adapter path does not emit it. Declaring it would be inert, and an inert declaration reads as a fact about the document |

`metadata.canonicalUrl` and `metadata.openGraph.url` are `origin` concatenated with that route's
path; `metadata.openGraph.type` is `"website"`. `A1` asserts the pairing so no second origin string
exists to drift, and it now covers four routes rather than two.

**The CV's and the portfolio's `title` and `description` are owner-supplied copy, transcribed here.**
They are deliberately not read from the content documents: head metadata is Adapter's, and sourcing it
from Content would put a renderable-adjacent value on an edge `A3` closes. This is the standing
condition [`S13`](30-slices.md#s13--the-apexs-real-title-and-description) retains past its own
withdrawal — an implementing agent with no supplied copy stops and asks rather than writing brand
voice.

`metadata.themeColor` is Presentation's `themeColor`, and `metadata.icons` is exactly one entry whose
`href` is Presentation's `iconDataUri`. One SVG data URI serves every size, so a second entry would be
a second copy of one mark. Both values are **imported, never transcribed** — a hex or a data URI
written out here would be a second copy of visual identity with nothing comparing the two, which is
what `A7` forbids. Whatever else `LandingPageIcon` requires beside `href` is the package's
declaration, transcribed at slice time against the pinned `0.4.1` the same way the route metadata's
other package-owned fields are.

**Adapter therefore imports two named things from Presentation, and only these two**, unchanged by
the four-route amendment — a route added does not widen this edge, because everything renderable still
arrives through Composition. That is a
change to `A3`, which said it read nothing from Presentation, and to the clause in
[`10-design.md`](10-design.md) § *Module boundaries* that it came from. Neither value is renderable
and neither is derived from Content, so the property that clause exists to protect — exactly one path
from data to markup, through Composition — is untouched. The design's wording was the stale half;
`/reconcile` corrected it on 2026-08-06 and the two documents now agree.

`socialImageUrl`, `openGraph.imageUrl` and the `twitter` block are **not** written here — `U6`
settled that no social image exists, so all three are omitted entirely. `title`, `description` and
the Open Graph title and description are owner-supplied copy, not this contract's to author. A slice
transcribes them; it does not invent them.

`missPath` is the canonical declaration of the miss route's path. Artifact's `missEmittedEntry` is the
package's emitted mapping of exactly this value and must change with it; `R5` asserts the pairing.
No other route needs such a pairing — Artifact treats every `.html` entry identically (`R1`, `R3`),
and only the miss route has a second, relocated published path. `cvPath` and `portfolioPath` emit
`cv/index.html` and `portfolio/index.html` and those documents stay where the package put them: a
directory index served with a 200 is what those two routes are **for**, and is a soft 404 only at
`/404/`.

**Adapter is where the build's entry conditions are read, and where it can still refuse to produce
anything.** It is the module the package CLI loads. Two refusals live here, and they are different in
kind:

1. **A malformed commit is Adapter's own**, and it is a **process exit**, not a thrown exception and
   not a string error: *Error semantics* holds, and the failure is expressible where a `Result`
   returned from module evaluation would have had no caller. It happens during module evaluation,
   before any source is resolved.
2. **Malformed content is the loader's**, through a validator this module declared. Every
   `ContentError` from the failing document is reported — not the first — and `compose` is never
   called, so no route body, stylesheet or document is produced. That is the whole of `A5`. **Whether
   a second failing document also reports is the loader's to decide and is not asserted here**: what
   this contract requires is that each document reports all of its own faults, which is the property a
   single validator can guarantee.

The second was Adapter's own direct call until 2026-08-11 and is why `C14` no longer names Adapter as
a *validation call site*: the only thing Adapter still holds is the **reference** to the validator,
which is what that invariant now closes the importer set around.

Adapter and Artifact each read the commit from the environment independently — Adapter for
`BuildContext`, Artifact for the marker — and both parse it with Content's `parseCommitId`. That they
agree is not assumed: `V1` compares the marker in every emitted document against the commit being
built.

### Artifact

```ts
export const missEmittedEntry: "404/index.html";

export const missRootEntry: "404.html";

export const serverConfigFilename: "default.conf";

export const buildMarkerPrefix: "<!-- build-commit: ";

export const buildMarkerSuffix: " -->";

export function buildMarker(commit: CommitId): string;

export function serverConfig(): string;

export function injectBuildMarker(
  documentHtml: string,
  commit: CommitId,
): Result<string, ArtifactError>;

export function finalizeArtifact(
  input: ArtifactInput,
): Promise<Result<ArtifactReport, ArtifactError>>;
```

**The marker format.** `buildMarker(commit)` is exactly
`` `${buildMarkerPrefix}${commit}${buildMarkerSuffix}` `` — an HTML comment carrying the full
forty-character commit id. `injectBuildMarker` inserts it immediately before the first `</head>` and
nowhere else, and fails rather than producing a second one. The format is a comment, not a
`<meta name>` element: an unregistered `meta` name is flagged by a conforming HTML validator, and this
design has already refused once to ship output it would have to except from validation. It is
extractable from a raw response body by a fixed pattern, with nothing parsed and nothing executed, and
because Artifact runs after the bundler no minifier ever sees it.

**`finalizeArtifact`'s order of operations is part of the contract, not an implementation detail.** It
validates `input.commit`, confirms `missEmittedEntry` is present (`R5`), copies it to `missRootEntry`,
injects the marker into every `.html` document in the tree — the copy included — **then removes
`missEmittedEntry`**, and writes `serverConfig()` last, into `serverConfigDir`. Copying before
injecting is what makes `R2` hold: both documents are marked in the same pass and are byte-identical at
the moment the identity is asserted. Injecting first and copying after would also work today and would
break silently the day a second post-build rewrite is added. The configuration is written last and
outside `outputDir`, so it is neither a document nor a marking candidate and no ordering question
about it can arise.

**The removal is why the miss document has exactly one published path.** `404/index.html` is a
directory index, so a host serves it with a **200** — the miss composition, at a fixed and discoverable
URL, declaring itself canonical through `A1`. That is a soft 404 by this design's own definition, and
`V12` never sees it because `V12` requests a *unique unknown* path. Removing the emitted entry after
the copy is what stops the path existing on either target. The route declaration is unchanged and
`missPath` still reads `/404/`: what changes is only where the emitted document ends up, which is
`Artifact`'s business and not the route's.

**`serverConfig` is Artifact's third duty and takes no argument.** It returns the container server's
configuration text — the format belongs to `nginx`, per [`U7`](#u7--which-server-serves-the-container-tree),
and the two directives that express the requirement are recorded there rather than restated here.
It is pure and deterministic, so the text is assertable without a filesystem, a container or a
network: a test can require it to resolve an unknown path to `missRootEntry` with a 404 status
(`R4`) and to name no path this repository does not emit. `V12` verifies the behaviour the file is
supposed to produce; this function is what makes the file itself checkable before an image exists.

Artifact imports `CommitId`, `parseCommitId` and `Result` from Content, and nothing else from this
repository.

### Verification

```ts
export const linkCheckRetry: RetryPolicy;

export const deploymentPollRetry: RetryPolicy;

export function readBuildMarker(documentHtml: string): Result<CommitId, VerificationError>;

export function checkLinks(
  targets: readonly CheckedLink[],
  policy: RetryPolicy,
): Promise<Result<readonly LinkCheckResult[], VerificationError>>;

export function pollForCommit(
  url: AbsoluteUrl,
  expected: CommitId,
  policy: RetryPolicy,
): Promise<Result<ReadBackResult, VerificationError>>;

export function assertNoAdditionalRequests(
  records: readonly RequestRecord[],
): Result<null, VerificationError>;

export function assertAttestation(
  attestation: Attestation | null,
  commit: CommitId,
): Result<null, VerificationError>;

export function assertContentPresent(
  documentHtml: string,
  manifestoSentences: readonly [string, ...string[]],
  inventory: Inventory,
): Result<null, VerificationError>;

export function assertDeploymentCandidateCurrent(
  commit: CommitId,
  branchHead: CommitId,
): Result<null, VerificationError>;

export function assertSelfContained(
  documentHtml: string,
): Result<null, VerificationError>;

export function assertStyleAgreement(
  bodyHtml: BodyHtml,
  stylesheet: StylesheetText,
): Result<null, VerificationError>;

export function assertEveryDocumentMarked(
  documents: readonly EmittedDocument[],
  commit: CommitId,
): Result<null, VerificationError>;

export function assertRootMissDocument(
  documents: readonly EmittedDocument[],
): Result<null, VerificationError>;

export function assertMissEntryRemoved(
  documents: readonly EmittedDocument[],
): Result<null, VerificationError>;

export function assertUnknownPathResponse(
  response: ServedResponse,
  emittedMissDocument: string,
): Result<null, VerificationError>;

export function assertServedBytesMatchEmitted(
  served: Uint8Array,
  emitted: Uint8Array,
): Result<null, VerificationError>;

export function assertImageIdentity(
  imageTag: string,
  servedMarker: CommitId,
  commit: CommitId,
): Result<null, VerificationError>;

export function assertImportGraph(
  edges: readonly ModuleImport[],
): Result<null, VerificationError>;
```

Concrete policy values:

| Constant | attempts | backoff | initialDelayMs | maxDelayMs | attemptTimeoutMs |
|---|---|---|---|---|---|
| `linkCheckRetry` | 3 | `exponential` | 1000 | 8000 | 10000 |
| `deploymentPollRetry` | 60 | `fixed` | 5000 | 5000 | 10000 |

`readBuildMarker` reads the format Artifact owns, through Artifact's exported constants. It never
restates the pattern.

**`checkLinks` returns no per-target result on failure.** `Result`'s error branch carries errors
only, so a run with any failing target yields no `LinkCheckResult` at all — including for the targets
that passed. Each failing target's attempt count and observed status therefore travel in that
target's `VerificationError.detail` and `observed`, which is the only place they are readable. This
is accepted rather than designed around: `Result` is the one error shape every module returns, and a
bespoke both-branches type for one function's diagnostics would be paid for at every other call site.
The cost lands on the acceptance criteria that name `attempts` for a failing target, which are
checkable only against the stub that answered — see [`30-slices.md`](30-slices.md) § S3.

`checkLinks` does not follow redirects. A 3xx is a pass, per the `LinkNotOk` row below, so a target
that has begun redirecting to a parked page, a registrar hold or a login wall satisfies `V4`. The
gate proves an address still answers, not that what answers is still the project.

**`checkLinks` took `readonly ResolvedHome[]` until 2026-08-21 and now takes `readonly CheckedLink[]`.**
It is otherwise unchanged: the retry semantics, the redirect rule and the no-per-target-result-on-failure
shape all hold as written. What the widening buys is that the function no longer decides what `V4`
covers — `checkedLinks` does, in Content, where the content is — and what it costs is that a failing
target is named by a `label` rather than by a `ProjectId`, so a diagnostic that was a typed identity is
now a string. That is the trade the 2026-08-07 ruling declined and 2026-08-21 accepted; the evidence
that reopened it is in [`90-decisions.md`](90-decisions.md).

**Four codes previously had no producing function, and two invariants no callable surface.** The three
signatures that close it are the two added above and `assertAttestation`'s changed first parameter:

| Code | Producer | Discharges |
|---|---|---|
| `ManifestoAbsent`, `ProjectNameAbsent` | `assertContentPresent` | `V3` |
| `StaleDeploymentCandidate` | `assertDeploymentCandidateCurrent` | `V6` |
| `AttestationAbsent` | `assertAttestation`, given `null` | `V5` |

`assertAttestation` takes `Attestation | null` because absence is the condition `AttestationAbsent`
names, and a parameter that cannot be absent cannot express it. The `attestation` job passes what it
read from the run's approval record to `publish-release`, and `null` where there was none. The Pages
preview does not call this function and does not depend on that job.

**`assertContentPresent` covers the apex and is not extended to the two new routes.** `V3` exists to
catch content that has come to depend on script execution, and neither the CV nor the portfolio
document carries an executing script at all (`X10`) — the failure mode is structurally absent there,
so a presence assertion would assert something nothing can break. The two routes' content is asserted
instead by their own slices, against the emitted document, without a Verification signature. Stated
plainly so it is a limit rather than an assumption.

`assertContentPresent` takes the `Inventory` rather than a list of names, so a caller cannot satisfy
`V3` by passing three of fourteen. `manifestoSentences` is non-empty for the same reason: an empty
list would pass vacuously. Both lists are compared as **literal text** against the document. A
manifesto sentence or a project `name` containing `&`, `<` or `>` will have been escaped by `X5` and
will therefore not match — that is accepted rather than worked around, because the failure is a red
build naming the value, and the alternative is a second escaping implementation in the module least
able to own one.

`assertDeploymentCandidateCurrent` compares two values and reads nothing, in the same shape as
`assertImageIdentity`: the workflow observes the deployment branch's head at the top of the critical
section and passes it in. Keeping the observation outside the function is what lets `V6` be tested
without a repository, a token or a network.

**`assertImportGraph` takes the graph as data for the same reason**, and it is the reason this
signature could be written at all. Reading imports off disk means choosing a scanner — a dependency
linter, a lint rule, or an AST walk — and that is a new dependency needing its own decision-log entry
naming what it rejected. Nothing here chooses one: the caller observes the edges and passes them in,
so the function is pure, total and testable against a literal graph, and the scanner becomes an
implementation detail of one test rather than a fact in this contract.

It discharges **seven** rules, four of which carry ids — `C1`, `C14`, `X2` and `A3` — and three of
which had none before 2026-08-07, existing only as prose in this section: Presentation imports
`Branded` from Content and nothing else from this repository; Artifact imports `CommitId`,
`parseCommitId` and `Result` and nothing else; and no repository module imports Verification, checked
over `src` rather than over the whole tree. `V16` is what gives those three a checkable home. That
they were unnumbered while four neighbours were is the same defect `U9` names for `P2`–`P4`: an
invariant nothing can call is a habit, and a rule with no id is not even that.

Every `assert*` function reports **all** faults it finds in one `Result`, not the first. A style
disagreement with four unmatched classes returns four errors.

`assertUnknownPathResponse` requires the served body to **equal** `emittedMissDocument`, not to
contain it. A containment check passes on a host that serves the right composition wrapped in its own
error chrome, which is a different page from the one that was built and verified.

`assertServedBytesMatchEmitted` compares bytes rather than parsed documents, because the failure it
exists to catch is a transform applied on one publication path and not the other, and a transform that
preserves the parse tree still changes what a crawler receives.

**No repository module imports Verification.** Its own tests necessarily do — a module nothing may
import is a module nothing can test — so the boundary is enforced over `src`, not over the whole
tree.

---

## Error semantics

### Content

```ts
export type ContentErrorCode =
  | "EmptyInventory"
  | "MalformedProjectId"
  | "DuplicateProjectId"
  | "InvalidYear"
  | "YearAfterBuild"
  | "EmptyField"
  | "HomeOwnUrlInvalid"
  | "HomeWithinParentMissing"
  | "HomeWithinParentNotOwn"
  | "HomeWithinOriginEscape"
  | "EscapedFromTargetMissing"
  | "EscapedFromSelfReference"
  | "EscapedFromCycle"
  | "EmptyTestimonials"
  | "TestimonialQuoteEmpty"
  | "TestimonialAuthorEmpty"
  | "TestimonialRoleEmpty"
  | "TestimonialOrganizationEmpty"
  | "TestimonialUrlInvalid"
  | "CvFieldEmpty"
  | "CvCollectionEmpty"
  | "CvUrlInvalid"
  | "CvYearInvalid"
  | "CvYearAfterBuild"
  | "PortfolioFieldEmpty"
  | "PortfolioCollectionEmpty"
  | "PortfolioTechDepthExceeded"
  | "PortfolioDuplicateCategory";

export type ContentError = {
  readonly code: ContentErrorCode;
  readonly projectId: ProjectId | null;
  readonly field: string | null;
  readonly detail: string;
};
```

Every variant is deterministic and **not retryable**. In every case the caller — the build — exits
non-zero and publishes nothing. There is no default value, no fallback stage, no dropped project and
no silently empty section. `validateInventory` reports **all** failures in one `Result`, never the
first only. Every other semantic validator holds to the same rule over its own codes.

The six testimonial codes reuse `ContentError` rather than earning a second error type: `projectId`
is always `null` for them — a `Testimonial` has no `ProjectId` — and `detail` carries the offending
record's zero-based index, since there is no identity field to name it by instead. `field` is `"quote"`,
`"author"`, `"role"`, `"organization"` or `"url"` for the five field-level codes and `null` for
`EmptyTestimonials`. Reusing the shape costs
one always-`null` field on these six variants and buys one error type, one `Result` shape and one
caller-facing report format for both content sets — the alternative, a `TestimonialError` type with its
own union, was considered and rejected for exactly that duplication.

**The nine CV and portfolio codes extend that reuse, and `projectId` is `null` for every one of them.**
Neither document has a `ProjectId` and neither will acquire one: the CV's employers and the portfolio's
categories are not projects in this repository's inventory, and giving them synthetic ids to reach an
existing field is the shape the 2026-08-07 `sourceUrl` ruling already rejected once.

**They are coarser than the testimonial codes on purpose.** A `Testimonial` has five fields and takes
five codes; `CvDocument` has more than thirty leaf fields across seven record types, and a code per
field would be an enumeration nobody can read, kept in step with a schema by hand. What discriminates
instead is `field`, which carries a **dotted path from the document root with a zero-based index at
each list** — `roles[3].achievements[1]`, `header.links[0].href`. That is what makes a report
actionable, and it is the one thing about these codes a reader may not assume from their names: the
code says what kind of fault, `field` says where, and only `field` is precise.

**`CvYearInvalid` takes precedence over `CvYearAfterBuild`** on a single bad value, exactly as
`InvalidYear` does over `YearAfterBuild`, so one wrong year yields one error rather than two carrying
the same `field`.

**`TestimonialUrlInvalid` is the only testimonial code that is not an emptiness check**, and the
asymmetry is worth naming: the other four field-level codes reject a field that is present and blank,
while this one rejects a field that is present and *wrong*. It is also the narrower half of the two
rules governing `url` — it constrains the value's **shape** and says nothing about whether the quote
was entitled to carry one, which is authored and unenforceable (§ *Types*).

| Code | Raised when | `projectId` | `field` |
|---|---|---|---|
| `EmptyInventory` | The inventory has no projects | `null` | `null` |
| `MalformedProjectId` | An `id` fails the `ProjectId` pattern or length | the raw value | `"id"` |
| `DuplicateProjectId` | Two projects share an `id` | the duplicate | `"id"` |
| `InvalidYear` | `year` is non-integer or outside 1000–9999 | set | `"year"` |
| `YearAfterBuild` | `year > BuildContext.utcYear`, where `year` is otherwise a valid four-digit integer. `InvalidYear` takes precedence, so one bad value yields one error rather than two carrying the same `field` | set | `"year"` |
| `EmptyField` | `name`, `line`, or a present `question` is empty after trimming | set | the field |
| `HomeOwnUrlInvalid` | `home.url` fails the `AbsoluteUrl` constraint | set | `"home.url"` |
| `HomeWithinParentMissing` | `home.parent` is not an `id` in the inventory | set | `"home.parent"` |
| `HomeWithinParentNotOwn` | `home.parent` exists but its own `home.kind` is not `"own"` | set | `"home.parent"` |
| `HomeWithinOriginEscape` | `home.path` is not root-relative, or resolving it against the parent origin changes the origin | set | `"home.path"` |
| `EscapedFromTargetMissing` | `escapedFrom` names no project in the inventory | set | `"escapedFrom"` |
| `EscapedFromSelfReference` | `escapedFrom === id` | set | `"escapedFrom"` |
| `EscapedFromCycle` | The `escapedFrom` edge set contains a cycle | each project on the cycle | `"escapedFrom"` |
| `EmptyTestimonials` | The testimonial collection has no entries | `null` | `null` |
| `TestimonialQuoteEmpty` | A `quote` is empty after trimming, at the index in `detail` | `null` | `"quote"` |
| `TestimonialAuthorEmpty` | An `author` is empty after trimming, at the index in `detail` | `null` | `"author"` |
| `TestimonialRoleEmpty` | A `role` is present but empty after trimming, at the index in `detail`. Absent is valid; present-and-empty is not (`X8` would otherwise render an empty metadata element) | `null` | `"role"` |
| `TestimonialOrganizationEmpty` | An `organization` is present but empty after trimming, at the index in `detail`. Absent is valid; present-and-empty is not, for `TestimonialRoleEmpty`'s reason | `null` | `"organization"` |
| `TestimonialUrlInvalid` | A `url` is present and is not an absolute `https:` URL, at the index in `detail`. Absent is valid. Emptiness needs no separate code — an empty string fails this one | `null` | `"url"` |
| `CvFieldEmpty` | A required CV string is empty after trimming, or a present optional one is. Every string field of every CV record is required except `CvRole.website` and `CvOpenSource.link`, which are URLs and fail `CvUrlInvalid` when present and empty | `null` | the dotted path |
| `CvCollectionEmpty` | A CV list the type declares non-empty has no entries — `header.links`, `badges`, `chips`, `roles`, `education`, `projects`, `openSource`, `timelineProjects`, a role's `achievements`, any record's `tech`, or an era's `projects` | `null` | the dotted path |
| `CvUrlInvalid` | A `header.links[].href`, `roles[].website`, `projects[].link` or `openSource[].link` is present and is not an absolute `https:` URL. Absent is valid where the field is optional; present-and-empty fails here rather than as `CvFieldEmpty`, so one bad URL yields one error | `null` | the dotted path |
| `CvYearInvalid` | A `projects[].year` is non-integer or outside 1000–9999 | `null` | the dotted path |
| `CvYearAfterBuild` | A `projects[].year` exceeds `BuildContext.utcYear`, where it is otherwise a valid four-digit integer | `null` | the dotted path |
| `PortfolioFieldEmpty` | A required portfolio string is empty after trimming — a `header` field, a `TechNode.name`, a `PortfolioCategory` field, or a `PortfolioStat` field. `PortfolioStat.value` is included: a stat with a label and no figure renders a dangling label | `null` | the dotted path |
| `PortfolioCollectionEmpty` | `technologies`, `projects` or `stats` has no entries, or a `TechNode.children` is present and empty. Absent `children` is valid and is how a leaf is spelled; present-and-empty is not, on the same reasoning `TestimonialRoleEmpty` rests on | `null` | the dotted path |
| `PortfolioTechDepthExceeded` | A `TechNode` is nested more than three levels deep. The bound is what makes a renderer total, and it is enforced rather than observed | `null` | the dotted path |
| `PortfolioDuplicateCategory` | Two top-level `technologies` entries share a `name`, or two `projects` entries share a `category`. Either renders the same heading twice with different contents beneath it, which reads as a data error to a visitor and as nothing at all to the build | `null` | the dotted path |

### Artifact

```ts
export type ArtifactErrorCode =
  | "CommitIdMalformed"
  | "OutputTreeMissing"
  | "MissDocumentMissing"
  | "MarkerInsertionPointMissing"
  | "MarkerAlreadyPresent"
  | "WriteFailed"
  | "RemoveFailed";

export type ArtifactError = {
  readonly code: ArtifactErrorCode;
  readonly entry: string | null;
  readonly detail: string;
};
```

`entry` is a position inside the emitted output tree, with one exception: for a failed
server-configuration write it is `serverConfigFilename`, which is outside that tree by `R6`.

Every variant is **not retryable**, including `WriteFailed`: a build that could not write its own
output directory has an environment fault, and retrying inside the step would hide it. In every case
the caller — the build — exits non-zero and publishes nothing.

**State left behind:** a partially rewritten output tree. It is never published, and the next build
starts from a clean output directory rather than repairing it.

| Code | Raised when | `entry` | Caller does |
|---|---|---|---|
| `CommitIdMalformed` | `ArtifactInput.commit` fails `parseCommitId` | `null` | Fail the build. The environment supplied no usable commit, so nothing can be marked |
| `OutputTreeMissing` | `outputDir` does not exist, or contains no `.html` document | `null` | Fail the build. The package build did not produce a tree |
| `MissDocumentMissing` | `missEmittedEntry` is absent from the tree | `missEmittedEntry` | Fail the build. The miss route did not emit, so no root miss document can exist |
| `MarkerInsertionPointMissing` | A document contains no `</head>` | the document | Fail the build |
| `MarkerAlreadyPresent` | A document already carries a build marker before injection | the document | Fail the build. Artifact ran twice, or the package emitted a marker of its own |
| `WriteFailed` | A copy, a rewrite, or the server-configuration write failed at the filesystem | the document, or `serverConfigFilename` | Fail the build |
| `RemoveFailed` | Removing `missEmittedEntry` after the copy failed at the filesystem (`R2`) | `missEmittedEntry` | Fail the build. The tree would otherwise publish the miss composition at a 200 path, which is the defect the removal exists to prevent |

### Verification

```ts
export type VerificationErrorCode =
  | "LinkUnreachable"
  | "LinkNotOk"
  | "MarkerAbsent"
  | "MarkerDuplicate"
  | "MarkerMismatch"
  | "PollExhausted"
  | "UnexpectedRequest"
  | "ScriptElementPresent"
  | "LinkedStylesheetPresent"
  | "ExternalAssetReference"
  | "ClassWithoutRule"
  | "SelectorWithoutUser"
  | "RootMissDocumentAbsent"
  | "MissEntryStillPresent"
  | "UnknownPathStatusWrong"
  | "UnknownPathBodyWrong"
  | "ServedBytesMismatch"
  | "ImageTagCommitMismatch"
  | "AttestationCommitMismatch"
  | "AttestationAbsent"
  | "ManifestoAbsent"
  | "ProjectNameAbsent"
  | "StaleDeploymentCandidate"
  | "ForbiddenModuleImport"
  | "UnauthorizedValidatorImport"
  | "UnpermittedImportName";

export type VerificationError = {
  readonly code: VerificationErrorCode;
  readonly detail: string;
  readonly observed: string | null;
  readonly expected: string | null;
};
```

| Code | Raised when | Retryable | Caller does |
|---|---|---|---|
| `LinkUnreachable` | Every attempt for one target failed before a response | Yes, within `linkCheckRetry`; exhaustion is terminal | Fail the gate, deploy nothing |
| `LinkNotOk` | A target responded outside 2xx/3xx. A 3xx is a pass and the redirect is never followed, so a redirected-away target is not detected here | No | Fail the gate, deploy nothing |
| `MarkerAbsent` | An emitted or served document carries no build marker | No | Fail the build or the read-back |
| `MarkerDuplicate` | A document carries more than one build marker | No | Fail the build. Artifact's single-injection guarantee is broken |
| `MarkerMismatch` | The served marker is a valid `CommitId` other than the expected one | Yes, within `deploymentPollRetry` — a cache or an in-flight publish | Keep polling; on exhaustion report `PollExhausted`. From `assertImageIdentity`, not retryable — the image is already built |
| `PollExhausted` | `deploymentPollRetry` was consumed without an exact marker match | No | Report the deploy failed. **Announce no live URL** |
| `UnexpectedRequest` | The browser capture recorded a load-triggered request other than the navigation document | No | Fail the gate, deploy nothing |
| `ScriptElementPresent` | An emitted document contains a script element that is neither the permitted `application/ld+json` block nor `X10`'s single inline enhancement script — a `src` attribute on either, a second block of either kind, a third script element, any script element at all on the miss document, or either permitted element's own content containing a `</script` sequence in any case (`V13`, `X6`, `X10`) | No | Fail the build |
| `LinkedStylesheetPresent` | An emitted document links a stylesheet rather than inlining it | No | Fail the build |
| `ExternalAssetReference` | An emitted document references an asset by URL other than a data URI. Two things are not asset references and do not raise it: an outbound link, and the document's own `<link rel="canonical">`. The second is an exemption `A1` forces rather than a relaxation — `metadata.canonicalUrl` is required of every route, and it names the address of the document already loaded, so no browser fetches it. Without the exemption `V13` and `A1` would contradict each other on every document this design emits | No | Fail the build |
| `ClassWithoutRule` | A class in a route's body has no selector in that route's stylesheet | No | Fail the build. **Never a warning** |
| `SelectorWithoutUser` | A **class** selector in a route's stylesheet matches nothing in that route's body. The token block's `:root` rules carry no class selector and cannot raise it (`X4`) | No | Fail the build |
| `RootMissDocumentAbsent` | `missRootEntry` is absent from the finished tree | No | Fail the build |
| `MissEntryStillPresent` | `missEmittedEntry` survives into the finished tree, so the miss composition is reachable at `/404/` with a 200 (`R2`) | No | Fail the build. Artifact's removal did not run |
| `UnknownPathStatusWrong` | A unique unknown path answered with a status other than 404 | No | Fail the gate or report the deploy failed. A 200 here is a soft 404 |
| `UnknownPathBodyWrong` | A unique unknown path answered 404 with a body other than the emitted miss document | No | Fail the gate or report the deploy failed |
| `ServedBytesMismatch` | What the running image serves for `/` differs byte for byte from the emitted document | No | Fail the image gate. **Never push** |
| `ImageTagCommitMismatch` | The image tag is not the full commit id being released | No | Fail the image gate. Never push |
| `AttestationCommitMismatch` | `Attestation.commit` differs from the commit being released | No | Refuse the release. Pages is unaffected; an attestation is never reused |
| `AttestationAbsent` | `assertAttestation` was given `null` — the release path carries no approval record | No | Refuse the release. Pages is unaffected |
| `ManifestoAbsent` | A known manifesto sentence is missing from built HTML with scripting never executed | No | Fail the build |
| `ProjectNameAbsent` | A project `name` is missing from built HTML with scripting never executed | No | Fail the build |
| `StaleDeploymentCandidate` | At the critical section's start, this run's commit is no longer the deployment-branch head | No | Stop before publishing. This is a clean stop, not a failure |
| `ForbiddenModuleImport` | A module imports one the graph does not permit it to — any edge out of Content (`C1`), an edge into Verification (`V16`), or an edge Composition or Adapter is not allowed (`X2`, `A3`) | No | Fail the build. **Never a warning** |
| `UnauthorizedValidatorImport` | A module other than Adapter imports a document validator (`C14`) | No | Fail the build. It was `UnauthorizedInventoryImport` until 2026-08-11, over the raw `projects` array, and guarded against a derivation being recomputed off unvalidated records. **That failure mode is now closed by construction** rather than by this code — the records are JSON outside the module graph and `Inventory`/`Testimonials` are constructible only by a validator — so what this guards is narrower and worth stating plainly: that there stays **one** validation entry point per document |
| `UnpermittedImportName` | A permitted edge carries a binding the rule does not allow — Adapter importing a Content derivation, a copy constant or a Presentation primitive (`A3`), Presentation importing anything but `Branded`, Artifact importing beyond `CommitId`, `parseCommitId` and `Result` | No | Fail the build |

### Composition, Presentation, Adapter

**No error type.** The four Composition functions and Presentation operate only on validated
values, cannot be malformed by construction, and perform no I/O.

Adapter declares none of its own either, and **does not handle `ContentError`** — that changed with
the 2026-08-11 migration and is written out in *Public signatures* § *Adapter*. Adapter declares all four
document validators; the package's loader invokes each, flattens every `ContentError` into the single
`message` the `Validator` contract permits, and refuses to call `compose` (`A5`). Adapter's own
refusal is the malformed-`GITHUB_SHA` process exit, which carries no error type either. There is no
Adapter-specific failure to name — malformed content is a Content fault, and Composition has no
failure of its own, both its functions being total.

**One bare-exception surface is ours.** `sourceUrl`'s module-load guard is written out in *Public
signatures* § *Content*. It is not a recoverable content fault and does not gain an error union merely
to convert an invariant breach into a branch. A second surface existed until 2026-08-10 — `foldRoutes`'s
structural guards over the fold's required envelope — and went with the fold.

Every other bare exception belongs to the external package. At the pinned `0.4.1` — re-verified
2026-08-20, unchanged from `0.3.0` — the external package
throws `Error` from `defineLandingPage` on an empty route list, and from `assertRoute` on a route
declaring neither or both of `entry` and `body`, on a `stylesheet` declared beside an `entry`, and on
a stylesheet containing `</style`. Nothing here catches any of them.

The first three are compile-time-visible defects under `LandingPageBodyRoute` and `A4`, not runtime
paths. **The fourth is not**: a stylesheet is generated text, so nothing about the declaration's shape
prevents it. `P5` is what keeps that throw unreachable, which is why it is an invariant on
Presentation rather than a note here.

---

## Invariants

Each is stated so it can become an assertion. The named module is responsible for maintaining it;
where a separate module checks it, that is said in the row.

| Id | Invariant | Owner |
|---|---|---|
| **C1** | Content imports no other repository module | Content |
| **C2** | `Inventory` has at least one project | Content |
| **C3** | `ProjectId` is unique across the inventory | Content |
| **C4** | Every `ProjectId` matches the pattern and length above | Content |
| **C5** | Every `year` is a four-digit integer no greater than `BuildContext.utcYear` | Content |
| **C6** | Every `home.parent` names an existing project whose own `home.kind` is `"own"` | Content |
| **C7** | For every `within` home, `path` begins with `/`, does not begin with `//`, and `new URL(path, parentOrigin).origin === parentOrigin` | Content |
| **C8** | Every `escapedFrom` names an existing project, never itself, and the edge set is acyclic — the relation is a forest | Content |
| **C9** | `stageOrder` contains each `Stage` exactly once, in lifecycle order | Content |
| **C10** | `sinceYear(inventory)` equals the minimum `year` in the inventory | Content |
| **C11** | `ecosystemTree` has one group per `Stage` in `stageOrder` order; within a group projects ascend by `id`; every project appears exactly once across all groups | Content |
| **C12** | `countByStage` has one entry per `Stage` in `stageOrder` order, and its counts sum to `projectTotal` | Content |
| **C13** | `resolvedHomes` yields one entry per `own` and `within` home and none for `none` | Content |
| **C14** | Nothing imports `projectsDocumentValidator`, `testimonialsDocumentValidator`, `cvDocumentValidator` or `portfolioDocumentValidator` except Adapter, which declares them against the four build-time sources, and the tests that exercise them directly. No derivation function, no Composition entry and no Artifact step reads any of them. **Reachability, not naming**: a namespace import, an `export *`, a namespace re-export and a dynamic `import()` each reach a validator without writing its name, and the check fails closed on a clause shape it does not recognise. The set is closed by enumeration, so a fifth document validator that is not added here is one this invariant does not cover | Content |
| **C15** | `parseCommitId` is the only implementation of the `CommitId` pattern in the repository | Content |
| **C17** | `checkedLinks` is the only enumeration of `V4`'s target set. Every outbound URL any route renders is either in it or is not an HTTP address at all; no other function, test or workflow step assembles a list for `checkLinks` | Content |
| **C18** | A `TechNode` tree is at most three levels deep, and a present `children` is non-empty | Content |
| **P1** | Nothing in Presentation references a linked font, an external stylesheet, a gradient or an illustration asset. Neither `--font-sans` nor `--font-mono` names a webfont, and no rule is an `@font-face` | Presentation |
| **P2** | The rendered page is legible in greyscale, in two parts. **(a)** Every foreground colour resolved against the background it is rendered on meets WCAG AA — 4.5:1, or 3:1 at `1.563rem` and above, WCAG's large-text threshold and the value `--step-2` names. The threshold is stated as a size rather than as a token because no rule references that token. `--rule` is **exempt, by name**: record separation is carried by the **spacing around a record**, so a divider reinforces and never signals. This clause named `--space-1` as that spacing until 2026-08-08; the `entry` primitive separates records with its own `clamp()` padding, so the exemption rests on the separation existing rather than on which value expresses it. **(b)** No meaning is carried by hue alone, which obliges the `link` primitive to declare a `text-decoration`, or a font weight distinct from body text. Part (b) is what makes this say greyscale rather than contrast: `--link` against `--fg` is 1.50:1, far below the 4.5:1 body-text threshold, so a link is not reliably separable from body text by luminance alone. The margin against `--bg` is not what is at issue — `--link` clears (a) there at 11.17:1 — which is why (b) is a separate half rather than a consequence of (a) | Presentation |
| **P3** | Nothing **moves** under `prefers-reduced-motion: reduce`: no transform, translation, scale, rotation, position change or scroll behaviour is animated or transitioned. A transition of a non-positional property — `link`'s and `card`'s hover colour changes are the cases in the primitive set — is not motion and is permitted. Motion itself is not forbidden outright, only under `reduce`: `card`'s hover lift is the one rule in the set that moves, and it sits inside a `prefers-reduced-motion: no-preference` block, so under `reduce` the rule is absent rather than overridden. The preference addresses vestibular motion rather than change as such, which is why this names motion and not animation. `00-brief.md` § *Definition of done* states this same narrowed form as of its 2026-08-07 amendment, so the two agree — see [`90-decisions.md`](90-decisions.md) and [`U10`](#u10--p3-is-narrowed-to-motion-pending-an-owner-edit-to-the-brief) | Presentation |
| **P4** | Focus order matches visual order and every interactive element is keyboard-reachable | Presentation |
| **P5** | No `StylesheetText` contains a `</style` sequence in any case — the package emits it unescaped inside a `<style>` element and throws on one | Presentation |
| **P6** | A route's stylesheet is the token block followed by the `rules` of exactly those primitives whose `className` occurs in that route's `bodyHtml`, and nothing else. `stylesheetFor` derives every inclusion from the body, so no caller states it | Presentation |
| **P7** | Exactly one primitive's `rules` reference `--font-mono`; no other primitive and no token-block rule does. What that primitive may carry is `X1`'s, not restated here | Presentation |
| **X1** | No count, total, year or other figure on **any** route is a typed literal in Composition's source. On the **apex** each such figure is additionally a Content **derivation**, computed from the inventory or the testimonial collection and never authored. On `/cv/` and `/portfolio/` a figure may instead be **authored content** carried in that route's own validated document — `PortfolioStat.value` is `"20+"` and `"50+"`, which are the author's estimates rather than counts of anything the document holds, and `CvRole.period` is prose with no end date. The derivation clause narrowed to the apex on 2026-08-21; `00-brief.md` § *Definition of done* still states the broader form, so the two disagree on a released requirement until it is edited — see [`U11`](#u11--x1s-derivation-clause-is-narrowed-to-the-apex-pending-an-owner-edit-to-the-brief) | Composition |
| **X2** | Composition imports only Content and Presentation, and nothing imports Composition except Adapter. It does not import `RoutePath`: the current route travels into `renderOutbound` as a plain `string`, for the reason `origin` does | Composition |
| **X3** | The page contains no form, no analytics, no consent surface and no third-party script | Composition |
| **X4** | For each `ComposedRoute`, every class referenced in `bodyHtml` has a matching selector in `stylesheet`, and every **class** selector in `stylesheet` has a user in `bodyHtml` — checked by `assertStyleAgreement`. The token block's `:root` rules fall outside both halves and need no exemption clause: they carry no class selector, and `Primitive.rules` roots every other rule at its own `className` | Composition |
| **X5** | Every Content value interpolated into `bodyHtml` is HTML-escaped, in attribute position as well as in text position; `<`, `>`, `&`, `"` and `'` never reach the document unescaped from a content value. The rule is over every interpolated value, not over a named list of fields. The attribute half is not implied by the text half — `"` and `'` are inert in text and are exactly what closes an attribute early — a `ResolvedHome.url` carried in an `href` is the case the apex composition has, a `Testimonial.url` in the `Source` link's `href` (`X8`) is a second one on the same document, and the CV's four link-bearing field paths are four more on a third. Asserted with a fixture project carrying all five characters, in both positions. **One exception, and it is not a relaxation**: inside the `application/ld+json` block (`X6`) HTML escaping would corrupt the JSON — `&amp;` in a URL is a different URL — so values there are JSON-string-escaped instead, and `X6`'s `</script` guard is what keeps that safe rather than the escaping | Composition |
| **X6** | The apex body carries **exactly one** `<script type="application/ld+json">` element, holding a single `Organization` object. The **CV** body carries **exactly one**, holding a single `Person` object built from `CvData` and carrying neither `email` nor `phone`. The **portfolio** and **miss** bodies carry **none**. Every value in either block is JSON-string-escaped (`X5`), neither contains a `</script` sequence in any case — checked as one of `ScriptElementPresent`'s raising conditions, not a separate code — and any figure in either obeys `X1` as narrowed for that route. The only other script element any document may carry is the single inline enhancement script `X10` admits, on the apex alone | Composition |
| **X7** | The apex renders only `EcosystemGroup`s carrying at least one project. `C11` keeps every `Stage` in the tree so counts, ordering and totals stay total and testable; a lifecycle stage nothing has reached yet is not rendered as a heading with nothing beneath it. The two are complementary rather than in tension — the derivation is complete, the page is not a list of empties — and this is stated because the design's "never a silently empty section" rule was written for an empty *inventory* and left the empty *group* unnamed | Composition |
| **X8** | The apex's testimonials section renders every `Testimonial` `composeApex` is given, in input order — it sorts nothing and drops nothing. A testimonial carrying neither `role` nor `organization` omits the metadata line entirely rather than rendering an empty one. A present `url` renders as one further attribution line carrying a single link whose text is `Source` and whose `href` is that value; an absent `url` renders **no** such line and no placeholder, so a card without a citation is indistinguishable from a card that was never eligible for one. The link text is fixed and is Composition's own word rather than the quoted person's, so § *Public signatures*' rule that no testimonial field appears in Composition's source survives the addition intact | Composition |
| **X9** | The apex body carries its four sections — Effortless Action, The Echo System, Contamination and Testimonials — each reached by a fragment link in the apex navigation, and each carrying the `view` primitive's class. Which one is visible is decided by that primitive's `:target` rules and by nothing the composition states; a document requested with no fragment shows the first. Those rules remain the whole of section selection with `X10`'s script never executed — the script enhances the switch and does not replace it | Composition |
| **X10** | The apex body carries **at most one** script element beyond `X6`'s JSON-LD block: an **inline enhancement script** with no `src` attribute, containing no `</script` sequence in any case. The CV, portfolio and miss bodies carry none — what the script enhances is the apex's tab switch, its stage filtering and its detail overlay, none of which the other three documents have, so a copy there would be an element with nothing to act on. It initiates **no** network request of any kind — no `fetch`, no `XMLHttpRequest`, no dynamic `import()`, and no element insertion that loads a resource — which is what keeps `V2` true of a document that now executes something. It is **strictly additive**: it may reveal, hide, filter, reorder or overlay content already present in `bodyHtml`, and is never the sole source of any content, figure or link on the page. That constraint is not review-enforced — `V3` asserts every manifesto sentence and project `name` in built HTML **with scripting never executed**, so a script that became load-bearing for content turns `V3` red. `P3` and `P4` bind it as they bind the primitive set: it introduces no motion under `prefers-reduced-motion: reduce`, and any overlay it opens preserves focus order and keyboard reachability | Composition |
| **A1** | Every URL in route metadata is built from `origin`; no origin string is written twice. Each route's `canonicalUrl` and `openGraph.url` equal `origin` concatenated with that route's `path` | Adapter |
| **A2** | Every entry in `metadata.icons` carries a `DataUri` as its `href`; no icon is a linked asset | Adapter |
| **A3** | Adapter obtains everything renderable from Composition; it imports Content only for `projectsDocumentValidator`, `testimonialsDocumentValidator`, `cvDocumentValidator`, `portfolioDocumentValidator`, `parseCommitId` and the types `BuildContext`, `Inventory`, `Testimonials`, `CvData` and `PortfolioData`, and Presentation only for `themeColor` and `iconDataUri` — never a derivation function, a copy constant, a primitive or the stylesheet. Both import lists are enumerated, and nothing renderable is on either. Composition and the external package are closed as **modules**, not as name lists: `A3` bounds which modules Adapter may reach, and only Content's and Presentation's edges are further narrowed to exact names | Adapter |
| **A4** | Exactly four routes are declared, in this order: `apexPath`, `cvPath`, `portfolioPath`, `missPath`. The miss is last because it is the fallback rather than a peer, and `RoutePath`'s member order states the same sequence | Adapter |
| **A5** | Each of the four content documents is validated exactly once per build, before any route is composed, against one `BuildContext` read once. On any document's failure every `ContentError` from that document is reported — not the first — and no route body, stylesheet or document is produced. Adapter declares the validators; the package's loader invokes them and refuses to call `compose`, which is why this is stated as a property of the build rather than as a call Adapter makes | Adapter |
| **A6** | All four routes are `LandingPageBodyRoute` values: none declares `entry`, `hydrate` or `noScript`, and the configuration declares no `styles`, `publicDir` or `allow`. Each route's stylesheet travels in its own `stylesheet` field | Adapter |
| **A7** | No colour literal and no data URI is written in Adapter. `metadata.themeColor` is Presentation's `themeColor` and every `metadata.icons[].href` is Presentation's `iconDataUri`, by reference — the same rule `A1` applies to `origin`, applied to visual identity | Adapter |
| **R1** | Every emitted document carries exactly one build marker, and it carries the commit being built | Artifact |
| **R2** | `missRootEntry` is a byte-identical copy of the document the package emitted at `missEmittedEntry`, asserted at the copy; and `missEmittedEntry` is **absent** from the finished tree, so the miss document has exactly one published path and no host can serve it with a 200 | Artifact |
| **R3** | Artifact compiles nothing, bundles nothing and resolves no module; the only change it makes to a document is the marker | Artifact |
| **R4** | The emitted server configuration resolves every unknown path to `missRootEntry` with status 404; sets no cookie, no cache-control directive chosen by application logic, and no tracking or rewrite header; and executes nothing per request. A response header that is an unconfigured byproduct of serving a static file over HTTP — a content-type, a content-length, a last-modified time, an entity tag, the server's own identifying header — is not a violation | Artifact |
| **R5** | `missEmittedEntry` is the package's emitted entry for Adapter's `missPath` — checked against the emitted tree **before `R2`'s removal**, never assumed. A pairing asserted after the file is gone would assert nothing | Artifact |
| **R6** | The emitted server configuration is written outside `outputDir` and never appears in the published tree, on either target | Artifact |
| **V1** | No document reaches publication unless it carries the exact commit's marker | Verification |
| **V2** | Loading a route document triggers zero requests other than the navigation document itself. Checked against `/`, `/cv/` and `/portfolio/` — every directly navigable route, each reached from the masthead. The miss route is excluded because it is reached only through the unknown-path mechanism `V12` covers, not through direct navigation | Verification |
| **V3** | Every manifesto sentence asserted, and every project `name`, appears in built HTML with scripting never executed | Verification |
| **V4** | Every `CheckedLink` in `checkedLinks(inventory, cv)` responds 2xx or 3xx before release — the inventory's resolved homes, `sourceUrl`, and every outbound URL the CV document carries. It read *every `ResolvedHome`* until 2026-08-21, which left `sourceUrl` outside it by construction. The Pages preview does not wait on this networked gate | Verification |
| **V5** | An `Attestation` is valid for exactly one `CommitId` and is never accepted for another. It gates the **release path only** — the registry push and the redeploy — and not the Pages deploy, which is why the preview's every-commit cadence is real; the cost is recorded in `10-design.md` § *Publication targets* | Verification |
| **V6** | Publication happens only while this run's commit is the deployment-branch head | Verification |
| **V7** | After content validation → render → package build → Artifact → offline verification, publication forks. The preview branch performs branch-head check → Pages deploy → Pages read-back (exact marker, bytes, unknown path) without waiting on the image gate, link gate or attestation. In parallel the release-preparation branch performs image build → in-CI image gate → networked link check, and continues on its own through truth attestation → **branch-head re-check** → registry push → redeploy trigger → endpoint read-back (exact marker, unknown path) → live claim. **The two branches never join**, and neither waits on the other: `V11`'s two halves each compare a served response against the corresponding emitted document rather than against each other, so neither is evidence the other needs. The head is checked **twice** because the attestation before release is a human gate of unbounded duration, and a check taken before it proves nothing after it | Verification |
| **V8** | No live URL is stated or implied until `pollForCommit` returns `ok` for the exact commit **and** the unknown-path check passes **against the target that claim is about** — Pages for the preview URL, the endpoint for the site. A read-back on one target licenses no claim about the other | Verification |
| **V9** | No image is pushed to the registry unless the in-CI gate passed for that image | Verification |
| **V10** | The image tag equals the full commit id, and equals the marker the running image serves | Verification |
| **V11** | For each of `/`, `/cv/` and `/portfolio/`, what the running image serves and what Pages serves are **each** byte-identical to that route's own emitted document. Both targets are compared, which is what makes the brief's "asserted rather than assumed" true of the pair rather than of one side of it. The endpoint is deliberately not compared — `V15` covers it with the marker and unknown-path pair instead, because a byte match across a proxy this repository does not own would fail on transport differences that are not divergence. It named `/` only while that was the only content route; since 2026-08-21 it names `/`, `/cv/` and `/portfolio/`, because checking one document and arguing the others from shared construction is the reasoning this same invariant already rejected once when it covered one target and argued the other | Verification |
| **V12** | An unknown path returns status 404 carrying the emitted miss document, on **both** targets | Verification |
| **V13** | No emitted document contains a linked stylesheet, an external asset reference, or a script element carrying a `src` attribute. The apex document contains **at most two** script elements — its inert `application/ld+json` block (`X6`) and `X10`'s single inline enhancement script; the **CV** document contains **exactly one**, its `Person` block; the **portfolio** and **miss** documents contain none. No document may contain more than its own count. Both permitted elements are inline and fetch nothing. Any `src` attribute on any script element fails, as does any script element that is neither of the two permitted. The rule was a blanket ban until 2026-08-07, narrowed then to admit a non-executing block because it forbade one on the ground that it forbade execution; it was widened again on 2026-08-10 to admit one executing but request-free enhancement script, on the reasoning that what is worth checking is what a document **fetches** and whether its content survives with scripting off — which `V2` and `V3` check directly, against a real browser and against built HTML — rather than whether anything executes at all | Verification |
| **V14** | No image tag is stated or implied until the push for that tag has succeeded and the tag resolves in the registry | Verification |
| **V15** | After the registry push, the redeploy is triggered and the endpoint serves the pushed commit's marker, with a unique unknown path answering 404 carrying the emitted miss document, before anything claims the site is deployed. **A successful push is not a deployment.** Both checks reuse `pollForCommit` and `assertUnknownPathResponse` against the endpoint; the trigger itself is workflow configuration and has no surface here, on the same footing as the registry push | Verification |
| **V16** | The module import graph is exactly the one *Public signatures*, `C1`, `C14`, `X2` and `A3` describe — checked over `src` plus Adapter's own file, with the edges observed by the caller. **`assertImportGraph` is declared above and has no implementation**; the graph is currently checked by `tests/content/import-graph.test.ts` against a test-local AST helper, which is the arrangement `assertImportGraph` was written to replace and has not yet. It is the checkable home for the three import rules carrying no other id: Presentation imports only `Branded`, Artifact imports only `CommitId`, `parseCommitId` and `Result`, and no repository module imports Verification | Verification |

**`C16` is retired and is not reused.** It was `S11`'s testimonial-import closure and merged into
`C14` with the 2026-08-11 JSON migration; the two invariants added on 2026-08-21 take `C17` and `C18`
rather than filling the gap. Four test-file comments still cite `C16` meaning the old rule, and
reusing the number would silently repoint them at a rule about link checking. Ids are never reused
here for the reason `30-slices.md` gives for criterion ids: a renumbering rewrites what an existing
citation refers to.

Three things the design states that this contract deliberately does **not** encode as build-time
checks, because encoding them would duplicate a fact another module owns or claim a check that cannot
be performed:

- **`home.url` addresses the project's own site.** Checking that its host is a subdomain of the apex
  would require Content to know the apex origin, which Adapter owns (`A3`). Covered by the release
  attestation and by `V4`, not by a Content assertion.
- **`site/cv.json` and `site/portfolio.json` still say what their source repositories say.** They are
  hand transcriptions of `Portfolio`'s `config/cvData.yml` and `Docusaurus-Template`'s
  `data/portfolioData.json`, and the brief forbids this build from reading either — no content derived
  from sibling repositories, no network in the build. Nothing detects a divergence and nothing can;
  each document's `provenance` field is what makes the question askable.
- **A CV `email` is deliverable and a `phone` is reachable.** Both are checked for emptiness and for
  nothing else. `V4` speaks HTTP and neither is an HTTP address, so this is the same honest limit
  `V4` has for a project's site, applied to the two contact fields.
- **`genre` and `stage` are true of the project.** Both are authored facts. `Genre` is closed at the
  type level; whether the assigned value is the right one is attestation work.
- **The deployed compose stack *keeps* serving the published image.** This entry read "the deployed
  compose stack serves the published image" until 2026-08-07, on the reasoning that the design
  guarantees a published image is correct and stops there. It no longer stops there: the brief's
  amendment put the redeploy step and its verification endpoint in scope, so `V15` observes the
  delivery environment once, at release. What remains uncovered is *afterwards* — no invariant observes
  the stack between releases, so a container stopped, rolled back by hand, or repointed after `V15`
  passes is not detected. That is the same honest limit `V4` has for a project's site.

---

## Unresolved

Nothing below is invented. Each item names what is missing and what would settle it. **Numbers are
stable and are never reused** — [`30-slices.md`](30-slices.md) cites these by number, and an item keeps
its number even where it has narrowed or been answered. No range is named here, because a range rots
the moment a higher number is cited.

### U1 — The package cannot accept a caller-supplied body

**Answered 2026-08-06: released at `0.3.0`, with all three capabilities including the preferred one.**
Retained so citations resolve.

Verified against the published package, not its documentation: `npm` carries `0.3.0`, whose `gitHead`
is `ab44435e3bc1af90509dd0364856a84aa7d932e8` — the `Release landing page package 0.3.0 (#8)` commit —
so the inspected source is the published source. `LandingPageRoute` is now
`LandingPageEntryRoute | LandingPageBodyRoute`. A `LandingPageBodyRoute` carries `body: string` and
`stylesheet?: string`, has **no** `entry` field, and the adapter emits the `<script type="module">`
only on the entry-route branch. The stylesheet is emitted as a `<style>` element inside `<head>`.
`LandingPageMetadata.noScript` remains optional, so `U5`'s decision to declare none still holds.

**Written 2026-08-06.** Adapter's default export, its two route declarations and the metadata rules
are in *Public signatures*, and `A1`, `A2`, `A4` and `A6` are enforceable against them. The
`styles`-versus-`stylesheet` question this entry left open is answered by inspection rather than by
preference: `LandingPageConfig.styles` is **read by nothing** at `0.3.0`, exactly as `hydrate` is, so
Presentation's output travels in each route's own `stylesheet`. Two package behaviours found in the
same reading became invariants here — the body and the stylesheet are both inserted **unescaped**,
which is `X5` and `P5`.

Only metadata *values* remained unwritten, and none of them was blocked by the package: `themeColor`
and `icons` by `U2`, since answered and written; the social-image fields by `U6`, since answered and
omitted; and the titles and descriptions by their being owner-supplied copy.

The paragraphs below describe the superseded `0.2.0` state and are retained as the record of what was
asked for and why.

Verified against `subzerodev-platform-ui-landing-page@0.2.0`: the adapter composes one fixed document
per route — `<div id="root"></div>` plus `<script type="module" src="…">` — and hands it to Vite.
`LandingPageRoute` requires an `entry` and declares no field for a body or a stylesheet.
`LandingPageRoute.hydrate?: boolean` exists and is read by nothing.

Required of the package, and **only these**:

1. Emit a caller-supplied body into the document instead of the fixed shell.
2. Omit the entry script when a body is supplied, so the emitted document loads nothing.
3. Preferred, not required: accept a caller-supplied stylesheet and emit it as a `<style>` element in
   the head. Without it the stylesheet has nowhere conforming to go, since `<style>` is not conforming
   in `<body>`.

This is narrower than the four requirements the previous revision recorded. The root `404.html` and
the build marker moved to Artifact and are written above; the icon set needs no package change, since
`LandingPageIcon.href` is a string and a data URI is a URL.

**Blocked by U1:** Adapter's `LandingPageConfig` default export, its two route declarations and their
metadata — the field names carrying a body and a stylesheet do not exist yet, and a contract may not
invent another repository's public interface. `A1`, `A2` and `A4` are unenforceable until they do.

Per the design's *Failure modes*, that is a slice in `SubZeroDev.Platform.UI.LandingPage`, not
something improvised here. **This contract stops at that boundary.**

### U2 — Presentation's token set and primitives

**Answered 2026-08-06 by the owner, authored whole.** Retained so citations resolve. The ruling and
its rejected alternatives are in [`90-decisions.md`](90-decisions.md); the measurable definition of
`P2` that came with it is a separate entry there.

**Written 2026-08-06.** Presentation's surface is in *Public signatures* — `palette`, `primitives`,
`themeColor`, `iconDataUri` and `stylesheetFor` — with the token block's properties and values, and
the `HexColor`, `DataUri`, `ClassName`, `ColorToken`, `Palette`, `PrimitiveName`, `Primitive` and
`PrimitiveSet` types above them. `P2` becomes measurable, and `P6` and `P7` are new. The single
`stylesheet: StylesheetText` constant the previous revision carried is **gone**: the ruling makes a
route's stylesheet the token block plus the rules of exactly the primitives that route referenced,
which a module-level constant cannot express.

Three things the ruling underdetermined were decided with it, each on the owner's answer and each
recorded in [`90-decisions.md`](90-decisions.md):

- **The palette is exported as typed values**, not left inside the token block as text. Two consumers
  need values rather than CSS — `themeColor`, which the ruling derives from `--bg` rather than
  choosing separately, and any checker for `P2`(a).
- **`stylesheetFor` takes the body**, so the referenced set is observed rather than declared. That is
  what makes `X4` verify a property that already holds (`P6`) instead of enforcing one.
- **Adapter imports `themeColor` and `iconDataUri` from Presentation.** `A3` widens by two names and
  `A7` is added; see *Public signatures* § *Adapter* for why the one-path-from-data-to-markup property
  survives it.

**The divergence this entry recorded is closed.** `10-design.md` § *Module boundaries* said Adapter
"reads nothing from Presentation" and its dependency block omitted the edge; `/reconcile` corrected
both on 2026-08-06, and corrected a second, older one found in the same pass — Presentation was
described as depending on nothing while every type it exports is `Branded<…>`. Nothing is outstanding
here.

What the entry said before it was answered is retained below, as the record of what was blocked and
why.

The design fixes the constraints — dark-first, minimal, typography-first, large whitespace, no
gradient, no illustration, no webfont — and names no token, no scale step and no primitive. A token
set written here would be authored visual identity, which is brand material and not the contract's to
author. The same gap covers how a route obtains only the rules its body requires, which `X4` demands
and which depends on what a primitive is. `stylesheet: StylesheetText` is written; the rest is not.
`P1`–`P5` hold regardless of what the set turns out to be.

### U3 — Where the attestation record lives

**Answered 2026-08-06: a protected GitHub Environment with required reviewers.** Retained so citations
resolve.

The `attestation` job targets the environment before `publish-release`; a human approves; the provider records approver and
timestamp. `assertAttestation` reads the run's approval record and takes the commit from the run's
`head_sha`, so the commit is derived rather than stored. An approval cannot be replayed onto another
run, which satisfies `V5` natively.

**Verified 2026-08-06, and it does not supply one of the three fields.** `GET /repos/{owner}/{repo}/actions/runs/{run_id}/approvals`
returns an array of environment approvals carrying `state`, `user`, `comment` and an `environments`
array. Read access to the repository is the whole permission requirement, so the `publish` job needs
no scope it does not already have. `Attestation.approver` is `user.login` and `Attestation.commit` is
the run's `head_sha`.

**`Attestation.attestedAtUtc` has no source on that endpoint.** The approval object carries no
timestamp; the `created_at` and `updated_at` inside `environments[]` are the *environment resource's*
timestamps, not the approval's, and reporting one as the moment a human approved would be a
fabricated fact. `GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses` does carry
`created_at` and `creator.login`, but its creator is the run's actor rather than the approver, so
combining the two endpoints yields a record whose two halves describe different people.

**Resolved 2026-08-06 on the owner's ruling: the field is dropped.** `Attestation` is `commit` and
`approver`, both readable from the record without inference. GitHub still records the approval
instant in the run and the audit log, which is what the design asks of the *gate* — it does not
require this type to carry all three. `V5` turns only on the commit and is unchanged.

Rejected with it: redefining the field as the instant the `publish` job observed the approval — true
and recordable, but it reads as the approval time and is not, the gap being however long the run
waited. And sourcing it from `GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses`, which
does carry `created_at` — rejected because that status's `creator` is the run's actor rather than the
approver, so the record's two halves would describe different people.

**The divergence this entry recorded is closed.** `10-design.md` § *Module boundaries* said the
attestation "records approver, commit and timestamp"; `/reconcile` changed the clause on 2026-08-06 to
distinguish what the provider records from what this repository reads back. Nothing is outstanding
here.

### U4 — Package version to pin

**Answered 2026-08-06: pin `0.3.0` exactly.** Retained so citations resolve. The pin moved to `0.4.1`
on 2026-08-11, exactly, with the JSON-content migration; the ruling that it is pinned rather than
ranged is what this entry settled and it is unchanged.

It is the version that satisfies `U1`, verified as published rather than assumed — see that entry for
the evidence. The pin is exact, with a lockfile, per the design's *The package is unavailable or
drifts*.

The prior drift this entry recorded — `SubZeroDev.Platform` pinning `0.2.0`, the package's own
`30-slices.md` naming `0.1.0` as the published handoff — is superseded for this repository's purposes
but is still live for the other two, and is tracked as issue #4. Neither repository is this one.

### U5 — `<noscript>` is withdrawn, pending an owner edit to the brief

**Answered 2026-08-07: the brief was amended and this is closed.** Retained under its original heading
so the citations to it resolve — `30-slices.md` and *Public signatures* § *Adapter* both link this
anchor. The edit named below as remaining was made: `00-brief.md` § *Definition of done* now reads
"It carries no `<noscript>` content", carrying the reasoning below. Nothing is outstanding here.

The paragraphs below are retained as the record of what was asked for and why.

The brief's *Definition of done* requires `<noscript>` content asserted against the built HTML, while
the design requires a document with no script at all. `<noscript>` renders precisely when scripting
is off; on a page that needs no scripting there is no fallback for it to describe, and the pattern
`SubZeroDev.Platform` ships — *"This site needs JavaScript to render the status page."* — would be
false here.

**Adjudicated 2026-08-05: the brief is the defect.** The requirement is vestigial, inherited from a
client-rendered status page where it was load-bearing. This contract therefore declares no
`noScript` metadata and no assertion over it.

Remaining: the owner strikes `` and `<noscript>` content `` from the *Definition of done* bullet in
`00-brief.md`. A model may interrogate that file but not author it, so the edit is not made here.
Until it is made, the brief and this contract disagree on a released requirement.

### U6 — Whether a social image asset exists

**Answered 2026-08-06: no social image asset.** `socialImageUrl` and `openGraph.imageUrl` are both
omitted, and the whole `twitter` block is omitted with them. No route declares an `og:image` or a
Twitter card.

The brief requires Open Graph and X/Twitter metadata. Verified at `0.3.0` and re-verified at the
pinned `0.4.1` on 2026-08-20: `socialImageUrl`,
`openGraph.imageUrl` and `twitter.imageUrl` are all optional, and the whole `twitter` block is
omitted when absent. An Open Graph image is fetched by a crawler, not by the document, so it does not
engage the zero-additional-request non-goal.

Two consequences made this a real fork rather than a missing string, and both are moot now that no
image exists: `card: "summary_large_image"` with no image would have been a claim about a picture
that does not exist, so an image would have forced either `card: "summary"` or no `twitter` block;
and `socialImageUrl` and `openGraph.imageUrl` each emit an `og:image`, so declaring both would have
emitted the element twice.

An image would also have been the **only** asset in this design that is neither inline nor a data
URI — `V13` permits it, since a crawler fetch is not a load-triggered request — but with no image
declared, this design has no such asset and the self-contained-document rule has no edge to hold.

### U7 — Which server serves the container tree

**Answered 2026-08-06: `nginx:alpine`.** Retained so citations resolve.

The design states the requirements — a read-only tree, nothing executed per request, no state, no
added header, and an unknown path resolved to the root miss document with a **404 status** — and says
explicitly that which server satisfies them is not a design decision. It became a contract decision the
moment Artifact had to emit a configuration file, because the file's format belongs to the server.

`try_files $uri $uri/ =404` with `error_page 404 /404.html` expresses the requirement. Settling this
also reworded `R4`: "adds no header of its own" was unsatisfiable, since HTTP requires headers and
every server sends an identifier. A later pass (PR #12 review) found the rewording itself untestable —
"the protocol and the file's content type require" named no boundary a verifier could check — and
sharpened it to name the forbidden category directly: no cookie, no application-chosen cache-control
directive, no tracking or rewrite header, with the unconfigured byproducts of serving a static file
carved out by name rather than by an open-ended "require".

**Written 2026-08-06.** `serverConfig()`, `serverConfigFilename`, `finalizeArtifact`'s third duty and
the `ArtifactInput` and `ArtifactReport` fields are in *Public signatures*. One thing the entry did
not anticipate had to be decided with them: the configuration is written **outside** `outputDir`, not
into it, because a file the server reads must not also be a file it serves — `R6`. `V12` verifies the
behaviour whatever the file says.

### U8 — The `validateInventory` call site and load-time failure

**Answered 2026-08-05: Adapter holds it.** Retained so citations resolve.

**Superseded in part on 2026-08-11.** The question this entry answered — *which module holds the call
site* — stopped having an answer inside this repository when the content moved to JSON: the package's
loader invokes the validators, and Adapter only declares them. What the ruling actually secured is
intact and is why this is a supersession rather than a reversal — validation still happens exactly
once per document, before anything is composed, in the one place the build reads its entry conditions.
Everything below describes the arrangement as it stood between 2026-08-05 and 2026-08-11.

The design places content validation first in the ordering and closes the set of modules permitted to
import `projects` to "the single call site that hands it to the validator, and Verification" — without
naming which module that call site is in. The owner ruled Adapter, and `A3` narrowed accordingly: it
still obtains everything renderable from Composition, and its Content imports are enumerated rather
than forbidden outright. What Adapter does with a failing `Result` is written in *Public signatures*
and asserted as `A5`.

**The divergence this entry recorded is closed.** `10-design.md` § *Module boundaries* said Adapter
"reads nothing from Content or Presentation directly"; `/reconcile` changed the clause on 2026-08-05
and it now enumerates the permitted Content imports, with nothing renderable among them. Nothing is
outstanding here.

### U9 — Accessibility has no Verification surface

**Raised 2026-08-06 by a full re-derivation, and open. Nothing is invented here.**

`10-design.md` § *Module boundaries* gives Verification ownership of "content invariants,
derived-value correctness, markup and stylesheet agreement, **accessibility**, built-output shape,
browser request capture, link resolution, the in-CI image gate, byte identity between the two
targets, release attestation and deployment read-back". Accessibility is the only item in that list
with nothing callable behind it **at all**. Two others — content invariants and derived-value
correctness — also have no function in *Public signatures*, and need none: each is discharged by a
test calling Content's own total functions, which this contract does write. Accessibility has neither a
Verification function nor a Content one to call, and no `VerificationErrorCode` names it.

`P2`, `P3` and `P4` are therefore invariants with nothing callable behind them — the same shape `V3`,
`V5` and `V6` were in before 2026-08-06. It survived that pass because that pass counted error codes
against the signature list, and these three have no code to count.

All three are `00-brief.md` *Definition of done* bullets. That bullet is also the only one in the
list that does **not** say how it is asserted, where the two around it say "asserted against the
built HTML" and "asserted with a browser network log". Whether that omission is deliberate is the
owner's to say, and it does not change that the design assigns the check to Verification.

What is missing, and what would settle each:

- **`P3` — `prefers-reduced-motion`.** Determinable in shape but not in kind. A check over
  `StylesheetText` is static and cheap; a computed-style check in a browser is what proves the
  rendered page. The design's own precedent for `V13` and `V2` — "Source inspection cannot prove
  runtime behaviour, and a network capture alone does not name what leaked. **Both are required**" —
  makes that a fork rather than an implementer's choice.
- **`P2` — greyscale legibility.** A contrast computation over resolved colour pairs. **Both halves of
  what this bullet said it needed are supplied as of 2026-08-06**: `palette` is exported as typed
  values, so there is something to compute over, and the invariant now names its own thresholds, its
  one exemption and its hue-independence clause. What is still unwritten is only the surface — which
  module holds the function, what it takes, and which `VerificationErrorCode` a failure carries.
  Part (a) is a static computation over `palette` and could be written today; part (b) is a claim
  about the rendered link affordance, which puts it on the same static-versus-browser fork as `P3`.
  Writing (a) alone would leave one invariant discharged by two mechanisms in two states, which is why
  neither is written here.
- **`P4` — focus order and keyboard reachability.** Needs a rendered document and a driver.
  [`30-slices.md`](30-slices.md) § *The publication CI* already lists the browser driver for `V2` as a
  choice needing a decision-log entry before implementation; this rides on the same one.

**Not blocked by this:** anything that emits a document. `P2`–`P4` stay Presentation's to maintain
and stay in the invariant table; what is unwritten is the surface that would check them, which is why
this is a contract gap rather than a design one. [`30-slices.md`](30-slices.md) § *Blocked* listed
`P1`–`P5` as "blocked by `U2` alone", which this narrows; `/reconcile` corrected that entry on
2026-08-06, so nothing is outstanding there.

### U10 — `P3` is narrowed to motion, pending an owner edit to the brief

**Answered 2026-08-07: the brief was amended and this is closed.** Retained under its original heading
so the citations to it resolve. The edit named below as remaining was made: `00-brief.md`
§ *Definition of done* now states the narrowed form — the page "**moves** nothing", with transform,
translation, scale, rotation, position change and scroll behaviour named, and a transition of a
non-positional property permitted. `P3` and the brief now state the same rule. Nothing is outstanding
here; what would *check* `P3` is still [`U9`](#u9--accessibility-has-no-verification-surface)'s.

The paragraphs below are retained as the record of what was asked for and why.

`00-brief.md` § *Definition of done* requires that the page "animates nothing under
`prefers-reduced-motion: reduce`". `P3` as it now stands requires that nothing **moves** — no
transform, translation, scale, rotation, position change or scroll behaviour animated or transitioned
— and permits a transition of a non-positional property, the `link` primitive's
`transition: color 120ms ease` being the case in the set.

**Adjudicated 2026-08-07: the narrow form is correct and the brief states the broader one.** The
preference addresses vestibular motion rather than change as such, which is WCAG 2.3.3's subject; a
colour change on hover moves nothing. The ruling and its rejected alternatives — adding a
reduced-motion block to `link` instead, and reporting only — are in
[`90-decisions.md`](90-decisions.md).

**The brief outranks this document, so until it is edited the two disagree on a released
requirement.** Remaining: the owner narrows or strikes that clause in `00-brief.md`. A model may
interrogate that file but not author it, so the edit is not made here.

This is the same shape as [`U5`](#u5--noscript-is-withdrawn-pending-an-owner-edit-to-the-brief), and
it is numbered for the same reason: a brief conflict recorded only in an append-only log is one
nobody re-reads. It blocks nothing — `P3` stays Presentation's to maintain, and
[`U9`](#u9--accessibility-has-no-verification-surface) still owns the question of what would check
it.

### U11 — `X1`'s derivation clause is narrowed to the apex, pending an owner edit to the brief

`00-brief.md` § *Definition of done* requires that *"No count, project total or figure anywhere on the
page is a typed literal."* `X1` as it now stands keeps the typed-literal half over **every** route —
no figure is ever written into Composition's source — and narrows the **derivation** half to the apex:
on `/cv/` and `/portfolio/` a figure may be authored content carried in that route's own validated
document.

**Adjudicated 2026-08-21: the narrow form is correct and the brief states the broader one.** The
source data does not support deriving most of these figures, and the two that look derivable are the
ones that show why. `PortfolioStat.value` carries `"20+"`, `"50+"` and `"Open Source"` — the author's
estimates about a twenty-year career, not counts of anything either document holds; the portfolio
document lists eleven technology categories, not fifty projects, so there is nothing to count.
`CvRole.period` is prose with no end date (`"2023 – Present"`), which no `Year` pair expresses. A
derivation over data that does not contain the fact would have to invent it, and a figure invented by
code is worse than one an author typed, because the author knew it was an estimate.

Two things this does **not** relax. A figure still never appears as a literal in Composition's source
on any route — that half of `X1` is unchanged and is what the rule was written to prevent. And the
apex is untouched: `projectTotal`, `countByStage`, `sinceYear` and `testimonialTotal` remain
derivations, and a count added to the apex is still a derivation or a contract amendment.

**The brief outranks this document, so until it is edited the two disagree on a released requirement.**
Remaining: the owner narrows that clause in `00-brief.md`. A model may interrogate that file but not
author it, so the edit is not made here. The bullet to change reads, in full:

> - No count, project total or figure anywhere on the page is a typed literal.

and the narrowed form it needs to state is that no figure on any route is a typed literal in rendering
code; that every figure on the apex is derived from the project inventory or the testimonial
collection; and that on the CV and portfolio routes a figure may instead be authored content carried
in that route's own content document.

This is the same shape as [`U5`](#u5--noscript-is-withdrawn-pending-an-owner-edit-to-the-brief) and
[`U10`](#u10--p3-is-narrowed-to-motion-pending-an-owner-edit-to-the-brief), and it is numbered for the
same reason: a brief conflict recorded only in an append-only log is one nobody re-reads. It blocks
nothing — `X1` stays Composition's to maintain, and the two routes ship under it as narrowed, exactly
as `P3` shipped under `U10`. The ruling and its rejected alternatives are in
[`90-decisions.md`](90-decisions.md), 2026-08-21.
