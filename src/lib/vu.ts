/**
 * Simulated VU-meter levels for when no Web Audio analyser is available
 * (CORS-blocked streams, etc.).
 *
 * The old implementation called Math.random() every animation frame:
 * the needle strobed uniformly and the behaviour was impossible to test.
 * Here the flicker is a deterministic PRNG sequence, re-seeded per
 * station so each channel has a stable (and testable) needle character.
 */

/** Mulberry32: tiny fast PRNG, returns floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a string hash → unsigned 32-bit seed. */
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const VU_BASE = 0.35;
export const VU_SPREAD = 0.5;

/**
 * A flicker function for one station: each call returns the next
 * simulated level in [VU_BASE, VU_BASE + VU_SPREAD]. Deterministic for a
 * given station id.
 */
export function createVuFlicker(stationId: string): () => number {
  const rnd = mulberry32(hashSeed(stationId));
  return () => VU_BASE + rnd() * VU_SPREAD;
}
