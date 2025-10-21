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
        </div>

        <div class="navbar-menu">
          <button v-if="userId" @click="handleLogout" class="nav-button">
            Logout
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router";

const props = defineProps({
  userId: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["logout"]);
const router = useRouter();

const handleLogout = () => {
  emit("logout");
  router.push({ name: "Home" });
};
</script>

<style scoped>
.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  color: var(--color-primary);
  font-weight: 700;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 1.5rem;
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

.nav-button {
  padding: 0.5rem 1rem;
  background-color: var(--color-secondary);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.nav-button:hover {
  background-color: #92b8d8;
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
</style>
