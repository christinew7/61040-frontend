<template>
  <div v-if="show" class="warning-container">
    <div class="warning-box">
      <img
        src="../assets/warning-outline.svg"
        alt="Warning"
        class="warning-icon"
      />
      <div class="warning-content">
        <h3 v-if="title" class="warning-title">{{ title }}</h3>
        <p class="warning-message">{{ message }}</p>
      </div>
      <button v-if="dismissable" @click="$emit('close')" class="close-button">
        ×
      </button>
    </div>
  </div>
</template>

<script setup>
import "./Warning.css";

defineProps({
  show: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: "",
  },
  message: {
    type: String,
    required: true,
  },
  dismissable: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["close"]);
</script>
