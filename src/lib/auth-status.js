// auth-status.js - Utility untuk mengelola status autentikasi untuk UI yang responsif

// Memory cache untuk status login yang diakses di seluruh aplikasi
let authState = {
  isLoggedIn: false,
  user: null,
  lastChecked: 0,
};

// Event emitter untuk perubahan auth state
const listeners = [];

// Konstanta
const AUTH_CHECK_INTERVAL = 10000; // 10 detik
const AUTH_CACHE_VERSION = "v2"; // Increment ini jika struktur cache berubah

// Fungsi untuk inisialisasi status autentikasi
const initAuthState = () => {
  if (typeof window === "undefined") return;

  // Set flag bahwa inisialisasi sudah dilakukan
  if (window.__NUTRIMOOD_AUTH_INITIALIZED__) {
    console.log("[AUTH DEBUG] Auth state already initialized");
    return;
  }
  console.log("[AUTH DEBUG] Initializing auth state");
  window.__NUTRIMOOD_AUTH_INITIALIZED__ = true;

  try {
    // Priority #1: Check "just logged out" flag
    const justLoggedOut =
      sessionStorage.getItem("nutrimood_just_logged_out") === "true";
    if (justLoggedOut) {
      console.log(
        "[AUTH DEBUG] Logout flag detected, setting logged out state"
      );
      authState.isLoggedIn = false;
      authState.user = null;
      return;
    }

    // Priority #2: Check quick login flag
    const quickLoginFlag =
      sessionStorage.getItem("nutrimood_logged_in") === "true";
    if (quickLoginFlag) {
      console.log("[AUTH DEBUG] Quick login flag found during init");
      authState.isLoggedIn = true;
      // Data user akan diambil nanti
    }

    // Priority #3: Check localStorage for persistent auth
    const cachedUser = localStorage.getItem("nutrimood_user");
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        if (userData && userData.user) {
          console.log("[AUTH DEBUG] Found cached user during init");
          authState.user = userData.user;
          authState.isLoggedIn = true;
          authState.lastChecked = userData.timestamp || Date.now();

          // Sync to sessionStorage for faster access
          sessionStorage.setItem("nutrimood_logged_in", "true");

          // Log current authentication status
          console.log("[AUTH DEBUG] Auth initialized with user from cache");
        }
      } catch (e) {
        console.error("Error parsing cached user:", e);
      }
    }

    // Priority #4: Check sessionStorage for newer auth state
    const sessionAuthState = sessionStorage.getItem("nutrimood_auth_state");
    if (sessionAuthState) {
      try {
        const sessionData = JSON.parse(sessionAuthState);
        if (sessionData && sessionData.isLoggedIn) {
          authState.isLoggedIn = true;
          // Last checked overrides only if newer
          if (sessionData.timestamp > authState.lastChecked) {
            authState.lastChecked = sessionData.timestamp;
          }
        }
      } catch (e) {
        console.error("Error parsing session auth state:", e);
      }
    }
  } catch (e) {
    console.error("Error initializing auth state:", e);
  }
};

// Inisialisasi saat modul dimuat di browser
if (typeof window !== "undefined") {
  initAuthState();

  // Recheck pada visibility change (ketika berpindah tab/aplikasi)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      // Mungkin perlu memeriksa ulang status autentikasi
      const now = Date.now();
      if (now - authState.lastChecked > AUTH_CHECK_INTERVAL) {
        notifyListeners(); // Beritahu komponen untuk memeriksa ulang
      }
    }
  });
}

/**
 * Set status autentikasi user di browser
 * @param {Object} user - data user atau null jika logout
 */
export const setAuthState = (user) => {
  const prevState = authState.isLoggedIn;

  // Update memori
  authState.isLoggedIn = !!user;
  authState.user = user;
  authState.lastChecked = Date.now();

  // Juga simpan di sessionStorage untuk konsistensi antar tabs
  if (typeof window !== "undefined") {
    if (user) {
      sessionStorage.setItem(
        "nutrimood_auth_state",
        JSON.stringify({
          isLoggedIn: true,
          timestamp: Date.now(),
        })
      );
    } else {
      sessionStorage.removeItem("nutrimood_auth_state");
    }
  }

  // Jika terjadi perubahan state, beritahu semua listener
  if (prevState !== authState.isLoggedIn) {
    notifyListeners();
  }
};

/**
 * Mendapatkan status autentikasi langsung dari memori dan storage
 * @returns {Object} status autentikasi
 */
export const getAuthState = () => {
  // Pastikan authState terinisialisasi di browser
  if (typeof window !== "undefined") {
    console.log("[AUTH DEBUG] getAuthState called");

    // Re-init auth state jika belum dilakukan
    if (!window.__NUTRIMOOD_AUTH_INITIALIZED__) {
      console.log("[AUTH DEBUG] Initializing auth state");
      initAuthState();
    }

    // Jika flag logout terdeteksi, prioritaskan
    if (sessionStorage.getItem("nutrimood_just_logged_out") === "true") {
      console.log("[AUTH DEBUG] Just logged out flag detected");
      // Untuk keamanan, jangan menghapus flag di sini, biarkan komponen yang melakukannya
      authState.isLoggedIn = false;
      authState.user = null;
      return { isLoggedIn: false, user: null, lastChecked: Date.now() };
    }

    // Cek quick login flag
    const quickLoginFlag =
      sessionStorage.getItem("nutrimood_logged_in") === "true";
    if (quickLoginFlag) {
      console.log(
        "[AUTH DEBUG] Quick login flag found, setting isLoggedIn=true"
      );
      // Jika flag menunjukkan login
      authState.isLoggedIn = true;

      // Cek localStorage untuk data user jika belum ada di memory
      if (!authState.user) {
        try {
          const cachedData = localStorage.getItem("nutrimood_user");
          if (cachedData) {
            const userData = JSON.parse(cachedData);
            if (userData && userData.user) {
              console.log("[AUTH DEBUG] Found user data in localStorage");
              authState.user = userData.user;
            }
          }
        } catch (e) {
          console.error("[AUTH DEBUG] Error parsing cached user:", e);
        }
      }
    }

    // Cek sessionStorage untuk update dari tab lain
    const sessionAuthState = sessionStorage.getItem("nutrimood_auth_state");
    if (sessionAuthState) {
      try {
        const parsedState = JSON.parse(sessionAuthState);
        // Jika session storage lebih baru dari memory cache
        if (parsedState.timestamp > authState.lastChecked) {
          console.log("[AUTH DEBUG] Updating auth state from sessionStorage");
          authState.isLoggedIn = parsedState.isLoggedIn;
          authState.lastChecked = parsedState.timestamp;
        }
      } catch (e) {
        console.error("[AUTH DEBUG] Error parsing auth state:", e);
      }
    }
  }

  // Log state sebelum mengembalikan
  console.log("[AUTH DEBUG] getAuthState returning:", {
    isLoggedIn: authState.isLoggedIn,
    hasUser: !!authState.user,
    lastChecked: new Date(authState.lastChecked).toLocaleTimeString(),
  });

  // Return copy of state
  return {
    isLoggedIn: authState.isLoggedIn,
    user: authState.user,
    lastChecked: authState.lastChecked,
  };
};

/**
 * Reset status autentikasi
 */
export const resetAuthState = () => {
  const prevState = authState.isLoggedIn;
  console.log("[AUTH DEBUG] resetAuthState called");

  // Reset memory state
  authState.isLoggedIn = false;
  authState.user = null;
  authState.lastChecked = 0;

  if (typeof window !== "undefined") {
    // Hapus semua data auth dari storage
    sessionStorage.removeItem("nutrimood_auth_state");
    sessionStorage.removeItem("nutrimood_logged_in");
    localStorage.removeItem("nutrimood_user");

    // Set flag logout
    sessionStorage.setItem("nutrimood_just_logged_out", "true");
    console.log("[AUTH DEBUG] Auth flags cleared, logout flag set");
  }

  // Jika terjadi perubahan state, beritahu semua listener
  if (prevState) {
    console.log("[AUTH DEBUG] Notifying listeners about logout");
    notifyListeners();
  }
};

/**
 * Beritahu semua listener tentang perubahan status auth
 */
const notifyListeners = () => {
  try {
    const state = getAuthState();
    console.log("[AUTH DEBUG] Notifying listeners of auth state change:", {
      isLoggedIn: state.isLoggedIn,
      hasUser: !!state.user,
      listenersCount: listeners.length,
    });

    // Tambahkan timestamp notifikasi untuk debugging
    const notifyState = {
      ...state,
      notifiedAt: Date.now(),
    };

    // Sync sessionStorage flags berdasarkan state saat ini
    if (typeof window !== "undefined") {
      if (state.isLoggedIn) {
        sessionStorage.setItem("nutrimood_logged_in", "true");
        // Hapus flag logout jika ada
        sessionStorage.removeItem("nutrimood_just_logged_out");
      } else {
        sessionStorage.removeItem("nutrimood_logged_in");
      }
    }

    // Beritahu semua listener yang terdaftar
    listeners.forEach((listener, index) => {
      try {
        console.log(`[AUTH DEBUG] Notifying listener #${index + 1}`);
        listener(notifyState);
      } catch (error) {
        console.error("[AUTH DEBUG] Error in auth state listener:", error);
      }
    });

    // Juga update sessionStorage dengan timestamp terbaru
    if (typeof window !== "undefined" && state.isLoggedIn) {
      sessionStorage.setItem(
        "nutrimood_auth_state",
        JSON.stringify({
          isLoggedIn: true,
          timestamp: Date.now(),
        })
      );
    }
  } catch (e) {
    console.error("Error in notifyListeners:", e);
  }
};

/**
 * Mendaftarkan listener untuk perubahan status auth
 * @param {Function} callback - fungsi yang akan dipanggil saat status berubah
 * @returns {Function} fungsi untuk unsubscribe
 */
export const subscribeToAuthChanges = (callback) => {
  console.log("[AUTH DEBUG] New auth state subscriber added");

  // Pastikan tidak mendaftarkan callback yang sama beberapa kali
  if (listeners.indexOf(callback) === -1) {
    listeners.push(callback);
    console.log("[AUTH DEBUG] Total auth state subscribers:", listeners.length);
  }

  // Pastikan auth state sudah ter-inisialisasi sebelum memanggil callback
  if (typeof window !== "undefined" && !window.__NUTRIMOOD_AUTH_INITIALIZED__) {
    console.log("[AUTH DEBUG] Initializing auth state for new subscriber");
    initAuthState();
  }

  // Panggil callback langsung dengan state saat ini
  const state = getAuthState();
  console.log("[AUTH DEBUG] Calling new subscriber with current state:", {
    isLoggedIn: state.isLoggedIn,
    hasUser: !!state.user,
  });

  setTimeout(() => {
    try {
      callback(state);
    } catch (error) {
      console.error(
        "[AUTH DEBUG] Error calling initial auth state listener:",
        error
      );
    }
  }, 0);

  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

// Export konstanta
export const AUTH_STATUS = {
  NOT_CHECKED: "not_checked",
  LOGGED_IN: "logged_in",
  LOGGED_OUT: "logged_out",
};

// Sinkronkan auth state jika browser
if (typeof window !== "undefined") {
  // Dengarkan event storage untuk sinkronisasi antar tab
  window.addEventListener("storage", (event) => {
    // Jika ada perubahan di localStorage yang berkaitan dengan auth
    if (
      event.key === "nutrimood_user" ||
      event.key === "nutrimood_auth_state"
    ) {
      // Re-cek status auth
      const newState = getAuthState();

      // Jika terjadi perubahan, beritahu semua listener
      if (newState.isLoggedIn !== authState.isLoggedIn) {
        authState.isLoggedIn = newState.isLoggedIn;
        authState.user = newState.user;
        authState.lastChecked = Date.now();

        // Notify listeners
        notifyListeners();
      }
    }
  });
}
