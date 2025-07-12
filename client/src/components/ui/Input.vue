<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  type: string;
  placeholder: string;
  modelValue: string;
  min?: string;
  max?: string;
  step?: string;
  required?: boolean;
  class?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "input"): void;
}>();

const value = computed({
  get: () => props.modelValue || null,
  set: (val) => {
    emit("update:modelValue", val || "");
    emit("input");
  },
});
</script>

<template>
  <n-input
    v-model:value="value"
    :type="type"
    :placeholder="placeholder"
    :min="min"
    :max="max"
    :step="step"
    :required="required"
  />
</template>
