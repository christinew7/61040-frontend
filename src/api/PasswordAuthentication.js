import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/**
 * @route POST /PasswordAuthentication/register
 * @desc Creates a new user account with the provided username and password.
 */
export async function register(username, password) {
  if (typeof username !== "string" || typeof password !== "string") {
    throw new TypeError("wrong types for inputs");
  }
  try {
    const response = await api.post("/PasswordAuthentication/register", {
      username,
      password,
    });
    return response.data.user; // returns user ID
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
}

/**
 * @route POST /PasswordAuthentication/authenticate
 * @desc Authenticates a user and returns session token
 */
export async function authenticate(username, password) {
  if (typeof username !== "string" || typeof password !== "string") {
    throw new TypeError("wrong types for inputs");
  }
  try {
    const response = await api.post("/PasswordAuthentication/authenticate", {
      username,
      password,
    });
    return {
      user: response.data.user,
      session: response.data.session,
    };
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
}

/**
 * @route POST /PasswordAuthentication/_getUsername
 * @desc Retrieves username for a given session token
 */
export async function getUsername(session) {
  if (typeof session !== "string")
    throw new TypeError("session must be string");

  console.log("getUsername called with session:", session);

  try {
    const response = await api.post("/PasswordAuthentication/_getUsername", {
      session,
    });
    console.log("getUsername response:", response);
    console.log("getUsername response.data:", response.data);

    // Backend is returning {username: null}, which means session isn't valid
    if (response.data.username === null) {
      console.error(
        "Backend returned null username - session may be invalid or expired"
      );
      throw new Error("Session is invalid or expired. Please log in again.");
    }

    // Handle different possible response structures
    if (response.data.username) {
      return response.data; // { username, userId }
    } else if (response.data.data && response.data.data.username) {
      return response.data.data; // nested structure
    } else {
      console.error("Unexpected response structure:", response.data);
      throw new Error("Username not found in response");
    }
  } catch (err) {
    console.error("getUsername error:", err);
    throw new Error(err.response?.data?.error || err.message);
  }
}

/**
 * @route POST /PasswordAuthentication/_getUserByUsername
 * @desc Retrieves user ID by username
 */
export async function getUserByUsername(username) {
  if (typeof username !== "string")
    throw new TypeError("username must be string");
  try {
    const response = await api.post(
      "/PasswordAuthentication/_getUserByUsername",
      {
        username,
      }
    );
    return response.data; // { userId }
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
}

/**
 * @route POST /logout
 * @desc Logs out the user by deleting their session
 */
export async function logout(session) {
  if (typeof session !== "string")
    throw new TypeError("session must be string");
  try {
    const response = await api.post("/logout", { session });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
}
