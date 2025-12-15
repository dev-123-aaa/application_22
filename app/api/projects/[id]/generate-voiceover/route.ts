import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { cache, CacheKeys } from "@/lib/cache";

export const dynamic = "force-dynamic";

// Disable caching
const headers = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
};

interface RouteParams {
  params: { id: string };
}

/**
 * POST /api/projects/[id]/generate-voiceover
 *
 * Triggers voiceover generation for a project.
 * Requires:
 * - Script must be approved (script_status === 'approved')
 * - Voiceover webhook URL must be configured in settings
 *
 * Updates voiceover_status to 'in_progress' and calls the webhook with:
 * { project_id, script_url, channel_id, channel_name }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const projectId = params.id;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400, headers }
      );
    }

    const sql = getDb();

    // 1. Fetch project with channel info
    const projectResult = await sql`
      SELECT p.*, c.name as channel_name
      FROM projects p
      LEFT JOIN channels c ON p.channel_id = c.channel_id
      WHERE p.project_id = ${projectId}
    `;

    if (projectResult.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404, headers }
      );
    }

    const project = projectResult[0];

    // 2. Validate script is approved
    if (project.script_status !== "approved") {
      return NextResponse.json(
        { error: "Script must be approved before generating voiceover" },
        { status: 400, headers }
      );
    }

    // 3. Fetch webhook URL
    const settingsResult = await sql`
      SELECT value FROM settings WHERE key = 'webhook_voiceover'
    `;

    const webhookUrl = settingsResult[0]?.value;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Voiceover webhook URL not configured. Please configure it in Settings." },
        { status: 400, headers }
      );
    }

    // 4. Update voiceover status to in_progress
    await sql`
      UPDATE projects
      SET voiceover_status = 'in_progress', updated_at = NOW()
      WHERE project_id = ${projectId}
    `;

    // 5. Call webhook
    const payload = {
      project_id: project.project_id,
      script_url: project.script_url,
      channel_id: project.channel_id,
      channel_name: project.channel_name,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (webhookError) {
      console.error("Voiceover webhook call failed:", webhookError);
      // Continue anyway - status is already updated
      // The webhook might still process the request even if we don't get a response
    }

    // 6. Invalidate cache
    cache.delete(CacheKeys.project(projectId));
    cache.invalidate("projects:");

    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    console.error("Generate voiceover error:", error);
    return NextResponse.json(
      { error: "Failed to generate voiceover" },
      { status: 500, headers }
    );
  }
}
