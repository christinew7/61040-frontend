<template>
  <header :class="{ 'scrolled-nav': scrollPosition }">
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <router-link
            v-if="userId"
            :to="{ name: 'Library', params: { userId } }"
            class="brand-link"
          >
            <h1 class="brand-name">CrochetBuddy</h1>
          </router-link>
          <router-link v-else :to="{ name: 'Home' }" class="brand-link">
            <h1 class="brand-name">CrochetBuddy</h1>
          </router-link>
        </div>

        <section class="navbar-menu">
          <PrimaryButton
            v-if="userId"
            @click="handleLogout"
            variant="secondary"
          >
            Logout
          </PrimaryButton>
        </section>
      </div>
      <svg viewBox="0 0 500 500" class="yarnball">
        <path :d="yarnballPath" fill="currentColor" />
      </svg>
    </nav>
  </header>
</template>

<script setup>
import "./NavBar.css";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import { yarnballPath } from "../assets/yarnballPath.js";
import PrimaryButton from "./PrimaryButton.vue";
import { logout } from "../api/PasswordAuthentication";

const props = defineProps({
  userId: {
    type: String,
    default: "",
  },
});

const router = useRouter();
const userStore = useUserStore();

const handleLogout = async () => {
  try {
    // Call backend logout API with session token
    if (userStore.sessionToken) {
      await logout(userStore.sessionToken);
    }
  } catch (err) {
    console.error("Logout API error:", err);
    // Continue with local logout even if API call fails
  } finally {
    // Clear local session regardless of API result
    userStore.logout();
    router.push({ name: "Home" });
  }
};
</script>
