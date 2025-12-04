import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Check for secret key in production
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  const isProduction = process.env.NODE_ENV === "production";
  const migrationSecret = process.env.MIGRATION_SECRET;

  if (isProduction && migrationSecret && secret !== migrationSecret) {
    return NextResponse.json(
      { error: "Unauthorized. Provide valid secret key." },
      { status: 401 }
    );
  }

  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL environment variable is not set" },
      { status: 500 }
    );
  }

  const sql = neon(DATABASE_URL);
  const results: string[] = [];

  try {
    // Create settings table
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    results.push("Settings table created");

    // Insert default webhook URL
    await sql`
      INSERT INTO settings (key, value)
      VALUES ('webhook_url', 'https://apkmap.app.n8n.cloud/webhook-test/961b7f38-73c4-4503-be2e-7333190dafa2')
      ON CONFLICT (key) DO NOTHING
    `;
    results.push("Default webhook URL inserted");

    // Create projects table
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        project_id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        status VARCHAR(255) DEFAULT 'Outline in progress',
        duration_hours INTEGER DEFAULT 0,
        duration_minutes INTEGER DEFAULT 0,
        total_sections INTEGER,
        main_characters TEXT,
        primary_locations TEXT,
        central_theme TEXT,
        tone TEXT,
        script TEXT,
        thumbnail_suggestions TEXT[],
        error TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    results.push("Projects table created");

    // Create updated_at trigger function
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    results.push("Trigger function created");

    // Create trigger for projects table
    await sql`
      DROP TRIGGER IF EXISTS update_projects_updated_at ON projects
    `;
    await sql`
      CREATE TRIGGER update_projects_updated_at
        BEFORE UPDATE ON projects
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;
    results.push("Projects trigger created");

    // Create trigger for settings table
    await sql`
      DROP TRIGGER IF EXISTS update_settings_updated_at ON settings
    `;
    await sql`
      CREATE TRIGGER update_settings_updated_at
        BEFORE UPDATE ON settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;
    results.push("Settings trigger created");

    // Verify tables exist
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('settings', 'projects')
    `;

    // Get current settings
    const settings = await sql`SELECT * FROM settings`;

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully",
      steps: results,
      tables: tables.map((t) => t.table_name),
      settings: settings.map((s) => ({ key: s.key, value: s.value })),
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Migration failed",
        steps: results,
      },
      { status: 500 }
    );
  }
}
