import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: `${API_BASE_URL}/FileTracker`,
  headers: { "Content-Type": "application/json" },
});

/**
 * @route POST api/FileTracker/startTracking
 * @desc Creates a new file tracking record for a user and file, initializing the current position.
 */
export async function startTracking(owner, file, maxIndex) {
  if (
    typeof owner !== "string" ||
    typeof file !== "string" ||
    typeof maxIndex !== "number"
  ) {
    throw new TypeError(
      "owner and file must be strings; maxIndex must be a number"
    );
  }

  try {
    const response = await api.post("/startTracking", {
      owner,
      file,
      maxIndex,
    });
    return response.data.id;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to start tracking");
  }
}

/**
 * @route POST api/FileTracker/deleteTracking
 * @desc Deletes an existing file tracking record for a user and file.
 */
export async function deleteTracking(owner, file) {
  if (typeof owner !== "string" || typeof file !== "string") {
    throw new TypeError("owner and file must be strings");
  }

  try {
    await api.post("/deleteTracking", { owner, file });
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to delete tracking");
  }
}

/**
 * @route POST api/FileTracker/jumpTo
 * @desc Updates the current tracking position to a specified index within a file.
 * @param {string} session - The session token to authenticate the request
 * @param {string} file - The file ID
 * @param {number} index - The index to jump to
 */
export async function jumpTo(session, file, index) {
  if (
    typeof session !== "string" ||
    typeof file !== "string" ||
    typeof index !== "number"
  ) {
    throw new TypeError(
      "session and file must be strings; index must be a number"
    );
  }

  try {
    await api.post("/jumpTo", { session, file, index });
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to jump to index");
  }
}

/**
 * @route POST api/FileTracker/next
 * @desc Advances the current tracking position to the next item in the file.
 * @param {string} session - The session token to authenticate the request
 * @param {string} file - The file ID
 */
export async function next(session, file) {
  if (typeof session !== "string" || typeof file !== "string") {
    throw new TypeError("session and file must be strings");
  }

  try {
    await api.post("/next", { session, file });
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to move to next item");
  }
}

/**
 * @route POST api/FileTracker/back
 * @desc Moves the current tracking position to the previous item in the file.
 * @param {string} session - The session token to authenticate the request
 * @param {string} file - The file ID
 */
export async function back(session, file) {
  if (typeof session !== "string" || typeof file !== "string") {
    throw new TypeError("session and file must be strings");
  }

  try {
    await api.post("/back", { session, file });
  } catch (err) {
    throw new Error(
      err.response?.data?.error || "Failed to move to previous item"
    );
  }
}

/**
 * @route POST api/FileTracker/setVisibility
 * @desc Sets the visibility status of a tracked file for a user.
 * @param {string} session - The session token to authenticate the request
 * @param {string} file - The file ID
 * @param {boolean} visible - The visibility status
 */
export async function setVisibility(session, file, visible) {
  if (
    typeof session !== "string" ||
    typeof file !== "string" ||
    typeof visible !== "boolean"
  ) {
    throw new TypeError(
      "session and file must be strings; visible must be a boolean"
    );
  }

  try {
    await api.post("/setVisibility", { session, file, visible });
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to set visibility");
  }
}

/**
 * @route POST api/FileTracker/startTrackingUsingLLM
 * @desc Starts tracking a file using an LLM to determine an initial current index.
 * @param {string} session - The session token to authenticate the request
 * @param {string} file - The file ID
 * @param {string} fileInput - The file content string
 * @param {number} fileMaxIndex - The maximum index (number of lines - 1)
 */
export async function startTrackingUsingLLM(
  session,
  file,
  fileInput,
  fileMaxIndex
) {
  if (
    typeof session !== "string" ||
    typeof file !== "string" ||
    typeof fileInput !== "string" ||
    typeof fileMaxIndex !== "number"
  ) {
    throw new TypeError(
      "session, file, fileInput must be strings; fileMaxIndex must be a number"
    );
  }

  try {
    const response = await api.post("/startTrackingUsingLLM", {
      session,
      file,
      fileInput,
      fileMaxIndex,
    });
    console.log("responded! ", response);
    return response.data.id;
  } catch (err) {
    throw new Error(
      err.response?.data?.error || "Failed to start tracking using LLM"
    );
  }
}

/**
 * @route POST api/FileTracker/_getCurrentItem
 * @desc Retrieves the current tracking index for a specific file being tracked by a user.
 * @param {string} session - The session token to authenticate the request
 * @param {string} file - The file ID
 */
export async function getCurrentItem(session, file) {
  if (typeof session !== "string" || typeof file !== "string") {
    throw new TypeError("session and file must be strings");
  }

  try {
    const response = await api.post("/_getCurrentItem", {
      session,
      file,
    });
    return response.data; // array of { index: number }
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to get current item");
  }
}

/**
 * @route POST api/FileTracker/_getVisibility
 * @desc Retrieves the visibility for a specific file being tracked by a user.
 * @param {string} session - The session token to authenticate the request
 * @param {string} file - The file ID
 */
export async function getVisibility(session, file) {
  if (typeof session !== "string" || typeof file !== "string") {
    throw new TypeError("session and file must be strings");
  }

  try {
    const response = await api.post("/_getVisibility", { session, file });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to get current item");
  }
}
