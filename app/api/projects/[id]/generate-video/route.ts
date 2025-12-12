import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
};

// POST - Trigger video generation
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getDb();

    // Get the project with channel info
    const projects = await sql`
      SELECT p.*, c.name as channel_name
      FROM projects p
      LEFT JOIN channels c ON p.channel_id = c.channel_id
      WHERE p.project_id = ${id}
    `;

    if (projects.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404, headers }
      );
    }

    const project = projects[0];

    // Validate script is approved
    if (project.script_status !== "approved") {
      return NextResponse.json(
        { error: "Script must be approved before generating video" },
        { status: 400, headers }
      );
    }

    // Validate script URL exists
    if (!project.script_url || project.script_url.trim() === "") {
      return NextResponse.json(
        { error: "Script URL is not set" },
        { status: 400, headers }
      );
    }

    // Check video generation not already in progress
    const inProgressStatuses = ["Section Chunking", "Rendering", "Finalizing"];
    if (project.video_status && inProgressStatuses.includes(project.video_status)) {
      return NextResponse.json(
        { error: "Video generation already in progress" },
        { status: 400, headers }
      );
    }

    // Get video webhook URL from settings
    const settings = await sql`
      SELECT value FROM settings WHERE key = 'webhook_video'
    `;

    if (settings.length === 0 || !settings[0].value || settings[0].value.trim() === "") {
      return NextResponse.json(
        { error: "Video generation webhook not configured. Please configure it in Settings." },
        { status: 500, headers }
      );
    }

    const webhookUrl = settings[0].value;

    // Update project to show video generation started
    await sql`
      UPDATE projects
      SET video_status = 'Section Chunking'
      WHERE project_id = ${id}
    `;

    // Prepare webhook payload
    const webhookPayload = {
      project_id: project.project_id,
      channel_id: project.channel_id || null,
      channel_name: project.channel_name || null,
      title: project.title,
      script_url: project.script_url,
    };

    // Trigger the webhook
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Revert video status on webhook failure
        await sql`
          UPDATE projects
          SET video_status = NULL
          WHERE project_id = ${id}
        `;
        throw new Error(`Webhook returned status ${response.status}`);
      }
    } catch (webhookError) {
      console.error("Video webhook trigger failed:", webhookError);

      // Revert video status
      await sql`
        UPDATE projects
        SET video_status = NULL
        WHERE project_id = ${id}
      `;

      if (webhookError instanceof Error && webhookError.name === "AbortError") {
        return NextResponse.json(
          { error: "Video generation webhook request timed out" },
          { status: 500, headers }
        );
      }

      return NextResponse.json(
        { error: "Failed to trigger video generation" },
        { status: 500, headers }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Video generation started",
    }, { headers });
  } catch (error) {
    console.error("Failed to start video generation:", error);
    return NextResponse.json(
      { error: "Failed to start video generation" },
      { status: 500, headers }
    );
  }
}
