<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>This is a minimal Vite + Vue 3 scaffold.</p>
  </div>
</template>

<script setup>
defineProps({
  msg: String,
});
</script>

<style scoped>
.hello {
  color: #2c3e50;
}
</style>
