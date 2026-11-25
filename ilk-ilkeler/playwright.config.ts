import { defineConfig, devices } from '@playwright/test';

// Firefox bilinçli olarak dışarıda (kalıcı kullanıcı kararı). Chromium + WebKit, dar ekrandan masaüstüne.
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:4323', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run build && npx astro preview --port 4323 --host 127.0.0.1 --ignore-lock',
    url: 'http://127.0.0.1:4323/first/',
    reuseExistingServer: false,
    timeout: 240_000,
  },
  projects: [
    { name: 'chromium-320', use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 568 }, hasTouch: true, isMobile: true } },
    { name: 'chromium-375', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true } },
    { name: 'webkit-390', use: { ...devices['iPhone 14'] } },
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'], viewport: { width: 1366, height: 900 } } },
  ],
});
