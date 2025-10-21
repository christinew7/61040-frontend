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
    default: "default", // 'default', 'primary', 'secondary'
    validator: (value) => ["default", "primary", "secondary"].includes(value),
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

<style scoped>
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-primary);
  border-radius: 8px;
  background: white;
  color: var(--color-primary);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 48px;
  min-height: 48px;
}

.icon-button:hover:not(.disabled) {
  background: var(--color-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.icon-button:active:not(.disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.icon-button.primary {
  background: var(--color-primary);
  color: white;
}

.icon-button.primary:hover:not(.disabled) {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}

.icon-button.secondary {
  border-color: var(--color-secondary);
  color: var(--color-secondary);
}

.icon-button.secondary:hover:not(.disabled) {
  background: var(--color-secondary);
  color: white;
}

.icon-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  font-size: 1.25rem;
  line-height: 1;
}

.label {
  font-size: 0.875rem;
}
</style>
