import { type NextRequest } from "next/server";
import { updateSession } from "./lib/db/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/ (API routes)
     * - _next/static (static files)
     * - _next/image  (image optimisation)
     * - favicon.ico
     * - public folder assets
     */
    "/((?!api/|_next/static|_next/image|favicon.ico|images/|videos/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
