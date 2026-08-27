import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run session-refresh middleware only on routes that need auth.
  // Exclude: static assets, Next.js internals, landing page, login/signup pages,
  // and browser meta-requests. This prevents an unnecessary auth.getUser() call
  // on every public page load.
  matcher: [
    "/anak/:path*",
    "/ortu/:path*",
    "/api/:path*",
  ],
};
