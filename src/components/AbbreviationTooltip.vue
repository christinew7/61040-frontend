<template>
  <div
    v-if="show"
    class="abbreviation-tooltip"
    :style="{
      top: position.y + 'px',
      left: position.x + 'px',
    }"
  >
    <div class="tooltip-content">
      <div class="tooltip-abbr">{{ abbreviation }}</div>
      <div class="tooltip-full">{{ fullText }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  abbreviation: {
    type: String,
    default: "",
  },
  fullText: {
    type: String,
    default: "",
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 }),
  },
});
</script>

<style scoped>
.abbreviation-tooltip {
  position: fixed;
  background: var(--color-bg-light);
  border: 2px solid var(--color-primary);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  pointer-events: none;
  animation: tooltipFadeIn 0.2s ease-out;
  max-width: 250px;
  transform: translate(-50%, -100%);
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, calc(-100% + 5px));
  }
  to {
    opacity: 1;
    transform: translate(-50%, -100%);
  }
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tooltip-abbr {
  font-family: "Fragment Mono", monospace;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-primary-dark);
}

.tooltip-full {
  font-family: "Fragment Mono", monospace;
  font-size: 0.85rem;
  color: var(--color-text-dark);
  font-weight: 300;
}
</style>
