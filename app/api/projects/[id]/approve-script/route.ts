import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
};

// POST - Toggle script approval
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { approved } = body;

    if (typeof approved !== "boolean") {
      return NextResponse.json(
        { error: "approved must be a boolean" },
        { status: 400, headers }
      );
    }

    const sql = getDb();

    // Update the script_approved field
    const result = await sql`
      UPDATE projects
      SET script_approved = ${approved}
      WHERE project_id = ${id}
      RETURNING project_id, script_approved
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404, headers }
      );
    }

    return NextResponse.json({
      success: true,
      project: result[0],
    }, { headers });
  } catch (error) {
    console.error("Failed to update script approval:", error);
    return NextResponse.json(
      { error: "Failed to update script approval" },
      { status: 500, headers }
    );
  }
}
