import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateSlug, isValidHexColor } from "@/lib/db/schema";
import { cache, CacheKeys, CacheTTL } from "@/lib/cache";

export const dynamic = "force-dynamic";

// Disable caching
const headers = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
};

// GET - Fetch all channels with project counts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skipCache = searchParams.get("fresh") === "true";

    const cacheKey = CacheKeys.channels();

    // Check cache first (unless fresh data requested)
    if (!skipCache) {
      const cached = cache.get<{ channels: unknown[] }>(cacheKey);
      if (cached) {
        return NextResponse.json(cached, { headers });
      }
    }

    const sql = getDb();
    const channels = await sql`
      SELECT c.*,
             COALESCE(COUNT(p.project_id), 0)::int as project_count
      FROM channels c
      LEFT JOIN projects p ON c.channel_id = p.channel_id
      GROUP BY c.channel_id
      ORDER BY c.name ASC
    `;

    const response = { channels };

    // Cache the result (5 minutes)
    cache.set(cacheKey, response, CacheTTL.CHANNELS);

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error("Failed to fetch channels:", error);
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500, headers }
    );
  }
}

// POST - Create a new channel
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug: providedSlug, description, color, avatar_url } = body;

    // Validate name
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400, headers }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Name must be 100 characters or less" },
        { status: 400, headers }
      );
    }

    // Generate or validate slug
    const slug = providedSlug ? providedSlug.trim() : generateSlug(name.trim());

    if (!slug || slug.length === 0) {
      return NextResponse.json(
        { error: "Could not generate a valid slug from the name" },
        { status: 400, headers }
      );
    }

    // Validate URL-safe slug
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Slug must only contain lowercase letters, numbers, and hyphens" },
        { status: 400, headers }
      );
    }

    // Validate color if provided
    const finalColor = color || "#00d4ff";
    if (!isValidHexColor(finalColor)) {
      return NextResponse.json(
        { error: "Color must be a valid hex color (e.g., #FF0000)" },
        { status: 400, headers }
      );
    }

    // Use slug as channel_id for simplicity
    const channel_id = slug;

    const sql = getDb();

    // Check if slug already exists
    const existing = await sql`
      SELECT channel_id FROM channels WHERE slug = ${slug} OR channel_id = ${channel_id}
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Channel with this slug already exists" },
        { status: 400, headers }
      );
    }

    // Insert new channel
    const result = await sql`
      INSERT INTO channels (
        channel_id,
        name,
        slug,
        description,
        color,
        avatar_url,
        created_at,
        updated_at
      )
      VALUES (
        ${channel_id},
        ${name.trim()},
        ${slug},
        ${description || null},
        ${finalColor},
        ${avatar_url || null},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    // Invalidate channels cache
    cache.delete(CacheKeys.channels());

    return NextResponse.json({
      success: true,
      channel: result[0],
    }, { headers });
  } catch (error) {
    console.error("Failed to create channel:", error);
    return NextResponse.json(
      { error: "Failed to create channel" },
      { status: 500, headers }
    );
  }
}
