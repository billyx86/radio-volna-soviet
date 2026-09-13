import { describe, expect, it } from "vitest";
import { isChannelNavKey, nextChannelIndex } from "./keyboard";

describe("isChannelNavKey", () => {
  it("accepts exactly the list navigation keys", () => {
    expect(isChannelNavKey("ArrowDown")).toBe(true);
    expect(isChannelNavKey("ArrowUp")).toBe(true);
    expect(isChannelNavKey("Home")).toBe(true);
    expect(isChannelNavKey("End")).toBe(true);
  });

  it("rejects other keys (including left/right arrows and Enter)", () => {
    expect(isChannelNavKey("ArrowLeft")).toBe(false);
    expect(isChannelNavKey("ArrowRight")).toBe(false);
    expect(isChannelNavKey("Enter")).toBe(false);
    expect(isChannelNavKey(" ")).toBe(false);
    expect(isChannelNavKey("a")).toBe(false);
  });
});

describe("nextChannelIndex", () => {
  const N = 5;

  it("ArrowDown moves to the next channel", () => {
    expect(nextChannelIndex("ArrowDown", 0, N)).toBe(1);
    expect(nextChannelIndex("ArrowDown", 2, N)).toBe(3);
  });

  it("ArrowDown wraps from the last channel to the first", () => {
    expect(nextChannelIndex("ArrowDown", N - 1, N)).toBe(0);
  });

  it("ArrowUp moves to the previous channel", () => {
    expect(nextChannelIndex("ArrowUp", 2, N)).toBe(1);
    expect(nextChannelIndex("ArrowUp", 1, N)).toBe(0);
  });

  it("ArrowUp wraps from the first channel to the last", () => {
    expect(nextChannelIndex("ArrowUp", 0, N)).toBe(N - 1);
  });

  it("landing on the list from outside starts at an end", () => {
    expect(nextChannelIndex("ArrowDown", -1, N)).toBe(0);
    expect(nextChannelIndex("ArrowUp", -1, N)).toBe(N - 1);
  });

  it("Home and End jump to the extremes", () => {
    expect(nextChannelIndex("Home", 3, N)).toBe(0);
    expect(nextChannelIndex("End", 1, N)).toBe(N - 1);
  });

  it("handles the degenerate sizes", () => {
    expect(nextChannelIndex("ArrowDown", 0, 1)).toBe(0);
    expect(nextChannelIndex("ArrowUp", 0, 1)).toBe(0);
    expect(nextChannelIndex("Home", 0, 1)).toBe(0);
    expect(nextChannelIndex("End", 0, 1)).toBe(0);
  });

  it("returns -1 for an empty list", () => {
    expect(nextChannelIndex("ArrowDown", 0, 0)).toBe(-1);
    expect(nextChannelIndex("End", -1, 0)).toBe(-1);
  });
});
