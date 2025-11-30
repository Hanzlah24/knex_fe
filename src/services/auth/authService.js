import api from "../config/axiosConfig";

const TOKEN_KEY = "@token";
const USER_KEY = "@user";

/**
 * Register a new user (sends signup OTP to email).
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {string} confirmation message
 */
export async function register(name, email, password) {
  try {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    return data.message;
  } catch (error) {
    console.error("Error during user registration:", error);
    throw error;
  }
}

/**
 * Verify signup OTP and complete registration.
 * @param {string} email
 * @param {string} otp
 * @returns {Object} the verified user object
 */
export async function verifyOtp(email, otp) {
  try {
    const { data } = await api.post("/auth/verify-otp", { email, otp });
    const { token, user } = data;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    console.error("Error during OTP verification:", error);
    throw error;
  }
}

/**
 * Log in an existing user.
 * @param {string} email
 * @param {string} password
 * @returns {Object} the logged-in user object
 */
export async function login(email, password) {
  try {
    const { data } = await api.post("/auth/login", { email, password });
    const { token, user } = data;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    console.error("Error during user login:", error);
    throw error;
  }
}

/**
 * Send OTP for password reset.
 * @param {string} email
 * @returns {string} confirmation message
 */
export async function forgotPassword(email) {
  try {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data.message;
  } catch (error) {
    console.error("Error during forgot password:", error);
    throw error;
  }
}

/**
 * Reset password using OTP.
 * @param {string} email
 * @param {string} otp
 * @param {string} newPassword
 * @returns {string} confirmation message
 */
export async function resetPassword(email, otp, newPassword) {
  try {
    const { data } = await api.post("/auth/reset-password", {
      email,
      otp,
      newPassword,
    });
    return data.message;
  } catch (error) {
    console.error("Error during password reset:", error);
    throw error;
  }
}

/** Log out: clear storage */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Get the raw JWT string (or null) */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/** Get the stored user object (or null) */
export function getUser() {
  const u = localStorage.getItem(USER_KEY);
  return u ? JSON.parse(u) : null;
}

/** Returns true if a token exists */
export function isLoggedIn() {
  return Boolean(getToken());
}
