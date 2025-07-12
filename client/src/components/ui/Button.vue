<script setup lang="ts">
defineProps<{
  onClick: () => void;
  type?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "error"
    | "warning"
    | "info"
    | "success";
  label?: string;
  round?: boolean;
  secondary?: boolean;
  strong?: boolean;
  quaternary?: boolean;
}>();
</script>

<template>
  <n-button
    @click="onClick"
    :type="type"
    :quaternary="quaternary"
    :round="round"
    :secondary="secondary"
    :strong="strong"
  >
    <slot>
      {{ label }}
    </slot>
  </n-button>
</template>
