import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware entirely for internal API routes
  if (pathname.startsWith("/api/internal/")) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - /api/internal/* (internal APIs)
     * - /_next/static (static files)
     * - /_next/image (image optimization)
     * - /favicon.ico
     * - files with extensions
     */
    "/((?!api/internal/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
