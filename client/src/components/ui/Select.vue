<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  options: { value: string; label: string }[];
  modelValue: string;
  required?: boolean;
  label?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change"): void;
}>();

const value = computed({
  get: () => props.modelValue || null,
  set: (val) => {
    emit("update:modelValue", val || "");
    emit("change");
  },
});
</script>

<template>
  <n-select
    v-model:value="value"
    :placeholder="'Select ' + (label || 'Option')"
    :options="options"
    :disabled="disabled"
  />
</template>
