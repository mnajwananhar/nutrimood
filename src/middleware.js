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
  console.log("MIDDLEWARE PATH:", req.nextUrl.pathname);
  console.log(
    "SESSION:",
    session ? `User logged in: ${session.user.email}` : "No session"
  );

  // Daftar rute yang membutuhkan autentikasi
  const protectedRoutes = [
    "/dashboard",
    "/dashboard/journal",
    "/recommendation/result", // Ubah ini, hapus /recommendation dasar tapi tetap protect /recommendation/result
    "/profile",
    "/education",
    "/community",
  ];

  // Cek apakah rute saat ini membutuhkan autentikasi
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  // Jika rute membutuhkan autentikasi dan user belum login
  if (isProtectedRoute && !session) {
    console.log("REDIRECT: User not authenticated, redirecting to login");
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Jika user sudah login dan mencoba mengakses halaman login/register
  if (
    session &&
    (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")
  ) {
    console.log("REDIRECT: User already logged in, redirecting to dashboard");
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
