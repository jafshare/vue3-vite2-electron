/// <reference types="vitest" />
import { rmSync } from "fs";
import path from "path";
import { configDefaults } from "vitest/config";
import { type Plugin, type UserConfig, defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import electron from "vite-plugin-electron";
import WindiCSS from "vite-plugin-windicss";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import { VITE_DEV_SERVER_HOST, VITE_DEV_SERVER_PORT } from "./common/env/vite";

rmSync("dist", { recursive: true, force: true }); // v14.14.0
const GLOBAL_SCSS_PATH = "src/assets/style/variables.scss";
const COMMON_PATH = path.join(__dirname, "common");
const RENDERER_PATH = path.join(__dirname, "src");
const MAIN_PATH = path.join(__dirname, "electron/main");
const resolve = {
  alias: {
    "@": RENDERER_PATH,
    "@common": COMMON_PATH,
    "@@": MAIN_PATH,
  },
};
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: [
        "vue",
        {
          "naive-ui": [
            "useDialog",
            "useMessage",
            "useNotification",
            "useLoadingBar",
          ],
        },
      ],
    }),
    Components({
      resolvers: [NaiveUiResolver()],
    }),
    electron({
      main: {
        entry: "electron/main/index.ts",
        vite: withDebug({
          resolve,
          build: {
            outDir: "dist/electron/main",
          },
        }),
      },
      preload: {
        input: {
          // You can configure multiple preload here
          index: path.join(__dirname, "electron/preload/index.ts"),
        },
        vite: {
          build: {
            // For Debug
            sourcemap: "inline",
            outDir: "dist/electron/preload",
          },
        },
      },
      // Enables use of Node.js API in the Renderer-process
      renderer: {},
    }),
    renderBuiltUrl(),
    WindiCSS(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // 注入全局变量
        additionalData: `@import "${GLOBAL_SCSS_PATH}";`, //引用公共样式，使用vite搭建项目只安装sass即可，不需要安装node-sass,sass-loader
      },
    },
  },
  resolve,
  server: {
    host: VITE_DEV_SERVER_HOST,
    port: VITE_DEV_SERVER_PORT,
  },
  test: {
    deps: {
      inline: ["vite-plugin-electron"],
    },
    // 去除playwright的测试用例
    exclude: [...configDefaults.exclude, "./test/playwright/*"],
  },
});

function withDebug(config: UserConfig): UserConfig {
  if (process.env.VSCODE_DEBUG) {
    if (!config.build) config.build = {};
    config.build.sourcemap = true;
    config.plugins = (config.plugins || []).concat({
      name: "electron-vite-debug",
      configResolved(config) {
        const index = config.plugins.findIndex(
          (p) => p.name === "electron-main-watcher"
        );
        // At present, Vite can only modify plugins in configResolved hook.
        (config.plugins as Plugin[]).splice(index, 1);
      },
    });
  }
  return config;
}

// Only worked Vite@3.x #212
function renderBuiltUrl(): Plugin {
  // https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts#L84-L124
  const KNOWN_ASSET_TYPES = [
    // images
    "png",
    "jpe?g",
    "jfif",
    "pjpeg",
    "pjp",
    "gif",
    "svg",
    "ico",
    "webp",
    "avif",

    // media
    "mp4",
    "webm",
    "ogg",
    "mp3",
    "wav",
    "flac",
    "aac",

    // fonts
    "woff2?",
    "eot",
    "ttf",
    "otf",

    // other
    "webmanifest",
    "pdf",
    "txt",
  ];

  return {
    name: "render-built-url",
    config(config) {
      config.experimental = {
        renderBuiltUrl(filename, type) {
          if (
            KNOWN_ASSET_TYPES.includes(path.extname(filename).slice(1)) &&
            type.hostType === "js"
          ) {
            // Avoid Vite relative-path assets handling
            // https://github.com/vitejs/vite/blob/89dd31cfe228caee358f4032b31fdf943599c842/packages/vite/src/node/build.ts#L838-L875
            return { runtime: JSON.stringify(filename) };
          }
        },
      };
    },
  };
}
