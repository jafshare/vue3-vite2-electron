/***/
<template>
  <el-container class="w-full h-full">
    <el-header class="header"><slot name="header">Header</slot></el-header>
    <el-container>
      <el-aside class="aside" width="50px"
        ><slot name="aside">Aside</slot></el-aside
      >
      <el-main class="main"><slot name="main">Main</slot></el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.header {
  @apply border-b-1 border-gray-200;
  @apply h-10;
}
.aside {
  @apply border-r-1 border-gray-200;
  @apply h-full;
}
.main {
  @apply m-0 p-0;
}
</style>
