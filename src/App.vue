<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useUserStore } from "./stores/userStore";

const userStore = useUserStore();

// Restore session on app load
onMounted(() => {
  userStore.restoreSession();
});
</script>

<style>
body {
  background-color: var(--color-bg-light);
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  background-color: var(--color-bg-light);
  min-height: 100vh;
}
</style>
