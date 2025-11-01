<template>
  <button
    :class="['icon-button', variant, { disabled: disabled }]"
    :disabled="disabled"
    @click="handleClick"
    :aria-label="ariaLabel"
  >
    <span class="icon">{{ icon }}</span>
    <span v-if="label" class="label">{{ label }}</span>
  </button>
</template>

<script setup>
import "./IconButton.css";

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: "",
  },
  ariaLabel: {
    type: String,
    default: "",
  },
  variant: {
    type: String,
    default: "default", // 'default', 'primary', 'secondary', 'gray'
    validator: (value) =>
      ["default", "primary", "secondary", "gray"].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click"]);

const handleClick = (event) => {
  if (!props.disabled) {
    emit("click", event);
  }
};
</script>
