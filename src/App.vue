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
@import url("https://fonts.googleapis.com/css2?family=Fragment+Mono:ital@0;1&family=Signika:wght@300..700&display=swap");

body {
  font-family: "Fragment Mono", sans-serif;
  background-color: var(--color-bg-light);
  margin: 0;
  padding: 0;
}

#app {
  font-family: "Signika", Helvetica, Arial, sans-serif;
  text-align: center;
  background-color: var(--color-bg-light);
  min-height: 100vh;
}
</style>
