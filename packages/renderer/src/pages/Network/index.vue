/***/
<template>
  <div class="wrapper">
    <div class="wrapper_left">
      <el-table
        :data="dataSource"
        :row-class-name="tableRowClassName"
        max-height="200"
        border
      >
        <el-table-column
          label="Result"
          prop="result"
          width="80"
        ></el-table-column>
        <el-table-column
          label="Method"
          prop="method"
          width="80"
        ></el-table-column>
        <el-table-column
          label="Protocol"
          prop="protocol"
          width="120"
        ></el-table-column>
        <el-table-column label="Host" prop="host"></el-table-column>
        <el-table-column label="URL" prop="url"></el-table-column>
        <el-table-column label="Time" prop="time" width="80"></el-table-column>
      </el-table>
    </div>
    <div class="wrapper_right">
      <el-tabs type="border-card">
        <el-tab-pane label="Overview">Overview</el-tab-pane>
        <el-tab-pane label="Inspector">Inspector</el-tab-pane>
        <el-tab-pane label="Composer">Composer</el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onUnmounted, onMounted } from "vue";
import { SimpleWebSocket } from "@/src/utils/websocket";
import { CMD } from "@common/ws";
const dataSource = ref<RequestData[]>([]);
const wsInstance = inject<SimpleWebSocket>("wsInstance");
// 根据不同的数据处理不同的情况
const tableRowClassName = () => {};
const handleUpdate = (data: RequestData) => {
  console.log("11111data:", data);
  const oldData = dataSource.value;
  dataSource.value = [...oldData, data];
};
onMounted(() => {
  wsInstance?.on(CMD.NEW_RECORD, handleUpdate);
});
onUnmounted(() => {
  wsInstance?.off(CMD.NEW_RECORD, handleUpdate);
});
</script>

<style lang="scss" scoped>
.wrapper {
  @apply flex;
  .wrapper_left {
    @apply flex-1 flex-nowrap;
  }
  .wrapper_right {
    @apply w-120;
  }
}
</style>
