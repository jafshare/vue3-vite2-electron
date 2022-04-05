import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import resolve from "vite-plugin-resolve";
import electron from "vite-plugin-electron-renderer";
import WindiCSS from "vite-plugin-windicss";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
// import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import pkg from "../../package.json";
// 这里最好用别名设置路径，vite会自动转换，否则相对或者绝对都会导致报错
const GLOBAL_SCSS_PATH = "@/src/assets/style/variables.scss".replace(
  /\\/g,
  "/"
);
const COMMON_PATH = path.join(__dirname, "../common/");
const RENDERER_PATH = __dirname;
// https://vitejs.dev/config/
export default defineConfig({
  mode: process.env.NODE_ENV,
  root: __dirname,
  plugins: [
    vue(),
    electron(),
    resolve(
      /**
       * Here you can specify other modules
       * 🚧 You have to make sure that your module is in `dependencies` and not in the` devDependencies`,
       *    which will ensure that the electron-builder can package it correctly
       */
      {
        // If you use electron-store, this will work
        "electron-store":
          'const Store = require("electron-store"); export default Store;',
      }
    ),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    WindiCSS(),
  ],
  base: "./",
  resolve: {
    alias: {
      "@": RENDERER_PATH,
      "@common": COMMON_PATH,
    },
  },
  build: {
    sourcemap: true,
    outDir: "../../dist/renderer",
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 注入全局变量
        additionalData: `@import "${GLOBAL_SCSS_PATH}";`, //引用公共样式，使用vite搭建项目只安装sass即可，不需要安装node-sass,sass-loader
      },
    },
  },
  server: {
    host: pkg.env.VITE_DEV_SERVER_HOST,
    port: pkg.env.VITE_DEV_SERVER_PORT,
  },
});
