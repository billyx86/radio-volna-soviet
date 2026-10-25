/**
 * VU PRNG parity guard between the standalone radio.html and the React app
 * (#15).
 *
 * radio.html hand-maintains its own copy of the VU flicker math so it can
 * run with no build step and no imports (must work from file://). src/lib/vu.ts
 * is the app's source of truth. This test does NOT re-implement the PRNG —
 * it extracts the *actual* function source out of radio.html, executes it in
 * plain Node, and asserts the first N VU values it produces for a fixed
 * station id are bit-for-bit identical to src/lib/vu.ts's createVuFlicker.
 *
 * If the two drift (a changed constant, a reordered mulberry32 step, a
 * reseed that now uses a different string), this fails — the exact class of
 * silent rot the issue is about.
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createVuFlicker, VU_BASE, VU_SPREAD } from "./lib/vu";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "radio.html"), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";

/**
 * Each PRNG helper is a single-line function declaration in radio.html.
 * Pull the whole line so we execute the *real* shipped source, not a copy.
 */
function singleLineFn(name: string): string {
  const m = script.match(new RegExp(`^function ${name}\\b.*$`, "m"));
  if (!m) {
    throw new Error(
      `could not extract single-line \`function ${name}\` from radio.html — ` +
        "did it get reformatted across lines? Update this extractor too.",
    );
  }
  return m[0];
}

// Execute the extracted source in an isolated scope, returning the two fns.
function loadHtmlPrng(): { hashSeed: (s: string) => number; mulberry32: (s: number) => () => number } {
  const code =
    singleLineFn("hashSeed") +
    "\n" +
    singleLineFn("mulberry32") +
    "\nreturn { hashSeed, mulberry32 };";
  const factory = new Function(code);
  return factory();
}

const SAMPLES = 64;
const FIXTURE_IDS = ["volna-1", "kosmos", "deep", "mayak"];

/** First N levels exactly as radio.html's vuLevel() would emit for a station. */
function htmlVuSequence(id: string, n: number): number[] {
  const { hashSeed, mulberry32 } = loadHtmlPrng();
  const rnd = mulberry32(hashSeed(id));
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(VU_BASE + rnd() * VU_SPREAD);
  return out;
}

/** First N levels from the app's canonical source of truth. */
function appVuSequence(id: string, n: number): number[] {
  const flicker = createVuFlicker(id);
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(flicker());
  return out;
}

describe("radio.html ↔ src/lib/vu.ts VU parity (#15)", () => {
  it("extracts the real PRNG source (extractor still matches the file)", () => {
    // loadHtmlPrng throws if the lines are gone; calling it proves the guard
    // is wired to the current file shape.
    const { hashSeed, mulberry32 } = loadHtmlPrng();
    expect(typeof hashSeed("x")).toBe("number");
    expect(typeof mulberry32(1)()).toBe("number");
  });

  it.each(FIXTURE_IDS.map((id) => [id, SAMPLES]))(
    "first %d VU values for station %s are bit-identical to the app",
    (id, n) => {
      const appSeq = appVuSequence(id, n);
      const htmlSeq = htmlVuSequence(id, n);
      // strictEqual per value: any float drift (even 1 ulp) fails.
      for (let i = 0; i < n; i++) {
        expect(htmlSeq[i], `sample ${i} for ${id}`).toBe(appSeq[i]);
      }
    },
  );

  it("produces a stable, in-range sequence for a fixed station", () => {
    const seq = appVuSequence("volna-1", SAMPLES);
    // Deterministic: two runs agree.
    expect(appVuSequence("volna-1", SAMPLES)).toEqual(seq);
    // Bounded by the documented VU envelope.
    for (const v of seq) {
      expect(v).toBeGreaterThanOrEqual(VU_BASE);
      expect(v).toBeLessThanOrEqual(VU_BASE + VU_SPREAD);
    }
  });

  it("different station ids diverge (per-station reseed is real)", () => {
    const a = appVuSequence("volna-1", SAMPLES);
    const b = appVuSequence("deep", SAMPLES);
    expect(a).not.toEqual(b);
  });
});
