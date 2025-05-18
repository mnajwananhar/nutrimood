"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUser, signOut, supabase } from "@/lib/supabase";
import {
  getAuthState,
  setAuthState,
  resetAuthState,
  subscribeToAuthChanges,
} from "@/lib/auth-status";
import NotificationBell from "../NotificationBell";

// Mengelola cache user dengan timestamp untuk validasi
const saveUserToCache = (user) => {
  if (typeof window !== "undefined") {
    if (user) {
      const cacheData = {
        user: user,
        timestamp: Date.now(),
      };
      localStorage.setItem("nutrimood_user", JSON.stringify(cacheData));
      // Juga set variabel session untuk flag status login
      sessionStorage.setItem("nutrimood_logged_in", "true");
    } else {
      localStorage.removeItem("nutrimood_user");
      sessionStorage.removeItem("nutrimood_logged_in");
    }
  }
};

// Fungsi untuk mendapatkan user dari localStorage dengan validasi waktu
const getUserFromCache = () => {
  if (typeof window !== "undefined") {
    try {
      const cachedData = localStorage.getItem("nutrimood_user");
      if (!cachedData) return null;

      const data = JSON.parse(cachedData);
      // Cache valid untuk 30 menit
      const CACHE_VALID_DURATION = 30 * 60 * 1000;

      if (
        data &&
        data.timestamp &&
        Date.now() - data.timestamp < CACHE_VALID_DURATION
      ) {
        return data.user;
      } else {
        // Cache sudah tidak valid, hapus
        localStorage.removeItem("nutrimood_user");
        return null;
      }
    } catch (e) {
      console.error("Error parsing user cache:", e);
      localStorage.removeItem("nutrimood_user");
      return null;
    }
  }
  return null;
};

export default function Header() {
  const pathname = usePathname();

  // Deteksi apakah ini adalah render server-side atau client-side
  const [isClient, setIsClient] = useState(false);

  // State management
  const [justLoggedOut, setJustLoggedOut] = useState(false);
  const [authState, setAuthState] = useState({ isLoggedIn: false, user: null });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null); // Mulai dengan null untuk menghindari hydration mismatch
  const [isLoading, setIsLoading] = useState(true); // Default loading sampai cek pertama selesai

  // Pertama, tandai bahwa kita di client side - ini penting untuk hydration
  useEffect(() => {
    setIsClient(true);
  }, []);
  // Effect untuk menginisialisasi status autentikasi dari browser storage - dijalankan sekali saja
  useEffect(() => {
    // Hanya jalankan di client side
    if (typeof window !== "undefined") {
      try {
        // Prioritas #1: Cek log out flag
        const loggedOutFlag =
          sessionStorage.getItem("nutrimood_just_logged_out") === "true";
        setJustLoggedOut(loggedOutFlag);

        if (loggedOutFlag) {
          sessionStorage.removeItem("nutrimood_just_logged_out");
          setUser(null);
          setIsLoading(false);
          return; // Keluar lebih awal jika memang sedang logout
        }

        // Prioritas #2: Cek sessionStorage untuk login cepat
        const quickLoginCheck =
          sessionStorage.getItem("nutrimood_logged_in") === "true";

        // Prioritas #3: Ambil auth state dari global state
        const state = getAuthState();
        setAuthState(state);

        // Prioritas #4: Cek localStorage untuk persistent login
        const cachedUser = getUserFromCache();

        // Gunakan informasi status yang tersedia
        if (state.user) {
          setUser(state.user);
          setIsLoading(false);
        } else if (quickLoginCheck || state.isLoggedIn) {
          // Jika kita tahu user sudah login tapi belum dapat datanya,
          // tampilkan loading tetapi jangan tampilkan UI "belum login"
          setIsLoading(true);
        } else if (cachedUser) {
          setUser(cachedUser);
          setIsLoading(false);
        } else {
          // Default ke loading untuk mencegah flashing UI
          setIsLoading(true);
        }
      } catch (e) {
        console.error("Error initializing auth state:", e);
        setIsLoading(true); // Tetap loading daripada menampilkan UI "belum login"
      }
    }
  }, []); // Effect utama untuk pemeriksaan status autentikasi dan subscription events
  useEffect(() => {
    // Hanya jalankan di client-side
    if (!isClient) return;

    let isMounted = true; // Tracking agar tidak update state jika component unmounted

    // Prevent showing error alerts in header
    sessionStorage.removeItem("nutrimood_error_shown");

    // Import session manager
    const sessionManager = require("@/lib/session-manager").default;

    // Fungsi untuk memeriksa status user
    const checkUser = async (skipLoading = false) => {
      try {
        // Set loading state kecuali diminta untuk dilewati
        if (isMounted && !skipLoading) setIsLoading(true);

        // Cek apakah sedang dalam status logout
        const isLoggingOut =
          sessionStorage.getItem("nutrimood_just_logged_out") === "true";

        // Memastikan session aktif dengan SessionManager
        await sessionManager.checkSession();

        // Gunakan getUser yang sudah dioptimasi
        const userData = await getUser();

        // Log untuk debugging
        console.log(
          "[AUTH DEBUG] checkUser result:",
          userData ? "User logged in" : "No user",
          userData
        );

        // Hanya update state jika komponen masih mounted
        if (isMounted) {
          if (!userData || isLoggingOut) {
            // Jika tidak ada user atau sedang logout
            console.log("[AUTH DEBUG] No user or logging out, resetting state");
            setUser(null);
            setIsLoading(false); // Selalu akhiri loading state
            saveUserToCache(null);
            resetAuthState();
            sessionStorage.removeItem("nutrimood_logged_in");
          } else {
            // Update state dengan user data
            console.log("[AUTH DEBUG] User found, updating state");
            setUser(userData);
            setIsLoading(false);

            // Juga tandai di sessionStorage untuk quick check
            sessionStorage.setItem("nutrimood_logged_in", "true");

            // Update cache untuk performa
            saveUserToCache(userData);

            // Update state global
            setAuthState(userData);
          }
        }
      } catch (error) {
        console.error("[AUTH DEBUG] Error fetching user:", error.message);

        // Coba lakukan pemeriksaan cepat dari sessionStorage
        const quickLoginCheck =
          sessionStorage.getItem("nutrimood_logged_in") === "true";
        const cachedUser = getUserFromCache();

        if (isMounted) {
          if (quickLoginCheck && cachedUser) {
            // Jika ada cache dan flag login di session, gunakan itu
            console.log("[AUTH DEBUG] Header - using cached user after error");
            setUser(cachedUser);
            setIsLoading(false);
            setAuthState(cachedUser);
          } else {
            // Tidak ada cache yang bisa digunakan
            console.log("[AUTH DEBUG] Header - no cache to fallback to");
            setUser(null);
            setIsLoading(false);
            saveUserToCache(null);
            resetAuthState();
            sessionStorage.removeItem("nutrimood_logged_in");
          }
        }
      }
    }; // Lakukan pemeriksaan awal
    checkUser();

    // Pemeriksaan kedua setelah delay untuk mengatasi masalah timing
    const secondCheck = setTimeout(() => {
      if (isMounted) {
        console.log("[AUTH DEBUG] Running second auth check");
        checkUser(true); // Skip loading pada pemeriksaan kedua
      }
    }, 800); // Menambah delay untuk memastikan getUser() sempat dijalankan

    // Subscribe ke event perubahan auth state global
    const unsubscribeAuthChanges = subscribeToAuthChanges((newAuthState) => {
      // Hanya update jika component masih mounted
      if (isMounted) {
        console.log("[AUTH DEBUG] Auth state changed:", newAuthState);
        // Ketika auth state berubah, perbarui state lokal
        if (newAuthState.isLoggedIn && newAuthState.user) {
          console.log("[AUTH DEBUG] Auth state indicates logged in, updating");
          setUser(newAuthState.user);
          setIsLoading(false);
          saveUserToCache(newAuthState.user);
          sessionStorage.setItem("nutrimood_logged_in", "true");
        } else if (!newAuthState.isLoggedIn) {
          // Untuk logout, selalu tunjukkan status "belum login"
          console.log("[AUTH DEBUG] Auth state indicates logged out, clearing");
          setUser(null);
          setIsLoading(false);
          saveUserToCache(null);
          sessionStorage.removeItem("nutrimood_logged_in");
        }
      }
    }); // Subscribe ke event auth Supabase dengan integrasi SessionManager
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Hanya update jika component masih mounted
      if (isMounted) {
        console.log(
          "[AUTH DEBUG] Supabase auth state changed:",
          _event,
          session ? "session exists" : "no session"
        );

        // Referensi ke session manager
        const sessionManager = require("@/lib/session-manager").default;
        const currentUser = session?.user ?? null;

        if (_event === "SIGNED_IN" && currentUser) {
          // Sync dengan session manager
          sessionManager.handleSignIn(session);

          // Update state dan cache untuk login
          console.log("[AUTH DEBUG] User signed in, updating state");
          setUser(currentUser);
          setIsLoading(false);
          saveUserToCache(currentUser);
          setAuthState(currentUser);
          sessionStorage.setItem("nutrimood_logged_in", "true");
        } else if (_event === "SIGNED_OUT" || _event === "USER_DELETED") {
          // Sync dengan session manager
          sessionManager.handleSignOut();

          // Update untuk logout
          console.log("[AUTH DEBUG] User signed out, clearing state");
          setUser(null);
          setIsLoading(false);
          saveUserToCache(null);
          resetAuthState();
          sessionStorage.removeItem("nutrimood_logged_in");
        } else if (_event === "TOKEN_REFRESHED" && currentUser) {
          // Sync dengan session manager
          sessionManager.handleTokenRefresh(session);

          // Update saat token diperbarui
          console.log("[AUTH DEBUG] Token refreshed, updating state");
          setUser(currentUser);
          setIsLoading(false);
          saveUserToCache(currentUser);
          setAuthState(currentUser);
          sessionStorage.setItem("nutrimood_logged_in", "true");
        }
      }
    });

    // Tambahkan event listener untuk window focus event
    const handleWindowFocus = () => {
      console.log("[AUTH DEBUG] Window focused, rechecking auth");
      if (isMounted) {
        // Force check user status when window gets focus
        checkUser(true);
      }
    };
    window.addEventListener("focus", handleWindowFocus); // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(secondCheck);
      subscription.unsubscribe();
      unsubscribeAuthChanges();
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [isClient]); // Hanya bergantung pada isClient untuk memastikan konsistensi
  const handleSignOut = async () => {
    try {
      // Tutup menu mobile jika terbuka
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }

      // Set flag logout - sangat penting untuk rendering state
      if (typeof window !== "undefined") {
        // Set flag untuk mendeteksi logout di semua komponen
        sessionStorage.setItem("nutrimood_just_logged_out", "true");

        // Hapus semua data otentikasi di localStorage dan sessionStorage
        [
          "nutrimood_user",
          "nutrimood_logged_in",
          "nutrimood_auth_state",
        ].forEach((key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
      }

      // Reset global state dan UI state
      resetAuthState(); // Reset global auth state
      setUser(null); // Reset local state
      setIsLoading(false);
      saveUserToCache(null);

      // Gunakan signOut yang sudah dioptimasi
      await signOut();

      // Force UI refresh tanpa full reload - penting untuk navbar konsisten
      setTimeout(() => {
        // Redirect ke halaman utama setelah logout
        window.location.href = "/";
      }, 0);
    } catch (error) {
      console.error("Error signing out:", error.message);
      // Jika gagal logout, tetap perbarui UI agar konsisten
      setUser(null);
      resetAuthState();
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Link untuk pengguna yang belum login
  const publicLinks = [
    { name: "Beranda", href: "/" },
    { name: "Tentang", href: "/about" },
    { name: "Fitur", href: "/#features" },
    { name: "Kontak", href: "/contact" },
  ];
  // Link untuk pengguna yang sudah login
  const authLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Jurnal", href: "/dashboard/journal" },
    { name: "Rekomendasi", href: "/recommendation" },
    { name: "Edukasi", href: "/education" },
    { name: "Komunitas", href: "/community" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-neutral-900/80 dark:border-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                NutriMood
              </span>
            </Link>
          </div>{" "}
          {/* Desktop Navigation */}
          <nav className="hidden md:ml-6 md:flex md:space-x-8">
            {user
              ? // Tampilkan link untuk pengguna yang sudah login
                authLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                      pathname === link.href
                        ? "border-primary-500 text-primary-600 dark:text-primary-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-700"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))
              : !isClient || isLoading
              ? // Selama pre-render atau loading, tampilkan link publik sebagai fallback
                publicLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                      pathname === link.href
                        ? "border-primary-500 text-primary-600 dark:text-primary-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-700"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))
              : // Setelah loading selesai dan user dipastikan tidak ada, tampilkan link publik
                publicLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                      pathname === link.href
                        ? "border-primary-500 text-primary-600 dark:text-primary-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-700"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
          </nav>{" "}
          {/* Authentication Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Pada client side dan saat loading, hanya tampilkan skeleton jika belum ada user */}
            {isClient && isLoading ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <NotificationBell />
                <Link
                  href="/profile"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  {user.user_metadata?.full_name || "Pengguna"}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Keluar
                </button>
              </div>
            ) : !isClient || isLoading ? (
              /* Tampilkan placeholder selama pre-render atau saat loading */
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md"></div>
            ) : (
              /* Hanya tampilkan tombol login/register jika benar-benar tidak ada user dan sudah selesai loading */
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 dark:bg-transparent dark:text-primary-400 dark:border-primary-500 dark:hover:bg-primary-900/20"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              aria-expanded="false"
            >
              <span className="sr-only">Buka menu utama</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          {" "}
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user
              ? // Tampilkan link untuk pengguna yang sudah login
                authLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === link.href
                        ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))
              : !isClient || isLoading
              ? // Selama pre-render atau loading, tunjukkan placeholder
                publicLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === link.href
                        ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))
              : // Setelah loading selesai, tampilkan link publik
                publicLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === link.href
                        ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
            {/* Mobile Authentication Buttons */}
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              {isClient && isLoading ? (
                <div className="px-3 py-2">
                  <div className="h-8 w-full bg-gray-200 animate-pulse rounded-md"></div>
                </div>
              ) : user ? (
                <div>
                  <div className="px-3 py-2">
                    <Link
                      href="/profile"
                      className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {user.user_metadata?.full_name || "Pengguna"}
                    </Link>
                  </div>
                  <div className="px-3 py-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Keluar
                    </button>
                  </div>
                </div>
              ) : !isClient || isLoading ? (
                /* Tampilkan placeholder selama pre-render atau saat loading */
                <div className="px-3 py-2">
                  <div className="h-8 w-full bg-gray-200 animate-pulse rounded-md"></div>
                </div>
              ) : (
                /* Hanya tampilkan tombol login/register jika benar-benar tidak ada user */
                <div className="space-y-2">
                  <Link
                    href="/login"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-gray-50 dark:bg-transparent dark:text-primary-400 dark:border-primary-500 dark:hover:bg-primary-900/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
