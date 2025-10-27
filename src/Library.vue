<template>
  <div>
    <Warning
      v-if="showWarning"
      :message="warningMessage"
      @close="handleWarningClose"
    />
    <NavBar :userId="userId" class="navbar" />
    <main class="library">
      <header class="hero">
        <h1 class="title">{{ welcomeMessage }}, {{ displayName }}</h1>
        <div class="actions">
          <PrimaryButton @click="onUpload">Upload pattern</PrimaryButton>
        </div>
      </header>

      <section class="files-section">
        <div v-if="files.length === 0" class="empty-state">
          <p>
            Your library has no patterns yet. Upload your first pattern to get
            started!
          </p>
        </div>
        <div v-else class="files-grid">
          <FileDisplay
            v-for="file in files"
            :key="file.id"
            :file="file"
            @click="viewPattern(file)"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import PrimaryButton from "./components/PrimaryButton.vue";
import FileDisplay from "./components/FileDisplay.vue";
import Warning from "./components/Warning.vue";
import { getUsername } from "./api/PasswordAuthentication";
import { getAllFiles } from "./api/Library";
import NavBar from "./components/NavBar.vue";
import { useUserStore } from "./stores/userStore";

const router = useRouter();
const userStore = useUserStore();

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
});

const displayName = ref("Guest");
const welcomeMessage = ref("Welcome");
const showWarning = ref(false);
const warningMessage = ref("");
const pendingRoute = ref(null);

const handleWarningClose = () => {
  showWarning.value = false;
  if (pendingRoute.value) {
    router.push(pendingRoute.value);
    pendingRoute.value = null;
  }
};

// Check if user is a first-time visitor
const checkFirstTimeUser = () => {
  const visitKey = `visited_${props.userId}`;
  const hasVisitedBefore = localStorage.getItem(visitKey);

  if (hasVisitedBefore) {
    welcomeMessage.value = "Welcome back";
  } else {
    welcomeMessage.value = "Welcome";
    // Mark that user has now visited
    localStorage.setItem(visitKey, "true");
  }
};

const fetchUsername = async () => {
  if (props.userId) {
    try {
      const result = await getUsername(props.userId);
      displayName.value = result.username;
      // Update username in store if it's different
      if (userStore.username !== result.username) {
        userStore.updateUsername(result.username);
      }
    } catch (err) {
      console.error("Failed to fetch username", err);
      displayName.value = "Guest";
    }
  } else {
    displayName.value = "Guest";
  }
};

onMounted(() => {
  if (!userStore.isAuthenticated) {
    console.log("User not authenticated, redirecting to home");
    router.push({ name: "Home" });
    return;
  }

  // Check if the logged-in user matches the route userId
  if (userStore.userId !== props.userId) {
    warningMessage.value = "You can only access your own library!";
    showWarning.value = true;
    pendingRoute.value = {
      name: "Library",
      params: { userId: userStore.userId },
    };
    return;
  }

  // Use stored username if available
  if (userStore.username) {
    displayName.value = userStore.username;
  }

  // Check if first-time visitor
  checkFirstTimeUser();

  fetchUsername();
  fetchAllFiles();
});

watch(
  () => props.userId,
  (newUserId) => {
    // Check if user is trying to access another user's library
    if (userStore.isAuthenticated && userStore.userId !== newUserId) {
      console.log("Route changed to another user's library, redirecting");
      warningMessage.value = "You can only access your own library!";
      showWarning.value = true;
      pendingRoute.value = {
        name: "Library",
        params: { userId: userStore.userId },
      };
      return;
    }
    fetchUsername();
    fetchAllFiles();
  }
);

const files = ref([]);

const fetchAllFiles = async () => {
  if (props.userId) {
    try {
      const result = await getAllFiles(props.userId);
      console.log("getAllFiles result:", result);

      // Extract first item (title) from each file's items array
      files.value = result.files
        .filter((file) => file.items && file.items.length > 0)
        .map((file) => ({
          id: file._id,
          title: file.items[0],
          items: file.items,
        }))
        .reverse();
    } catch (err) {
      console.error("Failed to fetch files:", err);
    }
  }
};

function onUpload() {
  router.push({ name: "UploadPattern", params: { userId: props.userId } });
}

function viewPattern(file) {
  console.log("Viewing pattern:", file);
  router.push({
    name: "Pattern",
    params: {
      userId: props.userId,
      fileId: file.id,
    },
  });
}
</script>

<style scoped>
.navbar {
  position: sticky;
}
.library {
  max-width: 960px;
  margin: 0 auto;
}
.hero {
  text-align: center;
  padding: 1.5rem 0;
}
.title {
  font-size: 2.5rem;
  color: var(--color-text-dark);
}
.actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}
.files-section {
  margin-top: 1rem;
}
.section-title {
  font-size: 1.75rem;
  color: var(--color-text-dark);
  margin-bottom: 1.5rem;
  text-align: center;
}
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-dark);
  opacity: 0.7;
}
.files-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 1.5rem;
}
</style>
