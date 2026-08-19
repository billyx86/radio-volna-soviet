import { describe, expect, it } from "vitest";
import { STATIONS, getStationById } from "./stations";

describe("STATIONS dataset", () => {
  it("has stations", () => {
    expect(STATIONS.length).toBeGreaterThan(0);
  });

  it("ids are unique", () => {
    const ids = STATIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("frequencies are unique", () => {
    const freqs = STATIONS.map((s) => s.freq);
    expect(new Set(freqs).size).toBe(freqs.length);
  });

  it("all frequencies are within the FM band (87.5–108.0 MHz)", () => {
    for (const s of STATIONS) {
      expect(s.freq).toBeGreaterThanOrEqual(87.5);
      expect(s.freq).toBeLessThanOrEqual(108.0);
    }
  });

  it("all stream URLs are absolute HTTPS", () => {
    for (const s of STATIONS) {
      expect(s.streamUrl).toMatch(/^https:\/\//);
      expect(new URL(s.streamUrl).host.length).toBeGreaterThan(0);
    }
  });

  it("every station has non-empty names and a genre", () => {
    for (const s of STATIONS) {
      expect(s.nameRu.length).toBeGreaterThan(0);
      expect(s.nameEn.length).toBeGreaterThan(0);
      expect(s.genre.length).toBeGreaterThan(0);
      expect(s.code.length).toBeGreaterThan(0);
    }
  });
});

describe("getStationById", () => {
  it("finds an existing station", () => {
    const first = STATIONS[0]!;
    expect(getStationById(first.id)).toBe(first);
  });

  it("returns undefined for an unknown id", () => {
    expect(getStationById("nope")).toBeUndefined();
  });
});
