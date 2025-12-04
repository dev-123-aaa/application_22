import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Fetch current settings
export async function GET() {
  try {
    const settings = await sql`
      SELECT key, value, updated_at
      FROM settings
      WHERE key = 'webhook_url'
    `;

    if (settings.length === 0) {
      return NextResponse.json(
        { error: "Webhook URL not configured" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      webhook_url: settings[0].value,
      updated_at: settings[0].updated_at,
    });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - Update webhook URL
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { key, value } = body;

    // Validate input
    if (!key || !value) {
      return NextResponse.json(
        { error: "Missing required fields: key and value" },
        { status: 400 }
      );
    }

    if (key !== "webhook_url") {
      return NextResponse.json(
        { error: "Only webhook_url setting can be updated" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(value);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Update or insert the setting
    const result = await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = ${value}, updated_at = NOW()
      RETURNING key, value, updated_at
    `;

    return NextResponse.json({
      success: true,
      webhook_url: result[0].value,
      updated_at: result[0].updated_at,
    });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
