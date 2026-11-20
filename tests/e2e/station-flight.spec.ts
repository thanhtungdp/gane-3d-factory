import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

async function reachMap(page: import("@playwright/test").Page) {
  await page.goto("/?demo=1&intro=0");
  await page.getByTestId("demo-button").click();
  await expect(page.getByTestId("brand-confirm")).toBeVisible({ timeout: 20_000 });
  await page.getByTestId("begin-button").click();
  await expect(page.getByTestId("launch-screen")).toBeVisible();
  await page.getByTestId("skip-launch").click();
  await expect(page.getByTestId("health-card")).toBeVisible();
}

async function finishS(page: import("@playwright/test").Page) {
  await page.getByTestId("planet-intro").getByTestId("continue").click();
  await expect(page.getByTestId("planet-game")).toBeVisible({ timeout: 15_000 });
  for (let i = 0; i < 4; i += 1) {
    await page.getByTestId(`fog-zone-${i}`).click();
    const modal = page.getByTestId("question-modal");
    await expect(modal).toBeVisible({ timeout: 10_000 });
    await page.locator('[data-testid^="question-option-"]').first().click();
    await page.getByTestId("question-continue").click();
    await expect(modal).toBeHidden({ timeout: 5_000 });
  }
  await page.locator('[data-testid="planet-game"] [data-testid="continue"]').first().click();
  await expect(page.getByTestId("badge")).toBeVisible({ timeout: 10_000 });
}

test("hoàn thành S rồi bay thẳng sang A, không chen bản đồ", async ({ page }) => {
  await reachMap(page);
  await page.getByTestId("next-planet-button").click();
  await expect(page.getByTestId("flight-screen")).toBeVisible();
  await page.getByTestId("flight-skip").click();
  await expect(page.getByTestId("planet-intro")).toBeVisible();
  await finishS(page);

  await page.getByTestId("badge").getByTestId("continue").click();
  await expect(page.getByTestId("flight-screen")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("flight-route")).toContainText("Đài Thiên Văn");
  await page.getByTestId("flight-skip").click();
  await expect(page.getByTestId("planet-intro")).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("header").first()).toContainText("ALIGN STRATEGY");
});

test("desktop: orbit stage, flight, question ẩn/mở, console thu gọn", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await reachMap(page);
  await expect(page.getByTestId("map-orbit")).toBeVisible();
  await page.getByTestId("orbit-node-S").click();
  await expect(page.getByTestId("flight-screen")).toBeVisible();
  await page.getByTestId("flight-skip").click();
  await expect(page.getByTestId("planet-intro")).toBeVisible();
  await page.getByTestId("planet-intro").getByTestId("continue").click();
  await expect(page.getByTestId("planet-game")).toBeVisible({ timeout: 15_000 });

  await page.getByTestId("fog-zone-0").click();
  await expect(page.getByTestId("question-modal")).toBeVisible();
  await expect(page.locator('[data-testid="question-modal"]')).toHaveCount(1);
  await page.getByTestId("question-hide").click();
  await expect(page.getByTestId("question-pill")).toBeVisible();
  await page.getByTestId("question-pill").click();
  await expect(page.getByTestId("question-modal")).toBeVisible();
  await page.locator('[data-testid^="question-option-"]').first().click();
  await expect(page.getByTestId("question-continue")).toBeVisible();
  await page.getByTestId("question-continue").click();

  await page.getByTestId("planet-console-collapse").click();
  await expect(page.getByTestId("planet-console-reopen")).toBeVisible();
  await page.getByTestId("planet-console-reopen").click();
  await expect(page.getByTestId("planet-console-collapse")).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
