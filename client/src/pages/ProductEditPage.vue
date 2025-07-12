<script setup lang="ts">
import { onMounted } from "vue";
import {
  ArrowLeft,
  Package,
  FileText,
  Image,
  Tag,
  Save,
  X,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  IndianRupee,
} from "lucide-vue-next";
//
import useProduct from "../composables/useProduct";
import { useProductStore } from "../stores/productStore";
import useProductRouting from "../composables/useProductRouting";
import Input from "../components/ui/Input.vue";
import Select from "../components/ui/Select.vue";
import Button from "../components/ui/Button.vue";

const props = defineProps<{
  id: string;
}>();

const productId = props.id;

const productStore = useProductStore();
const { goBack } = useProductRouting();
const {
  addTag,
  removeTag,
  formData,
  tagInput,
  handleProductUpdate,
  loadProduct,
  initialLoading,
  loading,
  currentProduct,
} = useProduct();

onMounted(async () => {
  await Promise.all([productStore.fetchCategories(), loadProduct(productId)]);
});
</script>

<template>
  <div>
    <div class="max-w-screen-xl mx-auto px-4">
      <div class="flex items-center h-16 space-x-[1em]">
        <Button @click="goBack" type="tertiary">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back
        </Button>
        <h2 class="text-lg font-semibold text-gray-900 ml-4">
          Edit Product
          {{ currentProduct?.name ? `- ${currentProduct.name}` : "" }}
        </h2>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="initialLoading" class="flex justify-center items-center h-64">
      <Loader2 class="w-5 h-5 animate-spin text-blue-600" />
      <span class="ml-2 text-gray-500">Loading product...</span>
    </div>

    <!-- Main Content -->
    <main v-else class="max-w-screen-xl mx-auto p-4">
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm">
        <form @submit.prevent="handleProductUpdate(productId)" class="p-6">
          <!-- Product Status -->
          <div class="mb-4">
            <label class="flex items-center gap-2 cursor-pointer mb-2">
              <input
                v-model="formData.isEnabled"
                type="checkbox"
                class="w-4 h-4"
              />

              <span class="text-sm font-medium text-gray-700"
                >Product Enabled</span
              >
            </label>
            <span
              :class="
                formData.isEnabled
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              "
              class="inline-flex items-center gap-1 mt-2 px-2 py-1 text-xs font-medium rounded-full"
            >
              <CheckCircle v-if="formData.isEnabled" class="w-3 h-3" />
              <XCircle v-else class="w-3 h-3" />
              {{ formData.isEnabled ? "Enabled" : "Disabled" }}
            </span>
          </div>

          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="mb-4">
              <label
                class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
              >
                <FileText class="w-4 h-4" />
                Product Name *
              </label>
              <Input
                :modelValue="formData.name"
                @update:modelValue="formData.name = $event"
                type="text"
                required
                placeholder="Enter product name"
              />
            </div>

            <div class="mb-4">
              <label
                class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
              >
                <Package class="w-4 h-4" />
                SKU*
              </label>
              <Input
                :modelValue="formData.sku"
                @update:modelValue="formData.sku = $event"
                type="text"
                placeholder="Product SKU"
              />
            </div>
          </div>

          <!-- Description -->
          <div class="mb-4">
            <label
              class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              <FileText class="w-4 h-4" />
              Description*
            </label>
            <Input
              :modelValue="formData.description"
              @update:modelValue="formData.description = $event"
              type="textarea"
              rows="3"
              placeholder="Product description"
            />
          </div>

          <!-- Price, Stock, Category Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="mb-4">
              <label
                class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
              >
                <IndianRupee class="w-4 h-4" />
                Price *
              </label>
              <Input
                :modelValue="formData.price.toString()"
                @update:modelValue="formData.price = Number($event)"
                type="number"
                required
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div class="mb-4">
              <label
                class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
              >
                <Package class="w-4 h-4" />
                Stock
              </label>
              <Input
                :modelValue="formData.stock.toString()"
                @update:modelValue="formData.stock = Number($event)"
                type="number"
                min="0"
                placeholder="0"
                required
              />
            </div>

            <div class="mb-4">
              <label
                class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
              >
                <Tag class="w-4 h-4" />
                Category *
              </label>
              <Select
                :options="
                  productStore.categories.map((category) => ({
                    value: category,
                    label: category,
                  }))
                "
                :modelValue="formData.category"
                @update:modelValue="formData.category = $event"
                required
                label="Category"
              />
            </div>
          </div>

          <!-- Image URL -->
          <div class="mb-4">
            <label
              class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              <Image class="w-4 h-4" />
              Image URL
            </label>
            <Input
              :modelValue="formData.imageUrl"
              @update:modelValue="formData.imageUrl = $event"
              type="url"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <!-- Tags -->
          <div class="mb-6">
            <label
              class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
            >
              <Tag class="w-4 h-4" />
              Tags
            </label>
            <div class="flex gap-2 mb-2">
              <Input
                :modelValue="tagInput"
                @update:modelValue="tagInput = $event"
                type="text"
                placeholder="Enter tag and press Enter"
                @keyup.enter="addTag"
              />
              <Button @click="addTag" type="info">
                <Plus class="w-4 h-4" />
                Add
              </Button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(tag, index) in formData.tags"
                :key="index"
                class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {{ tag }}
                <button
                  @click="removeTag(index)"
                  type="button"
                  class="text-blue-600 hover:text-blue-800 bg-none border-none cursor-pointer p-0"
                >
                  <X class="w-3 h-3" />
                </button>
              </span>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button @click="goBack" type="tertiary">
              <X class="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="info"
              :disabled="loading"
              @click="handleProductUpdate(productId)"
            >
              <Save class="w-4 h-4 mr-2" />
              {{ loading ? "Updating..." : "Update Product" }}
            </Button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>
