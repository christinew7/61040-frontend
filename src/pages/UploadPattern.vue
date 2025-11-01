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

        <section class="form-group image-upload">
          <label for="pattern-image">Pattern Image (Optional)</label>
          <input
            id="pattern-image"
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            style="display: none"
            ref="fileInput"
          />
          <PrimaryButton type="button" @click="triggerFileInput" variant="gray">
            Choose File
          </PrimaryButton>
          <div v-if="imagePreview" class="image-preview">
            <img :src="imagePreview" alt="Pattern preview" />
            <IconButton
              icon="✕"
              label=""
              aria-label="Remove image"
              variant="gray"
              @click="clearImage"
              class="clear-image"
            />
          </div>
        </section>

        <div class="actions">
          <PrimaryButton type="submit" :loading="uploading"
            >Upload</PrimaryButton
          >
          <PrimaryButton @click="handleCancel" variant="gray"
            >Cancel</PrimaryButton
          >
        </div>
      </form>
    </section>
  </main>
</template>

<script setup>
import "./UploadPattern.css";
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import NavBar from "../components/NavBar.vue";
import PrimaryButton from "../components/PrimaryButton.vue";
import IconButton from "../components/IconButton.vue";
import Warning from "../components/Warning.vue";
import {
  createLibrary,
  createFile,
  addItemToFile,
  getFileString,
  setImageToFile,
} from "../api/Library";
import { startTrackingUsingLLM } from "../api/FileTracker";

const router = useRouter();
const route = useRoute();

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
});

const patternName = ref("");
const patternContent = ref("");
const uploading = ref(false);
const patternImage = ref(null);
const imagePreview = ref(null);
const fileInput = ref(null);

const warningMessage = ref("");
const showWarning = ref(false);

function triggerFileInput() {
  const input = document.getElementById("pattern-image");
  if (input) input.click();
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith("image/")) {
    warningMessage.value = "Please upload a valid image file.";
    showWarning.value = true;
    return;
  }

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
    patternImage.value = e.target.result; // Store base64 string
  };
  reader.readAsDataURL(file);
}

function clearImage() {
  patternImage.value = null;
  imagePreview.value = null;
  // Clear the file input
  const fileInput = document.getElementById("pattern-image");
  if (fileInput) fileInput.value = "";
}

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

    // Upload image if provided
    if (patternImage.value) {
      try {
        await setImageToFile(userId, fileId, patternImage.value);
        console.log("Pattern image uploaded successfully");
      } catch (imgErr) {
        console.error("Failed to upload image:", imgErr);
        // Don't fail the whole upload if image fails
      }
    }

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
