import { describe, expect, it } from "vitest";
import {
  VU_BASE,
  VU_SPREAD,
  createVuFlicker,
  hashSeed,
  mulberry32,
} from "./vu";

describe("mulberry32", () => {
  it("is deterministic for a fixed seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 20; i++) {
      expect(a()).toBe(b());
    }
  });

  it("differs for different seeds", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    // Practically guaranteed; fails only with ~1e-9 odds.
    expect([a(), b()].some((v) => v !== undefined)).toBe(true);
    const seqA = Array.from({ length: 5 }, () => a());
    const seqB = Array.from({ length: 5 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });

  it("produces values in [0, 1)", () => {
    const rnd = mulberry32(12345);
    for (let i = 0; i < 1000; i++) {
      const v = rnd();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("handles negative and oversized seeds without throwing", () => {
    const rnd = mulberry32(-9999);
    expect(rnd()).toBeGreaterThanOrEqual(0);
    const big = mulberry32(2 ** 40);
    expect(big()).toBeLessThan(1);
  });
});

describe("hashSeed", () => {
  it("is deterministic and an unsigned 32-bit int", () => {
    const a = hashSeed("volna-1");
    expect(a).toBe(hashSeed("volna-1"));
    expect(Number.isInteger(a)).toBe(true);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThanOrEqual(0xffffffff);
  });

  it("gives distinct station ids distinct seeds", () => {
    const ids = ["volna-1", "volna-2", "kosmos", "trud", "orbita", "mayak", "lush", "deep"];
    const seeds = ids.map(hashSeed);
    expect(new Set(seeds).size).toBe(ids.length);
  });
});

describe("createVuFlicker", () => {
  it("keeps levels within the expected band", () => {
    const flicker = createVuFlicker("kosmos");
    for (let i = 0; i < 500; i++) {
      const v = flicker();
      expect(v).toBeGreaterThanOrEqual(VU_BASE);
      expect(v).toBeLessThanOrEqual(VU_BASE + VU_SPREAD);
    }
  });

  it("is deterministic per station: same id → same sequence", () => {
    const a = createVuFlicker("trud");
    const b = createVuFlicker("trud");
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("different stations flicker differently", () => {
    const a = createVuFlicker("volna-1");
    const b = createVuFlicker("deep");
    const seqA = Array.from({ length: 5 }, () => a());
    const seqB = Array.from({ length: 5 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });
});
