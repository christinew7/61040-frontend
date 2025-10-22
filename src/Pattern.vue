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
        <!-- Language controls above pattern text -->
        <section class="language-controls-section">
          <div class="language-selector">
            <label for="pattern-lang">Pattern language:</label>
            <select id="pattern-lang" v-model="patternLanguage">
              <option value="US">US English</option>
              <option value="UK">UK English</option>
            </select>
          </div>

          <div class="translation-toggle">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="translatePattern"
                :disabled="translating"
              />
              <span>
                {{
                  translating
                    ? "Translating..."
                    : `Translate to ${patternLanguage === "US" ? "UK" : "US"}`
                }}
              </span>
            </label>
          </div>

          <IconButton
            :icon="isVisible ? '💡' : '🌙'"
            label=""
            :aria-label="isVisible ? 'Hide pattern' : 'Show pattern'"
            variant="primary"
            @click="handleVisibility"
          ></IconButton>
        </section>

        <div class="pattern-wrapper">
          <div class="content">
            <div
              v-for="(line, index) in patternLines"
              :key="index"
              :class="[
                'line',
                { 'current-line': isVisible && index === currentIndex - 1 },
                { dimmed: !isVisible },
              ]"
              @click="isVisible ? handleLineClick(index + 1) : null"
            >
              <span
                v-for="(segment, segIndex) in parseLineForAbbreviations(line)"
                :key="segIndex"
              >
                <span
                  v-if="segment.isAbbreviation"
                  class="abbreviation"
                  @click.stop="showAbbreviationTooltip($event, segment.text)"
                >
                  {{ segment.text }}
                </span>
                <span v-else>{{ segment.text }}</span>
              </span>
            </div>
          </div>

          <!-- Tooltip for abbreviation expansion -->
          <div
            v-if="tooltipVisible"
            class="abbreviation-tooltip"
            :style="{
              top: tooltipPosition.y + 'px',
              left: tooltipPosition.x + 'px',
            }"
          >
            <div class="tooltip-content">
              <div class="tooltip-abbr">{{ tooltipData.abbr }}</div>
              <div class="tooltip-full">{{ tooltipData.full }}</div>
            </div>
          </div>

          <aside
            v-if="isVisible"
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
        </div>
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
import {
  jumpTo,
  next,
  back,
  getCurrentItem,
  setVisibility,
  getVisibility,
} from "./api/FileTracker";
import { translateTermFromL1, translateTermFromL2 } from "./api/Dictionary";
import { translateTermFromL1 as translateAbbreviationFromL1 } from "./api/Dictionary";
import { translateTermFromL2 as translateAbbreviationFromL2 } from "./api/Dictionary";

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
const originalPatternLines = ref([]); // Store original lines for translation
const loading = ref(true);
const error = ref("");
const currentIndex = ref(0);
const controlsTopOffset = ref(0);
const patternLanguage = ref("US"); // What language the pattern is written in
const translatePattern = ref(false); // Whether to translate or not
const isVisible = ref(true); // Track visibility state
const translating = ref(false); // Track if translation is in progress

// Tooltip state for abbreviation expansion
const tooltipVisible = ref(false);
const tooltipPosition = ref({ x: 0, y: 0 });
const tooltipData = ref({ abbr: "", full: "" });

// Create a unique key for localStorage based on user and file
const getStorageKey = (key) => `pattern_${props.userId}_${props.fileId}_${key}`;

// Load saved preferences from localStorage
const loadSavedPreferences = () => {
  try {
    const savedLanguage = localStorage.getItem(getStorageKey("language"));
    const savedTranslate = localStorage.getItem(getStorageKey("translate"));
    const savedVisibility = localStorage.getItem(getStorageKey("visibility"));

    if (savedLanguage) {
      patternLanguage.value = savedLanguage;
    }
    if (savedTranslate !== null) {
      translatePattern.value = savedTranslate === "true";
    }
    if (savedVisibility !== null) {
      isVisible.value = savedVisibility === "true";
    }

    console.log("Loaded preferences:", {
      language: patternLanguage.value,
      translate: translatePattern.value,
      visibility: isVisible.value,
    });
  } catch (err) {
    console.error("Failed to load saved preferences:", err);
  }
};

// Save preferences to localStorage
const savePreferences = () => {
  try {
    localStorage.setItem(getStorageKey("language"), patternLanguage.value);
    localStorage.setItem(
      getStorageKey("translate"),
      translatePattern.value.toString()
    );
    localStorage.setItem(
      getStorageKey("visibility"),
      isVisible.value.toString()
    );
  } catch (err) {
    console.error("Failed to save preferences:", err);
  }
};

const fetchPattern = async () => {
  loading.value = true;
  error.value = "";

  try {
    // Load saved preferences before fetching pattern
    loadSavedPreferences();

    const result = await getFileString(props.userId, props.fileId);
    console.log("Pattern data:", result);

    if (result?.fileString) {
      const lines = JSON.parse(result.fileString);

      if (lines.length > 0) {
        patternTitle.value = lines[0];
        patternLines.value = lines.slice(1);
        originalPatternLines.value = lines.slice(1); // Store original lines
      } else {
        error.value = "Pattern is empty";
      }
    } else {
      error.value = "Pattern not found";
    }

    // Fetch the current tracking index
    await fetchCurrentIndex();
    await fetchVisibility();
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

const fetchVisibility = async () => {
  try {
    const result = await getVisibility(props.userId, props.fileId);
    console.log("Visibility result:", result);

    // api returns visibility data
    // Only update from API if no local preference is saved
    const savedVisibility = localStorage.getItem(getStorageKey("visibility"));
    if (savedVisibility === null) {
      isVisible.value = result.visible;
    }
  } catch (err) {
    console.error("Failed to fetch visibility:", err);
    // Don't set error, just log it - default to visible
  }
};

// Parse a line to identify abbreviations that can be expanded
const parseLineForAbbreviations = (line) => {
  const segments = [];
  // Split by spaces while preserving them
  const words = line.split(/(\s+)/);

  for (const word of words) {
    if (!word) continue;

    // Check if it's whitespace
    if (/^\s+$/.test(word)) {
      segments.push({ text: word, isAbbreviation: false });
      continue;
    }

    // Match patterns like: *tr, 2tr, tr, trs, etc.
    const match = word.match(/^([*\d]*)([a-zA-Z]+)(.*)$/);
    if (match) {
      const [, prefix, actualWord, suffix] = match;
      const lowerWord = actualWord.toLowerCase();

      // Common crochet abbreviations to highlight
      const commonAbbreviations = [
        "ch",
        "sc",
        "dc",
        "tr",
        "hdc",
        "dtr",
        "ss",
        "sl",
        "st",
        "sts",
        "sp",
        "inc",
        "dec",
        "yo",
        "sk",
        "rep",
      ];

      // Check if base word (without 's') is an abbreviation
      let baseWord = lowerWord;
      if (lowerWord.length > 1 && lowerWord.endsWith("s")) {
        baseWord = lowerWord.slice(0, -1);
      }

      if (
        commonAbbreviations.includes(baseWord) ||
        commonAbbreviations.includes(lowerWord)
      ) {
        segments.push({ text: word, isAbbreviation: true });
      } else {
        segments.push({ text: word, isAbbreviation: false });
      }
    } else {
      segments.push({ text: word, isAbbreviation: false });
    }
  }

  return segments;
};

// Show tooltip with abbreviation expansion
const showAbbreviationTooltip = async (event, abbr) => {
  console.log("Abbreviation clicked:", abbr);
  event.stopPropagation();

  // Extract just the letters from the abbreviation (remove prefix/suffix)
  const match = abbr.match(/^([*\d]*)([a-zA-Z]+)(.*)$/);
  if (!match) {
    console.log("No match found for:", abbr);
    return;
  }

  const [, , actualWord] = match;
  let baseWord = actualWord.toLowerCase();
  let hasPlural = false;

  // Special cases: these abbreviations should be looked up as-is
  const noPluralizationList = ["ss", "sts"];

  // Handle plural forms (but not for special cases)
  if (
    baseWord.length > 1 &&
    baseWord.endsWith("s") &&
    !noPluralizationList.includes(baseWord)
  ) {
    hasPlural = true;
    baseWord = baseWord.slice(0, -1);
  }

  console.log("Trying to expand:", baseWord, "hasPlural:", hasPlural);

  try {
    // Try to get full form from dictionary (abbreviation type)
    const fullForm = await translateAbbreviationFromL2(
      "abbreviation",
      baseWord
    );

    console.log("Got expansion:", fullForm);

    if (fullForm && fullForm.trim() !== "") {
      let displayFull = fullForm;
      if (hasPlural) {
        displayFull = fullForm + "s";
      }

      tooltipData.value = {
        abbr: abbr,
        full: displayFull,
      };

      // Position tooltip near the click
      tooltipPosition.value = {
        x: event.clientX + 10,
        y: event.clientY + 10,
      };

      tooltipVisible.value = true;
      console.log("Tooltip should be visible now");

      // Auto-hide after 3 seconds
      setTimeout(() => {
        tooltipVisible.value = false;
      }, 3000);
    } else {
      console.log("Expansion was empty or undefined");
    }
  } catch (err) {
    console.log("No expansion found for:", baseWord, err);
    // Show tooltip anyway with "No definition available"
    tooltipData.value = {
      abbr: abbr,
      full: "No definition available (add to dictionary)",
    };

    tooltipPosition.value = {
      x: event.clientX + 10,
      y: event.clientY + 10,
    };

    tooltipVisible.value = true;

    setTimeout(() => {
      tooltipVisible.value = false;
    }, 3000);
  }
};

// Translate a single line by replacing terms word by word
const translateLine = async (line, fromLang) => {
  // Split the line into words, preserving spaces
  const words = line.split(/(\s+)/);
  const translatedWords = [];
  let hasTranslation = false;

  for (const word of words) {
    // Skip empty strings and pure whitespace
    if (!word || word.trim() === "") {
      translatedWords.push(word);
      continue;
    }

    // Match patterns like: *tr, 2tr, tr, trs, or tr.
    // Captures: prefix (*, numbers, etc.) + letters + suffix (punctuation)
    const match = word.match(/^([*\d]*)([a-zA-Z]+)(.*)$/);
    if (!match) {
      // Not a word pattern (pure symbols, etc.), keep as is
      translatedWords.push(word);
      continue;
    }

    const [, prefix, actualWord, suffix] = match;

    // Check if the word ends with 's' (plural form)
    let baseWord = actualWord;
    let hasPlural = false;
    if (actualWord.length > 1 && actualWord.toLowerCase().endsWith("s")) {
      // Try without the 's' first to see if it's a plural
      baseWord = actualWord.slice(0, -1);
      hasPlural = true;
    }

    const lowerWord = baseWord.toLowerCase();

    try {
      let translatedWord;

      // Try language translation (US <-> UK)
      if (fromLang === "US") {
        translatedWord = await translateTermFromL1("language", lowerWord);
      } else {
        translatedWord = await translateTermFromL2("language", lowerWord);
      }

      // Check if translation was successful and not undefined/null/empty
      if (translatedWord && translatedWord.trim() !== "") {
        // Preserve original capitalization
        if (baseWord[0] === baseWord[0].toUpperCase()) {
          translatedWord =
            translatedWord.charAt(0).toUpperCase() + translatedWord.slice(1);
        }

        // Add back the plural 's' if it was there
        if (hasPlural) {
          translatedWord = translatedWord + "s";
        }

        console.log(
          `✓ Translated: "${prefix}${actualWord}" → "${prefix}${translatedWord}"`
        );
        translatedWords.push(prefix + translatedWord + suffix);
        hasTranslation = true;
      } else {
        // Translation returned undefined or empty
        // If it was a plural attempt, try the original word without removing 's'
        if (hasPlural) {
          try {
            const fullWordLower = actualWord.toLowerCase();
            if (fromLang === "US") {
              translatedWord = await translateTermFromL1(
                "language",
                fullWordLower
              );
            } else {
              translatedWord = await translateTermFromL2(
                "language",
                fullWordLower
              );
            }

            if (translatedWord && translatedWord.trim() !== "") {
              // Preserve original capitalization
              if (actualWord[0] === actualWord[0].toUpperCase()) {
                translatedWord =
                  translatedWord.charAt(0).toUpperCase() +
                  translatedWord.slice(1);
              }

              console.log(
                `✓ Translated: "${prefix}${actualWord}" → "${prefix}${translatedWord}"`
              );
              translatedWords.push(prefix + translatedWord + suffix);
              hasTranslation = true;
            } else {
              // Keep original
              translatedWords.push(word);
            }
          } catch (err) {
            // Keep original word
            translatedWords.push(word);
          }
        } else {
          // Keep original
          translatedWords.push(word);
        }
      }
    } catch (err) {
      // If translation fails (word not in dictionary), keep original word
      translatedWords.push(word);
    }
  }

  const result = translatedWords.join("");
  if (hasTranslation) {
    console.log(`Original: "${line}"`);
    console.log(`Result: "${result}"`);
  }
  return result;
};

// Apply translation to all pattern lines
const applyTranslation = async () => {
  if (!translatePattern.value) {
    // Reset to original lines
    patternLines.value = [...originalPatternLines.value];
    return;
  }

  translating.value = true;
  try {
    const translatedLines = [];
    let translatedCount = 0;
    let failedCount = 0;

    for (const line of originalPatternLines.value) {
      try {
        const translatedLine = await translateLine(line, patternLanguage.value);
        translatedLines.push(translatedLine);
        if (translatedLine !== line) {
          translatedCount++;
        }
      } catch (err) {
        console.error("Failed to translate line:", line, err);
        translatedLines.push(line); // Keep original line if translation fails
        failedCount++;
      }
    }

    patternLines.value = translatedLines;
    console.log(
      `Translation complete. Translated: ${translatedCount}, Failed: ${failedCount}, Total lines: ${originalPatternLines.value.length}`
    );
  } catch (err) {
    console.error("Translation failed:", err);
    alert("Translation failed. Check the dictionary for missing terms.");
    // Reset to original on complete failure
    patternLines.value = [...originalPatternLines.value];
    translatePattern.value = false;
  } finally {
    translating.value = false;
  }
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

const handleVisibility = async () => {
  try {
    // Toggle the visibility state
    isVisible.value = !isVisible.value;

    // Save to localStorage
    savePreferences();

    // Call the API to update visibility on the backend
    await setVisibility(props.userId, props.fileId, isVisible.value);

    console.log(`Visibility set to: ${isVisible.value}`);
  } catch (err) {
    console.error("Failed to set visibility:", err);
    alert(err.message || "Failed to set visibility");
    // Revert the state if API call fails
    isVisible.value = !isVisible.value;
    savePreferences();
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

// Watch for translation setting changes
watch([translatePattern, patternLanguage], async () => {
  // Save preferences when they change
  savePreferences();
  await applyTranslation();
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
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
  position: relative;
  width: 100%;
}

.language-controls-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.language-selector label {
  font-weight: 600;
  color: var(--color-text-dark);
  font-size: 0.9rem;
  white-space: nowrap;
}

.language-selector select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.9rem;
  color: var(--color-text-dark);
  background-color: white;
  cursor: pointer;
}

.language-selector select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.translation-toggle {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--color-text-dark);
  font-size: 0.9rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label span {
  white-space: nowrap;
}

.pattern-wrapper {
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

.line.dimmed {
  cursor: default;
  pointer-events: none;
}

.line.dimmed .abbreviation {
  pointer-events: auto;
  cursor: help;
}

.line:hover:not(.current-line):not(.dimmed) {
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

.abbreviation {
  color: var(--color-dark);
  text-decoration: underline;
  text-decoration-style: dotted;
  cursor: help;
  /* font-weight: 600; */
  transition: all 0.2s ease;
}

.abbreviation:hover {
  background-color: rgba(247, 202, 201, 0.2);
  text-decoration-style: solid;
}

.abbreviation-tooltip {
  position: fixed;
  background: white;
  border: 2px solid var(--color-primary);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  pointer-events: none;
  animation: tooltipFadeIn 0.2s ease-out;
  max-width: 250px;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tooltip-abbr {
  font-family: "Courier New", monospace;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-primary);
}

.tooltip-full {
  font-size: 0.85rem;
  color: var(--color-text-dark);
  font-weight: 500;
}
</style>
