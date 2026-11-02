import { NextResponse, type NextRequest } from "next/server";
import { from } from "@/lib/db";
import { verifySessionToken } from "@/lib/db/auth";

export const dynamic = "force-dynamic";

const ALLOWED_TABLES = new Set([
  "products",
  "stores",
  "blog_posts",
  "past_events",
  "contact_leads",
  "franchise_leads",
  "event_bookings",
]);

// Tables that public can read without admin auth
const PUBLIC_READ_TABLES = new Set([
  "products",
  "stores",
  "blog_posts",
  "past_events",
]);

// Tables that public can insert into (contact forms, franchise enquiry, event booking)
const PUBLIC_INSERT_TABLES = new Set([
  "contact_leads",
  "franchise_leads",
  "event_bookings",
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      table,
      action = "select",
      select: selectCols = "*",
      where = [],
      order = [],
      limit,
      data,
      count,
      head,
      single,
      maybeSingle,
    } = body;

    if (!table || !ALLOWED_TABLES.has(table)) {
      return NextResponse.json(
        { error: { message: `Invalid or unauthorized table: ${table}` } },
        { status: 400 }
      );
    }

    // Auth check: Is this action allowed publicly?
    const isPublicRead = action === "select" && PUBLIC_READ_TABLES.has(table);
    const isPublicInsert = action === "insert" && PUBLIC_INSERT_TABLES.has(table);

    if (!isPublicRead && !isPublicInsert) {
      // Must be authenticated as admin
      const token = request.cookies.get("waffle_admin_session")?.value;
      const session = token ? verifySessionToken(token) : null;
      if (!session) {
        return NextResponse.json(
          { error: { message: "Unauthorized: Admin session required" } },
          { status: 401 }
        );
      }
    }

    const builder = from(table);

    // Apply where clauses
    if (Array.isArray(where)) {
      for (const w of where) {
        if (w.op === "!=") {
          builder.neq(w.col, w.val);
        } else {
          builder.eq(w.col, w.val);
        }
      }
    }

    // Apply order
    if (Array.isArray(order)) {
      for (const o of order) {
        builder.order(o.col, { ascending: o.ascending });
      }
    }

    // Apply limit
    if (typeof limit === "number") {
      builder.limit(limit);
    }

    // Execute according to action
    if (action === "insert") {
      builder.insert(data);
    } else if (action === "update") {
      builder.update(data);
    } else if (action === "delete") {
      builder.delete();
    } else {
      // select
      builder.select(selectCols, {
        count: count ? "exact" : undefined,
        head: !!head,
      });
      if (single) {
        builder.single();
      } else if (maybeSingle) {
        builder.maybeSingle();
      }
    }

    const result = await builder.execute();

    if (result.error) {
      return NextResponse.json(
        { data: null, count: null, error: { message: result.error.message || String(result.error) } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: result.data,
      count: result.count,
      error: null,
    });
  } catch (err: any) {
    console.error("API /api/db error:", err);
    return NextResponse.json(
      { data: null, count: null, error: { message: err.message || "Internal server error" } },
      { status: 500 }
    );
  }
}
