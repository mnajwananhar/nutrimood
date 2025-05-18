"use client";

import { useEffect } from "react";
import sessionManager from "@/lib/session-manager";

// This component initializes session management when mounted
export default function SessionInitializer() {
  useEffect(() => {
    // Prevent multiple initializations with a global flag
    if (
      typeof window !== "undefined" &&
      !window.__SESSION_INITIALIZER_EXECUTED__
    ) {
      window.__SESSION_INITIALIZER_EXECUTED__ = true;
      console.log(
        "[AUTH DEBUG] Initializing session manager from SessionInitializer"
      );
      sessionManager.init();
    }
  }, []);

  // Return null as this is just an initializer with no UI
  return null;
}
