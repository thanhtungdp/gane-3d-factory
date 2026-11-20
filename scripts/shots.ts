/**
 * Chụp ảnh QA các màn chính ở 390×844 (và landing desktop 1440×900).
 * Yêu cầu: dev server đang chạy (`npm run dev`) trừ khi BASE_URL trỏ nơi khác.
 *
 *   npm run shots
 */
import { chromium, type Page } from "playwright";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

const base = process.env.BASE_URL ?? "http://127.0.0.1:5173";
const out = process.env.SHOTS_DIR ?? "shots";

async function shoot(page: Page, name: string) {
  await mkdir(out, { recursive: true });
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${out}/${name}.png` });
  console.log(`• ${out}/${name}.png`);
}

async function main() {
  const cached = "/home/tungphan/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
  const executablePath = process.env.CHROME_PATH ?? (existsSync(cached) ? cached : undefined);
  const browser = await chromium.launch({
    executablePath,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader"],
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") console.log("[console]", msg.text());
  });

  await page.goto(`${base}/?demo=1&intro=0`, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-testid="landing-form"]');
  await shoot(page, "01-landing");

  await page.click('[data-testid="demo-button"]');
  await page.waitForSelector('[data-testid="brand-confirm"]', { timeout: 20_000 });
  await shoot(page, "02-confirm");

  await page.click('[data-testid="begin-button"]');
  await page.waitForSelector('[data-testid="launch-screen"]', { timeout: 15_000 });
  await page.waitForTimeout(1400);
  await shoot(page, "03-launch");

  await page
    .locator('[data-testid="skip-launch"]')
    .click({ timeout: 3500 })
    .catch(() => undefined);
  await page.waitForSelector('[data-testid="health-card"]', { timeout: 20_000 });
  await shoot(page, "04-map");

  await page.click('[data-testid="next-planet-button"]');
  await page.waitForSelector('[data-testid="planet-intro"]');
  await shoot(page, "05-planet-intro");

  await page.click('[data-testid="planet-intro"] [data-testid="continue"]');
  await page.waitForSelector('[data-testid="planet-game"]', { timeout: 15_000 });
  await page.waitForTimeout(900);
  await shoot(page, "06-planet-game");

  await page.evaluate(async () => {
    const w = window as unknown as { __SAOKIM__?: { seedAll: () => Promise<void> } };
    await w.__SAOKIM__?.seedAll();
  });
  await page.waitForSelector('[data-testid="report-top"]', { timeout: 15_000 });
  await shoot(page, "07-report-locked");

  await page.evaluate(() => {
    const w = window as unknown as { __SAOKIM__?: { run: { getState: () => { unlockLead: () => void } } } };
    w.__SAOKIM__?.run.getState().unlockLead();
  });
  await page.waitForTimeout(400);
  await page.locator('[data-testid="offers"]').scrollIntoViewIfNeeded();
  await shoot(page, "08-offers-unlocked");

  await page.locator('[data-testid="weaknesses"]').scrollIntoViewIfNeeded();
  await shoot(page, "09-weaknesses");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/?intro=0`, { waitUntil: "networkidle" });
  await shoot(page, "10-landing-desktop");

  await browser.close();
  console.log("Xong. Kiểm tra thư mục", out);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
