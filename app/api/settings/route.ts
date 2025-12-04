import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Disable caching for this endpoint
const headers = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Pragma": "no-cache",
};

// GET - Fetch current settings
export async function GET() {
  try {
    const sql = getDb();
    const settings = await sql`
      SELECT key, value, updated_at
      FROM settings
      WHERE key = 'webhook_url'
    `;

    if (settings.length === 0) {
      return NextResponse.json(
        { error: "Webhook URL not configured" },
        { status: 404, headers }
      );
    }

    return NextResponse.json({
      webhook_url: settings[0].value,
      updated_at: settings[0].updated_at,
    }, { headers });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500, headers }
    );
  }
}

// PUT - Update webhook URL
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    console.log("PUT /api/settings - Received body:", JSON.stringify(body));

    const { key, value } = body;

    // Validate input
    if (!key || !value) {
      console.log("PUT /api/settings - Missing fields:", { key, value });
      return NextResponse.json(
        { error: "Missing required fields: key and value" },
        { status: 400, headers }
      );
    }

    if (key !== "webhook_url") {
      return NextResponse.json(
        { error: "Only webhook_url setting can be updated" },
        { status: 400, headers }
      );
    }

    // Validate URL format
    try {
      new URL(value);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400, headers }
      );
    }

    // Update or insert the setting
    const sql = getDb();
    console.log("PUT /api/settings - Executing SQL update for:", value);

    const result = await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW()
      RETURNING key, value, updated_at
    `;

    console.log("PUT /api/settings - SQL result:", JSON.stringify(result));

    if (!result || result.length === 0) {
      console.error("PUT /api/settings - No rows returned from upsert");
      return NextResponse.json(
        { error: "Database update failed - no rows returned" },
        { status: 500, headers }
      );
    }

    const response = {
      success: true,
      webhook_url: result[0].value,
      updated_at: result[0].updated_at,
    };

    console.log("PUT /api/settings - Returning:", JSON.stringify(response));
    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update settings" },
      { status: 500, headers }
    );
  }
}
