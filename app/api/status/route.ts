import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

interface StatusUpdateRequest {
  project_id: string;
  status?: string;
  script_url?: string;
  script_status?: "pending" | "draft" | "approved";
  total_sections?: number;
  current_section?: number;
  main_characters?: string | string[];
  primary_locations?: string | string[];
  central_theme?: string;
  tone?: string;
  thumbnail_suggestions?: string[];
  error?: string | null;
  // Video generation fields
  video_status?: string;
  video_drive_folder?: string;
}

// POST - Update project status (called by n8n)
export async function POST(request: Request) {
  // Security: Check webhook secret if configured
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (webhookSecret) {
    const providedSecret = request.headers.get("x-webhook-secret");
    if (providedSecret !== webhookSecret) {
      console.log("POST /api/status - Unauthorized: invalid or missing secret");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

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

    console.log("POST /api/status - Received:", JSON.stringify(body));

    const {
      project_id,
      status,
      script_url,
      script_status,
      total_sections,
      current_section,
      main_characters,
      primary_locations,
      central_theme,
      tone,
      thumbnail_suggestions,
      error,
      video_status,
      video_drive_folder,
    } = body;

    // Validate required fields
    if (!project_id || typeof project_id !== "string" || project_id.trim() === "") {
      return NextResponse.json(
        { success: false, error: "project_id is required" },
        { status: 400 }
      );
    }

    // At least one of status or video_status must be provided
    const hasStatus = status && typeof status === "string" && status.trim() !== "";
    const hasVideoStatus = video_status && typeof video_status === "string" && video_status.trim() !== "";

    if (!hasStatus && !hasVideoStatus) {
      return NextResponse.json(
        { success: false, error: "status or video_status is required" },
        { status: 400 }
      );
    }

    // Convert arrays to strings if needed (n8n might send arrays)
    const mainCharsStr = Array.isArray(main_characters)
      ? main_characters.join(", ")
      : main_characters;
    const locationsStr = Array.isArray(primary_locations)
      ? primary_locations.join(", ")
      : primary_locations;

    // Build the update query dynamically
    // Using COALESCE to only update fields that are provided
    const sql = getDb();
    const result = await sql`
      UPDATE projects
      SET
        status = COALESCE(${status ?? null}, status),
        script_url = COALESCE(${script_url ?? null}, script_url),
        script_status = COALESCE(${script_status ?? null}, script_status),
        total_sections = COALESCE(${total_sections ?? null}, total_sections),
        current_section = COALESCE(${current_section ?? null}, current_section),
        main_characters = COALESCE(${mainCharsStr ?? null}, main_characters),
        primary_locations = COALESCE(${locationsStr ?? null}, primary_locations),
        central_theme = COALESCE(${central_theme ?? null}, central_theme),
        tone = COALESCE(${tone ?? null}, tone),
        thumbnail_suggestions = COALESCE(${thumbnail_suggestions ?? null}, thumbnail_suggestions),
        error = ${error ?? null},
        video_status = COALESCE(${video_status ?? null}, video_status),
        video_drive_folder = COALESCE(${video_drive_folder ?? null}, video_drive_folder),
        updated_at = NOW()
      WHERE project_id = ${project_id}
      RETURNING project_id, status, script_status, current_section, total_sections, video_status, video_drive_folder, updated_at
    `;

    if (result.length === 0) {
      console.log("POST /api/status - Project not found:", project_id);
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    console.log("POST /api/status - Updated:", result[0]);
    return NextResponse.json({
      success: true,
      project: {
        project_id: result[0].project_id,
        status: result[0].status,
        script_status: result[0].script_status,
        current_section: result[0].current_section,
        total_sections: result[0].total_sections,
        video_status: result[0].video_status,
        video_drive_folder: result[0].video_drive_folder,
        updated_at: result[0].updated_at,
      },
    });
  } catch (error) {
    console.error("POST /api/status - Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update project status" },
      { status: 500 }
    );
  }
}
