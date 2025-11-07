// src/api/Library.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
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
 * @param {string} session - The session token to authenticate the request
 */
export async function createFile(session) {
  if (typeof session !== "string")
    throw new TypeError("session must be a string");
  try {
    const response = await api.post("/createFile", { session });
    return response.data.id;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to create file");
  }
}

/**
 * @route POST /api/Library/addItemToFile
 * @desc Adds an item to the items list of this file.
 * @param {string} session - The session token to authenticate the request
 * @param {string} file - The file ID
 * @param {string} item - The item to add
 */
export async function addItemToFile(session, file, item) {
  if (
    typeof session !== "string" ||
    typeof file !== "string" ||
    typeof item !== "string"
  ) {
    throw new TypeError("session, file, and item must be strings");
  }
  try {
    await api.post("/addItemToFile", { session, file, item });
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
 * @param {string} session - The session token to authenticate the request
 */
export async function getAllFiles(session) {
  if (typeof session !== "string")
    throw new TypeError("session must be a string");
  console.log("getAllFiles called with session:", session);
  console.log("Sending request body:", { session });
  try {
    const response = await api.post("/_getAllFiles", { session });
    console.log("getAllFiles response:", response.data);
    return response.data; // array of files
  } catch (err) {
    console.error("getAllFiles error:", err.response?.data);
    throw new Error(err.response?.data?.error || "Failed to get all files");
  }
}

/**
 * @route POST /api/Library/_getFileString
 * @desc Returns the items list of the specified file as a JSON string.
 * @param {string} session - The session token to authenticate the request
 * @param {string} file - The file ID
 */
export async function getFileString(session, file) {
  if (typeof session !== "string" || typeof file !== "string") {
    throw new TypeError("session and file must be strings");
  }
  try {
    const response = await api.post("/_getFileString", { session, file });
    return response.data; // array of { fileString: string }
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to get file string");
  }
}

/**
 * @route POST /api/Library/setImageToFile
 * @desc Sets the image field of this file to image.
 * @param {string} session - The session token to authenticate the request
 * @param {string} file - The file ID
 * @param {string} image - The base64 image data
 */
export async function setImageToFile(session, file, image) {
  if (
    typeof session !== "string" ||
    typeof file !== "string" ||
    typeof image !== "string"
  ) {
    throw new TypeError("session, file, and image must be strings");
  }
  try {
    await api.post("/setImageToFile", { session, file, image });
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to set image to file");
  }
}

/**
 * @route POST /api/Library/clearImageFromFile
 * @desc Clears the image field of this file (sets to null).
 * @param {string} session - The session token to authenticate the request
 * @param {string} file - The file ID
 */
export async function clearImageFromFile(session, file) {
  if (typeof session !== "string" || typeof file !== "string") {
    throw new TypeError("session and file must be strings");
  }
  try {
    await api.post("/clearImageFromFile", { session, file });
  } catch (err) {
    throw new Error(
      err.response?.data?.error || "Failed to clear image from file"
    );
  }
}
