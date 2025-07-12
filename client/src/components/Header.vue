<script setup lang="ts">
import { Package } from "lucide-vue-next";
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-screen-xl px-4">
      <div class="flex items-center h-16">
        <h1
          class="text-xl font-semibold text-gray-900 flex items-center gap-2 cursor-pointer"
          @click="router.push('/products')"
        >
          <Package class="w-6 h-6" />
          Irys Product Manager
        </h1>
      </div>
    </div>
  </header>
</template>
