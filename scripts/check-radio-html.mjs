#!/usr/bin/env node
// Syntax gate for the inline <script> in the standalone radio.html (#15).
//
// radio.html is a no-build single-file radio that must work from file://, so
// it never goes through typecheck, tests, or the vite build. This extracts
// the inline script and runs `node --check` on it — a parse-only check, so
// browser globals (document, localStorage, Audio, requestAnimationFrame) are
// fine and the script is never executed. A typo, stray token, or
// unterminated template literal in that file fails CI here even though
// nothing else in the repo touches the file.
//
// The deeper assertion — that radio.html's hand-maintained VU PRNG stays in
// lockstep with src/lib/vu.ts — needs the real TS module and lives in
// src/radio-volna-parity.test.ts (run by vitest).

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = join(root, "radio.html");

let html;
try {
  html = readFileSync(htmlPath, "utf8");
} catch (err) {
  console.error(`✗ could not read ${htmlPath}: ${err.message}`);
  process.exit(1);
}

// Grab the single top-level inline <script>…</script> block.
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) {
  console.error("✗ no inline <script> block found in radio.html");
  process.exit(1);
}
const script = match[1];

// `node --check` parses without executing; write the extracted source to a
// temp .js (classic script mode — the inline script has no import/export).
const tmp = join(tmpdir(), `radio-html-check-${process.pid}.js`);
writeFileSync(tmp, script);
try {
  execFileSync(process.execPath, ["--check", tmp], { stdio: "pipe" });
} catch (err) {
  console.error(
    "✗ radio.html inline script failed `node --check` (syntax error):",
  );
  console.error(err.stderr ? err.stderr.toString() : err.message);
  process.exit(1);
} finally {
  try {
    unlinkSync(tmp);
  } catch {
    /* ignore */
  }
}

console.log(
  `✓ radio.html inline script: valid JS (${script.split("\n").length} lines, node --check passed)`,
);
