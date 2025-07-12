<script setup lang="ts">
import { ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import {
  Filter,
  Search,
  Tag,
  ToggleLeft,
  ArrowUpDown,
  SortAsc,
  RotateCcw,
  IndianRupee,
} from "lucide-vue-next";
//
import {
  useProductStore,
  type ProductFilters,
} from "../../stores/productStore";
import Input from "../ui/Input.vue";
import Select from "../ui/Select.vue";
import Button from "../ui/Button.vue";

const productStore = useProductStore();

// Local filters state
const localFilters = ref<ProductFilters>({ ...productStore.filters });

watch(
  () => productStore.filters,
  (newFilters) => {
    localFilters.value = { ...newFilters };
  },
  { deep: true }
);

const applyFilters = async () => {
  if (
    localFilters.value.minPrice &&
    localFilters.value.maxPrice &&
    localFilters.value.minPrice > localFilters.value.maxPrice
  ) {
    productStore.error = "Min price cannot be greater than max price";
    return;
  }

  productStore.updateFilters(localFilters.value);
  await productStore.fetchProducts(1); // Reset to first page
};

// Debounced version for text inputs
const debouncedApplyFilters = useDebounceFn(applyFilters, 500);

const resetFilters = async () => {
  productStore.resetFilters();
  localFilters.value = { ...productStore.filters };
  await productStore.fetchProducts(1);
};
</script>

<template>
  <div class="py-3 px-2">
    <div class="flex items-start justify-between">
      <h3
        class="text-lg font-semibold text-gray-700 flex justify-start items-center gap-2 mb-4"
      >
        <Filter class="w-5 h-5" />
        Filters
      </h3>

      <!-- Filter Actions -->
      <div class="border-gray-200">
        <Button @click="resetFilters" type="tertiary">
          <RotateCcw class="w-4 h-4 mr-2" />
          Reset Filters
        </Button>
      </div>
    </div>

    <!-- Search -->
    <div class="mb-4">
      <label
        class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
      >
        <Search class="w-4 h-4" />
        Search
      </label>
      <Input
        :modelValue="localFilters.search"
        @update:modelValue="localFilters.search = $event"
        type="text"
        placeholder="Search products..."
        @input="debouncedApplyFilters"
      />
    </div>

    <!-- Category Filter -->
    <div class="mb-4">
      <label
        class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
      >
        <Tag class="w-4 h-4" />
        Category
      </label>
      <Select
        :options="[
          { value: '', label: 'All Categories' },
          ...productStore.categories.map((category) => ({
            value: category,
            label: category,
          })),
        ]"
        :modelValue="localFilters.category"
        @update:modelValue="localFilters.category = $event"
        @change="debouncedApplyFilters"
        label="Category"
      />
    </div>

    <!-- Price Range -->
    <div class="mb-4">
      <label
        class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
      >
        <IndianRupee class="w-4 h-4" />
        Price Range
      </label>
      <div class="flex gap-2">
        <Input
          :modelValue="localFilters.minPrice?.toString() ?? ''"
          @update:modelValue="localFilters.minPrice = Number($event)"
          type="number"
          @input="debouncedApplyFilters"
          placeholder="Min"
          min="0"
          step="0.01"
        />
        <Input
          :modelValue="localFilters.maxPrice?.toString() ?? ''"
          @update:modelValue="localFilters.maxPrice = Number($event)"
          type="number"
          @input="debouncedApplyFilters"
          placeholder="Max"
          min="0"
          step="0.01"
        />
      </div>
    </div>

    <!-- Status Filter -->
    <div class="mb-4">
      <label
        class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
      >
        <ToggleLeft class="w-4 h-4" />
        Status
      </label>
      <Select
        :options="[
          { value: 'null', label: 'All Products' },
          { value: 'true', label: 'Enabled Only' },
          { value: 'false', label: 'Disabled Only' },
        ]"
        :modelValue="localFilters.isEnabled?.toString() ?? ''"
        @update:modelValue="
          localFilters.isEnabled =
            $event === 'null' || $event === ''
              ? null
              : $event === 'true'
              ? true
              : false
        "
        @change="debouncedApplyFilters"
        label="Status"
      />
    </div>

    <!-- Sort Options -->
    <div class="mb-4">
      <label
        class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
      >
        <ArrowUpDown class="w-4 h-4" />
        Sort By
      </label>
      <Select
        :options="[
          { value: 'createdAt', label: 'Date Created' },
          { value: 'updatedAt', label: 'Date Modified' },
          { value: 'name', label: 'Name' },
          { value: 'price', label: 'Price' },
        ]"
        :modelValue="localFilters.sortBy"
        @update:modelValue="
          localFilters.sortBy = $event as
            | 'name'
            | 'price'
            | 'createdAt'
            | 'updatedAt'
        "
        @change="debouncedApplyFilters"
        label="Sort By"
      />
    </div>

    <div class="mb-4">
      <label
        class="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
      >
        <SortAsc class="w-4 h-4" />
        Sort Order
      </label>
      <Select
        :options="[
          { value: 'desc', label: 'Descending' },
          { value: 'asc', label: 'Ascending' },
        ]"
        :modelValue="localFilters.sortOrder"
        @update:modelValue="
          localFilters.sortOrder =
            $event === 'desc' || $event === '' ? 'desc' : 'asc'
        "
        @change="debouncedApplyFilters"
        label="Sort Order"
      />
    </div>
  </div>
</template>
