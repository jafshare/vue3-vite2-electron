import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
// 引入windicss
import "virtual:windi.css";
import "@/src/assets/style/index.scss";
const pinia = createPinia();
// 直接使用node的语法
import "./samples/node-api";

createApp(App).use(pinia).mount("#app").$nextTick(window.removeLoading);
