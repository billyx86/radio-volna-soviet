/**
 * Guard tests for the social-share card and favicon wiring in index.html
 * (#13). These fail if the og:image asset silently corrupts/regresses in
 * size, or if a meta tag drifts (e.g. twitter:card flips back to
 * "summary", which makes platforms ignore the image entirely).
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");
const pngPath = join(root, "public", "og-image.png");

const OG_IMAGE_URL =
  "https://billyx86.github.io/radio-volna-soviet/og-image.png";

function metaValue(key: string): string | null {
  for (const tag of html.match(/<meta\b[^>]*>/g) ?? []) {
    const name = tag.match(/(?:property|name)\s*=\s*"([^"]*)"/)?.[1];
    if (name === key) return tag.match(/content\s*=\s*"([^"]*)"/)?.[1] ?? null;
  }
  return null;
}

function linkHref(rel: string): string | null {
  for (const tag of html.match(/<link\b[^>]*>/g) ?? []) {
    const r = tag.match(/rel\s*=\s*"([^"]*)"/)?.[1];
    if (r === rel) return tag.match(/href\s*=\s*"([^"]*)"/)?.[1] ?? null;
  }
  return null;
}

describe("og-image.png", () => {
  it("is a valid PNG with the 8-byte signature", () => {
    const buf = readFileSync(pngPath);
    expect(buf.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
  });

  it("is exactly 1200×630 (OG spec size, from the IHDR chunk)", () => {
    const buf = readFileSync(pngPath);
    // IHDR: bytes 0-7 signature, 8-11 length, 12-15 "IHDR", 16-19 width,
    // 20-23 height (big-endian).
    expect(buf.subarray(12, 16).toString("ascii")).toBe("IHDR");
    expect(buf.readUInt32BE(16)).toBe(1200);
    expect(buf.readUInt32BE(20)).toBe(630);
  });
});

describe("favicon + theme-color", () => {
  it("references the committed favicon.svg", () => {
    expect(linkHref("icon")).toBe("/favicon.svg");
  });

  it("declares a theme-color matching the site background", () => {
    expect(metaValue("theme-color")).toBe("#0d0a08");
  });

  it("has a page description for crawlers", () => {
    expect(metaValue("description") ?? "").toContain("Радио Волна");
  });
});

describe("Open Graph + Twitter meta", () => {
  it("sets og:type, og:title and og:description", () => {
    expect(metaValue("og:type")).toBe("website");
    expect(metaValue("og:title")).toBe("Радио Волна — Radio Volna");
    expect(metaValue("og:description") ?? "").toContain("8 FM stations");
  });

  it("points og:image at the absolute committed card URL", () => {
    expect(metaValue("og:image")).toBe(OG_IMAGE_URL);
    expect(metaValue("og:image:width")).toBe("1200");
    expect(metaValue("og:image:height")).toBe("630");
    // The URL's last path segment must match the committed asset name,
    // so a renamed public/ file fails loudly.
    expect(OG_IMAGE_URL.split("/").pop()).toBe("og-image.png");
  });

  it("uses summary_large_image (the gating tag) and mirrors the image for Twitter", () => {
    expect(metaValue("twitter:card")).toBe("summary_large_image");
    expect(metaValue("twitter:image")).toBe(OG_IMAGE_URL);
    expect(metaValue("twitter:title")).toBe("Радио Волна — Radio Volna");
  });
});
