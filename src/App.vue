<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import "./App.css";
import { onMounted } from "vue";
import { useUserStore } from "./stores/userStore";

const userStore = useUserStore();

// Restore session on app load
onMounted(() => {
  userStore.restoreSession();
});
</script>
