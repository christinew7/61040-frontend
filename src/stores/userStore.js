import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUserStore = defineStore(
  "user",
  () => {
    // State
    const userId = ref(null);
    const username = ref(null);
    const sessionToken = ref(null);

    // Getters
    const isAuthenticated = computed(
      () => !!userId.value && !!sessionToken.value
    );

    // Actions
    function login(userIdValue, usernameValue, token) {
      userId.value = userIdValue;
      username.value = usernameValue;
      sessionToken.value = token || userIdValue; // Use userId as token if no token provided

      // Store in localStorage for persistence
      localStorage.setItem("userId", userIdValue);
      localStorage.setItem("username", usernameValue || "");
      localStorage.setItem("sessionToken", sessionToken.value);
    }

    function logout() {
      userId.value = null;
      username.value = null;
      sessionToken.value = null;

      // Clear from localStorage
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      localStorage.removeItem("sessionToken");
    }

    function restoreSession() {
      const storedUserId = localStorage.getItem("userId");
      const storedUsername = localStorage.getItem("username");
      const storedToken = localStorage.getItem("sessionToken");

      if (storedUserId && storedToken) {
        userId.value = storedUserId;
        username.value = storedUsername;
        sessionToken.value = storedToken;
        return true;
      }
      return false;
    }

    function updateUsername(newUsername) {
      username.value = newUsername;
      localStorage.setItem("username", newUsername);
    }

    return {
      // State
      userId,
      username,
      sessionToken,

      // Getters
      isAuthenticated,

      // Actions
      login,
      logout,
      restoreSession,
      updateUsername,
    };
  },
  {
    persist: false, // We're handling persistence manually with localStorage
  }
);
