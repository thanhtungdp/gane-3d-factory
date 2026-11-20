import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

type Planet = "S" | "A" | "O" | "K" | "IM";

async function demoToConfirm(page: Page) {
  await page.goto("/?demo=1&quality=low&intro=0");
  await page.getByTestId("demo-button").click();
  await expect(page.getByTestId("brand-confirm")).toBeVisible({ timeout: 20_000 });
}

async function openStation(page: Page, planet: Planet) {
  await page.evaluate(() => {
    const w = window as unknown as { __SAOKIM__?: { run: { setState: (v: object) => void } } };
    w.__SAOKIM__?.run.setState({ screen: "map" });
  });
  await page.waitForTimeout(220);
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
  await expect(page.getByTestId("planet-intro")).toBeVisible({ timeout: 10_000 });
  await page.getByTestId("planet-intro").getByTestId("continue").click();
  await expect(page.getByTestId("planet-game")).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(420);
}

async function answerFirst(page: Page) {
  await page.locator('[data-testid^="question-option-"]').first().click();
  await expect(page.getByTestId("question-continue")).toBeVisible({ timeout: 5_000 });
  await page.getByTestId("question-continue").click();
  await expect(page.getByTestId("question-modal")).toBeHidden({ timeout: 5_000 });
  await page.waitForTimeout(260);
}

async function noHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function dockButton(page: Page) {
  return page.locator('[data-testid="game-dock"] [data-testid="continue"]');
}

test("S: sương che thật, tap mở, dock luôn hiện, popup không phải scroll ở 320×640", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await demoToConfirm(page);
  await openStation(page, "S");

  const cta = await dockButton(page);
  await expect(cta).toBeVisible();
  await expect(cta).toBeDisabled();
  await expect(cta).toContainText("vùng sương");

  const hiddenBefore = await page.evaluate(() => {
    const cell = document.querySelector('[data-testid="fog-zone-0"]');
    const content = cell?.querySelector(".scan-cell__content");
    const style = content ? getComputedStyle(content) : null;
    return {
      opened: cell?.getAttribute("data-opened"),
      filter: style?.filter ?? "",
      opacity: style ? Number(style.opacity) : 1,
    };
  });
  expect(hiddenBefore.opened).toBe("false");
  expect(hiddenBefore.opacity).toBeLessThan(0.5);
  expect(hiddenBefore.filter).toContain("blur");

  await page.getByTestId("fog-zone-0").click();
  await expect(page.getByTestId("question-modal")).toBeVisible({ timeout: 5_000 });
  await page.waitForTimeout(450);

  const sheet = await page.evaluate(() => {
    const modal = document.querySelector('[data-testid="question-modal"]')!;
    const body = modal.querySelector<HTMLElement>(".sheet__body")!;
    const footer = modal.querySelector<HTMLElement>(".sheet__footer")!;
    const footerRect = footer.getBoundingClientRect();
    return {
      bodyClient: body.clientHeight,
      bodyScroll: body.scrollHeight,
      footerVisible: footerRect.top >= 0 && footerRect.bottom <= window.innerHeight + 1,
    };
  });
  expect(sheet.bodyScroll).toBeLessThanOrEqual(sheet.bodyClient + 1);
  expect(sheet.footerVisible).toBe(true);

  await answerFirst(page);
  await expect(cta).toBeVisible();
  await expect(cta).toContainText("vùng sương");

  const game = await page.evaluate(() => {
    const body = document.querySelector<HTMLElement>(".kim-game__body")!;
    return {
      bodyClient: body.clientHeight,
      bodyScroll: body.scrollHeight,
      nestedScrollers: document.querySelectorAll(".planet-panel .overflow-y-auto").length,
    };
  });
  expect(game.bodyScroll).toBeLessThanOrEqual(game.bodyClient + 1);
  expect(game.nestedScrollers).toBe(0);
  await noHorizontalOverflow(page);
});

test("A: kéo bản đồ từ mọi điểm, chờ 850ms rồi mới mở câu hỏi", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await demoToConfirm(page);
  await openStation(page, "A");

  await page.getByTestId("star-0").click();
  await page.waitForTimeout(250);
  await answerFirst(page);
  await page.getByTestId("star-1").click();
  await page.waitForTimeout(200);
  await page.getByTestId("star-2").click();
  await page.waitForTimeout(250);
  await answerFirst(page);

  await page.getByTestId("continue").click();
  await expect(page.getByTestId("align-map")).toBeVisible();

  const map = page.getByTestId("align-map");
  const box = await map.boundingBox();
  expect(box).toBeTruthy();
  await map.click({ position: { x: 24, y: box!.height - 20 } });

  const token = page.locator(".align-map__token");
  await expect(token).toBeVisible();
  await expect(page.getByTestId("question-modal")).toBeHidden();
  await expect(page.getByTestId("question-modal")).toBeVisible({ timeout: 2_500 });
  await noHorizontalOverflow(page);
});

test("viewport fold/duo: CTA trạm nào cũng nằm trong màn hình, không tràn ngang", async ({ page }) => {
  test.setTimeout(150_000);
  const viewports = [
    { width: 320, height: 640 },
    { width: 344, height: 882 },
    { width: 725, height: 870 },
    { width: 540, height: 720 },
    { width: 884, height: 1104 },
    { width: 1024, height: 768 },
    { width: 1024, height: 600 },
    { width: 1440, height: 900 },
  ];
  const planets: Planet[] = ["S", "A", "O", "K", "IM"];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await demoToConfirm(page);
    for (const planet of planets) {
      await openStation(page, planet);
      if (await page.getByTestId("question-modal").isVisible()) {
        await page.getByTestId("question-hide").click();
      }
      const cta = await dockButton(page);
      await expect(cta).toBeVisible();
      const box = await cta.boundingBox();
      expect(box, `${planet} ${viewport.width}×${viewport.height} thiếu CTA`).toBeTruthy();
      expect(box!.y, `${planet} ${viewport.width}×${viewport.height} CTA lệch trên`).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height, `${planet} ${viewport.width}×${viewport.height} CTA bị cắt`).toBeLessThanOrEqual(
        viewport.height + 1,
      );
      await noHorizontalOverflow(page);
      await page.evaluate(() => {
        const w = window as unknown as { __SAOKIM__?: { run: { setState: (v: object) => void } } };
        w.__SAOKIM__?.run.setState({ screen: "map" });
      });
    }
  }
});
