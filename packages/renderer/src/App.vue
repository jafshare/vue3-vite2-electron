<template>
  <Layout>
    <template #header>
      <el-space>
        <el-switch
          v-model="isProxy"
          size="mini"
          active-text="开启"
          inactive-text="关闭"
          :loading="loading"
          @change="handleProxyChange"
        />
      </el-space>
    </template>
    <template #main><Network /></template>
  </Layout>
</template>
<script setup lang="ts">
import { onUnmounted, provide, ref } from "vue";
import { ElMessage } from "element-plus";
// 需要手动导入样式
import "element-plus/es/components/message/style/css";
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import Network from "@/src/pages/Network/index.vue";
import Layout from "@/src/components/Layout/index.vue";
import { CMD } from "@common/ws";
import { SimpleWebSocket } from "./utils/websocket";
const loading = ref(false);
const isProxy = ref(true);
// 启动后启动websocket
const wsInstance = SimpleWebSocket.getInstance();
const handleProxyChange = async (value: boolean) => {
  loading.value = true;
  try {
    await wsInstance.send(
      value ? CMD.START_PROXY_SERVER : CMD.STOP_PROXY_SERVER
    );
    ElMessage.success({ message: `${value ? "打开" : "关闭"}代理成功` });
  } catch (error) {
    console.log(error);
    ElMessage.error({ message: `${value ? "打开" : "关闭"}代理失败` });
  }
  loading.value = false;
};
// 卸载后自动关闭
onUnmounted(() => {
  wsInstance.close();
});
// 提供ws服务
provide("wsInstance", wsInstance);
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  @apply h-full w-full;
}
</style>
