import { NextResponse } from "next/server";

export function middleware() {
  // Auth uses an HttpOnly cookie on the external API domain (DigitalOcean).
  // Next.js middleware only sees cookies on the frontend domain (Vercel), so
  // a cookie check here would block every dashboard request in production.
  // Client-side AuthGuard + AuthBootstrap validate the session instead.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
