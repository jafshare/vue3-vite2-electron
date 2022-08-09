import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: "on-first-retry",
  },
  // 指定测试用例的目录
  testDir: "./test/playwright/",
};
export default config;
