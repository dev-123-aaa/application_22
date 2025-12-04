import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

interface StatusUpdateRequest {
  project_id: string;
  status: string;
  script?: string;
  total_sections?: number;
  main_characters?: string;
  primary_locations?: string;
  central_theme?: string;
  tone?: string;
  thumbnail_suggestions?: string[];
  error?: string | null;
}

// POST - Update project status (called by n8n)
export async function POST(request: Request) {
  try {
    let body: StatusUpdateRequest;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const {
      project_id,
      status,
      script,
      total_sections,
      main_characters,
      primary_locations,
      central_theme,
      tone,
      thumbnail_suggestions,
      error,
    } = body;

    // Validate required fields
    if (!project_id || typeof project_id !== "string" || project_id.trim() === "") {
      return NextResponse.json(
        { success: false, error: "project_id is required" },
        { status: 400 }
      );
    }

    if (!status || typeof status !== "string" || status.trim() === "") {
      return NextResponse.json(
        { success: false, error: "status is required" },
        { status: 400 }
      );
    }

    // Build the update query dynamically
    // Using COALESCE to only update fields that are provided
    const sql = getDb();
    const result = await sql`
      UPDATE projects
      SET
        status = ${status},
        script = COALESCE(${script ?? null}, script),
        total_sections = COALESCE(${total_sections ?? null}, total_sections),
        main_characters = COALESCE(${main_characters ?? null}, main_characters),
        primary_locations = COALESCE(${primary_locations ?? null}, primary_locations),
        central_theme = COALESCE(${central_theme ?? null}, central_theme),
        tone = COALESCE(${tone ?? null}, tone),
        thumbnail_suggestions = COALESCE(${thumbnail_suggestions ?? null}, thumbnail_suggestions),
        error = ${error ?? null},
        updated_at = NOW()
      WHERE project_id = ${project_id}
      RETURNING project_id, status, updated_at
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project: {
        project_id: result[0].project_id,
        status: result[0].status,
        updated_at: result[0].updated_at,
      },
    });
  } catch (error) {
    console.error("Failed to update project status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update project status" },
      { status: 500 }
    );
  }
}
