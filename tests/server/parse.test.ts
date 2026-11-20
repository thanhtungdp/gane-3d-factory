import { describe, expect, it } from "vitest";
import {
  brandNameFromTitle,
  domainRoot,
  nameFromDomain,
  parsePage,
  resolveBrandName,
  resolveDescription,
  resolveTagline,
} from "../../server/crawl/parse";
import { detectIndustry } from "../../server/crawl/industry";
import { fixtureText } from "./helpers";

const PAGE_URL = "https://www.hoasen.vn/";

describe("parsePage (cheerio)", () => {
  it("lấy tên/logo/meta theo đúng độ ưu tiên", async () => {
    const html = await fixtureText("brand-page.html");
    const parsed = parsePage(html, PAGE_URL);

    expect(parsed.title).toContain("Hoa Sen Group");
    expect(parsed.schema.name).toBe("Hoa Sen Group");
    expect(parsed.schema.slogan).toBe("Vật liệu bền vững, ngôi nhà bền lâu");
    expect(parsed.schema.logoUrl).toBe("/logo-schema.png");
    expect(parsed.schema.sameAs).toHaveLength(3);
    expect(parsed.headerLogos.length).toBeGreaterThan(0);
    expect(parsed.headerLogos[0]?.url).toBe("https://www.hoasen.vn/logo-header.svg");
    expect(parsed.headerLogos[0]?.logoSig).toBe(true);
    expect(parsed.appleTouchIcons[0]?.url).toContain("apple-touch-icon.png");
    expect(parsed.manifestUrl).toBe("https://www.hoasen.vn/site.webmanifest");
    expect(parsed.ogImage).toBe("https://www.hoasen.vn/og-image.png");
    expect(parsed.icons[0]?.minSize).toBeGreaterThanOrEqual(32);
    expect(parsed.themeColor).toBe("#0a6e3d");
    expect(parsed.hasViewport).toBe(true);
    expect(parsed.hasResponsiveInlineCss).toBe(false);

    const brand = resolveBrandName(parsed);
    expect(brand.name).toBe("Hoa Sen Group");
    expect(brand.nameSource).toBe("schema.org");

    expect(resolveDescription(parsed)).toContain("tôn thép");
    expect(resolveTagline(parsed)).toBe("Vật liệu bền vững, ngôi nhà bền lâu");
  });

  it("chỉ lấy CSS same-origin và social links trong footer", async () => {
    const html = await fixtureText("brand-page.html");
    const parsed = parsePage(html, PAGE_URL);
    expect(parsed.stylesheets).toEqual(["https://www.hoasen.vn/assets/site.css"]);
    const types = parsed.socials.map((s) => s.type);
    expect(types).toContain("facebook");
    expect(types).toContain("zalo");
    expect(types).toContain("youtube");
    expect(types).toContain("tiktok");
  });

  it("tách tên từ title và tên miền", () => {
    expect(brandNameFromTitle("Hoa Sen Group | Vật liệu xanh", "www.hoasen.vn")).toBe("Hoa Sen Group");
    expect(brandNameFromTitle("Trang chủ – Mộc Việt", "mocviet.vn")).toBe("Mộc Việt");
    expect(domainRoot("www.hoasen.com.vn")).toBe("hoasen");
    expect(domainRoot("shop.mocviet.vn")).toBe("shop.mocviet");
    expect(nameFromDomain("www.hoa-sen.vn")).toBe("Hoa Sen");
  });

  it("fallback tên theo h1/domain khi thiếu schema", async () => {
    const html = await fixtureText("brand-page-weak.html");
    const parsed = parsePage(html, "https://mocviet.vn/");
    const brand = resolveBrandName(parsed);
    expect(brand.nameSource).toBe("title");
    expect(brand.name.length).toBeGreaterThan(1);
    expect(parsed.hasViewport).toBe(false);
  });

  it("đoán ngành từ keyword tiếng Việt", () => {
    const detection = detectIndustry({
      name: "Hoa Sen Group",
      title: "Vật liệu xây dựng",
      description: "Tôn thép, ống nhựa, vật liệu xây dựng cho công trình",
      headings: ["Vật liệu xanh cho ngôi nhà Việt"],
    });
    expect(detection).toBeDefined();
    expect(detection?.industry).toBeTruthy();
    expect(detection?.matched.length).toBeGreaterThan(0);
  });
});
