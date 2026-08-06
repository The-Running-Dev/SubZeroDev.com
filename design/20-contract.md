# Contract — SubZeroDev.com

Derived from [`10-design.md`](10-design.md). Where this document and the design disagree, one of them
is a defect; say which rather than reconciling.

Language: TypeScript. Established by the consumer pattern `SubZeroDev.Platform` proved and by
`SubZeroDev.Platform.UI.LandingPage`'s published `exports`.

Module names below — Content, Presentation, Composition, Adapter, Artifact, Verification — are the
design's module boundaries, not paths.

**Every interface on the render path is now written.** The external package released `0.3.0` carrying
all three capabilities [`U1`](#u1--the-package-cannot-accept-a-caller-supplied-body) asked for,
verified against the published source, so Adapter's route declarations and default export are written
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

`Result` carries a non-empty error list. No function in this contract throws, and no error is a
string.

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
```

`EcosystemTree` carries exactly one group per `Stage`, in `stageOrder` order, including groups with
no projects. `ResolvedHome` is produced only for `own` and `within` homes; `none` yields no entry.

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
  | "row"
  | "bar";

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
| `Primitive.rules` | CSS text. Every selector in it **begins with** that primitive's own class selector, and each selector in a selector list is anchored independently. What follows the anchor is unconstrained — any pseudo-class, pseudo-element, combinator or universal selector — because the property that has to hold is that no rule can match an element the class is absent from, and the anchor alone establishes it. A rule that could match without the class belongs in the token block, not in a primitive, because `stylesheetFor` emits a primitive's rules only when its class is present. Rules may sit inside an `@media` block; `row`'s single-column wrap and `P3`'s `prefers-reduced-motion` rules are the cases that need one. Contains no `</style` sequence (`P5`) |

`PrimitiveName` is **closed at eight** as of the 2026-08-07 amendment adding `bar`, which followed the
same day's amendment adding `row`; see [`90-decisions.md`](90-decisions.md). Composition references a
primitive through `primitives`, so a ninth is a further contract amendment rather than a class someone
adds to markup. `rule` and `link` appear in both `ColorToken` and `PrimitiveName` and are different
things in each — a colour custom property in the first, a class in the second.

`row` lays its direct children out left-to-right, each taking an equal share of the available width,
wrapping to a single column at the same `720px` breakpoint `page` already uses. Its **one** spacing
rule is the gap between those columns. It carries no colour rule, no type rule and no spacing inside a
column — those come from whatever primitive each child already declares.

It is also the only primitive whose rules reach elements it does not name, through a child combinator
on the universal selector. That is what makes the equal share a property of the row rather than of
what is put in it: a child needs no cooperating class, so `row` composes with the other six instead of
constraining what may sit in one.

`bar` lays its direct children left-to-right and pushes them to the **two ends** of its width,
wrapping to a single column at the same `720px` breakpoint `page` and `row` already use. Like `row` it
carries one spacing rule — a gap, which in the unwrapped state is a floor rather than the actual
separation — and no colour rule and no type rule.

**What distinguishes it from `row` is child sizing, and that is the whole of it.** `row` divides a
width between columns and gives each an equal share; `bar` leaves its children at their content width
and puts the free space *between* them. A row of two prose columns and a strip with a group at each
end are different layouts, and neither expresses the other: `row` cannot right-align its second child
without abandoning the equal share that is its purpose, and `bar` cannot give a column half the width
without abandoning the free space that is its. `bar` therefore needs **no** rule reaching a child it
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
the pair, and `P6` is what makes it true of every `ComposedRoute` rather than a habit.

### Route

```ts
export type RoutePath = "/" | "/404/";
```

The design's `Route` — path, prerendered body, required stylesheet, static head metadata — **is** the
external package's `LandingPageBodyRoute` at `0.3.0`. This repository declares no type of its own
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

`RoutePath` narrows `path` to the two values `A4` permits. `body` carries a `BodyHtml` and
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
  readonly target: ResolvedHome;
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
```

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
| `Project` inventory | Source in this repository | Rebuilt from source on every commit. A change to `Project`'s shape is a compile error, not a migration. |
| Build marker | Injected by Artifact into each emitted document | No existing data. Every artifact is regenerated per commit; an older artifact is replaced, never migrated. |
| Server configuration | Emitted by Artifact beside the output tree, never into it (`R6`) | Regenerated per build from the same source. Nothing reads a previous build's copy, and it is never published. |
| Registry tags | The image registry | A commit tag is written once and never rewritten — the image it names is immutable. `latest` moves and is never an identity. No tag is ever migrated; an old tag stays resolvable, which is what makes a rollback expressible. |
| `Attestation` | A CI approval record, owned by the CI provider | Not read by the build and not read by any later run. An attestation is consumed by exactly one deployment and never re-read. |

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

export const projects: readonly Project[];

export function validateInventory(
  projects: readonly Project[],
  context: BuildContext,
): Result<Inventory, ContentError>;

export function parseCommitId(value: string): CommitId | null;

export function projectTotal(inventory: Inventory): number;

export function countByStage(inventory: Inventory): readonly StageCount[];

export function ecosystemTree(inventory: Inventory): EcosystemTree;

export function contaminationForest(inventory: Inventory): ContaminationForest;

export function sinceYear(inventory: Inventory): Year;

export function resolvedHomes(inventory: Inventory): readonly ResolvedHome[];
```

`projects` is the hand-authored inventory source and the **only unvalidated export in this contract**.
It is `readonly Project[]` and not `Inventory`: it carries no guarantee that any invariant holds, and
it exists so that `validateInventory` and Verification have something to read. Its field brands are
applied at the authoring site rather than earned there — which is why the *Error semantics* table
anticipates raw values that fail their own constraints. The brands gate the derivations; runtime
validation is `validateInventory`'s alone. `C14` is what stops `projects` becoming a second entry
point into the module's data.

Every function other than `validateInventory` and `parseCommitId` takes an `Inventory`, which only
`validateInventory` can produce. They are total on that input and return no error.
`validateInventory` is the sole validating entry point into the module's data.

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

**It is deliberately outside `V4`, and that is a cost rather than an oversight.** `checkLinks` runs
over `resolvedHomes(inventory)`, and `sourceUrl` produces no `ResolvedHome` — there is no project it
belongs to, and a synthetic `projectId` to carry it would be a `ProjectId` naming nothing. The brief's
*Definition of done* requires every outbound **project** link to resolve, and a code-forge account
page is not one, so this sits outside that clause rather than violating it. Stated plainly: **this is
the one outbound link on the page that no gate checks.** It was verified `200` by hand on 2026-08-07.
The alternatives — widening `checkLinks`, or a full site-link type with project-reference resolution —
were both put and both declined; see [`90-decisions.md`](90-decisions.md), 2026-08-07.

### Presentation

```ts
export const palette: Palette;

export const primitives: PrimitiveSet;

export const themeColor: HexColor;

export const iconDataUri: DataUri;

export function stylesheetFor(body: BodyHtml): StylesheetText;
```

**`stylesheetFor` reads the referenced set out of the body rather than being told it.** It collects
which `primitives` class names occur in `body` **as a class token**, and returns the token
block followed by exactly those primitives' `rules`, in `PrimitiveName` declaration order. A class in
the body that is not one of them contributes nothing, which is what leaves `X4`'s
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
| `--font-mono` | a system mono stack | `year`, `stage`, `ProjectId` and `escapedFrom` edges — never prose |
| `--step--1` | `0.8rem` | |
| `--step-0` | `1rem` | body |
| `--step-1` | `1.25rem` | |
| `--step-2` | `1.563rem` | the threshold `P2` names |
| `--step-3` | `1.953rem` | |
| `--space-0` | `0.75rem` | |
| `--space-1` | `1.17rem` | record separation |
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
is "roughly 65 characters at `--step-0`", which puts `1rem` at index 0, and `P2` requires 3:1 "at
`--step-2` and above", which is WCAG's large-text threshold and therefore the `1.563rem` step at a
16px root. The `0.8rem` step takes `--step--1` as a consequence. The spacing indices run from 0 over
the same five values, so `--space-1` is the record separation `P2` cites.

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
export function composeApex(inventory: Inventory): ComposedRoute;

export function composeMiss(): ComposedRoute;
```

These two are the module's entire public surface. Both are total and neither can fail: an `Inventory`
cannot be malformed by construction, and neither function performs I/O.

Each produces its `bodyHtml` first, referencing classes only through `primitives`, and obtains
`stylesheet` by calling `stylesheetFor` on that same body. Composition therefore never states which
primitives it used, and a route whose stylesheet describes a primitive its body does not carry is not
expressible (`P6`).

`composeMiss` takes no inventory because the miss document displays nothing derived from one. If it
ever must — a project count, the since year — that is a contract amendment, not an implementer's call,
because `X1` makes every figure on a page a Content derivation and a composition with no data cannot
carry one.

**Adapter supplies the `Inventory`.** `composeApex` takes it as a parameter and Composition never
validates, imports `projects` or reads the environment. See *Adapter* below and
[`U8`](#u8--the-validateinventory-call-site-and-load-time-failure).

### Adapter

```ts
export const origin: "https://subzerodev.com";

export const apexPath: "/";

export const missPath: "/404/";

declare const config: LandingPageConfig;
export default config;
```

The default export is the whole of Adapter's renderable surface: the package CLI loads this module
and reads `config`. No repository module imports Adapter — Verification's assertions over `A4` and
`A6` necessarily do, which is the same reading Verification's own boundary rule takes.

`config.routes` is exactly two `LandingPageBodyRoute` values, in this order — the apex at `apexPath`
carrying `composeApex(inventory)`, and the miss at `missPath` carrying `composeMiss()` — each route's
`body` and `stylesheet` taken from that route's own `ComposedRoute`.

Five fields are declared **absent**, in four groups, and each absence is load-bearing rather than a
default:

| Field | Absent because |
|---|---|
| `config.styles` | The package declares it and **reads it nowhere** at `0.3.0` — verified against the published source, the same way `hydrate` is declared and unread. Presentation's output therefore travels in each route's own `stylesheet`, which is also what makes `X4` a per-document check rather than a check across the pair |
| `config.publicDir`, `config.allow` | This repository emits no public asset and imports nothing from outside the site root. Note that omitting `publicDir` does not disable it — the package falls back to a `public` directory beside the adapter, which this repository does not create. A public directory is the one path by which a linked asset could enter the tree, and `V13` is what catches one that does |
| `metadata.noScript` | [`U5`](#u5--noscript-is-withdrawn-pending-an-owner-edit-to-the-brief). For a body route the package appends it **inside the body**, so a declaration here would put a false sentence in the document's prose |
| `metadata.repositoryUrl` | The package's adapter path does not emit it. Declaring it would be inert, and an inert declaration reads as a fact about the document |

`metadata.canonicalUrl` and `metadata.openGraph.url` are `origin` concatenated with that route's
path; `metadata.openGraph.type` is `"website"`. `A1` asserts the pairing so no second origin string
exists to drift.

`metadata.themeColor` is Presentation's `themeColor`, and `metadata.icons` is exactly one entry whose
`href` is Presentation's `iconDataUri`. One SVG data URI serves every size, so a second entry would be
a second copy of one mark. Both values are **imported, never transcribed** — a hex or a data URI
written out here would be a second copy of visual identity with nothing comparing the two, which is
what `A7` forbids. Whatever else `LandingPageIcon` requires beside `href` is the package's
declaration, transcribed at slice time against the pinned `0.3.0` the same way the route metadata's
other package-owned fields are.

**Adapter therefore imports two named things from Presentation, and only these two.** That is a
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

**Adapter is the `validateInventory` call site.** It is the module the package CLI loads, so it is the
one place in the import graph where the build's entry conditions are read and where the build can
still refuse to produce anything. It constructs `BuildContext` from the environment — the commit
through `parseCommitId`, the UTC year — calls `validateInventory(projects, context)`, and on
`{ ok: false }` reports **every** `ContentError` and terminates the build with a non-zero exit,
rendering nothing. On `{ ok: true }` it hands the `Inventory` to `composeApex` and declares the two
routes. That handling is the whole of `A5`, and it is why `C14`'s closed importer set names Adapter.

It is a process exit, not a thrown exception and not a string error: *Error semantics* holds, and the
failure is expressible where a `Result` returned from module evaluation would have had no caller.

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
validates `input.commit`, copies `missEmittedEntry` to `missRootEntry`, injects the marker into every
`.html` document in the tree — the copy included — and writes `serverConfig()` last, into
`serverConfigDir`. Copying before injecting is what makes `R2` hold: both documents are marked in the
same pass and stay byte-identical. Injecting first and copying after would also work today and would
break silently the day a second post-build rewrite is added. The configuration is written last and
outside `outputDir`, so it is neither a document nor a marking candidate and no ordering question
about it can arise.

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
  targets: readonly ResolvedHome[],
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

**Four codes previously had no producing function, and two invariants no callable surface.** The three
signatures that close it are the two added above and `assertAttestation`'s changed first parameter:

| Code | Producer | Discharges |
|---|---|---|
| `ManifestoAbsent`, `ProjectNameAbsent` | `assertContentPresent` | `V3` |
| `StaleDeploymentCandidate` | `assertDeploymentCandidateCurrent` | `V6` |
| `AttestationAbsent` | `assertAttestation`, given `null` | `V5` |

`assertAttestation` takes `Attestation | null` because absence is the condition `AttestationAbsent`
names, and a parameter that cannot be absent cannot express it. The `publish` job passes what it read
from the run's approval record, and `null` where there was none.

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
  | "EscapedFromCycle";

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
first only.

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

### Artifact

```ts
export type ArtifactErrorCode =
  | "CommitIdMalformed"
  | "OutputTreeMissing"
  | "MissDocumentMissing"
  | "MarkerInsertionPointMissing"
  | "MarkerAlreadyPresent"
  | "WriteFailed";

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
  | "UnknownPathStatusWrong"
  | "UnknownPathBodyWrong"
  | "ServedBytesMismatch"
  | "ImageTagCommitMismatch"
  | "AttestationCommitMismatch"
  | "AttestationAbsent"
  | "ManifestoAbsent"
  | "ProjectNameAbsent"
  | "StaleDeploymentCandidate";

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
| `ScriptElementPresent` | An emitted document contains a `<script>` element | No | Fail the build |
| `LinkedStylesheetPresent` | An emitted document links a stylesheet rather than inlining it | No | Fail the build |
| `ExternalAssetReference` | An emitted document references an asset by URL other than a data URI or an outbound link | No | Fail the build |
| `ClassWithoutRule` | A class in a route's body has no selector in that route's stylesheet | No | Fail the build. **Never a warning** |
| `SelectorWithoutUser` | A **class** selector in a route's stylesheet matches nothing in that route's body. The token block's `:root` rules carry no class selector and cannot raise it (`X4`) | No | Fail the build |
| `RootMissDocumentAbsent` | `missRootEntry` is absent from the finished tree | No | Fail the build |
| `UnknownPathStatusWrong` | A unique unknown path answered with a status other than 404 | No | Fail the gate or report the deploy failed. A 200 here is a soft 404 |
| `UnknownPathBodyWrong` | A unique unknown path answered 404 with a body other than the emitted miss document | No | Fail the gate or report the deploy failed |
| `ServedBytesMismatch` | What the running image serves for `/` differs byte for byte from the emitted document | No | Fail the image gate. **Never push** |
| `ImageTagCommitMismatch` | The image tag is not the full commit id being released | No | Fail the image gate. Never push |
| `AttestationCommitMismatch` | `Attestation.commit` differs from the commit being deployed | No | Refuse to deploy. An attestation is never reused |
| `AttestationAbsent` | `assertAttestation` was given `null` — the run carries no approval record | No | Refuse to deploy |
| `ManifestoAbsent` | A known manifesto sentence is missing from built HTML with scripting never executed | No | Fail the build |
| `ProjectNameAbsent` | A project `name` is missing from built HTML with scripting never executed | No | Fail the build |
| `StaleDeploymentCandidate` | At the critical section's start, this run's commit is no longer the deployment-branch head | No | Stop before publishing. This is a clean stop, not a failure |

### Composition, Presentation, Adapter

**No error type.** Composition and Presentation operate only on an `Inventory`, which cannot be
malformed by construction, and neither performs I/O.

Adapter declares none of its own either, and **handles** `ContentError`: it is the sole
`validateInventory` call site, and its whole response to `{ ok: false }` is to report every error and
exit non-zero. There is no Adapter-specific failure to name — a malformed inventory is a Content
fault, and an inventory that validates leaves Adapter nothing that can fail.

**Bare exceptions exist in the system and none of them is ours.** At `0.3.0` the external package
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
| **C14** | Nothing imports `projects` except the `validateInventory` call site — Adapter once it exists, and until then the committed-inventory assertion — and Verification's assertions over the inventory. No derivation function, no Composition entry and no Artifact step reads it | Content |
| **C15** | `parseCommitId` is the only implementation of the `CommitId` pattern in the repository | Content |
| **P1** | Nothing in Presentation references a linked font, an external stylesheet, a gradient or an illustration asset. Neither `--font-sans` nor `--font-mono` names a webfont, and no rule is an `@font-face` | Presentation |
| **P2** | The rendered page is legible in greyscale, in two parts. **(a)** Every foreground colour resolved against the background it is rendered on meets WCAG AA — 4.5:1, or 3:1 at `--step-2` and above. `--rule` is **exempt, by name**: record separation is carried by `--space-1`, so a divider reinforces and never signals. **(b)** No meaning is carried by hue alone, which obliges the `link` primitive to declare a `text-decoration`, or a font weight distinct from body text. Part (b) is what makes this say greyscale rather than contrast: `--link` against `--fg` is 1.50:1, far below the 4.5:1 body-text threshold, so a link is not reliably separable from body text by luminance alone. The margin against `--bg` is not what is at issue — `--link` clears (a) there at 11.17:1 — which is why (b) is a separate half rather than a consequence of (a) | Presentation |
| **P3** | Nothing **moves** under `prefers-reduced-motion: reduce`: no transform, translation, scale, rotation, position change or scroll behaviour is animated or transitioned. A transition of a non-positional property — a colour change on hover or focus is the case in the primitive set — is not motion and is permitted. The preference addresses vestibular motion rather than change as such, which is why this names motion and not animation. **`00-brief.md` § *Definition of done* states the broader form and outranks this document**; the disagreement is known and unreconciled — see [`90-decisions.md`](90-decisions.md), 2026-08-07 | Presentation |
| **P4** | Focus order matches visual order and every interactive element is keyboard-reachable | Presentation |
| **P5** | No `StylesheetText` contains a `</style` sequence in any case — the package emits it unescaped inside a `<style>` element and throws on one | Presentation |
| **P6** | A route's stylesheet is the token block followed by the `rules` of exactly those primitives whose `className` occurs in that route's `bodyHtml`, and nothing else. `stylesheetFor` derives the set from the body, so no caller states it | Presentation |
| **P7** | Exactly one primitive's `rules` reference `--font-mono`; no other primitive and no token-block rule does. What that primitive may carry is `X1`'s, not restated here | Presentation |
| **X1** | No count, total, year or other figure on the page is a typed literal; each comes from a Content derivation | Composition |
| **X2** | Composition imports only Content and Presentation, and nothing imports Composition except Adapter | Composition |
| **X3** | The page contains no form, no analytics, no consent surface and no third-party script | Composition |
| **X4** | For each `ComposedRoute`, every class referenced in `bodyHtml` has a matching selector in `stylesheet`, and every **class** selector in `stylesheet` has a user in `bodyHtml` — checked by `assertStyleAgreement`. The token block's `:root` rules fall outside both halves and need no exemption clause: they carry no class selector, and `Primitive.rules` roots every other rule at its own `className` | Composition |
| **X5** | Every Content value interpolated into `bodyHtml` is HTML-escaped, in attribute position as well as in text position; `<`, `>`, `&`, `"` and `'` never reach the document unescaped from a content value. The rule is over every interpolated value, not over a named list of fields. The attribute half is not implied by the text half — `"` and `'` are inert in text and are exactly what closes an attribute early — and a `ResolvedHome.url` carried in an `href` is the case the apex composition has. Asserted with a fixture project carrying all five characters, in both positions | Composition |
| **A1** | Every URL in route metadata is built from `origin`; no origin string is written twice. Each route's `canonicalUrl` and `openGraph.url` equal `origin` concatenated with that route's `path` | Adapter |
| **A2** | Every entry in `metadata.icons` carries a `DataUri` as its `href`; no icon is a linked asset | Adapter |
| **A3** | Adapter obtains everything renderable from Composition; it imports Content only for `projects`, `validateInventory`, `BuildContext` and `parseCommitId`, and Presentation only for `themeColor` and `iconDataUri` — never a derivation function, a copy constant, a primitive or the stylesheet. Both import lists are enumerated, and nothing renderable is on either | Adapter |
| **A4** | Exactly two routes are declared: `apexPath` and `missPath` | Adapter |
| **A5** | Adapter validates the inventory exactly once; on failure it reports every `ContentError` and exits non-zero, and no route body, stylesheet or document is produced | Adapter |
| **A6** | Both routes are `LandingPageBodyRoute` values: neither declares `entry`, `hydrate` or `noScript`, and the configuration declares no `styles`, `publicDir` or `allow`. Each route's stylesheet travels in its own `stylesheet` field | Adapter |
| **A7** | No colour literal and no data URI is written in Adapter. `metadata.themeColor` is Presentation's `themeColor` and every `metadata.icons[].href` is Presentation's `iconDataUri`, by reference — the same rule `A1` applies to `origin`, applied to visual identity | Adapter |
| **R1** | Every emitted document carries exactly one build marker, and it carries the commit being built | Artifact |
| **R2** | `missRootEntry` and `missEmittedEntry` are byte-identical in the finished tree | Artifact |
| **R3** | Artifact compiles nothing, bundles nothing and resolves no module; the only change it makes to a document is the marker | Artifact |
| **R4** | The emitted server configuration resolves every unknown path to `missRootEntry` with status 404; sets no cookie, no cache-control directive chosen by application logic, and no tracking or rewrite header; and executes nothing per request. A response header that is an unconfigured byproduct of serving a static file over HTTP — a content-type, a content-length, a last-modified time, an entity tag, the server's own identifying header — is not a violation | Artifact |
| **R5** | `missEmittedEntry` is the package's emitted entry for Adapter's `missPath` — checked against the emitted tree, never assumed | Artifact |
| **R6** | The emitted server configuration is written outside `outputDir` and never appears in the published tree, on either target | Artifact |
| **V1** | No document reaches publication unless it carries the exact commit's marker | Verification |
| **V2** | Loading a route document triggers zero requests other than the navigation document itself | Verification |
| **V3** | Every manifesto sentence asserted, and every project `name`, appears in built HTML with scripting never executed | Verification |
| **V4** | Every `ResolvedHome` responds 2xx or 3xx before deployment | Verification |
| **V5** | An `Attestation` is valid for exactly one `CommitId` and is never accepted for another | Verification |
| **V6** | Publication happens only while this run's commit is the deployment-branch head | Verification |
| **V7** | The ordering holds: content validation → render → package build → Artifact → offline verification → image build → in-CI image gate → networked link check and truth attestation → branch-head check → Pages deploy and registry push → exact-marker and unknown-path read-back → live claim | Verification |
| **V8** | No live URL is stated or implied until `pollForCommit` returns `ok` for the exact commit **and** the unknown-path check passes | Verification |
| **V9** | No image is pushed to the registry unless the in-CI gate passed for that image | Verification |
| **V10** | The image tag equals the full commit id, and equals the marker the running image serves | Verification |
| **V11** | What the running image serves for `/` is byte-identical to the emitted apex document | Verification |
| **V12** | An unknown path returns status 404 carrying the emitted miss document, on **both** targets | Verification |
| **V13** | No emitted document contains a script element, a linked stylesheet or an external asset reference | Verification |
| **V14** | No image tag is stated or implied until the push for that tag has succeeded and the tag resolves in the registry | Verification |

Three things the design states that this contract deliberately does **not** encode as build-time
checks, because encoding them would duplicate a fact another module owns or claim a check that cannot
be performed:

- **`home.url` addresses the project's own site.** Checking that its host is a subdomain of the apex
  would require Content to know the apex origin, which Adapter owns (`A3`). Covered by the release
  attestation and by `V4`, not by a Content assertion.
- **`genre` and `stage` are true of the project.** Both are authored facts. `Genre` is closed at the
  type level; whether the assigned value is the right one is attestation work.
- **The deployed compose stack serves the published image.** The design guarantees a published image
  is correct and stops there. `V9`–`V12` cover the artifact; nothing here observes a delivery
  environment, and no invariant claims to.

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

The `publish` job targets the environment; a human approves; the provider records approver and
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

**Answered 2026-08-06: pin `0.3.0` exactly.** Retained so citations resolve.

It is the version that satisfies `U1`, verified as published rather than assumed — see that entry for
the evidence. The pin is exact, with a lockfile, per the design's *The package is unavailable or
drifts*.

The prior drift this entry recorded — `SubZeroDev.Platform` pinning `0.2.0`, the package's own
`30-slices.md` naming `0.1.0` as the published handoff — is superseded for this repository's purposes
but is still live for the other two, and is tracked as issue #4. Neither repository is this one.

### U5 — `<noscript>` is withdrawn, pending an owner edit to the brief

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

The brief requires Open Graph and X/Twitter metadata. Verified at `0.3.0`: `socialImageUrl`,
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

The design places content validation first in the ordering and closes the set of modules permitted to
import `projects` to "the single call site that hands it to the validator, and Verification" — without
naming which module that call site is in. The owner ruled Adapter, and `A3` narrowed accordingly: it
still obtains everything renderable from Composition, and its Content imports are enumerated rather
than forbidden outright. What Adapter does with a failing `Result` is written in *Public signatures*
and asserted as `A5`.

**The divergence this entry recorded is closed.** `10-design.md` § *Module boundaries* said Adapter
"reads nothing from Content or Presentation directly"; `/reconcile` changed the clause on 2026-08-05
and it now names the same four Content imports, with nothing renderable among them. Nothing is
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
