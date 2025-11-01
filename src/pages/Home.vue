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
import "./Home.css";
import PrimaryButton from "../components/PrimaryButton.vue";
import Warning from "../components/Warning.vue";
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { register, authenticate } from "../api/PasswordAuthentication";
import { useUserStore } from "../stores/userStore";

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
  if (userStore.isAuthenticated) {
    router.push({ name: "Library", params: { userId: userStore.userId } });
  }
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
  showWarning.value = false;
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
