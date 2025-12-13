import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { cache, CacheKeys, CacheTTL, shouldCacheProject } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Validate Google Docs URL format
function isValidGoogleDocsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Must be from docs.google.com domain
    if (parsed.hostname !== "docs.google.com") {
      return false;
    }
    // Must be a document path: /document/d/[ID]/...
    const pathMatch = parsed.pathname.match(/^\/document\/d\/[a-zA-Z0-9_-]+/);
    return pathMatch !== null;
  } catch {
    return false;
  }
}

// Disable caching
const headers = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
};

// GET - Fetch single project by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const skipCache = searchParams.get("fresh") === "true";

    console.log("GET /api/projects/[id] - Fetching project:", id);

    const cacheKey = CacheKeys.project(id);

    // Check cache first (unless fresh data requested)
    if (!skipCache) {
      const cached = cache.get<{ project: { status: string; video_status: string | null } }>(cacheKey);
      if (cached && shouldCacheProject(cached.project.status, cached.project.video_status)) {
        console.log("GET /api/projects/[id] - Cache hit:", id);
        return NextResponse.json(cached, { headers });
      }
    }

    const sql = getDb();
    const projects = await sql`
      SELECT * FROM projects WHERE project_id = ${id}
    `;

    if (projects.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404, headers }
      );
    }

    const response = { project: projects[0] };

    // Only cache if project is not in progress
    if (shouldCacheProject(projects[0].status, projects[0].video_status)) {
      cache.set(cacheKey, response, CacheTTL.PROJECT_SINGLE);
    }

    console.log("GET /api/projects/[id] - Found:", projects[0].status);
    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500, headers }
    );
  }
}

// DELETE - Delete project by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log("DELETE /api/projects/[id] - Deleting project:", id);

    const sql = getDb();

    // Check if project exists first
    const existing = await sql`
      SELECT project_id FROM projects WHERE project_id = ${id}
    `;

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404, headers }
      );
    }

    // Delete the project
    await sql`DELETE FROM projects WHERE project_id = ${id}`;

    // Invalidate caches
    cache.delete(CacheKeys.project(id));
    cache.invalidate("projects:");

    console.log("DELETE /api/projects/[id] - Project deleted:", id);
    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500, headers }
    );
  }
}

// PATCH - Update project status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    console.log("PATCH /api/projects/[id] - Updating project:", id, "status:", status);

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400, headers }
      );
    }

    const sql = getDb();

    // Check if project exists first
    const existing = await sql`
      SELECT project_id FROM projects WHERE project_id = ${id}
    `;

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404, headers }
      );
    }

    // Update the project status
    const result = await sql`
      UPDATE projects
      SET status = ${status}, updated_at = NOW()
      WHERE project_id = ${id}
      RETURNING *
    `;

    // Invalidate caches
    cache.delete(CacheKeys.project(id));
    cache.invalidate("projects:");

    console.log("PATCH /api/projects/[id] - Project updated:", id);
    return NextResponse.json({ success: true, project: result[0] }, { headers });
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500, headers }
    );
  }
}

// PUT - Update project fields (script_url, etc.)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400, headers }
      );
    }

    const { script_url } = body;

    console.log("PUT /api/projects/[id] - Updating project:", id, "body:", JSON.stringify(body));

    // Validate Google Docs URL format if script_url is provided
    if (script_url && script_url.trim() !== "" && !isValidGoogleDocsUrl(script_url)) {
      return NextResponse.json(
        { error: "script_url must be a valid Google Docs URL (https://docs.google.com/document/d/...)" },
        { status: 400, headers }
      );
    }

    const sql = getDb();

    // Check if project exists first
    const existing = await sql`
      SELECT project_id FROM projects WHERE project_id = ${id}
    `;

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404, headers }
      );
    }

    // Update the project with the provided fields
    const result = await sql`
      UPDATE projects
      SET
        script_url = COALESCE(${script_url ?? null}, script_url),
        updated_at = NOW()
      WHERE project_id = ${id}
      RETURNING *
    `;

    // Invalidate caches
    cache.delete(CacheKeys.project(id));
    cache.invalidate("projects:");

    console.log("PUT /api/projects/[id] - Project updated:", id);
    return NextResponse.json({ success: true, project: result[0] }, { headers });
  } catch (error) {
    console.error("PUT /api/projects/[id] - Error:", error);
    return NextResponse.json(
      {
        error: "Failed to update project",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500, headers }
    );
  }
}
