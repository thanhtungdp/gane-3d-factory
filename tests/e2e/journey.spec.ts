import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

async function noHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth - window.innerWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

test("onboarding demo → xác nhận → bản đồ → trạm, không tràn ngang", async ({ page }) => {
  await page.goto("/?demo=1&intro=0");
  await expect(page.getByTestId("landing-form")).toBeVisible();
  await noHorizontalOverflow(page);

  await page.getByTestId("demo-button").click();
  await expect(page.getByTestId("brand-confirm")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("brand-name-input")).toHaveValue("Cà phê Nắng Mai");
  await noHorizontalOverflow(page);

  await page.getByTestId("begin-button").click();
  await expect(page.getByTestId("launch-screen")).toBeVisible({ timeout: 10_000 });
  await page.getByTestId("skip-launch").click();

  await expect(page.getByTestId("health-card")).toBeVisible();
  await expect(page.getByTestId("next-planet-button")).toBeVisible();
  await noHorizontalOverflow(page);

  await page.getByTestId("next-planet-button").click();
  await expect(page.getByTestId("flight-screen")).toBeVisible({ timeout: 10_000 });
  await page.getByTestId("flight-skip").click();
  await expect(page.getByTestId("planet-intro")).toBeVisible();
  await page.getByTestId("planet-intro").getByTestId("continue").click();
  await expect(page.getByTestId("planet-game")).toBeVisible({ timeout: 15_000 });
});

test("tap target của điều khiển chính đạt 44px", async ({ page }) => {
  await page.goto("/?demo=1&intro=0");
  await page.getByTestId("demo-button").click();
  await expect(page.getByTestId("brand-confirm")).toBeVisible({ timeout: 20_000 });

  const selectors = [
    '[data-testid="start-button"]',
    '[data-testid="begin-button"]',
    ".icon-btn",
    ".btn",
    'button[data-testid="no-website-link"]',
  ];
  for (const sel of selectors) {
    const nodes = page.locator(sel);
    const count = await nodes.count();
    for (let i = 0; i < count; i += 1) {
      const node = nodes.nth(i);
      if (!(await node.isVisible())) continue;
      const box = await node.boundingBox();
      if (!box) continue;
      expect(box.height, `${sel} #${i} height`).toBeGreaterThanOrEqual(43.5);
    }
  }
});

test("báo cáo demo + lead gate mở khoá", async ({ page }) => {
  await page.goto("/?demo=1&intro=0");
  await page.getByTestId("demo-button").click();
  await expect(page.getByTestId("brand-confirm")).toBeVisible({ timeout: 20_000 });
  await page.getByTestId("begin-button").click();
  await page.getByTestId("skip-launch").click();
  await expect(page.getByTestId("health-card")).toBeVisible();

  await page.evaluate(async () => {
    const w = window as unknown as { __SAOKIM__?: { seedAll: () => Promise<void> } };
    await w.__SAOKIM__?.seedAll();
  });

  await expect(page.getByTestId("report-top")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("weaknesses")).toBeVisible();
  await expect(page.getByTestId("insights")).toBeVisible();
  await noHorizontalOverflow(page);

  await page.getByTestId("unlock-report-button").click();
  await expect(page.getByTestId("lead-sheet")).toBeVisible();
  await page.getByTestId("lead-name").fill("Nguyễn Minh Anh");
  await page.getByTestId("lead-phone").fill("0901234567");
  await page.getByTestId("lead-representative").locator("input").check();
  await page.getByTestId("lead-consent").locator("input").check();
  await page.getByTestId("lead-submit").click();

  await expect(page.getByTestId("lead-sheet")).toBeHidden({ timeout: 20_000 });
  await expect(page.getByTestId("pdf-button")).toBeVisible({ timeout: 15_000 });
});

test("landing desktop không tràn ngang", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?intro=0");
  await expect(page.getByTestId("landing-form")).toBeVisible();
  await noHorizontalOverflow(page);
});
