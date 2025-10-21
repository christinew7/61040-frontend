<template>
  <NavBar :userId="userId" />
  <main class="pattern">
    <header class="header">
      <h1 class="title">{{ patternTitle }}</h1>
    </header>

    <section class="pattern-content">
      <p v-if="loading" class="loading">Loading pattern...</p>
      <p v-else-if="error" class="error">{{ error }}</p>
      <section v-else class="pattern-container">
        <div class="content">
          <div
            v-for="(line, index) in patternLines"
            :key="index"
            :class="['line', { 'current-line': index === currentIndex - 1 }]"
            @click="handleLineClick(index + 1)"
          >
            {{ line }}
          </div>
        </div>

        <aside
          class="navigation-controls"
          :style="{ top: controlsTopOffset + 'px' }"
        >
          <!-- <div class="current-position">
            Line {{ currentIndex }} of {{ patternLines.length }}
          </div> -->
          <IconButton
            icon="↑"
            label=""
            aria-label="Go to previous line"
            variant="primary"
            :disabled="currentIndex <= 1"
            @click="handleBack"
          />
          <IconButton
            icon="↓"
            label=""
            aria-label="Go to next line"
            variant="primary"
            :disabled="currentIndex >= patternLines.length"
            @click="handleNext"
          />
        </aside>
      </section>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import NavBar from "./components/NavBar.vue";
import PrimaryButton from "./components/PrimaryButton.vue";
import IconButton from "./components/IconButton.vue";
import { getFileString } from "./api/Library";
import { jumpTo, next, back, getCurrentItem } from "./api/FileTracker";

const router = useRouter();

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
  fileId: {
    type: String,
    required: true,
  },
});

const patternTitle = ref("");
const patternLines = ref([]);
const loading = ref(true);
const error = ref("");
const currentIndex = ref(0);
const controlsTopOffset = ref(0);

const fetchPattern = async () => {
  loading.value = true;
  error.value = "";

  try {
    const result = await getFileString(props.userId, props.fileId);
    console.log("Pattern data:", result);

    if (result?.fileString) {
      const lines = JSON.parse(result.fileString);

      if (lines.length > 0) {
        patternTitle.value = lines[0];
        patternLines.value = lines.slice(1);
      } else {
        error.value = "Pattern is empty";
      }
    } else {
      error.value = "Pattern not found";
    }

    // Fetch the current tracking index
    await fetchCurrentIndex();
  } catch (err) {
    console.error("Failed to fetch pattern:", err);
    error.value = err.message || "Failed to load pattern";
  } finally {
    loading.value = false;
  }
};

const fetchCurrentIndex = async () => {
  try {
    const result = await getCurrentItem(props.userId, props.fileId);
    console.log("Current item result:", result);

    // api returns { index: number}
    currentIndex.value = result.index;
    // }
  } catch (err) {
    console.error("Failed to fetch current index:", err);
    // Don't set error, just log it - pattern can still be viewed
  }
};

const goBack = () => {
  router.push({ name: "Library", params: { userId: props.userId } });
};

const handleNext = async () => {
  try {
    await next(props.userId, props.fileId);
    await fetchCurrentIndex();
    await updateControlsPosition();
  } catch (err) {
    console.error("Failed to move to next line:", err);
    alert(err.message || "Failed to move to next line");
  }
};

const handleBack = async () => {
  try {
    await back(props.userId, props.fileId);
    await fetchCurrentIndex();
    await updateControlsPosition();
  } catch (err) {
    console.error("Failed to move to previous line:", err);
    alert(err.message || "Failed to move to previous line");
  }
};

const handleLineClick = async (lineIndex) => {
  try {
    await jumpTo(props.userId, props.fileId, lineIndex);
    await fetchCurrentIndex();
    await updateControlsPosition();
  } catch (err) {
    console.error("Failed to jump to line:", err);
    alert(err.message || "Failed to jump to line");
  }
};

const updateControlsPosition = async () => {
  await nextTick();
  const currentLine = document.querySelector(".current-line");
  const controlsElement = document.querySelector(".navigation-controls");

  if (currentLine && controlsElement) {
    const contentElement = document.querySelector(".content");
    if (contentElement) {
      const contentRect = contentElement.getBoundingClientRect();
      const lineRect = currentLine.getBoundingClientRect();
      const controlsHeight = controlsElement.offsetHeight;

      // Calculate the middle of the highlighted line
      const lineMiddle =
        lineRect.top -
        contentRect.top +
        contentElement.scrollTop +
        lineRect.height / 2;

      // Center the gap between buttons (middle of controls) with the line middle
      const centeredTop = lineMiddle - controlsHeight / 2;

      controlsTopOffset.value = centeredTop;

      // Scroll the highlighted line into view (centered)
      currentLine.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }
};

watch(currentIndex, () => {
  updateControlsPosition();
});

onMounted(async () => {
  await fetchPattern();
  await updateControlsPosition();
});
</script>

<style scoped>
.pattern {
  padding: 2rem 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.title {
  font-size: 2rem;
  color: var(--color-text-dark);
  margin-top: 1rem;
  margin-bottom: 0;
}

.pattern-content {
  background: var(--color-bg-light);
  padding: 2rem;
  border-radius: 8px;
  min-height: 300px;
}

.pattern-container {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  position: relative;
  width: 100%;
}

.content {
  flex: 1;
  font-family: "Courier New", monospace;
  line-height: 1.6;
  max-width: calc(100% - 120px);
}

.navigation-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: absolute;
  left: calc(100% - 100px);
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: top 0.3s ease;
  min-width: 80px;
}

.current-position {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-dark);
  text-align: center;
  white-space: nowrap;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-dark);
  opacity: 0.7;
}

.error {
  color: var(--color-error);
  opacity: 1;
}

.line {
  padding: 0.5rem;
  color: var(--color-text-dark);
  white-space: pre-wrap;
  word-wrap: break-word;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.line:hover:not(.current-line) {
  background-color: rgba(179, 206, 229, 0.2); /* Light blue hover */
}

.line.current-line {
  font-weight: bold;
  background-color: rgba(247, 202, 201, 0.3); /* Light pink highlight */
  padding: 0.5rem;
  border-radius: 12px;
  margin: 0.25rem 0;
  cursor: pointer;
}
</style>
