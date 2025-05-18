"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    // Supabase sudah handle session dari magic link, cukup update password
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "Password berhasil direset. Silakan login dengan password baru."
      );
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 px-4">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Password Baru
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-neutral-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-neutral-800 dark:text-white"
              placeholder="Masukkan password baru"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {loading ? "Menyimpan..." : "Simpan Password Baru"}
          </button>
        </form>
        {message && (
          <div className="mt-4 text-green-600 text-center">{message}</div>
        )}
        {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
      </div>
    </div>
  );
}
