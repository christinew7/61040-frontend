<template>
  <Warning
    v-if="showWarning"
    :message="warningMessage"
    @close="showWarning = false"
  />
  <NavBar :userId="userId" class="navbar" />
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
            :aria-label="isVisible ? 'Show pattern' : 'Hide pattern'"
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
                  @mouseenter="showAbbreviationTooltip($event, segment.text)"
                  @mouseleave="hideAbbreviationTooltip"
                >
                  {{ segment.text }}
                </span>
                <span v-else>{{ segment.text }}</span>
              </span>
            </div>
          </div>

          <!-- Tooltip for abbreviation expansion -->
          <AbbreviationTooltip
            :show="tooltipVisible"
            :abbreviation="tooltipData.abbr"
            :fullText="tooltipData.full"
            :position="tooltipPosition"
          />

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
              @keyup.down="handleBack"
            />
            <IconButton
              icon="↓"
              label=""
              aria-label="Go to next line"
              variant="primary"
              :disabled="currentIndex >= patternLines.length"
              @click="handleNext"
              @keyup.up="handleNext"
            />
          </aside>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup>
import "./Pattern.css";
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import NavBar from "../components/NavBar.vue";
import PrimaryButton from "../components/PrimaryButton.vue";
import IconButton from "../components/IconButton.vue";
import Warning from "../components/Warning.vue";
import AbbreviationTooltip from "../components/AbbreviationTooltip.vue";
import { getFileString } from "../api/Library";
import {
  jumpTo,
  next,
  back,
  getCurrentItem,
  setVisibility,
  getVisibility,
} from "../api/FileTracker";
import { translateTermFromL1, translateTermFromL2 } from "../api/Dictionary";
import { translateTermFromL2 as translateAbbreviationFromL2 } from "../api/Dictionary";

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
const dataLoaded = ref(false); // Track if pattern data has been loaded

// Tooltip state for abbreviation expansion
const tooltipVisible = ref(false);
const tooltipPosition = ref({ x: 0, y: 0 });
const tooltipData = ref({ abbr: "", full: "" });

// Warning state
const showWarning = ref(false);
const warningMessage = ref("");

// Create a unique key for localStorage based on user and file
const getStorageKey = (key) => `pattern_${props.userId}_${props.fileId}_${key}`;

// Get cache key for translated patterns
const getTranslationCacheKey = (targetLang) =>
  `pattern_${props.userId}_${props.fileId}_translated_${targetLang}`;

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

// Load cached translation from localStorage
const loadCachedTranslation = (targetLang) => {
  try {
    const cacheKey = getTranslationCacheKey(targetLang);
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsedCache = JSON.parse(cached);

      return parsedCache.lines;
    }
  } catch (err) {
    console.error("Failed to load cached translation:", err);
  }
  return null;
};

// Save translated pattern to localStorage
const saveCachedTranslation = (targetLang, translatedLines) => {
  try {
    const cacheKey = getTranslationCacheKey(targetLang);
    const cacheData = {
      lines: translatedLines,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`Saved translated pattern cache for ${targetLang}`);
  } catch (err) {
    console.error("Failed to save cached translation:", err);
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
    const result = await getFileString(props.userId, props.fileId);
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

    // Load saved preferences AFTER pattern data is loaded
    loadSavedPreferences();

    // Mark data as loaded
    dataLoaded.value = true;
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

    // Check if we have a saved preference in localStorage first
    const savedVisibility = localStorage.getItem(getStorageKey("visibility"));

    if (savedVisibility !== null) {
      // localStorage takes precedence - will be loaded by loadSavedPreferences()
      console.log("Using localStorage visibility preference");
      return;
    }
    // No localStorage preference - use API's has a value
    if (result && result.visible !== undefined) {
      isVisible.value = result.visible;
      console.log("Using API visibility:", result.visible);
    }
  } catch (err) {
    console.error("Failed to fetch visibility:", err);
    // On error, keep the default true value
    isVisible.value = true;
  }
};

// Parse a line to identify abbreviations that can be expanded
const parseLineForAbbreviations = (line) => {
  const segments = [];

  // Multi-word abbreviations to check first (order matters - check longer phrases first)
  const multiWordAbbreviations = ["inv dec", "inv inc"];

  // Common single-word crochet abbreviations
  const singleWordAbbreviations = [
    "slst",
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
    "mr",
  ];

  let remainingLine = line;
  let currentIndex = 0;

  while (currentIndex < line.length) {
    let matched = false;

    // Check for multi-word abbreviations first
    for (const multiAbbr of multiWordAbbreviations) {
      const restOfLine = line.slice(currentIndex);
      const pattern = new RegExp(
        `^([*\\d]*)(${multiAbbr.replace(" ", "\\s+")})(\\s|[.,;:!?]|$)`,
        "i"
      );
      const match = restOfLine.match(pattern);

      if (match) {
        const [fullMatch, prefix, abbr, suffix] = match;
        const matchLength = prefix.length + abbr.length;

        segments.push({
          text: prefix + abbr,
          isAbbreviation: true,
        });

        currentIndex += matchLength;
        matched = true;
        break;
      }
    }

    if (matched) continue;

    // Check for single words
    const restOfLine = line.slice(currentIndex);
    const wordMatch = restOfLine.match(/^(\s+)/);

    if (wordMatch) {
      // It's whitespace
      segments.push({ text: wordMatch[0], isAbbreviation: false });
      currentIndex += wordMatch[0].length;
      continue;
    }

    // Match patterns like: *tr, 2tr, tr, trs, etc.
    const abbrMatch = restOfLine.match(/^([*\d]*)([a-zA-Z]+)/);
    if (abbrMatch) {
      const [fullMatch, prefix, actualWord] = abbrMatch;
      const lowerWord = actualWord.toLowerCase();

      // Check if base word (without 's') is an abbreviation
      let baseWord = lowerWord;
      if (lowerWord.length > 1 && lowerWord.endsWith("s")) {
        baseWord = lowerWord.slice(0, -1);
      }

      if (
        singleWordAbbreviations.includes(baseWord) ||
        singleWordAbbreviations.includes(lowerWord)
      ) {
        segments.push({ text: fullMatch, isAbbreviation: true });
      } else {
        segments.push({ text: fullMatch, isAbbreviation: false });
      }

      currentIndex += fullMatch.length;
      continue;
    }

    // Not a word or abbreviation, just take the next character
    segments.push({ text: line[currentIndex], isAbbreviation: false });
    currentIndex++;
  }

  return segments;
};

// Show tooltip with abbreviation expansion
const showAbbreviationTooltip = async (event, abbr) => {
  console.log("Abbreviation clicked:", abbr);
  event.stopPropagation();

  // Check if it's a multi-word abbreviation (contains space)
  if (abbr.includes(" ") || /\s/.test(abbr)) {
    // Multi-word abbreviation - look it up as-is
    const cleanAbbr = abbr.trim().toLowerCase();

    try {
      const fullForm = await translateAbbreviationFromL2(
        "abbreviation",
        cleanAbbr
      );

      if (fullForm && fullForm.trim() !== "") {
        tooltipData.value = {
          abbr: abbr.trim(),
          full: fullForm,
        };
      } else {
        tooltipData.value = {
          abbr: abbr.trim(),
          full: "No definition available (add to dictionary)",
        };
      }

      // Position tooltip
      const targetElement = event.target;
      const rect = targetElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;

      tooltipPosition.value = {
        x: centerX,
        y: rect.top - 10,
      };

      tooltipVisible.value = true;
      return;
    } catch (err) {
      console.log("No expansion found for multi-word:", cleanAbbr, err);
      tooltipData.value = {
        abbr: abbr.trim(),
        full: "No definition available (add to dictionary)",
      };

      const targetElement = event.target;
      const rect = targetElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;

      tooltipPosition.value = {
        x: centerX,
        y: rect.top - 10,
      };

      tooltipVisible.value = true;
      return;
    }
  }

  // Single-word abbreviation - extract just the letters from the abbreviation (remove prefix/suffix)
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
      let displayAbbr = actualWord; // Show only the letter part, not prefix/suffix

      if (hasPlural) {
        displayFull = fullForm + "s";
        // Keep the 's' in the abbreviation display too
        displayAbbr = actualWord;
      }

      tooltipData.value = {
        abbr: displayAbbr,
        full: displayFull,
      };

      // Position tooltip centered above the clicked abbreviation
      // Get the clicked element's position
      const targetElement = event.target;
      const rect = targetElement.getBoundingClientRect();

      // Calculate center of the abbreviation
      const centerX = rect.left + rect.width / 2;

      // Position above the text with some spacing
      // Note: We'll use transform in CSS to center horizontally
      tooltipPosition.value = {
        x: centerX,
        y: rect.top - 10, // 10px above the text
      };

      tooltipVisible.value = true;
      console.log("Tooltip should be visible now");
    } else {
      console.log("Expansion was empty or undefined");
    }
  } catch (err) {
    console.log("No expansion found for:", baseWord, err);
    // Show tooltip anyway with "No definition available"
    tooltipData.value = {
      abbr: actualWord, // Show only the letter part, not prefix/suffix
      full: "No definition available (add to dictionary)",
    };

    // Position tooltip centered above the clicked abbreviation
    const targetElement = event.target;
    const rect = targetElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    tooltipPosition.value = {
      x: centerX,
      y: rect.top - 10,
    };

    tooltipVisible.value = true;

    setTimeout(() => {
      tooltipVisible.value = false;
    }, 3000);
  }
};

const hideAbbreviationTooltip = async () => {
  tooltipVisible.value = false;
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
    // Determine target language (opposite of pattern language)
    const targetLang = patternLanguage.value === "US" ? "UK" : "US";

    console.log(
      `Attempting to translate from ${patternLanguage.value} to ${targetLang}`
    );

    // Try to load from cache first
    const cachedTranslation = loadCachedTranslation(targetLang);
    if (
      cachedTranslation &&
      cachedTranslation.length === originalPatternLines.value.length
    ) {
      console.log(
        `✓ Using cached translation to ${targetLang} (${cachedTranslation.length} lines)`
      );
      patternLines.value = cachedTranslation;
      translating.value = false;
      return;
    }

    // No cache found, perform translation
    console.log(
      `No valid cache found, translating from ${patternLanguage.value} to ${targetLang}...`
    );
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

    // Save the translation to cache
    saveCachedTranslation(targetLang, translatedLines);

    console.log(
      `Translation complete. Translated: ${translatedCount}, Failed: ${failedCount}, Total lines: ${originalPatternLines.value.length}`
    );
  } catch (err) {
    console.error("Translation failed:", err);
    warningMessage.value =
      "Translation failed. Check the dictionary for missing terms.";
    showWarning.value = true;

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
    warningMessage.value = err.message || "Failed to move to next line";
    showWarning.value = true;
  }
};

const handleBack = async () => {
  try {
    await back(props.userId, props.fileId);
    await fetchCurrentIndex();
    await updateControlsPosition();
  } catch (err) {
    console.error("Failed to move to previous line:", err);
    warningMessage.value = err.message || "Failed to move to previous line";
    showWarning.value = true;
  }
};

const handleLineClick = async (lineIndex) => {
  try {
    await jumpTo(props.userId, props.fileId, lineIndex);
    await fetchCurrentIndex();
    await updateControlsPosition();
  } catch (err) {
    console.error("Failed to jump to line:", err);
    warningMessage.value = err.message || "Failed to jump to line";
    showWarning.value = true;
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

    // If turning visibility on, scroll to current line
    if (isVisible.value) {
      await updateControlsPosition();
    }

    console.log(`Visibility set to: ${isVisible.value}`);
  } catch (err) {
    console.error("Failed to set visibility:", err);
    warningMessage.value = err.message || "Failed to set visibility";
    showWarning.value = true;
    // Revert the state if API call fails
    isVisible.value = !isVisible.value;
    savePreferences();
  }
};

// Handle keyboard navigation
const handleKeyDown = async (event) => {
  // Don't handle if an input, select, or textarea is focused (but allow buttons)
  const activeElement = document.activeElement;
  if (
    activeElement &&
    (activeElement.tagName === "INPUT" ||
      activeElement.tagName === "SELECT" ||
      activeElement.tagName === "TEXTAREA")
  ) {
    return;
  }

  // Handle 'n' key for toggling visibility
  if (event.key === "n" || event.key === "N") {
    event.preventDefault();
    await handleVisibility();
    return;
  }

  // Only handle arrow keys when visibility is on
  if (!isVisible.value) return;

  if (event.key === "ArrowUp") {
    event.preventDefault();
    // Blur any focused button to remove focus highlight
    if (activeElement && activeElement.tagName === "BUTTON") {
      activeElement.blur();
    }
    if (currentIndex.value > 1) {
      await handleBack();
    }
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    // Blur any focused button to remove focus highlight
    if (activeElement && activeElement.tagName === "BUTTON") {
      activeElement.blur();
    }
    if (currentIndex.value < patternLines.value.length) {
      await handleNext();
    }
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
  // Only trigger if data is loaded
  if (!dataLoaded.value) {
    console.log("Data not loaded yet, skipping translation");
    return;
  }

  // Save preferences when they change
  savePreferences();
  await applyTranslation();
});

onMounted(async () => {
  await fetchPattern();
  await updateControlsPosition();
  // Apply translation if it was enabled in preferences
  if (translatePattern.value) {
    await applyTranslation();
  }

  // Add keyboard event listener
  window.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  // Remove keyboard event listener
  window.removeEventListener("keydown", handleKeyDown);
});
</script>
