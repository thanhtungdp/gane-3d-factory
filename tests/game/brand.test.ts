import { describe, expect, it } from "vitest";
import {
  colorVariants,
  hueShift,
  inkOn,
  mixHex,
  monogramOf,
  normalizeHex,
  primaryColor,
} from "@/game/engine/brand";
import { makeBrand } from "./helpers";

describe("brand helpers", () => {
  it("normalize hex 3/6 ký tự và loại giá trị sai", () => {
    expect(normalizeHex("#abc")).toBe("#aabbcc");
    expect(normalizeHex("21409A")).toBe("#21409a");
    expect(normalizeHex("xyz")).toBeNull();
    expect(normalizeHex(undefined)).toBeNull();
  });

  it("lấy màu primary từ palette, fallback khi thiếu", () => {
    expect(primaryColor(makeBrand())).toBe("#21409a");
    expect(primaryColor(makeBrand({ palette: [] }))).toBe("#21409a");
    expect(primaryColor(makeBrand({ palette: [{ hex: "#ff0000", role: "accent", source: "css" }] }))).toBe("#ff0000");
  });

  it("monogram lấy chữ cái đầu tối đa 2 từ", () => {
    expect(monogramOf("Cà Phê Đất Việt")).toBe("CP");
    expect(monogramOf("Sao Kim")).toBe("SK");
    expect(monogramOf("")).toBe("SK");
  });

  it("hueShift tạo màu khác mà vẫn là hex hợp lệ", () => {
    const shifted = hueShift("#21409a", 155);
    expect(shifted).toMatch(/^#[0-9a-f]{6}$/);
    expect(shifted).not.toBe("#21409a");
    expect(hueShift("#808080", 90)).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("colorVariants tạo 2 màu khác base và khác nhau", () => {
    for (const base of ["#21409a", "#ef4123", "#f4f6fb", "#808080", "#4fd1c5"]) {
      const [a, b] = colorVariants(base);
      expect(a).not.toBe(normalizeHex(base));
      expect(b).not.toBe(normalizeHex(base));
      expect(a).not.toBe(b);
    }
  });

  it("mixHex và inkOn chạy đúng hai đầu", () => {
    expect(mixHex("#000000", "#ffffff", 0)).toBe("#000000");
    expect(mixHex("#000000", "#ffffff", 1)).toBe("#ffffff");
    expect(inkOn("#f4f6fb")).toBe("#06102e");
    expect(inkOn("#21409a")).toBe("#f4f6fb");
  });
});
