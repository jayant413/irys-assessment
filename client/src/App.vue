<script setup lang="ts">
import { RouterView } from "vue-router";
//
import Header from "./components/Header.vue";
import ErrorMessage from "./components/ErrorMessage.vue";
</script>

<template>
  <div id="app">
    <Header />
    <n-config-provider>
      <n-message-provider>
        <n-dialog-provider>
          <ErrorMessage />
          <RouterView />
        </n-dialog-provider>
      </n-message-provider>
    </n-config-provider>
  </div>
</template>
