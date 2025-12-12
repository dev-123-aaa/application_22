import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { SCRIPT_STATUSES, ScriptStatus } from "@/lib/db/schema";
import { cache, CacheKeys } from "@/lib/cache";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
};

// POST - Update script status
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status is a valid script status
    if (!status || !SCRIPT_STATUSES.includes(status as ScriptStatus)) {
      return NextResponse.json(
        { error: `status must be one of: ${SCRIPT_STATUSES.join(", ")}` },
        { status: 400, headers }
      );
    }

    const sql = getDb();

    // If setting to "approved", verify script_url exists
    if (status === "approved") {
      const project = await sql`
        SELECT script_url FROM projects WHERE project_id = ${id}
      `;

      if (project.length === 0) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404, headers }
        );
      }

      if (!project[0].script_url || project[0].script_url.trim() === "") {
        return NextResponse.json(
          { error: "Cannot approve script: No script URL has been set. Please wait for the script to be generated." },
          { status: 400, headers }
        );
      }
    }

    // Update the script_status field
    const result = await sql`
      UPDATE projects
      SET script_status = ${status}
      WHERE project_id = ${id}
      RETURNING project_id, script_status, script_url
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404, headers }
      );
    }

    // Invalidate caches
    cache.delete(CacheKeys.project(id));
    cache.invalidate("projects:");

    return NextResponse.json({
      success: true,
      project: result[0],
    }, { headers });
  } catch (error) {
    console.error("Failed to update script status:", error);
    return NextResponse.json(
      { error: "Failed to update script status" },
      { status: 500, headers }
    );
  }
}
