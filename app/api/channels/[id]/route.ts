import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isValidHexColor } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

// Disable caching
const headers = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
};

// GET - Fetch single channel by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const sql = getDb();
    const channels = await sql`
      SELECT * FROM channels WHERE channel_id = ${id}
    `;

    if (channels.length === 0) {
      return NextResponse.json(
        { error: "Channel not found" },
        { status: 404, headers }
      );
    }

    return NextResponse.json({ channel: channels[0] }, { headers });
  } catch (error) {
    console.error("Failed to fetch channel:", error);
    return NextResponse.json(
      { error: "Failed to fetch channel" },
      { status: 500, headers }
    );
  }
}

// PUT - Update channel
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, slug: providedSlug, description, color, avatar_url } = body;

    const sql = getDb();

    // Check if channel exists
    const existing = await sql`
      SELECT * FROM channels WHERE channel_id = ${id}
    `;

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Channel not found" },
        { status: 404, headers }
      );
    }

    const currentChannel = existing[0];

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400, headers }
        );
      }
      if (name.length > 100) {
        return NextResponse.json(
          { error: "Name must be 100 characters or less" },
          { status: 400, headers }
        );
      }
    }

    // Validate slug if provided
    let newSlug = currentChannel.slug;
    if (providedSlug !== undefined) {
      newSlug = providedSlug.trim();
      if (!/^[a-z0-9-]+$/.test(newSlug)) {
        return NextResponse.json(
          { error: "Slug must only contain lowercase letters, numbers, and hyphens" },
          { status: 400, headers }
        );
      }

      // Check if new slug conflicts with another channel
      if (newSlug !== currentChannel.slug) {
        const slugConflict = await sql`
          SELECT channel_id FROM channels WHERE slug = ${newSlug} AND channel_id != ${id}
        `;
        if (slugConflict.length > 0) {
          return NextResponse.json(
            { error: "Channel with this slug already exists" },
            { status: 400, headers }
          );
        }
      }
    }

    // Validate color if provided
    if (color !== undefined && !isValidHexColor(color)) {
      return NextResponse.json(
        { error: "Color must be a valid hex color (e.g., #FF0000)" },
        { status: 400, headers }
      );
    }

    // Update channel with provided fields
    const result = await sql`
      UPDATE channels
      SET
        name = COALESCE(${name !== undefined ? name.trim() : null}, name),
        slug = ${newSlug},
        description = COALESCE(${description !== undefined ? description : null}, description),
        color = COALESCE(${color !== undefined ? color : null}, color),
        avatar_url = COALESCE(${avatar_url !== undefined ? avatar_url : null}, avatar_url),
        updated_at = NOW()
      WHERE channel_id = ${id}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      channel: result[0],
    }, { headers });
  } catch (error) {
    console.error("Failed to update channel:", error);
    return NextResponse.json(
      { error: "Failed to update channel" },
      { status: 500, headers }
    );
  }
}

// DELETE - Delete channel (only if no projects linked)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const sql = getDb();

    // Check if channel exists
    const existing = await sql`
      SELECT channel_id FROM channels WHERE channel_id = ${id}
    `;

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Channel not found" },
        { status: 404, headers }
      );
    }

    // Check if channel has any projects
    const projects = await sql`
      SELECT project_id FROM projects WHERE channel_id = ${id} LIMIT 1
    `;

    if (projects.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete channel with existing projects" },
        { status: 400, headers }
      );
    }

    // Delete channel
    await sql`DELETE FROM channels WHERE channel_id = ${id}`;

    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    console.error("Failed to delete channel:", error);
    return NextResponse.json(
      { error: "Failed to delete channel" },
      { status: 500, headers }
    );
  }
}
