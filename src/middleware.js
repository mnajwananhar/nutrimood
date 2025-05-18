import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  // Debug: log session dan path untuk troubleshooting
  console.log("[AUTH DEBUG] MIDDLEWARE PATH:", req.nextUrl.pathname);
  if (error) {
    console.error("[AUTH DEBUG] Session error in middleware:", error.message);
  }
  console.log(
    "[AUTH DEBUG] SESSION:",
    session ? `User logged in: ${session.user.email}` : "No session"
  );

  // Daftar rute yang membutuhkan autentikasi
  const protectedRoutes = [
    "/dashboard",
    "/dashboard/journal",
    "/dashboard/education",
    "/recommendation/result",
    "/profile",
    "/notifications",
    "/education", // Semua rute edukasi memerlukan login
    "/community",
  ];

  // Cek apakah rute saat ini membutuhkan autentikasi
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );
  // Jika rute membutuhkan autentikasi dan user belum login
  if (isProtectedRoute && !session) {
    console.log(
      "[AUTH DEBUG] REDIRECT: User not authenticated, redirecting to login"
    );
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    // Tambahkan pesan error untuk ditampilkan
    redirectUrl.searchParams.set(
      "error",
      "Silakan login untuk mengakses halaman ini"
    );
    return NextResponse.redirect(redirectUrl);
  }

  // Jika user sudah login dan mencoba mengakses halaman login/register
  if (
    session &&
    (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")
  ) {
    console.log(
      "[AUTH DEBUG] REDIRECT: User already logged in, redirecting to dashboard"
    );
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/recommendation/result/:path*", // Hanya recommendation/result yang perlu autentikasi
    "/profile/:path*",
    "/education/:path*",
    "/community/:path*",
    "/login",
    "/register",
  ],
};
