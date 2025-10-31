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

<style scoped>
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  /* border: 2px solid var(--color-primary-dark); */
  border-radius: 8px;
  background: var(--color-bg-light);
  color: var(--color-primary-darkest);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 48px;
  min-height: 48px;
  font-family: "Fragment Mono", monospace;
}

.icon-button:hover:not(.disabled) {
  background: var(--color-primary);
  /* color: white; */
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 8px var(--color-secondary-light);
  font-weight: bold;
  letter-spacing: 0.02em;
  text-shadow: 0.5px 0 0 currentColor;
}

.icon-button:active:not(.disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.icon-button.primary {
  background: var(--color-primary);
  border: 2px solid var(--color-primary);
  color: var(--color-primary-darkest);
}

.icon-button.primary:hover:not(.disabled) {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  font-weight: bold;
  letter-spacing: 0.02em;
  text-shadow: 0.5px 0 0 currentColor;
}

.icon-button.secondary {
  border-color: var(--color-secondary);
  background: var(--color-secondary);
  color: var(--color-secondary-darkest);
}

.icon-button.secondary:hover:not(.disabled) {
  background: var(--color-secondary-dark);
  border-color: var(--color-secondary-dark);
  color: var(--color-secondary-darkest);
  font-weight: bold;
  letter-spacing: 0.02em;
  text-shadow: 0.5px 0 0 currentColor;
}

.icon-button.gray {
  border-color: var(--color-gray);
  background: var(--color-gray);
  color: var(--color-gray-darkest);
}

.icon-button.gray:hover:not(.disabled) {
  background: var(--color-gray-dark);
  border-color: var(--color-gray-dark);
  color: var(--color-gray-darkest);
  font-weight: bold;
  letter-spacing: 0.02em;
  text-shadow: 0.5px 0 0 currentColor;
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
