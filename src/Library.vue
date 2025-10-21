<template>
  <div>
    <NavBar :userId="userId" />
    <main class="library">
      <header class="hero">
        <h1 class="title">Welcome, {{ displayName }}</h1>
        <p class="subtitle">Your saved patterns and uploads</p>

        <div class="actions">
          <PrimaryButton @click="onUpload">Upload pattern</PrimaryButton>
          <!-- <PrimaryButton @click="onDictionary"> Manage Dictionary </PrimaryButton> -->
        </div>
      </header>

      <section class="files-section">
        <div v-if="files.length === 0" class="empty-state">
          <p>No patterns yet. Upload your first pattern to get started!</p>
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
  // Check if user is logged in
  if (!userStore.isAuthenticated) {
    console.log("User not authenticated, redirecting to home");
    router.push({ name: "Home" });
    return;
  }

  // Check if the logged-in user matches the route userId
  if (userStore.userId !== props.userId) {
    console.log("User trying to access another user's library, redirecting");
    alert("You can only access your own library!");
    router.push({ name: "Library", params: { userId: userStore.userId } });
    return;
  }

  // Use stored username if available
  if (userStore.username) {
    displayName.value = userStore.username;
  }

  fetchUsername();
  fetchAllFiles();
});

watch(
  () => props.userId,
  (newUserId) => {
    // Check if user is trying to access another user's library
    if (userStore.isAuthenticated && userStore.userId !== newUserId) {
      console.log("Route changed to another user's library, redirecting");
      alert("You can only access your own library!");
      router.push({ name: "Library", params: { userId: userStore.userId } });
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
      for (const file of result.files) {
        if (file.items && file.items.length > 0) {
          files.value.push({
            id: file._id,
            title: file.items[0],
            items: file.items,
          });
        }
      }
      console.log("Processed files:", files.value);
    } catch (err) {
      console.error("Failed to fetch files:", err);
    }
  }
};

function onUpload() {
  // Navigate to upload pattern page with userId
  router.push({ name: "UploadPattern", params: { userId: props.userId } });
}

// function onDictionary() {
//   // Navigate to dictionary manager page (global, no userId needed)
//   router.push({ name: "DictionaryManager" });
// }

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
.library {
  padding: 3rem 1.5rem;
  max-width: 960px;
  margin: 0 auto;
}
.hero {
  text-align: center;
}
.title {
  font-size: 2.5rem;
  margin: 0;
  color: var(--color-text-dark);
}
.subtitle {
  margin-top: 0.5rem;
  color: var(--color-text-dark);
  opacity: 0.85;
}
.actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.files-section {
  margin-top: 3rem;
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
