import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 12000 },

  webServer: [
    {  
        command: '',
        url: 'http://localhost:3000',       // polling frontend
        reuseExistingServer: true,
        timeout: 150000,
    }
  ],

  use: {
    headless: true,
    baseURL: 'http://localhost:3000', 
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'afterglow-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'afterglow-mobile', use: { ...devices['iPhone 16'] } },
  ],
});

