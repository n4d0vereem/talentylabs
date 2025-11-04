import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  const publicPaths = ["/sign-in", "/sign-up", "/api/auth"];
  
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (pathname.startsWith("/dashboard")) {
    try {
      // Check for session cookie
      const sessionCookie = request.cookies.get("better-auth.session_token");

      if (!sessionCookie) {
        const signInUrl = new URL("/sign-in", request.url);
        signInUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(signInUrl);
      }

      return NextResponse.next();
    } catch (error) {
      // If there's an error checking the session, redirect to sign-in
      const signInUrl = new URL("/sign-in", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Redirect root to dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};

