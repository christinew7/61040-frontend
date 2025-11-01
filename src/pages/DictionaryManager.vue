<template>
  <NavBar></NavBar>
  <main class="dictionary-manager">
    <header class="header">
      <PrimaryButton @click="goBack">← Back to Library</PrimaryButton>
      <h1 class="title">Dictionary Manager</h1>
      <p class="subtitle">Add and manage crochet terminology translations</p>
    </header>

    <Warning
      v-if="showWarning"
      :message="warningMessage"
      @close="showWarning = false"
    />
    <section class="add-term-section">
      <h2 class="section-title">Add US → UK Translation</h2>
      <form @submit.prevent="handleAddLanguageTerm" class="term-form">
        <div class="form-row">
          <div class="form-group">
            <label for="us-term">US English Term</label>
            <input
              id="us-term"
              v-model="languageTerm.language1"
              type="text"
              placeholder="e.g., single crochet"
              required
            />
          </div>

          <div class="form-group">
            <label for="uk-term">UK English Term</label>
            <input
              id="uk-term"
              v-model="languageTerm.language2"
              type="text"
              placeholder="e.g., double crochet"
              required
            />
          </div>
        </div>

        <div class="form-actions">
          <PrimaryButton type="submit" :loading="addingLanguage">
            Add US → UK Term
          </PrimaryButton>
        </div>
      </form>
    </section>

    <section class="add-term-section">
      <h2 class="section-title">Add Full Name → Abbreviation</h2>
      <form @submit.prevent="handleAddAbbreviationTerm" class="term-form">
        <div class="form-row">
          <div class="form-group">
            <label for="full-name">Full Name</label>
            <input
              id="full-name"
              v-model="abbreviationTerm.language1"
              type="text"
              placeholder="e.g., single crochet"
              required
            />
          </div>

          <div class="form-group">
            <label for="abbreviation">Abbreviation</label>
            <input
              id="abbreviation"
              v-model="abbreviationTerm.language2"
              type="text"
              placeholder="e.g., sc"
              required
            />
          </div>
        </div>

        <div class="form-actions">
          <PrimaryButton type="submit" :loading="addingAbbreviation">
            Add Abbreviation
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
      <h2 class="section-title">Example Terms</h2>
      <div class="terms-info">
        <p class="info-text">
          Use these dictionaries to translate between US/UK terminology and
          full/abbreviated crochet terms. This helps the pattern tracker
          understand your patterns better.
        </p>
      </div>

      <div class="example-terms">
        <h3>US → UK Translations:</h3>
        <ul>
          <li>single crochet (US) → double crochet (UK)</li>
          <li>double crochet (US) → treble crochet (UK)</li>
          <li>half double crochet (US) → half treble crochet (UK)</li>
          <li>treble crochet (US) → double treble crochet (UK)</li>
          <li>skip (US) → miss (UK)</li>
        </ul>
      </div>

      <div class="example-terms">
        <h3>Full Name → Abbreviation:</h3>
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
import "./DictionaryManager.css";
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import PrimaryButton from "../components/PrimaryButton.vue";
import {
  addTerm,
  translateTermFromL1,
  translateTermFromL2,
} from "../api/Dictionary";
import NavBar from "../components/NavBar.vue";
import Warning from "../components/Warning.vue";

const router = useRouter();
const route = useRoute();

const languageTerm = ref({
  language1: "",
  language2: "",
});

const abbreviationTerm = ref({
  language1: "",
  language2: "",
});

const testInput = ref("");
const translationResult = ref("");
const addingLanguage = ref(false);
const addingAbbreviation = ref(false);
const translating = ref(false);

const warningMessage = ref("");
const showWarning = ref(false);

const handleAddLanguageTerm = async () => {
  if (!languageTerm.value.language1 || !languageTerm.value.language2) {
    warningMessage.value = "Please provide both US and UK terms.";
    showWarning.value = true;
    return;
  }

  addingLanguage.value = true;
  try {
    await addTerm(
      "language",
      languageTerm.value.language1,
      languageTerm.value.language2
    );

    // Clear the form
    languageTerm.value.language1 = "";
    languageTerm.value.language2 = "";
  } catch (err) {
    warningMessage.value = "Failed to add language term";
    showWarning.value = true;
  } finally {
    addingLanguage.value = false;
  }
};

const handleAddAbbreviationTerm = async () => {
  if (!abbreviationTerm.value.language1 || !abbreviationTerm.value.language2) {
    warningMessage.value = "Please provide both full name and abbreviation";
    showWarning.value = true;
    return;
  }

  addingAbbreviation.value = true;
  try {
    await addTerm(
      "abbreviation",
      abbreviationTerm.value.language1,
      abbreviationTerm.value.language2
    );

    // Clear the form
    abbreviationTerm.value.language1 = "";
    abbreviationTerm.value.language2 = "";
  } catch (err) {
    warningMessage.value = "Failed to add abbreviation";
    showWarning.value = true;
  } finally {
    addingAbbreviation.value = false;
  }
};

const translateFromL1 = async () => {
  if (!testInput.value) {
    warningMessage.value = "Please enter a term to translate!";
    showWarning.value = true;
    return;
  }

  translating.value = true;
  try {
    const result = await translateTermFromL1(testInput.value);
    translationResult.value = result;
  } catch (err) {
    warningMessage.value = "Translation not found...";
    showWarning.value = true;
    translationResult.value = "Translation not found";
  } finally {
    translating.value = false;
  }
};

const translateFromL2 = async () => {
  if (!testInput.value) {
    warningMessage.value = "Please enter a term to translate";
    showWarning.value = true;
    return;
  }

  translating.value = true;
  try {
    const result = await translateTermFromL2(testInput.value);
    translationResult.value = result;
  } catch (err) {
    warningMessage.value = "Translation not found...";
    showWarning.value = true;
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
