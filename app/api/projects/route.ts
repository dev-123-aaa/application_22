import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

// GET - Fetch all projects
export async function GET() {
  try {
    const projects = await sql`
      SELECT * FROM projects ORDER BY created_at DESC
    `;

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST - Create a new project
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, duration_hours, duration_minutes } = body;

    // Validate input
    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (typeof duration_hours !== "number" || duration_hours < 0) {
      return NextResponse.json(
        { error: "Duration hours must be a non-negative number" },
        { status: 400 }
      );
    }

    if (typeof duration_minutes !== "number" || duration_minutes < 0 || duration_minutes > 59) {
      return NextResponse.json(
        { error: "Duration minutes must be between 0 and 59" },
        { status: 400 }
      );
    }

    const project_id = uuidv4();

    const result = await sql`
      INSERT INTO projects (
        project_id,
        title,
        status,
        duration_hours,
        duration_minutes,
        created_at,
        updated_at
      )
      VALUES (
        ${project_id},
        ${title.trim()},
        'Outline in progress',
        ${duration_hours},
        ${duration_minutes},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      project: result[0],
    });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
