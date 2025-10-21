<template>
  <main class="dictionary-manager">
    <header class="header">
      <PrimaryButton @click="goBack">← Back to Library</PrimaryButton>
      <h1 class="title">Dictionary Manager</h1>
      <p class="subtitle">Add and manage crochet terminology translations</p>
    </header>

    <section class="add-term-section">
      <h2 class="section-title">Add New Term</h2>
      <form @submit.prevent="handleAddTerm" class="term-form">
        <div class="form-row">
          <div class="form-group">
            <label for="language1">English Term</label>
            <input
              id="language1"
              v-model="newTerm.language1"
              type="text"
              placeholder="e.g., single crochet"
              required
            />
          </div>

          <div class="form-group">
            <label for="language2">Translation</label>
            <input
              id="language2"
              v-model="newTerm.language2"
              type="text"
              placeholder="e.g., sc"
              required
            />
          </div>
        </div>

        <div class="form-actions">
          <PrimaryButton type="submit" :loading="adding">
            Add Term
          </PrimaryButton>
        </div>
      </form>
    </section>

    <section class="test-section">
      <h2 class="section-title">Test Translation</h2>
      <div class="test-form">
        <div class="form-row">
          <div class="form-group">
            <label for="test-input">Enter Term to Translate</label>
            <input
              id="test-input"
              v-model="testInput"
              type="text"
              placeholder="Enter a term"
            />
          </div>
          <div class="test-buttons">
            <PrimaryButton @click="translateFromL1" :loading="translating">
              English → Abbreviation
            </PrimaryButton>
            <PrimaryButton
              @click="translateFromL2"
              :loading="translating"
              variant="secondary"
            >
              Abbreviation → English
            </PrimaryButton>
          </div>
        </div>
        <div v-if="translationResult" class="translation-result">
          <strong>Translation:</strong> {{ translationResult }}
        </div>
      </div>
    </section>

    <section class="terms-list-section">
      <h2 class="section-title">Common Crochet Terms</h2>
      <div class="terms-info">
        <p class="info-text">
          Use this dictionary to translate between full crochet terms and their
          abbreviations. This helps the pattern tracker understand your patterns
          better.
        </p>
      </div>
      <div class="example-terms">
        <h3>Example Terms to Add:</h3>
        <ul>
          <li>chain → ch</li>
          <li>single crochet → sc</li>
          <li>double crochet → dc</li>
          <li>treble crochet → tr</li>
          <li>slip stitch → ss</li>
          <li>stitch → st</li>
          <li>stitches → sts</li>
          <li>repeat → rep</li>
        </ul>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import PrimaryButton from "./components/PrimaryButton.vue";
import {
  addTerm,
  translateTermFromL1,
  translateTermFromL2,
} from "./api/Dictionary";

const router = useRouter();
const route = useRoute();

const newTerm = ref({
  language1: "",
  language2: "",
});

const testInput = ref("");
const translationResult = ref("");
const adding = ref(false);
const translating = ref(false);

const handleAddTerm = async () => {
  if (!newTerm.value.language1 || !newTerm.value.language2) {
    // alert("Please provide both terms");
    return;
  }

  adding.value = true;
  try {
    await addTerm(newTerm.value.language1, newTerm.value.language2);
    // alert(`Added: "${newTerm.value.language1}" ↔ "${newTerm.value.language2}"`);

    // Clear the form
    newTerm.value.language1 = "";
    newTerm.value.language2 = "";
  } catch (err) {
    console.error("Failed to add term:", err);
    alert(err.message || "Failed to add term");
  } finally {
    adding.value = false;
  }
};

const translateFromL1 = async () => {
  if (!testInput.value) {
    // alert("Please enter a term to translate");
    return;
  }

  translating.value = true;
  try {
    const result = await translateTermFromL1(testInput.value);
    translationResult.value = result;
  } catch (err) {
    console.error("Translation failed:", err);
    translationResult.value = "Translation not found";
  } finally {
    translating.value = false;
  }
};

const translateFromL2 = async () => {
  if (!testInput.value) {
    // alert("Please enter a term to translate");
    return;
  }

  translating.value = true;
  try {
    const result = await translateTermFromL2(testInput.value);
    translationResult.value = result;
  } catch (err) {
    console.error("Translation failed:", err);
    translationResult.value = "Translation not found";
  } finally {
    translating.value = false;
  }
};

const goBack = () => {
  // Go back to the previous page or home
  router.go(-1);
};
</script>

<style scoped>
.dictionary-manager {
  padding: 2rem 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.header {
  margin-bottom: 3rem;
}

.title {
  font-size: 2.5rem;
  color: var(--color-text-dark);
  margin: 1rem 0 0.5rem 0;
}

.subtitle {
  color: var(--color-text-dark);
  opacity: 0.85;
  margin: 0;
}

.add-term-section,
.test-section,
.terms-list-section {
  background: var(--color-bg-light);
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  color: var(--color-text-dark);
  margin: 0 0 1.5rem 0;
}

.term-form {
  width: 100%;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: var(--color-text-dark);
  margin-bottom: 0.5rem;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.test-form {
  width: 100%;
}

.test-buttons {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.translation-result {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border-left: 4px solid var(--color-primary);
  font-size: 1.1rem;
}

.terms-info {
  margin-bottom: 1.5rem;
}

.info-text {
  color: var(--color-text-dark);
  opacity: 0.85;
  line-height: 1.6;
  margin: 0;
}

.example-terms {
  background: white;
  padding: 1.5rem;
  border-radius: 6px;
}

.example-terms h3 {
  margin: 0 0 1rem 0;
  color: var(--color-text-dark);
}

.example-terms ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.example-terms li {
  padding: 0.5rem;
  background: var(--color-bg-light);
  border-radius: 4px;
  color: var(--color-text-dark);
  font-family: "Courier New", monospace;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .test-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .example-terms ul {
    grid-template-columns: 1fr;
  }
}
</style>
