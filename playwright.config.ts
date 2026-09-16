import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 3,
  use: {
    baseURL: 'http://127.0.0.1:8081',
    browserName: 'chromium',
    viewport: { width: 390, height: 844 },
    launchOptions: process.env.PTOWN_TEST_BROWSER ? {
      executablePath: process.env.PTOWN_TEST_BROWSER,
      args: ['--no-sandbox', '--no-zygote', '--disable-gpu'],
    } : {},
  },
  webServer: {
    command: 'node scripts/serve-preview.cjs',
    url: 'http://127.0.0.1:8081',
    reuseExistingServer: false,
  },
});
