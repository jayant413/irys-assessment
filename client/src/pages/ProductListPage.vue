<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Plus, Upload, BarChart3 } from "lucide-vue-next";
//
import { useProductStore } from "../stores/productStore";
import ProductList from "../components/products/ProductList.vue";
import useProductRouting from "../composables/useProductRouting";
import ProductFilters from "../components/products/ProductFilters.vue";
import BulkUploadModal from "../components/products/BulkUploadModal.vue";
import Button from "../components/ui/Button.vue";

const showBulkUploadModal = ref(false);

const productStore = useProductStore();
const { handleCreate } = useProductRouting();

onMounted(async () => {
  if (productStore.products.length === 0) {
    await Promise.all([
      productStore.fetchProducts(),
      productStore.fetchCategories(),
    ]);
  }
});
</script>

<template>
  <div class="bg-gray-100">
    <div class="flex">
      <!-- Sidebar -->
      <aside
        class="w-80 bg-white border-r border-gray-200 sticky top-16 h-[calc(100vh-4.3rem)] overflow-y-auto"
      >
        <div class="flex gap-3 m-[0.5em] mt-[1em]">
          <Button @click="handleCreate" type="info">
            <Plus class="w-4 h-4" />
            Add Product
          </Button>

          <Button @click="showBulkUploadModal = true">
            <Upload class="w-4 h-4" />
            Bulk Upload
          </Button>
        </div>
        <div class="p-[0.5em] py-0">
          <ProductFilters />
          <div class="px-2">
            <h3
              class="text-sm font-semibold text-gray-700 flex justify-start items-center gap-2 mb-4"
            >
              <BarChart3 class="w-4 h-4" />
              Product Statistics
            </h3>
            <div
              class="grid grid-cols-3 gap-2 text-sm text-gray-500 text-center"
            >
              <div>
                <div class="mb-1">Total</div>
                <div class="font-mono font-semibold text-lg">
                  {{
                    productStore.filteredProductCount.toLocaleString("en-US", {
                      minimumIntegerDigits: 3,
                      useGrouping: false,
                    })
                  }}
                </div>
              </div>
              <div>
                <div class="mb-1">Enabled</div>
                <div class="font-mono font-semibold text-lg text-emerald-600">
                  {{
                    productStore.pagination.totalEnabledCount.toLocaleString(
                      "en-US",
                      { minimumIntegerDigits: 3, useGrouping: false }
                    )
                  }}
                </div>
              </div>
              <div>
                <div class="mb-1">Disabled</div>
                <div class="font-mono font-semibold text-lg text-red-600">
                  {{
                    productStore.pagination.totalDisabledCount.toLocaleString(
                      "en-US",
                      { minimumIntegerDigits: 3, useGrouping: false }
                    )
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 h-full">
        <ProductList />
      </main>
    </div>

    <!-- Bulk Upload Modal -->
    <BulkUploadModal
      v-if="showBulkUploadModal"
      @close="showBulkUploadModal = false"
    />
  </div>
</template>
