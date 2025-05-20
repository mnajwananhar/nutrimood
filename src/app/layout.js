"use client";

import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SessionInitializer from "@/components/SessionInitializer";
import { cssVariables } from "@/lib/theme";
import "./globals.css";

// Font configurations
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  // Gunakan useState dengan function initializer untuk menghindari hydration mismatch
  const [theme, setTheme] = useState(() => {
    // Kode ini hanya akan dieksekusi di client-side
    if (typeof window !== "undefined") {
      // Cek tema dari localStorage
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme;
      } else if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        return "dark";
      }
    }
    return "light"; // Default fallback untuk server-side rendering
  });

  // Effect untuk mendeteksi perubahan preferensi sistem
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Cek tema dari localStorage
      const savedTheme = localStorage.getItem("theme");

      if (savedTheme) {
        setTheme(savedTheme);
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
      }
    }
  }, []);

  // Mengubah tema dan menyimpannya ke localStorage
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    try {
      // Simpan ke localStorage
      localStorage.setItem("theme", newTheme);

      // Terapkan langsung ke dokumen untuk feedback instan
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      }
    } catch (error) {
      console.error("Error menyimpan tema:", error);
    }
  };

  // Menerapkan tema ke elemen html
  useEffect(() => {
    // Perubahan tema yang lebih reaktif
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Menambahkan script untuk mendeteksi tema dari localStorage sebelum render
  // untuk menghindari flash of unstyled content
  const themeScript = `
    (function() {
      try {
        let persistedTheme = localStorage.getItem('theme');
        let prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (persistedTheme === 'dark' || (!persistedTheme && prefersDark)) {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
      } catch (err) {
        // Fallback jika localStorage tidak tersedia
        document.documentElement.classList.add('light');
      }
    })()
  `;

  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link
          rel="apple-touch-icon"
          sizes="192x192"
          href="/icons/icon-192x192.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="256x256"
          href="/icons/icon-256x256.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="384x384"
          href="/icons/icon-384x384.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="512x512"
          href="/icons/icon-512x512.png"
        />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="NutriMood" />
        <meta name="apple-mobile-web-app-title" content="NutriMood" />
        <meta
          name="description"
          content="Aplikasi rekomendasi makanan berbasis mood dan kesehatan."
        />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta
          name="msapplication-TileImage"
          content="/icons/icon-192x192.png"
        />
        {/* Menambahkan CSS variables */}
        <style>{cssVariables}</style>
        {/* Script untuk menerapkan tema sebelum render untuk menghindari flicker */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-white dark:bg-neutral-800 shadow-lg border border-gray-200 dark:border-neutral-700 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 hover:shadow-xl"
          aria-label="Toggle Theme"
          title={
            theme === "light" ? "Aktifkan Mode Gelap" : "Aktifkan Mode Terang"
          }
        >
          {theme === "light" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-neutral-800 transition-transform duration-300 ease-in-out"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-yellow-400 transition-transform duration-300 ease-in-out animate-[spin_1s_ease-in-out]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          )}
        </button>

        {/* Layout with Header, Main content, and Footer */}
        <SessionInitializer />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
