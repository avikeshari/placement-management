import { defineConfig, devices } from "@playwright/test";

const isDeployedRun = Boolean(process.env.E2E_BASE_URL);

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/globalSetup.js",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }]
  ],

  use: {
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    navigationTimeout: 15000,
    actionTimeout: 10000,
    expect: {
      timeout: 10000
    }
  },

  webServer: isDeployedRun
    ? undefined
    : [
        {
          command: "npm start",
          cwd: "../backend",
          url: "http://127.0.0.1:5000/api/health",
          timeout: 120000,
          reuseExistingServer: true
        },
        {
          command: "npm run dev -- --host 127.0.0.1",
          cwd: ".",
          url: "http://127.0.0.1:5173",
          timeout: 120000,
          reuseExistingServer: true
        }
      ],

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"]
      }
    }
  ]
});
