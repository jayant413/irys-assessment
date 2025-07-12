<script setup lang="ts">
import { useProductStore } from "../stores/productStore";
import { useMessage } from "naive-ui";
import { watch } from "vue";

const productStore = useProductStore();
const message = useMessage();

watch(
  () => productStore.error,
  (newError: string | null) => {
    if (newError) {
      message.error(newError);
      productStore.clearError();
    }
  }
);
</script>

<template></template>
