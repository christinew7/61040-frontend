<template>
  <main class="home">
    <header class="hero">
      <h1 class="title">CrochetBuddy</h1>

      <section class="actions">
        <template v-if="!mode">
          <PrimaryButton @click="showLogin">Log in</PrimaryButton>
          <PrimaryButton @click="showSignUp">Sign up</PrimaryButton>
        </template>

        <form
          v-else
          class="auth-window"
          @submit.prevent="submitAuth"
          @keyup.enter="submitAuth"
        >
          <Warning
            v-if="showWarning"
            :message="warningMessage"
            @close="showWarning = false"
          />
          <h3>{{ mode === "login" ? "Log in" : "Sign up" }}</h3>
          <label>
            Username
            <input v-model="username" type="text" placeholder="username" />
          </label>
          <label>
            Password
            <input v-model="password" type="password" placeholder="password" />
          </label>
          <div class="auth-actions">
            <PrimaryButton @click="submitAuth">{{
              mode === "login" ? "Log in" : "Sign up"
            }}</PrimaryButton>
            <PrimaryButton @click="cancelAuth" variant="gray"
              >Cancel</PrimaryButton
            >
          </div>
        </form>
      </section>

      <p class="subtitle">
        CrochetBuddy removes the friction from following crochet patterns,
        making it effortless with following crochet patterns, whether you're
        used to US or UK terms. CrochetBuddy features an abbreviation reference,
        US/UK terminology toggle, and a row tracker!
      </p>
    </header>
  </main>
</template>

<script setup>
import PrimaryButton from "./components/PrimaryButton.vue";
import Warning from "./components/Warning.vue";
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { register, authenticate } from "./api/PasswordAuthentication";
import { useUserStore } from "./stores/userStore";

const router = useRouter();
const userStore = useUserStore();
const mode = ref(null); // null | 'login' | 'signup'
const username = ref("");
const password = ref("");
const submitting = ref(false);
const showWarning = ref(false);
const warningMessage = ref("");

// Prevent scrolling on the home page
onMounted(() => {
  document.body.style.overflow = "hidden";

  if (userStore.isAuthenticated) {
    router.push({ name: "Library", params: { userId: userStore.userId } });
  }
});

// Restore scrolling when leaving the page
onBeforeUnmount(() => {
  document.body.style.overflow = "";
});

function showLogin() {
  mode.value = "login";
  username.value = "";
  password.value = "";
}

function showSignUp() {
  mode.value = "signup";
  username.value = "";
  password.value = "";
}

function cancelAuth() {
  mode.value = null;
}

async function submitAuth() {
  if (!username.value || !password.value) {
    warningMessage.value = "Please enter a username and password.";
    showWarning.value = true;
    return;
  }

  submitting.value = true;
  try {
    let userId;
    if (mode.value === "signup") {
      userId = await register(username.value, password.value);
    } else if (mode.value === "login") {
      userId = await authenticate(username.value, password.value);
    }

    // Ensure userId is valid before navigating
    if (!userId) {
      throw new Error("Authentication succeeded but no userId returned");
    }

    console.log("Navigating to library with userId:", userId);

    // Store user session
    userStore.login(userId, username.value);

    mode.value = null;

    // Navigate to library page with userId
    router.push({ name: "Library", params: { userId: userId } });
  } catch (err) {
    console.error("Authentication error:", err);
    warningMessage.value = `Authentication failed: ${err?.message || err}`;
    showWarning.value = true;
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.home {
  padding: 4rem 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  max-height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: var(--color-bg-light);
  background-image: radial-gradient(
      circle at 10% 20%,
      var(--color-primary) -10%,
      transparent 30%
    ),
    radial-gradient(
      circle at 20% 30%,
      var(--color-secondary) 0%,
      transparent 90%
    ),
    radial-gradient(circle at 0% 0%, var(--color-secondary) 3%, transparent 50%),
    radial-gradient(
      circle at 50% 60%,
      var(--color-secondary) 0%,
      transparent 30%
    ),
    radial-gradient(
      ellipse at 60% 30%,
      var(--color-primary) 0%,
      transparent 30%
    ),
    radial-gradient(
      circle at 70% 10%,
      var(--color-secondary-light) 0%,
      transparent 60%
    ),
    radial-gradient(
      circle at 70% 80%,
      var(--color-primary-light) 0%,
      transparent 80%
    ),
    radial-gradient(circle at 80% 60%, var(--color-primary) 0%, transparent 60%);
}
.hero {
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
}
.title {
  font-size: 3rem;
  margin: 0;
  margin-bottom: 2rem;
  color: var(--color-secondary-darker);
}
.subtitle {
  margin-top: 2rem;
  color: var(--color-secondary-darkest);
  opacity: 0.85;
}
.actions {
  margin-top: 0;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  position: relative;
}

.auth-window {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  /* background: var(--color-gray); */
  padding: 1.5rem;
  border-radius: 8px;
  min-width: 280px;
  position: relative;
}
.auth-window h3 {
  margin: 0 0 0.5rem 0;
}
.auth-window label {
  display: flex;
  flex-direction: column;
  text-align: left;
  font-size: 0.9rem;
}
.auth-window input {
  margin-top: 0.25rem;
  padding: 0.75rem;
  background: var(--color-gray-light);
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-family: "Fragment Mono", monospace;
}
.auth-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
}
</style>
