import { describe, expect, it } from "vitest";
import {
  buildPalette,
  contrastRatio,
  ensureContrast,
  extractCssColors,
  NAVY_BACKGROUND,
  parseCssColor,
  rgbToHex,
  hexToRgb,
} from "../../server/crawl/palette";
import { fixture, fixtureText } from "./helpers";

describe("palette OKLab", () => {
  it("parse màu CSS: hex, rgb, hsl", () => {
    expect(parseCssColor("#0a6e3d")?.rgb).toEqual({ r: 10, g: 110, b: 61 });
    expect(rgbToHex({ r: 10, g: 110, b: 61 })).toBe("#0a6e3d");
    expect(parseCssColor("rgb(239, 65, 35)")?.rgb).toEqual({ r: 239, g: 65, b: 35 });
    expect(parseCssColor("hsl(0, 100%, 50%)")?.rgb).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseCssColor("rgba(0,0,0,0)")?.alpha).toBe(0);
    expect(hexToRgb("#f4a261")).toEqual({ r: 244, g: 162, b: 97 });
  });

  it("đếm màu trong CSS, bỏ alpha thấp", () => {
    const counts = extractCssColors(`a{color:#0a6e3d;background:rgba(255,255,255,0)} b{color:#0a6e3d;border-color:rgb(244,162,97)}`);
    expect(counts.get("#0a6e3d")).toBe(2);
    expect(counts.get("#f4a261")).toBe(1);
    expect(counts.size).toBe(2);
  });

  it("ensureContrast nâng độ tương phản trên nền navy", () => {
    const adjusted = ensureContrast("#0a0a1a", NAVY_BACKGROUND, 3);
    expect(contrastRatio(adjusted, NAVY_BACKGROUND)).toBeGreaterThanOrEqual(3);
  });

  it("gộp logo + theme + CSS thành tối đa 3 màu, khử trùng, đủ tương phản", async () => {
    const logo = await fixture("logo-large.png");
    const css = await fixtureText("brand-page-css.css");
    const result = await buildPalette({ logoPng: logo, themeColor: "#0a6e3d", cssTexts: [css] });

    expect(result.palette.length).toBeGreaterThanOrEqual(2);
    expect(result.palette.length).toBeLessThanOrEqual(3);
    expect(new Set(result.palette.map((c) => c.hex)).size).toBe(result.palette.length);
    expect(result.palette[0]?.role).toBe("primary");
    for (const color of result.palette) {
      expect(contrastRatio(color.hex, NAVY_BACKGROUND)).toBeGreaterThanOrEqual(3);
      expect(["logo", "css", "theme", "manual", "fallback"]).toContain(color.source);
    }
    expect(result.colorConsistency).toBeGreaterThan(0);
    expect(result.colorConsistency).toBeLessThanOrEqual(10);
  });

  it("không có dữ liệu → palette fallback Sao Kim", async () => {
    const result = await buildPalette({});
    expect(result.palette.length).toBe(3);
    expect(result.palette.every((c) => c.source === "fallback")).toBe(true);
    expect(result.colorConsistency).toBe(0);
    expect(result.palette[0]?.role).toBe("primary");
  });

  it("màu trùng gần nhau trong CSS không tạo 3 màu giống nhau", async () => {
    const css = ".a{color:#0a6e3d}.b{color:#0a6f3e}.c{color:#096d3c}.d{color:#f4a261}";
    const result = await buildPalette({ cssTexts: [css] });
    expect(new Set(result.palette.map((c) => c.hex)).size).toBe(result.palette.length);
  });
});
