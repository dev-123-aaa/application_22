import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { cache, CacheKeys, CacheTTL } from "@/lib/cache";

export const dynamic = "force-dynamic";

// Disable caching
const headers = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
};

// Status values that indicate a project is in progress
const IN_PROGRESS_STATUSES = [
  "Outline in progress",
  "Sections in creation",
  "Images generating",
  "Voiceover in progress",
];

// GET - Fetch all projects (optionally filtered by channel_id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel_id = searchParams.get("channel_id");
    const skipCache = searchParams.get("fresh") === "true";

    const cacheKey = CacheKeys.projects(channel_id || undefined);

    // Check cache first (unless fresh data requested)
    if (!skipCache) {
      const cached = cache.get<{ projects: Array<{ status?: string; video_status?: string }> }>(cacheKey);
      if (cached) {
        // Check if any project is in progress - if so, skip cache for real-time updates
        const hasInProgress = cached.projects.some(
          (p) =>
            IN_PROGRESS_STATUSES.includes(p.status || "") ||
            ["Section Chunking", "Rendering", "Finalizing"].includes(p.video_status || "")
        );
        if (!hasInProgress) {
          return NextResponse.json(cached, { headers });
        }
      }
    }

    const sql = getDb();

    let projects;
    if (channel_id) {
      // Filter by channel_id
      projects = await sql`
        SELECT * FROM projects
        WHERE channel_id = ${channel_id}
        ORDER BY created_at DESC
      `;
    } else {
      // Return all projects
      projects = await sql`
        SELECT * FROM projects ORDER BY created_at DESC
      `;
    }

    const response = { projects };

    // Cache the result
    cache.set(cacheKey, response, CacheTTL.PROJECTS_LIST);

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500, headers }
    );
  }
}

// Validate Google Docs URL format
function isValidGoogleDocsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "docs.google.com") return false;
    const pathMatch = parsed.pathname.match(/^\/document\/d\/[a-zA-Z0-9_-]+/);
    return pathMatch !== null;
  } catch {
    return false;
  }
}

// POST - Create a new project
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      project_id: providedId,
      title,
      duration_hours,
      duration_minutes,
      channel_id,
      script_mode = "generate",
      script_url = null,
    } = body;

    // Validate input
    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400, headers }
      );
    }

    if (typeof duration_hours !== "number" || duration_hours < 0) {
      return NextResponse.json(
        { error: "Duration hours must be a non-negative number" },
        { status: 400, headers }
      );
    }

    if (typeof duration_minutes !== "number" || duration_minutes < 0 || duration_minutes > 59) {
      return NextResponse.json(
        { error: "Duration minutes must be between 0 and 59" },
        { status: 400, headers }
      );
    }

    // Validate script_url if provided (manual mode)
    if (script_mode === "manual") {
      if (!script_url || !isValidGoogleDocsUrl(script_url)) {
        return NextResponse.json(
          { error: "Valid Google Docs URL is required in manual mode" },
          { status: 400, headers }
        );
      }
    }

    const sql = getDb();

    // Use provided project_id or generate new one
    let project_id = providedId;

    if (project_id) {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(project_id)) {
        return NextResponse.json(
          { error: "Invalid project_id format. Must be a valid UUID." },
          { status: 400, headers }
        );
      }

      // Check if project_id already exists
      const existing = await sql`
        SELECT project_id FROM projects WHERE project_id = ${project_id}
      `;
      if (existing.length > 0) {
        return NextResponse.json(
          { error: "Project with this ID already exists" },
          { status: 409, headers }
        );
      }
    } else {
      // Generate new UUID
      project_id = uuidv4();
    }

    // Validate channel_id if provided
    if (channel_id) {
      const channelExists = await sql`
        SELECT channel_id FROM channels WHERE channel_id = ${channel_id}
      `;
      if (channelExists.length === 0) {
        return NextResponse.json(
          { error: "Channel not found" },
          { status: 400, headers }
        );
      }
    }

    // Create project with script_url if manual mode, otherwise null
    const result = await sql`
      INSERT INTO projects (
        project_id,
        title,
        status,
        duration_hours,
        duration_minutes,
        channel_id,
        script_url,
        script_status,
        voiceover_status,
        created_at,
        updated_at
      )
      VALUES (
        ${project_id},
        ${title.trim()},
        'Outline in progress',
        ${duration_hours},
        ${duration_minutes},
        ${channel_id || null},
        ${script_mode === "manual" ? script_url : null},
        'pending',
        'pending',
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    // Invalidate projects list cache
    cache.invalidate("projects:");

    return NextResponse.json({
      success: true,
      project: result[0],
    }, { headers });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500, headers }
    );
  }
}
