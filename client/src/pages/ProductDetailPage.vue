<script setup lang="ts">
import { onMounted } from "vue";
import {
  ArrowLeft,
  Edit,
  Pause,
  Play,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Package,
  Calendar,
  Hash,
  IndianRupee,
} from "lucide-vue-next";
//
import useFormat from "../composables/useFormat";
import useProduct from "../composables/useProduct";
import useProductRouting from "../composables/useProductRouting";
import Button from "../components/ui/Button.vue";

const props = defineProps<{
  id: string;
}>();
const productId = props.id;

const { formatDate, formatPrice } = useFormat();
const { goBack, handleEdit } = useProductRouting();
const {
  handleDeleteProduct,
  toggleProductStatus,
  loading,
  loadProduct,
  currentProduct,
} = useProduct();

onMounted(() => {
  loadProduct(productId);
});
</script>

<template>
  <div class="bg-gray-50">
    <!-- Page Navigation & Actions -->
    <div class="">
      <div class="max-w-screen-xl mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <Button @click="goBack" type="tertiary">
              <ArrowLeft class="w-4 h-4 mr-2" />
              Back
            </Button>
            <h2 class="text-lg font-semibold text-gray-900 ml-4">
              Product Details
            </h2>
          </div>

          <div v-if="currentProduct" class="flex gap-3">
            <Button @click="handleEdit(productId)" type="info">
              <Edit class="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              @click="toggleProductStatus(productId, !currentProduct.isEnabled)"
              :type="currentProduct.isEnabled ? 'warning' : 'primary'"
            >
              <Pause v-if="currentProduct.isEnabled" class="w-4 h-4" />
              <Play v-else class="w-4 h-4" />
              {{ currentProduct.isEnabled ? "Disable" : "Enable" }}
            </Button>
            <Button
              @click="handleDeleteProduct(productId, currentProduct?.name)"
              type="error"
            >
              <Trash2 class="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <Loader2 class="w-5 h-5 animate-spin text-blue-600" />
      <span class="ml-2 text-gray-500">Loading product...</span>
    </div>

    <!-- Main Content -->
    <main v-else-if="currentProduct" class="max-w-screen-xl mx-auto p-4">
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
        <!-- Product Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div
                class="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2"
              >
                {{ currentProduct.name }}
                <span
                  :class="
                    currentProduct.isEnabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  "
                  class="px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1"
                >
                  <CheckCircle
                    v-if="currentProduct.isEnabled"
                    class="w-3 h-3"
                  />
                  <XCircle v-else class="w-3 h-3" />
                  {{ currentProduct.isEnabled ? "Enabled" : "Disabled" }}
                </span>
              </div>
              <p class="text-gray-600 text-lg mb-4">
                {{ currentProduct.description || "No description provided" }}
              </p>
            </div>
            <div
              v-if="currentProduct.imageUrl"
              class="ml-8 flex-shrink-0 w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border"
            >
              <img
                :src="currentProduct.imageUrl"
                :alt="currentProduct.name"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <!-- Product Details Grid -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Basic Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h3>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <Package class="w-5 h-5 text-gray-400" />
                  <div>
                    <p class="text-sm font-medium text-gray-500">SKU</p>
                    <p class="text-gray-900">
                      {{ currentProduct.sku || "Not specified" }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <Hash class="w-5 h-5 text-gray-400" />
                  <div>
                    <p class="text-sm font-medium text-gray-500">Category</p>
                    <p class="text-gray-900">{{ currentProduct.category }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <IndianRupee class="w-5 h-5 text-gray-400" />
                  <div>
                    <p class="text-sm font-medium text-gray-500">Price</p>
                    <p class="text-gray-900 text-xl font-semibold">
                      {{ formatPrice(currentProduct.price) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Inventory -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Inventory
              </h3>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <Package class="w-5 h-5 text-gray-400" />
                  <div>
                    <p class="text-sm font-medium text-gray-500">Stock</p>
                    <p
                      :class="
                        currentProduct.stock > 0
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      "
                      class="text-lg font-semibold"
                    >
                      {{ currentProduct.stock }} units
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <Calendar class="w-5 h-5 text-gray-400" />
                  <div>
                    <p class="text-sm font-medium text-gray-500">Created</p>
                    <p class="text-gray-900">
                      {{ formatDate(currentProduct.createdAt) }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <Calendar class="w-5 h-5 text-gray-400" />
                  <div>
                    <p class="text-sm font-medium text-gray-500">Updated</p>
                    <p class="text-gray-900">
                      {{ formatDate(currentProduct.updatedAt) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tags -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in currentProduct.tags"
                  :key="tag"
                  class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {{ tag }}
                </span>
                <span
                  v-if="currentProduct.tags.length === 0"
                  class="text-gray-500 text-sm"
                >
                  No tags assigned
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Error State -->
    <main
      v-else
      class="max-w-screen-xl mx-auto p-4 flex justify-center items-center h-64"
    >
      <div class="text-center">
        <p class="text-gray-500 text-lg">Product not found</p>
        <Button @click="goBack" type="tertiary">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    </main>
  </div>
</template>
