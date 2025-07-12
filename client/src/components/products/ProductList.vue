<script setup lang="ts">
import { computed, ref } from "vue";
import { Loader2, Package } from "lucide-vue-next";
import { useInfiniteScroll } from "@vueuse/core";
//
import ProductCard from "./ProductCard.vue";
import useProduct from "../../composables/useProduct";
import { useProductStore } from "../../stores/productStore";
import useProductRouting from "../../composables/useProductRouting";

const containerProps = ref(null);

const productStore = useProductStore();
const { handleEdit, handleView } = useProductRouting();
const { toggleProductStatus, handleDeleteProduct } = useProduct();

const products = computed(() => productStore.products);
const isLoadingNextPage = computed(
  () => productStore.loading && productStore.products.length > 0
);

useInfiniteScroll(
  containerProps,
  async () => {
    try {
      await productStore.fetchNextPage();
    } catch (error) {
      console.error("Error loading next page:", error);
    }
  },
  {
    distance: 100,
  }
);
</script>

<template>
  <div
    ref="containerProps"
    class="h-[calc(100vh-4.3rem)] flex flex-col overflow-y-auto"
  >
    <!-- Loading State -->
    <div
      v-if="productStore.loading && productStore.products.length === 0"
      class="flex justify-center items-center h-64"
    >
      <Loader2 class="w-5 h-5 animate-spin text-blue-600" />
      <span class="ml-2 text-gray-500">Loading products...</span>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="productStore.products.length === 0"
      class="flex flex-1 items-center justify-center"
    >
      <div class="text-center py-16 px-4 text-gray-500">
        <Package class="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 class="text-lg font-semibold mb-2">No products found</h3>
        <p>Try adjusting your filters or add some products to get started.</p>
      </div>
    </div>

    <div class="p-5">
      <div v-for="product in products" :key="product._id">
        <ProductCard
          :product="product"
          @toggleStatus="toggleProductStatus(product._id, !product.isEnabled)"
          @edit="handleEdit(product._id)"
          @view="handleView(product._id)"
          @delete="handleDeleteProduct(product._id, product.name)"
        />
      </div>

      <!-- Loading indicator for next page -->
      <div
        v-if="isLoadingNextPage"
        class="flex justify-center items-center py-4"
      >
        <Loader2 class="w-4 h-4 animate-spin text-blue-600" />
        <span class="ml-2 text-gray-500 text-sm">Loading more products...</span>
      </div>
    </div>
  </div>
</template>
