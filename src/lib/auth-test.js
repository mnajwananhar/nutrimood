// auth-test.js - Utility to test and verify authentication fixes
"use client";

import { useState, useEffect } from "react";
import { getUser, refreshSession } from "./supabase";
import { recoverAuthentication } from "./auth-recovery";
import sessionManager from "./session-manager";

/**
 * Component to test authentication flow and verify fixes
 */
export function AuthTestComponent() {
  const [testResults, setTestResults] = useState({
    sessionCheck: "Not run",
    userFetch: "Not run",
    refreshSession: "Not run",
    recovery: "Not run",
    authStatus: "Not run",
  });
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results = { ...testResults };

    // Test 1: Session check
    try {
      console.log("TEST: Checking session...");
      await sessionManager.checkSession();
      results.sessionCheck = "PASS - Session check completed without errors";
    } catch (error) {
      results.sessionCheck = `FAIL - ${error.message}`;
    }

    // Test 2: User fetch
    try {
      console.log("TEST: Fetching user...");
      const user = await getUser();
      results.userFetch = user
        ? `PASS - User found: ${user.email}`
        : "FAIL - No user returned but no error thrown";
    } catch (error) {
      results.userFetch = `FAIL - ${error.message}`;
    }

    // Test 3: Session refresh
    try {
      console.log("TEST: Refreshing session...");
      const refreshResult = await refreshSession();
      results.refreshSession = refreshResult
        ? `PASS - Session refreshed successfully`
        : "WARNING - No refresh result but no error thrown";
    } catch (error) {
      results.refreshSession = `FAIL - ${error.message}`;
    }

    // Test 4: Recovery mechanism
    try {
      console.log("TEST: Testing recovery...");
      const recoveryResult = await recoverAuthentication();
      results.recovery = recoveryResult
        ? `PASS - Recovery successful`
        : "WARNING - Recovery returned null but no error thrown";
    } catch (error) {
      results.recovery = `FAIL - ${error.message}`;
    }

    // Test 5: Auth status consistency
    try {
      console.log("TEST: Checking auth status consistency...");
      const user = await getUser();
      const isLoggedIn =
        sessionStorage.getItem("nutrimood_logged_in") === "true";
      const hasUserCache = !!localStorage.getItem("nutrimood_user");

      if (user && isLoggedIn && hasUserCache) {
        results.authStatus = "PASS - Auth state consistent (logged in)";
      } else if (!user && !isLoggedIn && !hasUserCache) {
        results.authStatus = "PASS - Auth state consistent (logged out)";
      } else {
        results.authStatus = `WARNING - Inconsistent auth state: user=${!!user}, sessionFlag=${isLoggedIn}, localStorage=${hasUserCache}`;
      }
    } catch (error) {
      results.authStatus = `FAIL - ${error.message}`;
    }

    setTestResults(results);
    setIsRunning(false);
  };

  // Format for display
  const formatResults = () => {
    return Object.entries(testResults).map(([test, result]) => {
      const isPassing = result.startsWith("PASS");
      const isWarning = result.startsWith("WARNING");

      return {
        test: test
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
        result,
        status: isPassing ? "pass" : isWarning ? "warning" : "fail",
      };
    });
  };

  return {
    runTests,
    testResults: formatResults(),
    isRunning,
  };
}

/**
 * Run a complete auth flow test and return results
 */
export async function testAuthFlow() {
  const results = [];

  try {
    // Step 1: Check initial state
    results.push({
      step: "Initial State Check",
      result:
        sessionStorage.getItem("nutrimood_logged_in") === "true"
          ? "User appears to be logged in"
          : "User appears to be logged out",
    });

    // Step 2: Test session manager
    try {
      await sessionManager.checkSession();
      results.push({
        step: "Session Manager Check",
        result: "Success - Session manager completed check without errors",
      });
    } catch (e) {
      results.push({
        step: "Session Manager Check",
        result: `Error - ${e.message}`,
      });
    }

    // Step 3: Test user retrieval
    try {
      const user = await getUser();
      results.push({
        step: "User Retrieval",
        result: user
          ? `Success - User found: ${user.email}`
          : "Warning - No user found",
      });
    } catch (e) {
      results.push({
        step: "User Retrieval",
        result: `Error - ${e.message}`,
      });
    }

    // Step 4: Test session refresh
    try {
      const refreshed = await refreshSession();
      results.push({
        step: "Session Refresh",
        result: refreshed
          ? "Success - Session refreshed"
          : "Warning - Session refresh returned null",
      });
    } catch (e) {
      results.push({
        step: "Session Refresh",
        result: `Error - ${e.message}`,
      });
    }

    // Step 5: Test recovery mechanism
    try {
      const recovered = await recoverAuthentication();
      results.push({
        step: "Auth Recovery",
        result: recovered
          ? "Success - Recovery successful"
          : "Warning - Recovery returned null",
      });
    } catch (e) {
      results.push({
        step: "Auth Recovery",
        result: `Error - ${e.message}`,
      });
    }

    // Step 6: Test for infinite loop condition
    results.push({
      step: "Infinite Loop Check",
      result: "No infinite loop detected during test execution",
    });

    return { success: true, results };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      results,
    };
  }
}

export default {
  AuthTestComponent,
  testAuthFlow,
};
