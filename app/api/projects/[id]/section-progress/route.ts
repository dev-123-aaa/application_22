import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
};

interface SectionProgressRequest {
  current_section?: number;
  increment?: boolean;
}

// POST - Update section progress
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Security: Check webhook secret if configured
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (webhookSecret) {
    const providedSecret = request.headers.get("x-webhook-secret");
    if (providedSecret !== webhookSecret) {
      console.log("POST /api/projects/[id]/section-progress - Unauthorized");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  try {
    const { id } = await params;
    let body: SectionProgressRequest;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400, headers }
      );
    }

    const { current_section, increment } = body;

    // Validate input
    if (current_section === undefined && !increment) {
      return NextResponse.json(
        { success: false, error: "Either current_section or increment must be provided" },
        { status: 400, headers }
      );
    }

    const sql = getDb();

    let result;

    if (increment) {
      // Increment the current section by 1
      result = await sql`
        UPDATE projects
        SET current_section = COALESCE(current_section, 0) + 1,
            updated_at = NOW()
        WHERE project_id = ${id}
        RETURNING project_id, current_section, total_sections
      `;
    } else {
      // Set to specific value
      result = await sql`
        UPDATE projects
        SET current_section = ${current_section},
            updated_at = NOW()
        WHERE project_id = ${id}
        RETURNING project_id, current_section, total_sections
      `;
    }

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404, headers }
      );
    }

    console.log("POST /api/projects/[id]/section-progress - Updated:", result[0]);
    return NextResponse.json({
      success: true,
      project: {
        project_id: result[0].project_id,
        current_section: result[0].current_section,
        total_sections: result[0].total_sections,
      },
    }, { headers });
  } catch (error) {
    console.error("POST /api/projects/[id]/section-progress - Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update section progress" },
      { status: 500, headers }
    );
  }
}
