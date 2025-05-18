// auth-recovery.js - Recovery and troubleshooting utilities for authentication issues

import { getUser, refreshSession } from "./supabase";
import { resetAuthState } from "./auth-status";

// Track recovery attempts to prevent infinite loops
let recoveryAttempts = 0;
const MAX_RECOVERY_ATTEMPTS = 3;
let lastRecoveryTime = 0;
const RECOVERY_COOLDOWN = 10000; // 10 seconds

/**
 * Attempt to recover from authentication errors with multiple strategies
 * @returns {Promise<Object|null>} The user object if recovery successful, null otherwise
 */
export const recoverAuthentication = async () => {
  try {
    // Prevent excessive recovery attempts
    const now = Date.now();
    if (recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
      if (now - lastRecoveryTime < RECOVERY_COOLDOWN) {
        console.log("[AUTH RECOVERY] Too many recent attempts, cooling down");
        return null;
      }
      // Reset counter after cooldown period
      recoveryAttempts = 0;
    }

    recoveryAttempts++;
    lastRecoveryTime = now;

    console.log(
      `[AUTH RECOVERY] Attempting recovery (attempt ${recoveryAttempts})`
    );

    // Strategy 1: Try to refresh the session
    console.log("[AUTH RECOVERY] Strategy 1: Session refresh");
    const refreshedUser = await refreshSession();
    if (refreshedUser) {
      console.log("[AUTH RECOVERY] Session refresh successful");
      return refreshedUser;
    }

    // Strategy 2: Check localStorage cache
    console.log("[AUTH RECOVERY] Strategy 2: Checking local storage");
    try {
      const cachedData = localStorage.getItem("nutrimood_user");
      if (cachedData) {
        const data = JSON.parse(cachedData);
        if (data && data.user && data.user.id) {
          console.log("[AUTH RECOVERY] Found valid user in localStorage");

          // Set login flag to avoid disruption
          sessionStorage.setItem("nutrimood_logged_in", "true");

          // Try to refresh in the background
          setTimeout(() => {
            refreshSession().catch(console.error);
          }, 100);

          return data.user;
        }
      }
    } catch (e) {
      console.error("[AUTH RECOVERY] localStorage error:", e);
    }

    // Strategy 3: Get a fresh user session
    console.log("[AUTH RECOVERY] Strategy 3: Get fresh user");
    try {
      const userData = await getUser();
      if (userData) {
        console.log("[AUTH RECOVERY] Got fresh user data");
        return userData;
      }
    } catch (e) {
      console.error("[AUTH RECOVERY] getUser error:", e);
    }

    // If all strategies failed
    console.log("[AUTH RECOVERY] All recovery strategies failed");
    return null;
  } catch (error) {
    console.error("[AUTH RECOVERY] Recovery error:", error);
    return null;
  }
};

/**
 * Clear all authentication data and force a clean state
 */
export const forceAuthReset = () => {
  console.log("[AUTH RECOVERY] Performing force auth reset");

  // Reset memory values
  recoveryAttempts = 0;
  lastRecoveryTime = 0;

  // Reset auth state
  resetAuthState();

  if (typeof window === "undefined") return;

  // Clear all auth-related storage
  localStorage.removeItem("nutrimood_user");
  sessionStorage.removeItem("nutrimood_logged_in");
  sessionStorage.removeItem("nutrimood_auth_state");
  sessionStorage.removeItem("nutrimood_error_shown");
  sessionStorage.setItem("nutrimood_just_logged_out", "true");

  // Attempt to clear Supabase cookies
  document.cookie.split(";").forEach((c) => {
    if (c.trim().startsWith("sb-")) {
      document.cookie =
        c.trim().split("=")[0] +
        "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  });
};

/**
 * Track whether the user is having persistent authentication issues
 * @returns {boolean} True if the user is having persistent issues
 */
export const hasPersistentAuthIssues = () => {
  return recoveryAttempts >= MAX_RECOVERY_ATTEMPTS;
};
