// session-manager.js - Centralized session management

import { supabase, getUser, refreshSession } from "./supabase";
import { getAuthState, setAuthState, resetAuthState } from "./auth-status";

// Constants
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000; // Refresh if less than 10 minutes remaining

class SessionManager {
  constructor() {
    this.initialized = false;
    this.checkTimer = null;
    this.sessionExpiryTime = null;
  }

  // Initialize the session manager
  init() {
    if (typeof window === "undefined" || this.initialized) return;

    console.log("[SESSION] Initializing SessionManager");
    this.initialized = true;

    // Setup event listeners
    this.setupEventListeners();

    // Start session monitoring
    this.startSessionMonitoring();

    // Handle initial page load
    this.handleVisibilityChange();
  }

  // Setup visibility and focus event listeners
  setupEventListeners() {
    // Handle tab/window focus changes
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this)
    );

    // Handle window focus events
    window.addEventListener("focus", this.handleWindowFocus.bind(this));

    // Listen for auth state changes from Supabase
    supabase.auth.onAuthStateChange(this.handleAuthStateChange.bind(this));
  }

  // Start periodic session monitoring
  startSessionMonitoring() {
    // Clear any existing timer
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }

    // Set up periodic checks
    this.checkTimer = setInterval(
      this.checkSession.bind(this),
      SESSION_CHECK_INTERVAL
    );

    // Do an initial check
    this.checkSession();
  }

  // Handle visibility change events (tab focus/blur)
  handleVisibilityChange() {
    if (document.visibilityState === "visible") {
      console.log("[SESSION] Tab became visible, checking session");
      this.checkSession();
    }
  }

  // Handle window focus events
  handleWindowFocus() {
    console.log("[SESSION] Window focused, checking session");
    this.checkSession();
  }

  // Handle Supabase auth state changes
  handleAuthStateChange(event, session) {
    console.log("[SESSION] Auth state changed:", event);

    switch (event) {
      case "SIGNED_IN":
        this.handleSignIn(session);
        break;
      case "SIGNED_OUT":
        this.handleSignOut();
        break;
      case "TOKEN_REFRESHED":
        this.handleTokenRefresh(session);
        break;
      case "USER_UPDATED":
        this.handleUserUpdate(session);
        break;
    }
  }

  // Handle sign in events
  handleSignIn(session) {
    if (!session) return;

    console.log("[SESSION] User signed in");
    this.updateSessionData(session);

    // Update auth state
    setAuthState({
      isLoggedIn: true,
      user: session.user,
    });

    // Store session data
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "nutrimood_user",
        JSON.stringify({
          user: session.user,
          timestamp: Date.now(),
        })
      );
      sessionStorage.setItem("nutrimood_logged_in", "true");
    }
  }

  // Handle sign out events
  handleSignOut() {
    console.log("[SESSION] User signed out");
    this.sessionExpiryTime = null;

    // Reset auth state
    resetAuthState();
  }

  // Handle token refresh events
  handleTokenRefresh(session) {
    if (!session) return;

    console.log("[SESSION] Token refreshed");
    this.updateSessionData(session);
  }

  // Handle user update events
  handleUserUpdate(session) {
    if (!session) return;

    console.log("[SESSION] User updated");
    this.updateSessionData(session);

    // Update auth state with new user data
    setAuthState({
      isLoggedIn: true,
      user: session.user,
    });
  }

  // Update session data
  updateSessionData(session) {
    if (!session) return;

    // Calculate token expiry time
    const expiresAt = session.expires_at * 1000; // Convert to milliseconds
    this.sessionExpiryTime = expiresAt;

    console.log(
      "[SESSION] Session updated, expires at:",
      new Date(expiresAt).toLocaleString()
    );
  }
  // Track the last session check time to prevent excessive checks
  lastCheckTime = 0;
  isChecking = false;

  // Check session validity and refresh if needed
  async checkSession() {
    try {
      // Prevent multiple simultaneous checks
      if (this.isChecking) {
        console.log("[SESSION] Session check already in progress, skipping");
        return;
      }
      // Prevent too frequent checks - limit to once every 5 seconds
      const now = Date.now();
      if (now - this.lastCheckTime < 5000) {
        console.log("[SESSION] Session checked too recently, skipping");
        return;
      }
      this.isChecking = true;
      this.lastCheckTime = now;
      // Get current session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        // Only log, never throw, even if session missing
        console.error("[SESSION] Error getting session (non-fatal):", error);
        return;
      }
      if (!session) {
        console.log(
          "[SESSION] No active session (not logged in, this is fine on public pages)"
        );
        // Check if we need to clean up - but only do this if we're certain
        // Avoid cleaning up if we're just having temporary network issues
        const quickLoginFlag =
          typeof window !== "undefined" &&
          sessionStorage.getItem("nutrimood_logged_in") === "true";

        // Only reset auth state if there's no quick login flag indicating the user was logged in
        if (!quickLoginFlag) {
          const authState = getAuthState();
          if (authState.isLoggedIn) {
            console.log("[SESSION] Cleaning up stale auth state");
            resetAuthState();
          }
        }
        return;
      }
      // Update session data
      this.updateSessionData(session);
      // Check if token needs refresh
      const timeUntilExpiry = this.sessionExpiryTime - now;
      if (timeUntilExpiry < TOKEN_REFRESH_THRESHOLD) {
        console.log("[SESSION] Token expiring soon, refreshing");
        await refreshSession();
      }
    } catch (error) {
      // Only log, never throw
      console.error("[SESSION] Error checking session (non-fatal):", error);
    } finally {
      this.isChecking = false;
    }
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

// Export singleton
export default sessionManager;

// Auto-initialize on client side
if (typeof window !== "undefined") {
  // Initialize after DOM is fully loaded
  if (document.readyState === "complete") {
    sessionManager.init();
  } else {
    window.addEventListener("load", () => {
      sessionManager.init();
    });
  }
}
