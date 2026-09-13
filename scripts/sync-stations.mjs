#!/usr/bin/env node
/**
 * Regenerate the inline `const STATIONS=[...]` array in radio.html from
 * the TypeScript source of truth in src/data/stations.ts.
 *
 * The standalone radio.html is a static page (no build step, works from
 * file://), so it embeds its own copy of the station data. That copy has
 * drifted from the React app's data in the past (#7); this script makes
 * src/data/stations.ts the single source of truth. CI runs
 * `npm run sync:stations` and fails on any resulting diff.
 *
 * Usage: node scripts/sync-stations.mjs [--check]
 *   --check  exit 1 if radio.html would change (CI drift detection)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tsPath = join(root, "src", "data", "stations.ts");
const htmlPath = join(root, "radio.html");

const ts = readFileSync(tsPath, "utf8");

// Extract the array literal body from
//   export const STATIONS: Station[] = [ ... ];
const m = ts.match(/export const STATIONS: Station\[\] = \[([\s\S]*?)\n\];/);
if (!m) {
  console.error("sync-stations: could not find STATIONS in src/data/stations.ts");
  process.exit(1);
}

// The object literals are plain JS (strings/numbers only), so evaluating
// the literal is safe and needs no TS toolchain.
let STATIONS;
try {
  STATIONS = new Function(`return [${m[1]}];`)();
} catch (e) {
  console.error("sync-stations: STATIONS literal is not plain JS:", e.message);
  process.exit(1);
}

// Compact serialization, one station per line, key order as declared.
const lines = STATIONS.map(
  (s) => "  " + JSON.stringify(s) + ",",
);
const generated = "const STATIONS=[\n" + lines.join("\n") + "\n];";

const html = readFileSync(htmlPath, "utf8");
const re = /const STATIONS=\[\n[\s\S]*?\n\];\n/;
if (!re.test(html)) {
  console.error("sync-stations: could not find inline STATIONS in radio.html");
  process.exit(1);
}

const updated = html.replace(re, generated + "\n");

if (process.argv.includes("--check")) {
  if (updated !== html) {
    console.error(
      "sync-stations: radio.html is out of sync with src/data/stations.ts. Run `npm run sync:stations`.",
    );
    process.exit(1);
  }
  console.log("sync-stations: radio.html in sync ✓");
  process.exit(0);
}

writeFileSync(htmlPath, updated);
console.log(
  `sync-stations: wrote ${STATIONS.length} stations into radio.html`,
);
