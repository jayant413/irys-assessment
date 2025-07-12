<script setup lang="ts">
import {
  Package,
  Tag,
  Package2,
  Hash,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Edit,
  Trash2,
  IndianRupee,
} from "lucide-vue-next";
//
import { type Product } from "../../stores/productStore";
import Button from "../ui/Button.vue";

defineProps<{
  product: Product;
}>();

defineEmits<{
  toggleStatus: [product: Product];
  edit: [product: Product];
  view: [product: Product];
  delete: [product: Product];
}>();

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.style.display = "none";
};
</script>

<template>
  <div
    class="flex items-center w-full gap-4 p-4 bg-white border border-gray-200 rounded-md mb-3 transition-all duration-200 ease-in-out cursor-pointer hover:-translate-y-0.5 hover:shadow-lg"
    :class="{ 'opacity-60 bg-gray-50': !product.isEnabled }"
    @click="$emit('view', product)"
  >
    <!-- Product Image -->
    <div
      class="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0"
    >
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.name"
        @error="handleImageError"
        class="w-full h-full object-cover"
      />
      <Package v-else class="w-8 h-8 text-gray-400" />
    </div>

    <!-- Product Info -->
    <div class="flex-1 min-w-0">
      <div
        class="font-semibold text-gray-900 mb-1 overflow-hidden text-ellipsis whitespace-nowrap"
      >
        {{ product.name }}
      </div>
      <div
        class="text-sm text-gray-500 mb-2 overflow-hidden text-ellipsis whitespace-nowrap"
      >
        {{ product.description }}
      </div>
      <div class="flex gap-4 text-sm md:flex-row flex-col md:gap-4">
        <span class="font-semibold text-emerald-600 flex items-center gap-1">
          <IndianRupee class="w-3 h-3" />
          {{ product.price.toFixed(2) }}
        </span>
        <span class="text-gray-500 flex items-center gap-1">
          <Tag class="w-3 h-3" />
          {{ product.category }}
        </span>
        <span class="text-purple-600 flex items-center gap-1">
          <Package2 class="w-3 h-3" />
          Stock: {{ product.stock }}
        </span>
      </div>
      <div v-if="product.tags.length" class="flex flex-wrap gap-1 mt-2">
        <span
          v-for="tag in product.tags"
          :key="tag"
          class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
        >
          <Hash class="w-2.5 h-2.5" />
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Status Badge -->
    <div class="flex-shrink-0">
      <span
        class="px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1"
        :class="
          product.isEnabled
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        "
      >
        <CheckCircle v-if="product.isEnabled" class="w-3 h-3" />
        <XCircle v-else class="w-3 h-3" />
        {{ product.isEnabled ? "Enabled" : "Disabled" }}
      </span>
    </div>

    <!-- Product Actions -->
    <div class="flex gap-2 flex-shrink-0" @click.stop>
      <Button
        @click="$emit('toggleStatus', product)"
        type="primary"
        :secondary="product.isEnabled"
        :label="product.isEnabled ? 'Disable product' : 'Enable product'"
      >
        <Lock v-if="product.isEnabled" class="w-4 h-4" />
        <Unlock v-else class="w-4 h-4" />
      </Button>

      <Button
        @click="$emit('edit', product)"
        type="info"
        :label="'Edit product'"
      >
        <Edit class="w-4 h-4" />
      </Button>

      <Button
        @click="$emit('delete', product)"
        type="error"
        :label="'Delete product'"
      >
        <Trash2 class="w-4 h-4" />
      </Button>
    </div>
  </div>
</template>
