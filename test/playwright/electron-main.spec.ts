// example.spec.ts
import path from "path";
import {
  test,
  expect,
  ElectronApplication,
  _electron as electron,
} from "@playwright/test";
import { VITE_DEV_SERVER_HOST, VITE_DEV_SERVER_PORT } from "@common/env/vite";
let electronApp: ElectronApplication;
// 增加test的运行环境
const env = {
  VITE_DEV_SERVER_HOST,
  VITE_DEV_SERVER_PORT,
};
// 所有案例执行前启动electron
test.beforeAll(async () => {
  electronApp = await electron.launch({
    args: [path.resolve(__dirname, "../dist/main/index.cjs")],
    //@ts-ignore
    env,
  });
});
// 所有测试按钮执行后自动关闭
test.afterAll(async () => {
  await electronApp.close();
});

test("electron test case", async () => {
  const window = await electronApp.firstWindow();
  // Expect a title "to contain" a substring.
  await expect(window).toHaveTitle(/Vite App/, { timeout: 3000 });

  // Expect an attribute "Hello Vue 3 + TypeScript + Vite" to be visible on the page.
  await expect(
    window.locator("text=Hello Vue 3 + TypeScript + Vite").first()
  ).toBeVisible();
});
