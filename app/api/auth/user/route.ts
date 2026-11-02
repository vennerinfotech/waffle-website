import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/db/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("waffle_admin_session")?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }

  const session = verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: session.id,
      email: session.email,
      name: session.name,
    },
  });
}
