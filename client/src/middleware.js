import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");

  // Check if user has auth cookie
  const hasAuthCookie = request.cookies.get("authToken");

  if (isDashboard && !hasAuthCookie) {
    // No auth cookie - redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Cookie exists - middleware passes, but AuthGuard component adds client-side validation
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

