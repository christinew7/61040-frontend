<template>
  <NavBar :userId="userId" />
  <main class="upload-pattern">
    <header class="header">
      <h1 class="title">Upload Pattern</h1>
      <p class="subtitle">Add a new crochet pattern to your library</p>
    </header>

    <section class="upload-form">
      <Warning
        v-if="showWarning"
        :message="warningMessage"
        @close="showWarning = false"
      />

      <form @submit.prevent="handleUpload">
        <section class="form-group">
          <label for="pattern-name">Pattern Name</label>
          <input
            id="pattern-name"
            v-model="patternName"
            type="text"
            placeholder="Enter pattern name"
          />
        </section>

        <section class="form-group">
          <label for="pattern-content">Pattern Content</label>
          <textarea
            id="pattern-content"
            v-model="patternContent"
            placeholder="Copy and paste pattern here ..."
            rows="10"
          ></textarea>
        </section>

        <div class="actions">
          <PrimaryButton type="submit" :loading="uploading"
            >Upload</PrimaryButton
          >
          <PrimaryButton @click="handleCancel">Cancel</PrimaryButton>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import NavBar from "./components/NavBar.vue";
import PrimaryButton from "./components/PrimaryButton.vue";
import Warning from "./components/Warning.vue";
import {
  createLibrary,
  createFile,
  addItemToFile,
  getFileString,
} from "./api/Library";
import { startTrackingUsingLLM } from "./api/FileTracker";

const router = useRouter();
const route = useRoute();

const patternName = ref("");
const patternContent = ref("");
const uploading = ref(false);

const warningMessage = ref("");
const showWarning = ref(false);

async function handleUpload() {
  if (!patternName.value || !patternContent.value) {
    warningMessage.value = "Please provide both a pattern name and content.";
    showWarning.value = true;
    return;
  }

  const userId = route.params.userId;
  if (!userId) {
    warningMessage.value = "You're not logged in! Please log in again.";
    showWarning.value = true;
    return;
  }

  uploading.value = true;
  try {
    console.log("Creating new library for user:", userId);
    // manual create library temporarily for the user because there are no syncs
    const libraryId = await createLibrary(userId);

    console.log("Creating new file for user:", userId);

    // Create a new file in the user's library
    const fileId = await createFile(userId);
    console.log("File created with ID:", fileId);

    // Prepend pattern name to the beginning of content
    const contentWithName = `${patternName.value}\n${patternContent.value}`;

    // Split content into lines and add each line to the file
    const lines = contentWithName.split("\n");
    console.log(`Adding ${lines.length} lines to file...`);

    console.log(`userId is ${userId}`);
    console.log(`fileId is ${fileId}`);

    for (const line of lines) {
      await addItemToFile(userId, fileId, line);
    }

    console.log("Pattern uploaded successfully");

    // Also start fileTracking
    // SHOULD BE A SYNC
    const fileString = (await getFileString(userId, fileId)).fileString;
    const fileMaxIndex = lines.length - 1;

    const result = await startTrackingUsingLLM(
      userId,
      fileId,
      fileString,
      fileMaxIndex
    );
    console.log(result);
    router.push({ name: "Pattern", params: { userId, fileId } });
  } catch (err) {
    warningMessage.value = `Sorry... The server failed to upload your pattern: ${
      err?.message || err
    }`;
    showWarning.value = true;
    return;
  } finally {
    uploading.value = false;
  }
}

function handleCancel() {
  const userId = route.params.userId;
  if (userId) {
    router.push({ name: "Library", params: { userId } });
  } else {
    router.push({ name: "Home" });
  }
}
</script>

<style scoped>
.upload-pattern {
  padding: 3rem 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}
.header {
  text-align: center;
  margin-bottom: 2rem;
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
.upload-form {
  background: var(--color-bg-light);
  padding: 2rem;
  border-radius: 8px;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-text-dark);
}
.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
}
.form-group input[type="file"] {
  width: 100%;
  padding: 0.5rem;
}
.form-group textarea {
  resize: vertical;
  min-height: 200px;
}
.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}
</style>
