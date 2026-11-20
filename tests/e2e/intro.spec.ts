import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test("lần đầu mở: intro 10 giây, bỏ qua được, vào landing và không hiện lại", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("intro-screen")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("intro-step-0")).toHaveAttribute("data-lit", "false");
  await page.getByTestId("intro-skip").click();
  await expect(page.getByTestId("landing-form")).toBeVisible({ timeout: 10_000 });

  await page.reload();
  await expect(page.getByTestId("landing-form")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("intro-screen")).toHaveCount(0);
});

test("CTA hiện sau nhịp intro và đưa sang form nhập website", async ({ page }) => {
  await page.goto("/?intro=1");
  await expect(page.getByTestId("intro-screen")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("intro-cta")).toBeVisible({ timeout: 12_000 });
  await expect(page.getByTestId("intro-caption")).toContainText("bản đồ thương hiệu");
  await page.getByTestId("intro-cta").click();
  await expect(page.getByTestId("landing-form")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("website-input")).toBeVisible();
});

test("?intro=0 bỏ qua; ?intro=1 ép xem lại; nút Xem lại intro mở lại", async ({ page }) => {
  await page.goto("/?intro=0");
  await expect(page.getByTestId("landing-form")).toBeVisible();
  await expect(page.getByTestId("intro-screen")).toHaveCount(0);

  await page.getByTestId("replay-intro").click();
  await expect(page.getByTestId("intro-screen")).toBeVisible();
  await page.getByTestId("intro-skip").click();
  await expect(page.getByTestId("landing-form")).toBeVisible();

  await page.goto("/?intro=1");
  await expect(page.getByTestId("intro-screen")).toBeVisible({ timeout: 10_000 });
  await page.getByTestId("intro-skip").click();
});

test("intro 320×640 không tràn ngang, CTA nằm trong màn hình", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/?intro=1");
  await expect(page.getByTestId("intro-screen")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("intro-cta")).toBeVisible({ timeout: 12_000 });

  const metrics = await page.evaluate(() => {
    const cta = document.querySelector<HTMLElement>('[data-testid="intro-cta"]');
    const rect = cta?.getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      ctaBottom: rect ? rect.bottom : null,
      viewport: window.innerHeight,
    };
  });
  expect(metrics.overflow).toBeLessThanOrEqual(1);
  expect(metrics.ctaBottom).not.toBeNull();
  expect(metrics.ctaBottom!).toBeLessThanOrEqual(metrics.viewport + 1);
});

test("reduced-motion: vào khung cuối và CTA ngay", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?intro=1");
  await expect(page.getByTestId("intro-screen")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("intro-cta")).toBeVisible({ timeout: 3_000 });
  await expect(page.getByTestId("intro-step-4")).toHaveAttribute("data-lit", "true");
});

test("âm thanh nền bật mặc định, tắt/bật được và nhớ lựa chọn", async ({ page }) => {
  await page.goto("/?intro=0");
  await expect(page.getByTestId("landing-form")).toBeVisible();
  const toggle = page.getByRole("button", { name: "Tắt âm thanh" });
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");

  await toggle.click();
  await expect(page.getByRole("button", { name: "Bật âm thanh" })).toBeVisible();

  await page.reload();
  await expect(page.getByTestId("landing-form")).toBeVisible();
  await expect(page.getByRole("button", { name: "Bật âm thanh" })).toBeVisible();
});

test("tier low vẫn có rocket 2D trong intro", async ({ page }) => {
  await page.goto("/?intro=1&quality=low");
  await expect(page.getByTestId("intro-screen")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("intro-css-rocket")).toBeVisible();
  await expect(page.getByTestId("intro-cta")).toBeVisible({ timeout: 3_000 });
});
