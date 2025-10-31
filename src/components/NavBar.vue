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
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import { yarnballPath } from "../assets/yarnballPath.js";
import PrimaryButton from "./PrimaryButton.vue";

const props = defineProps({
  userId: {
    type: String,
    default: "",
  },
});

const router = useRouter();
const userStore = useUserStore();

const handleLogout = () => {
  userStore.logout();
  router.push({ name: "Home" });
};
</script>

<style scoped>
header {
  width: 100%;
  margin: 0;
  padding: 0;
}

.navbar {
  background: var(--color-bg-light);
  box-shadow: 0 2px 4px var(--color-primary);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  margin: 0;
  padding: 0;
}

.navbar-container {
  max-width: 100%;
  margin: 0;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}

.navbar-brand {
  flex-shrink: 0;
}

.brand-link {
  text-decoration: none;
  color: inherit;
}

.brand-name {
  font-size: 1.5rem;
  margin: 0;
  color: var(--color-primary-dark);
  font-weight: 700;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  z-index: 2;
}

.nav-link {
  text-decoration: none;
  color: var(--color-text-dark);
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.nav-link:hover {
  background-color: rgba(247, 202, 201, 0.2);
  color: var(--color-primary);
}

.nav-link.router-link-active {
  background-color: var(--color-primary);
  color: white;
}

@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
    gap: 1rem;
  }

  .navbar-menu {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
}

.yarnball {
  position: absolute;
  bottom: 0px;
  /* left -80 if width 50 */
  left: -40px;
  width: 35px;
  height: auto;
  animation: rollAcross 14s linear infinite;
  z-index: 0;
  color: var(--color-primary-dark);
}

@keyframes rollAcross {
  0% {
    transform: translateX(0) rotate(0deg);
  }
  100% {
    transform: translateX(110vw) rotate(720deg);
  }
}
</style>
