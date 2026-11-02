import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "./auth";

export async function updateSession(request: NextRequest) {
  const token = request.cookies.get("waffle_admin_session")?.value;
  const user = token ? verifySessionToken(token) : null;

  const isAdminRoute =
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login");

  if (isAdminRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and visiting /admin/login, redirect to dashboard
  if (request.nextUrl.pathname === "/admin/login" && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next({ request });
}
