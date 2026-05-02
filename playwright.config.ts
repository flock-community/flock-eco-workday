import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Disable full parallelism to prevent test interference
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2, // Limit workers to prevent session conflicts
  reporter: process.env.CI
    ? [['html', { outputFolder: 'playwright-report', open: 'never' }], ['line']]
    : 'line',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'on',
    // Ensure test isolation
    storageState: undefined, // Don't persist storage state between tests
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-features=PasswordBreachDetection'],
        },
      },
    },
  ],
  // Run your local dev server before starting the tests.
  // Skip when running in Docker where frontend is a separate service.
  webServer: process.env.SKIP_WEB_SERVER
    ? undefined
    : {
        command: 'npm run start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
      },
});
