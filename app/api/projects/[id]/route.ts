import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    console.log("GET /api/projects/[id] - Fetching project:", id);

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

    console.log("GET /api/projects/[id] - Found:", projects[0].status);
    return NextResponse.json({ project: projects[0] }, { headers });
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
    const body = await request.json();
    const { script_url } = body;

    console.log("PUT /api/projects/[id] - Updating project:", id);

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

    console.log("PUT /api/projects/[id] - Project updated:", id);
    return NextResponse.json({ success: true, project: result[0] }, { headers });
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500, headers }
    );
  }
}
