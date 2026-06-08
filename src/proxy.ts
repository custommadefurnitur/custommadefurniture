import { NextResponse } from "next/server";
import { auth } from "@/auth";

// 1. Export the function named 'proxy' to match the updated Next.js spec
export const proxy = auth(async (req) => {
  const { nextUrl } = req;
  const user = req.auth?.user;

  // 2. Guard Rule: Check if the user is attempting to hit an admin dashboard pipeline
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  if (isAdminRoute) {
    // A. Bouncer: If not logged in at all, redirect securely to your login form
    if (!user) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // B. Permission Check: If logged in but is a regular 'user', redirect to customer workspace
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  // 3. Clear Pass: If everything is validated, continue the standard server routing flow
  return NextResponse.next();
});

// 4. Routing Engine Filter Map: Ensures this execution only runs on matching paths
export const config = {
  matcher: [
    /*
     * Match all path frameworks starting with /admin
     * Includes layouts like /admin, /admin/faqs, /admin/users, etc.
     */
    "/admin/:path*",
  ],
};
