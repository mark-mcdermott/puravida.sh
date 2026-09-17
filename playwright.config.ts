import { defineConfig, devices } from '@playwright/test'
import { baseURL } from './tests/server-config'

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Not `webServer`: astro preview daemonizes, which Playwright reads as a crash.
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',
})
