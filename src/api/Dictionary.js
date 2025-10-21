// src/api/Dictionary.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create an Axios instance for the Dictionary concept
const api = axios.create({
  baseURL: `${API_BASE_URL}/Dictionary`,
  headers: { "Content-Type": "application/json" },
});

/**
 * @route POST api/Dictionary/addTerm
 * @desc Adds a new term pair (a word in one language and its translation in another) to the dictionary.
 */
export async function addTerm(type, language1, language2) {
  if (
    typeof type !== "string" ||
    (type !== "language" && type !== "abbreviation")
  ) {
    throw new TypeError(
      `type ${type} is incorrect. Must be 'language' or 'abbreviation'.`
    );
  }
  if (typeof language1 !== "string" || typeof language2 !== "string") {
    throw new TypeError("language1 and language2 must be strings");
  }

  try {
    const response = await api.post("/addTerm", { type, language1, language2 });
    return response.data.id;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to add term");
  }
}

/**
 * @route POST api/Dictionary/deleteTerm
 * @desc Deletes a specific term pair from the dictionary.
 */
export async function deleteTerm(language1, language2) {
  if (typeof language1 !== "string" || typeof language2 !== "string") {
    throw new TypeError("language1 and language2 must be strings");
  }

  try {
    await api.post("/deleteTerm", { language1, language2 });
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to delete term");
  }
}

/**
 * @route POST api/Dictionary/translateTermFromL1
 * @desc Translates a given word from language1 to language2.
 */
export async function translateTermFromL1(language1) {
  if (typeof language1 !== "string") {
    throw new TypeError("language1 must be a string");
  }

  try {
    const response = await api.post("/translateTermFromL1", { language1 });
    return response.data.language2;
  } catch (err) {
    throw new Error(
      err.response?.data?.error || "Failed to translate term from L1"
    );
  }
}

/**
 * @route POST api/Dictionary/translateTermFromL2
 * @desc Translates a given word from language2 to language1.
 */
export async function translateTermFromL2(language2) {
  if (typeof language2 !== "string") {
    throw new TypeError("language2 must be a string");
  }

  try {
    const response = await api.post("/translateTermFromL2", { language2 });
    return response.data.language1;
  } catch (err) {
    throw new Error(
      err.response?.data?.error || "Failed to translate term from L2"
    );
  }
}
