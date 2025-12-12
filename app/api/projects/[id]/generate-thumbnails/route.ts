import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
};

// POST - Trigger thumbnail generation
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const sql = getDb();

    // Fetch the project
    const projects = await sql`
      SELECT * FROM projects WHERE project_id = ${id}
    `;

    if (projects.length === 0) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404, headers }
      );
    }

    const project = projects[0];

    // Check if script is approved
    if (project.script_status !== "approved") {
      return NextResponse.json(
        { success: false, error: "Script must be approved before generating thumbnails" },
        { status: 400, headers }
      );
    }

    // Check if script URL exists
    if (!project.script_url) {
      return NextResponse.json(
        { success: false, error: "No script URL available to generate thumbnails from" },
        { status: 400, headers }
      );
    }

    // Fetch the thumbnail webhook URL from settings
    const settings = await sql`
      SELECT value FROM settings WHERE key = 'webhook_thumbnail'
    `;

    if (settings.length === 0 || !settings[0].value) {
      return NextResponse.json(
        { success: false, error: "Thumbnail webhook URL not configured. Please configure it in Settings." },
        { status: 400, headers }
      );
    }

    const webhookUrl = settings[0].value;

    // Get channel info
    const channelId = project.channel_id || "cartoonolgy";
    let channelName = "Cartoonolgy";

    if (project.channel_id) {
      const channels = await sql`
        SELECT name FROM channels WHERE channel_id = ${project.channel_id}
      `;
      if (channels.length > 0) {
        channelName = channels[0].name;
      }
    }

    // Prepare webhook payload
    const payload = {
      project_id: project.project_id,
      channel_id: channelId,
      channel_name: channelName,
      title: project.title,
      script_url: project.script_url,
    };

    // Trigger the webhook
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!webhookResponse.ok) {
        console.error("Thumbnail webhook returned error:", webhookResponse.status);
        return NextResponse.json(
          { success: false, error: `Webhook returned status ${webhookResponse.status}` },
          { status: 500, headers }
        );
      }

      console.log("POST /api/projects/[id]/generate-thumbnails - Webhook triggered successfully");
      return NextResponse.json({ success: true }, { headers });
    } catch (webhookError) {
      clearTimeout(timeoutId);
      console.error("Thumbnail webhook failed:", webhookError);

      if (webhookError instanceof Error && webhookError.name === "AbortError") {
        return NextResponse.json(
          { success: false, error: "Webhook request timed out" },
          { status: 500, headers }
        );
      }

      return NextResponse.json(
        { success: false, error: "Failed to trigger thumbnail webhook" },
        { status: 500, headers }
      );
    }
  } catch (error) {
    console.error("POST /api/projects/[id]/generate-thumbnails - Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to trigger thumbnail generation" },
      { status: 500, headers }
    );
  }
}
