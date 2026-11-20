/**
 * Chụp lại bộ ảnh Trạm 2.0 + fold/duo vào docs/assets/screens.
 *
 * Yêu cầu: dev server đang chạy (`npm run dev`), hoặc đặt BASE_URL.
 *   npm run shots:stations
 *
 * Dùng reduced-motion để câu KIM hiện đủ ngay (ảnh tài liệu không bị cắt giữa
 * hiệu ứng typewriter), vẫn giữ nguyên layout và trạng thái game.
 */
import { chromium, type Browser, type Page } from "playwright";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const base = process.env.BASE_URL ?? "http://127.0.0.1:5173";
const out = process.env.SHOTS_DIR ?? "docs/assets/screens";
const cached = "/home/tungphan/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
const executablePath = process.env.CHROME_PATH ?? (existsSync(cached) ? cached : undefined);

type Planet = "S" | "A" | "O" | "K" | "IM";

async function context(browser: Browser, width: number, height: number, mobile = true) {
  return browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    isMobile: mobile,
    hasTouch: true,
    reducedMotion: "reduce",
  });
}

async function demo(page: Page, quality?: "low" | "mid" | "high") {
  const suffix = quality ? `&quality=${quality}` : "";
  await page.goto(`${base}/?demo=1&intro=0${suffix}`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("demo-button").click();
  await page.getByTestId("brand-confirm").waitFor({ timeout: 20_000 });
}

async function openStation(page: Page, planet: Planet) {
  await page.evaluate(() => {
    const w = window as unknown as { __SAOKIM__?: { run: { setState: (v: object) => void } } };
    w.__SAOKIM__?.run.setState({ screen: "map" });
  });
  await page.waitForTimeout(180);
  await page.evaluate((target) => {
    const w = window as unknown as {
      __SAOKIM__?: {
        run: { setState: (v: object) => void };
        scene: { getState: () => { setPlanet: (p: string) => void; setMode: (m: string) => void } };
      };
    };
    w.__SAOKIM__?.run.setState({ screen: "planet", currentPlanet: target });
    w.__SAOKIM__?.scene.getState().setPlanet(target);
    w.__SAOKIM__?.scene.getState().setMode("planet");
  }, planet);
  await page.getByTestId("planet-intro").waitFor({ timeout: 10_000 });
  await page.getByTestId("planet-intro").getByTestId("continue").click();
  await page.getByTestId("planet-game").waitFor({ timeout: 15_000 });
  await page.waitForTimeout(1_200);
}

async function openQuestion(page: Page, zone = 0) {
  await page.getByTestId(`fog-zone-${zone}`).click();
  await page.getByTestId("question-modal").waitFor({ timeout: 5_000 });
  await page.waitForTimeout(350);
}

async function chooseFirst(page: Page) {
  await page.locator('[data-testid^="question-option-"]').first().click();
  await page.waitForTimeout(450);
}

async function continueQuestion(page: Page) {
  await page.getByTestId("question-continue").click();
  await page.waitForTimeout(300);
}

async function shoot(page: Page, name: string) {
  await mkdir(out, { recursive: true });
  await page.waitForTimeout(250);
  const png = `/tmp/saokim-${name}.png`;
  await page.screenshot({ path: png });
  await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(`${out}/${name}.jpg`);
  console.log(`• ${out}/${name}.jpg`);
}

async function main() {
  const browser = await chromium.launch({
    executablePath,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader"],
  });

  // Intro lần mở đầu — reduced-motion để câu chốt hiện đủ, vẫn đủ 5 trạm.
  {
    const ctx = await context(browser, 390, 844);
    const page = await ctx.newPage();
    await page.goto(`${base}/?intro=1`, { waitUntil: "domcontentloaded" });
    await page.getByTestId("intro-cta").waitFor({ timeout: 15_000 });
    await page.waitForTimeout(1800);
    await shoot(page, "intro");
    await ctx.close();
  }

  {
    const ctx = await context(browser, 1440, 900, false);
    const page = await ctx.newPage();
    await page.goto(`${base}/?intro=1`, { waitUntil: "domcontentloaded" });
    await page.getByTestId("intro-cta").waitFor({ timeout: 15_000 });
    await page.waitForTimeout(2200);
    await shoot(page, "desktop-intro");
    await ctx.close();
  }

  // Mobile 390: 5 trạm, popup compact, kết quả trạm.
  {
    const ctx = await context(browser, 390, 844);
    const page = await ctx.newPage();
    await demo(page);
    await openStation(page, "S");
    await shoot(page, "tram-s");
    await openQuestion(page);
    await chooseFirst(page);
    await shoot(page, "mobile-question");
    await continueQuestion(page);
    for (const index of [1, 2, 3]) {
      await openQuestion(page, index);
      await chooseFirst(page);
      await continueQuestion(page);
    }
    await page.getByTestId("game-dock").getByTestId("continue").click();
    await page.getByTestId("badge").waitFor({ timeout: 5_000 });
    await page.waitForTimeout(1_200);
    await shoot(page, "ket-qua-tram");

    for (const planet of ["A", "O", "K"] as const) {
      await openStation(page, planet);
      await shoot(page, planet === "A" ? "tram-a" : planet === "O" ? "tram-o" : "tram-k");
    }

    await openStation(page, "IM");
    await page.getByTestId("question-modal").waitFor({ timeout: 5_000 });
    await chooseFirst(page);
    await continueQuestion(page);
    await shoot(page, "tram-im");
    await ctx.close();
  }

  // Low-tier S.
  {
    const ctx = await context(browser, 390, 844);
    const page = await ctx.newPage();
    await demo(page, "low");
    await openStation(page, "S");
    await shoot(page, "tram-low-tier");
    await ctx.close();
  }

  // Desktop: console phải + popup giữa.
  {
    const ctx = await context(browser, 1440, 900, false);
    const page = await ctx.newPage();
    await demo(page);
    await openStation(page, "S");
    await shoot(page, "desktop-planet");
    await openQuestion(page);
    await chooseFirst(page);
    await shoot(page, "desktop-question");
    await ctx.close();
  }

  // Fold cover 344×882.
  {
    const ctx = await context(browser, 344, 882);
    const page = await ctx.newPage();
    await demo(page);
    await openStation(page, "S");
    await shoot(page, "fold-cover");
    await ctx.close();
  }

  // Fold inner 725×870: A với icon + horizon.
  {
    const ctx = await context(browser, 725, 870);
    const page = await ctx.newPage();
    await demo(page);
    await openStation(page, "A");
    await page.getByTestId("star-0").click();
    await page.waitForTimeout(250);
    await chooseFirst(page);
    await continueQuestion(page);
    await page.getByTestId("star-1").click();
    await page.waitForTimeout(1_200);
    await shoot(page, "fold-inner");
    await ctx.close();
  }

  // Duo 540×720.
  {
    const ctx = await context(browser, 540, 720);
    const page = await ctx.newPage();
    await demo(page);
    await openStation(page, "K");
    await shoot(page, "duo");
    await ctx.close();
  }

  // Fold large 884×1104.
  {
    const ctx = await context(browser, 884, 1104);
    const page = await ctx.newPage();
    await demo(page);
    await openStation(page, "S");
    await shoot(page, "fold-large");
    await ctx.close();
  }

  await browser.close();
  console.log("Xong. Kiểm tra", out);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
