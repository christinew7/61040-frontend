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

<style scoped>
.warning-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  width: 90%;
}

.warning-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--color-tertiary);
  border: 2px solid var(--color-tertiary-dark);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.warning-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  /* Green color filter for SVG */
  filter: invert(28%) sepia(12%) saturate(1850%) hue-rotate(94deg)
    brightness(95%) contrast(88%);
}

.warning-content {
  flex: 1;
}

.warning-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d5a3d;
}

.warning-message {
  margin: 0;
  font-size: 14px;
  color: #2d5a3d;
  line-height: 1.5;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #2d5a3d;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.2s;
}

.close-button:hover {
  opacity: 0.7;
}
</style>
