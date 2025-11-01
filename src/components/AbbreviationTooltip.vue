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
import "./AbbreviationTooltip.css";

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
