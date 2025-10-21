import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}/PasswordAuthentication`,
  headers: { "Content-Type": "application/json" },
});

/**
 * @route POST api/PasswordAuthentication/register
 * @desc Creates a new user account with the provided username and password.
 */
export async function register(username, password) {
  if (typeof username !== "string" || typeof password !== "string") {
    console.error("wrong types for inputs");
    throw new TypeError("wrong types for inputs");
  }
  try {
    const response = await api.post("/register", {
      username,
      password,
    });
    return response.data.user; // returns user ID
  } catch (err) {
    console.error(err);
    throw new Error(err.response?.data?.error);
  }
}

/**
 * @route POST /api/PasswordAuthentication/authenticate
 * @desc Authenticates a user with the provided username and password.
 */
export async function authenticate(username, password) {
  if (typeof username !== "string" || typeof password !== "string") {
    console.error("wrong types for inputs");
    throw new TypeError("wrong types for inputs");
  }
  try {
    const response = await api.post("/authenticate", { username, password });
    return response.data.user; // returns user ID
  } catch (err) {
    console.error(err);
    throw new Error(err.response?.data?.error);
  }
}

/**
 * @route POST /api/PasswordAuthentication/_getUserByUsername
 * @desc Retrieves a user's document by their username
 */
export async function getUserByUsername(username) {
  if (typeof username !== "string") {
    console.error("wrong types for inputs");
    throw new TypeError("wrong types for inputs");
  }
  try {
    const response = await api.post("/_getUserByUsername", { username });
    return response.data; // returns array of user objects
  } catch (err) {
    console.error(err);
    throw new Error(err.response?.data?.error);
  }
}

/**
 * @route POST /api/PasswordAuthentication/_getUsername
 * @desc Retrieves a user's username by their id
 */
export async function getUsername(userId) {
//   if (typeof userId !== ObjectId) {
//     console.log(typeof userId);
//     console.error("wrong types for inputs");
//     throw new TypeError("wrong types for inputs");
//   }
  try {
    const response = await api.post("/_getUsername", { userId });
    return response.data; // returns array of user objects
  } catch (err) {
    console.error(err);
    throw new Error(err.response?.data?.error);
  }
}
