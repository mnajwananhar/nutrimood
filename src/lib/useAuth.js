"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, refreshSession } from "@/lib/supabase";
import sessionManager from "@/lib/session-manager";
import { getAuthState, subscribeToAuthChanges } from "@/lib/auth-status";

/**
 * Custom hook for robust authentication management
 * Centralizes authentication logic for consistent behavior across components
 */
export function useAuth(options = {}) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract options with defaults
  const {
    redirectTo = "/login",
    redirectIfFound = false,
    refreshOnMount = true,
    refreshOnFocus = true,
  } = options;

  // Main authentication check function
  const checkAuth = async (skipLoading = false) => {
    try {
      if (!skipLoading) setLoading(true);

      // Validate session using session manager
      await sessionManager.checkSession();

      // Get current user data
      const userData = await getUser();

      if (!userData) {
        // No user found, try to refresh session before giving up
        console.log("[AUTH HOOK] No user data, trying session refresh");
        const refreshedUser = await refreshSession();

        if (refreshedUser) {
          // Refresh successful
          console.log("[AUTH HOOK] Session refresh successful");
          setUser(refreshedUser);
          setError(null);

          // If redirectIfFound is true and we have a redirect path, go there
          if (redirectIfFound && redirectTo) {
            router.push(redirectTo);
          }
        } else if (!redirectIfFound && redirectTo) {
          // User should be logged in but isn't, redirect to login
          console.log(
            "[AUTH HOOK] No user after refresh, redirecting to",
            redirectTo
          );
          router.push(redirectTo);
        }
      } else {
        // User found
        console.log("[AUTH HOOK] User authenticated:", userData.email);
        setUser(userData);
        setError(null);

        // If redirectIfFound is true and we have a redirect path, redirect away
        if (redirectIfFound && redirectTo) {
          console.log(
            "[AUTH HOOK] User found but shouldn't be here, redirecting to",
            redirectTo
          );
          router.push(redirectTo);
        }
      }
    } catch (err) {
      console.error("[AUTH HOOK] Error checking authentication:", err);
      setError(err);

      // Check if we have a quick login flag to avoid disrupting user experience
      const quickLoginFlag =
        typeof window !== "undefined" &&
        sessionStorage.getItem("nutrimood_logged_in") === "true";

      if (!quickLoginFlag && !redirectIfFound && redirectTo) {
        // Only redirect if there's no indication user was previously logged in
        router.push(redirectTo);
      }
    } finally {
      if (!skipLoading) setLoading(false);
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    // Initialize session manager
    sessionManager.init();

    // Check authentication status
    if (refreshOnMount) {
      checkAuth();
    } else {
      // Just set initial state from stored auth state
      const state = getAuthState();
      if (state.user) {
        setUser(state.user);
      }
      setLoading(false);
    }

    // Subscribe to auth state changes
    const unsubscribe = subscribeToAuthChanges((newState) => {
      console.log("[AUTH HOOK] Auth state changed:", newState.isLoggedIn);
      if (newState.isLoggedIn && newState.user) {
        setUser(newState.user);
      } else {
        setUser(null);

        // Redirect if needed
        if (!redirectIfFound && redirectTo) {
          router.push(redirectTo);
        }
      }
    });

    // Setup focus handler
    const handleFocus = () => {
      if (refreshOnFocus) {
        // Skip loading indicator for better UX
        checkAuth(true);
      }
    };

    // Add focus event listener
    if (typeof window !== "undefined" && refreshOnFocus) {
      window.addEventListener("focus", handleFocus);
    }

    // Cleanup
    return () => {
      unsubscribe();
      if (typeof window !== "undefined" && refreshOnFocus) {
        window.removeEventListener("focus", handleFocus);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Return authentication state and helper functions
  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    refresh: checkAuth,
    logout: async () => {
      // This just triggers the auth state change which will be handled by the subscription
      // Actual logout logic is in supabase.js signOut function
      try {
        const { signOut } = await import("@/lib/supabase");
        await signOut();
      } catch (err) {
        console.error("[AUTH HOOK] Error during logout:", err);
        setError(err);
      }
    },
  };
}
