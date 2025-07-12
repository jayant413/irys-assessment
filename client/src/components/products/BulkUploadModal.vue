<script setup lang="ts">
import {
  Upload,
  X,
  Info,
  FileText,
  AlertCircle,
  CheckCircle,
  FileCode,
  Loader2,
  Repeat,
} from "lucide-vue-next";
//
import useProduct from "../../composables/useProduct";
import Input from "../ui/Input.vue";
import Button from "../ui/Button.vue";

const {
  insertSampleProducts,
  jsonInput,
  repeataionCount,
  handleBulkUpload,
  loading,
  validationError,
  parsedProducts,
} = useProduct();
</script>

<template>
  <div
    class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
    >
      <div
        class="flex justify-between items-center p-6 border-b border-gray-200"
      >
        <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Upload class="w-5 h-5" />
          Bulk Upload Products
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors border-none cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6">
        <div class="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 class="mb-2 text-blue-900 font-medium flex items-center gap-2">
            <Info class="w-4 h-4" />
            Important Notes:
          </h4>
          <ul class="m-0 pl-5 text-blue-900 text-sm list-disc">
            <li>
              This will disable all existing products and enable the new ones
            </li>
            <li>Products must be in JSON array format</li>
            <li>
              Each product needs: name, description, price, category, sku, stock
            </li>
            <li>Maximum 1000 products per upload</li>
          </ul>
        </div>

        <div class="mb-4">
          <label
            class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
          >
            <FileText class="w-4 h-4" />
            Products JSON Data
          </label>
          <textarea
            v-model="jsonInput"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm transition-all duration-200 outline-none font-mono resize-y focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            rows="15"
            placeholder='Paste your JSON array here, e.g.:
[
  {
    "name": "iPhone 15",
    "description": "Latest smartphone with amazing features",
    "price": 999.99,
    "category": "Electronics",
    "sku": "IPHONE15-001",
    "stock": 50,
    "imageUrl": "https://example.com/iphone15.jpg",
    "tags": ["smartphone", "apple", "mobile"]
  }
]'
          ></textarea>
        </div>

        <div
          v-if="validationError"
          class="p-3 px-4 rounded-lg mb-4 relative bg-red-50 border border-red-200 text-red-700 flex items-center gap-2"
        >
          <AlertCircle class="w-4 h-4 flex-shrink-0" />
          {{ validationError }}
        </div>

        <div
          v-if="parsedProducts.length > 0"
          class="p-3 px-4 rounded-lg mb-4 relative bg-green-50 border border-green-200 text-green-700 flex items-center gap-2"
        >
          <CheckCircle class="w-4 h-4 flex-shrink-0" />
          Valid JSON! Found {{ parsedProducts.length }} products ready for
          upload.
        </div>

        <!-- Sample Data Button -->
        <div class="my-4 space-x-[1em] flex items-end">
          <Button @click="insertSampleProducts" type="primary">
            <FileCode class="w-3 h-3" />
            Insert Sample Data
          </Button>

          <div class="flex flex-col gap-2 ml-4">
            <label
              class="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Repeat class="w-4 h-4" />
              Repeataion Count
            </label>
            <Input
              :modelValue="repeataionCount.toString()"
              @update:modelValue="repeataionCount = Number($event)"
              type="number"
              max="1000"
              placeholder="100"
              class="!w-26"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-6 border-gray-200">
          <Button @click="$emit('close')" type="tertiary">
            <X class="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            @click="handleBulkUpload(parsedProducts, () => $emit('close'))"
            type="info"
            :disabled="loading || parsedProducts.length === 0"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <Upload v-else class="w-4 h-4" />
            {{
              loading
                ? "Uploading..."
                : `Upload ${parsedProducts.length} Products`
            }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
