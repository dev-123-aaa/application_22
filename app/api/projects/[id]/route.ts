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
