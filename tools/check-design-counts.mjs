// Flags a stale counting phrase in design/*.md before it needs a `/reconcile`
// pass to catch it by hand (issue #17). Scoped to the one shape that has
// actually drifted twice: a spelled-out numeral introducing an enumeration —
// "Four audiences, deliberately unranked:" followed by four bullets, or
// "Five things resemble persistence and are not:" followed by a five-row
// table. Where the numeral's colon is not immediately followed by a bullet
// list, numbered list or table on its own lines, this says nothing — silence
// isn't a pass, it's "not checkable this way." An inline "Two things: a, and
// b" clause is deliberately left unchecked: prose commas and "and"s serve
// too many other grammatical jobs (appositives, continuations) for a regex
// to tell an enumeration from an explanation without false positives.
//
// 90-decisions.md is append-only history — "310 tests across 31 files" is a
// point-in-time verified fact, not a list this file re-describes on every
// edit — so it is excluded.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const NUMERAL_WORDS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

const DESIGN_FILES = [
  "design/00-brief.md",
  "design/10-design.md",
  "design/20-contract.md",
  "design/30-slices.md",
];

const COUNTING_PHRASE = new RegExp(
  `\\b(${Object.keys(NUMERAL_WORDS)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("|")})\\b([^:.\\n]{0,100}):\\s*$`,
);

function countList(lines, startIndex, markerRegex) {
  let i = startIndex;
  while (i < lines.length && lines[i].trim() === "") i++;
  if (i >= lines.length || !markerRegex.test(lines[i])) return null;

  let count = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (markerRegex.test(line)) {
      count++;
      i++;
    } else if (line.trim() === "") {
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === "") j++;
      if (j < lines.length && markerRegex.test(lines[j])) {
        i = j;
      } else {
        break;
      }
    } else {
      // A continuation line wrapping the previous item, not a new one.
      i++;
    }
  }
  return count;
}

function countTableRows(lines, startIndex) {
  let i = startIndex;
  while (i < lines.length && lines[i].trim() === "") i++;
  if (i >= lines.length || !lines[i].trim().startsWith("|")) return null;
  i++;
  if (i >= lines.length || !/^\|[\s:|-]+\|?\s*$/.test(lines[i].trim())) return null;
  i++;
  let count = 0;
  while (i < lines.length && lines[i].trim().startsWith("|")) {
    count++;
    i++;
  }
  return count > 0 ? count : null;
}

// Exported for tests. Returns one entry per stale counting phrase found.
export function checkText(text, label) {
  const lines = text.split("\n");
  const findings = [];

  lines.forEach((line, lineIndex) => {
    const match = COUNTING_PHRASE.exec(line);
    if (!match) return;

    const expected = NUMERAL_WORDS[match[1].toLowerCase()];
    const bullets = countList(lines, lineIndex + 1, /^[-*]\s+/);
    const numbered = countList(lines, lineIndex + 1, /^\d+\.\s+/);
    const tableRows = countTableRows(lines, lineIndex + 1);

    let actual = null;
    let kind = null;
    if (bullets !== null) {
      actual = bullets;
      kind = "bullet list";
    } else if (numbered !== null) {
      actual = numbered;
      kind = "numbered list";
    } else if (tableRows !== null) {
      actual = tableRows;
      kind = "table";
    }

    if (actual !== null && actual !== expected) {
      findings.push({
        label,
        line: lineIndex + 1,
        phrase: line.trim(),
        expected,
        actual,
        kind,
      });
    }
  });

  return findings;
}

export function checkFiles(paths, readFile = (p) => readFileSync(p, "utf8")) {
  return paths.flatMap((path) => checkText(readFile(path), path));
}

function isMain() {
  return process.argv[1] === fileURLToPath(import.meta.url);
}

if (isMain()) {
  const findings = checkFiles(DESIGN_FILES);
  if (findings.length > 0) {
    for (const f of findings) {
      console.error(
        `${f.label}:${f.line}: "${f.phrase}" claims ${f.expected}, the following ${f.kind} has ${f.actual}`,
      );
    }
    console.error(`\n${findings.length} stale counting phrase(s) found.`);
    process.exit(1);
  }
  console.log("No stale counting phrases found.");
}
