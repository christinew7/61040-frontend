// src/api/Library.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const api = axios.create({
  baseURL: `${API_BASE_URL}/Library`,
  headers: { "Content-Type": "application/json" },
});

/**
 * @route POST /api/Library/create
 * @desc Creates a new Library with this owner and an empty set of Files.
 */
export async function createLibrary(owner) {
  if (typeof owner !== "string") throw new TypeError("owner must be a string");
  try {
    const response = await api.post("/create", { owner });
    return response.data.library;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to create library");
  }
}

/**
 * @route POST /api/Library/delete
 * @desc Deletes this owner's Library and all associated Files.
 */
export async function deleteLibrary(owner) {
  if (typeof owner !== "string") throw new TypeError("owner must be a string");
  try {
    await api.post("/delete", { owner });
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to delete library");
  }
}

/**
 * @route POST /api/Library/createFile
 * @desc Creates a File with the current DateTime and empty items, and adds it to this owner's Library.
 */
export async function createFile(owner) {
//   if (typeof owner !== "string") throw new TypeError("owner must be a string");
  try {
    const response = await api.post("/createFile", { owner });
    return response.data.id;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to create file");
  }
}

/**
 * @route POST /api/Library/addItemToFile
 * @desc Adds an item to the items list of this file.
 */
export async function addItemToFile(owner, file, item) {
  if (
    typeof owner !== "string" ||
    typeof file !== "string" ||
    typeof item !== "string"
  ) {
    throw new TypeError("owner, file, and item must be strings");
  }
  try {
    await api.post("/addItemToFile", { owner, file, item });
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to add item to file");
  }
}

/**
 * @route POST /api/Library/modifyItemInFile
 * @desc Replaces the item at index in file.items with newItem.
 */
export async function modifyItemInFile(owner, file, index, newItem) {
  if (
    typeof owner !== "string" ||
    typeof file !== "string" ||
    typeof index !== "number" ||
    typeof newItem !== "string"
  ) {
    throw new TypeError(
      "owner, file, newItem must be strings; index must be a number"
    );
  }
  try {
    await api.post("/modifyItemInFile", { owner, file, index, newItem });
  } catch (err) {
    throw new Error(
      err.response?.data?.error || "Failed to modify item in file"
    );
  }
}

/**
 * @route POST /api/Library/removeItemFromFile
 * @desc Removes the item at index from file.items.
 */
export async function removeItemFromFile(owner, file, index) {
  if (
    typeof owner !== "string" ||
    typeof file !== "string" ||
    typeof index !== "number"
  ) {
    throw new TypeError("owner, file must be strings; index must be a number");
  }
  try {
    await api.post("/removeItemFromFile", { owner, file, index });
  } catch (err) {
    throw new Error(
      err.response?.data?.error || "Failed to remove item from file"
    );
  }
}

/**
 * @route POST /api/Library/deleteFile
 * @desc Deletes this file from this owner's Library.
 */
export async function deleteFile(owner, file) {
  if (typeof owner !== "string" || typeof file !== "string") {
    throw new TypeError("owner and file must be strings");
  }
  try {
    await api.post("/deleteFile", { owner, file });
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to delete file");
  }
}

/**
 * @route POST /api/Library/_getAllFiles
 * @desc Returns all Files in this owner's Library (full FileDoc objects, not just IDs).
 */
export async function getAllFiles(owner) {
  if (typeof owner !== "string") throw new TypeError("owner must be a string");
  try {
    const response = await api.post("/_getAllFiles", { owner });
    return response.data; // array of files
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to get all files");
  }
}

/**
 * @route POST /api/Library/_getFileString
 * @desc Returns the items list of the specified file as a JSON string.
 */
export async function getFileString(owner, file) {
  if (typeof owner !== "string" || typeof file !== "string") {
    throw new TypeError("owner and file must be strings");
  }
  try {
    const response = await api.post("/_getFileString", { owner, file });
    return response.data; // array of { fileString: string }
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to get file string");
  }
}
