const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['allure-playwright', { outputFolder: 'allure-results', detail: true, suiteTitle: 'THE TREASURE Playwright QA' }]
  ],
  use: {
    baseURL: 'file://' + process.cwd() + '/',
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'on'
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'android-sized-chromium', use: { ...devices['Pixel 7'], defaultBrowserType: 'chromium' } }
  ],
  outputDir: 'test-results/artifacts'
});
