<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="primary-button"
    @click="$emit('click')"
    :aria-busy="loading ? 'true' : 'false'"
  >
    <span v-if="!loading"
      ><slot>{{ label }}</slot></span
    >
    <span v-else class="spinner" aria-hidden="true">●●●</span>
  </button>
</template>

<script setup>
import "./PrimaryButton.css";

// Props
defineProps({
  label: { type: String, default: "Primary" },
  type: { type: String, default: "button" },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});

// Emit events
defineEmits(["click"]);
</script>
