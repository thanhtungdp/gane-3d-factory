import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const cached = "/home/tungphan/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
const executablePath = process.env.CHROME_PATH ?? (existsSync(cached) ? cached : undefined);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:5173",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    launchOptions: {
      executablePath,
      args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader"],
    },
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
