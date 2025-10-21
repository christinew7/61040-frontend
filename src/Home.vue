<template>
  <main class="home">
    <header class="hero">
      <h1 class="title">CrochetBuddy</h1>

      <section class="actions">
        <template v-if="!mode">
          <PrimaryButton @click="showLogin">Log in</PrimaryButton>
          <PrimaryButton @click="showSignUp">Sign up</PrimaryButton>
        </template>

        <form v-else class="auth-window" @submit.prevent="submitAuth">
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
            <PrimaryButton @click="cancelAuth">Cancel</PrimaryButton>
          </div>
        </form>
      </section>

      <p class="subtitle">Your personal crochet companion</p>
    </header>
  </main>
</template>

<script setup>
import PrimaryButton from "./components/PrimaryButton.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { register, authenticate } from "./api/PasswordAuthentication";


const router = useRouter();
const mode = ref(null); // null | 'login' | 'signup'
const username = ref("");
const password = ref("");
const submitting = ref(false);

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
    alert("Please enter a username and password.");
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
    mode.value = null;

    // Navigate to library page with userId
    router.push({ name: "Library", params: { userId: userId } });
  } catch (err) {
    console.error("Authentication error:", err);
    // alert(`Authentication failed: ${err?.message || err}`);
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.home {
  padding: 4rem 1.5rem;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
.hero {
  text-align: center;
}
.title {
  font-size: 3rem;
  margin: 0;
  color: var(--color-text-dark);
}
.subtitle {
  margin-top: 0.5rem;
  color: var(--color-text-dark);
  opacity: 0.85;
}
.actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.auth-window {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: var(--color-bg-light);
  padding: 1rem;
  border-radius: 8px;
  min-width: 280px;
}
.auth-window label {
  display: flex;
  flex-direction: column;
  text-align: left;
  font-size: 0.9rem;
}
.auth-window input {
  margin-top: 0.25rem;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}
.auth-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
}
</style>
