// S15.9 — a type-level assertion, checked by `tsc --noEmit`. `CvData` and
// `PortfolioData` are branded exactly as `Inventory` and `Testimonials` are
// (tests/types/inventory.type-check.ts): only their validators can produce
// one, so a raw structural document is not assignable without `validateCv`
// or `validatePortfolio` narrowing it first. This file is compiled, never
// run.

import type { CvData, CvDocument, PortfolioData, PortfolioDocument } from "../../src/content";

declare const rawCv: CvDocument;
declare const cvData: CvData;
declare const rawPortfolio: PortfolioDocument;
declare const portfolioData: PortfolioData;
declare function needsCvData(cv: CvData): void;
declare function needsPortfolioData(portfolio: PortfolioData): void;

// A validated CvData is a valid CvDocument-shaped value in every position
// that only needs the structural shape.
const cvAsDocument: CvDocument = cvData;
void cvAsDocument;

// A raw CvDocument is not a CvData — in binding position …
// @ts-expect-error CvDocument is not assignable to CvData.
const badCv: CvData = rawCv;
void badCv;

// … and in argument position.
// @ts-expect-error CvDocument is not a valid CvData argument.
needsCvData(rawCv);

const portfolioAsDocument: PortfolioDocument = portfolioData;
void portfolioAsDocument;

// @ts-expect-error PortfolioDocument is not assignable to PortfolioData.
const badPortfolio: PortfolioData = rawPortfolio;
void badPortfolio;

// @ts-expect-error PortfolioDocument is not a valid PortfolioData argument.
needsPortfolioData(rawPortfolio);
