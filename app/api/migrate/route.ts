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
    results.push("Settings table created/verified");

    // Migrate webhook settings - convert old webhook_url to webhook_script
    const existingWebhook = await sql`
      SELECT value FROM settings WHERE key = 'webhook_url'
    `;
    if (existingWebhook.length > 0) {
      await sql`
        INSERT INTO settings (key, value)
        VALUES ('webhook_script', ${existingWebhook[0].value})
        ON CONFLICT (key) DO UPDATE SET value = ${existingWebhook[0].value}
      `;
      results.push("Migrated webhook_url to webhook_script");
    }

    // Insert webhook defaults
    await sql`
      INSERT INTO settings (key, value)
      VALUES ('webhook_script', '')
      ON CONFLICT (key) DO NOTHING
    `;
    await sql`
      INSERT INTO settings (key, value)
      VALUES ('webhook_video', '')
      ON CONFLICT (key) DO NOTHING
    `;
    await sql`
      INSERT INTO settings (key, value)
      VALUES ('webhook_thumbnail', '')
      ON CONFLICT (key) DO NOTHING
    `;
    results.push("Webhook settings configured");

    // Create channels table
    await sql`
      CREATE TABLE IF NOT EXISTS channels (
        channel_id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        color VARCHAR(7) DEFAULT '#00d4ff',
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    results.push("Channels table created/verified");

    // Seed default channels
    await sql`
      INSERT INTO channels (channel_id, name, slug, color) VALUES
        ('cartoonolgy', 'Cartoonolgy', 'cartoonolgy', '#FFD700'),
        ('ricktopus', 'Ricktopus', 'ricktopus', '#FF6B00'),
        ('red-umbrella', 'Red Umbrella', 'red-umbrella', '#E61919'),
        ('hidden-hokage', 'Hidden Hokage', 'hidden-hokage', '#FF8C00'),
        ('beyond-ultra', 'Beyond Ultra', 'beyond-ultra', '#9B59B6')
      ON CONFLICT (channel_id) DO NOTHING
    `;
    results.push("Default channels seeded");

    // Create projects table with full schema
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        project_id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        status VARCHAR(255) DEFAULT 'Outline in progress',
        duration_hours INTEGER DEFAULT 0,
        duration_minutes INTEGER DEFAULT 0,
        total_sections INTEGER,
        current_section INTEGER DEFAULT 0,
        main_characters TEXT,
        primary_locations TEXT,
        central_theme TEXT,
        tone TEXT,
        script_url TEXT,
        script_status VARCHAR(20) DEFAULT 'pending',
        thumbnail_suggestions TEXT[],
        error TEXT,
        channel_id VARCHAR(255) REFERENCES channels(channel_id),
        video_status VARCHAR(255),
        video_drive_folder TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    results.push("Projects table created/verified");

    // Add missing columns to existing projects table (for databases created with old schema)
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS channel_id VARCHAR(255) REFERENCES channels(channel_id)`;
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_status VARCHAR(255)`;
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_drive_folder TEXT`;
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS current_section INTEGER DEFAULT 0`;
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS script_url TEXT`;
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS script_status VARCHAR(20) DEFAULT 'pending'`;
    results.push("Added missing columns to projects table");

    // Migrate old script_approved to script_status if it exists
    try {
      await sql`
        UPDATE projects
        SET script_status = CASE
          WHEN script_approved = true THEN 'approved'
          ELSE 'pending'
        END
        WHERE script_approved IS NOT NULL
          AND (script_status IS NULL OR script_status = 'pending')
      `;
      results.push("Migrated script_approved to script_status");
    } catch {
      // Column doesn't exist, skip
    }

    // Drop old columns if they exist
    try {
      await sql`ALTER TABLE projects DROP COLUMN IF EXISTS script`;
      results.push("Dropped old script column");
    } catch {
      // Column doesn't exist or can't be dropped
    }

    try {
      await sql`ALTER TABLE projects DROP COLUMN IF EXISTS script_approved`;
      results.push("Dropped old script_approved column");
    } catch {
      // Column doesn't exist or can't be dropped
    }

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

    // Create triggers for all tables
    await sql`DROP TRIGGER IF EXISTS update_projects_updated_at ON projects`;
    await sql`
      CREATE TRIGGER update_projects_updated_at
        BEFORE UPDATE ON projects
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;
    results.push("Projects trigger created");

    await sql`DROP TRIGGER IF EXISTS update_settings_updated_at ON settings`;
    await sql`
      CREATE TRIGGER update_settings_updated_at
        BEFORE UPDATE ON settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;
    results.push("Settings trigger created");

    await sql`DROP TRIGGER IF EXISTS update_channels_updated_at ON channels`;
    await sql`
      CREATE TRIGGER update_channels_updated_at
        BEFORE UPDATE ON channels
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;
    results.push("Channels trigger created");

    // Verify tables exist
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('settings', 'projects', 'channels')
    `;

    // Get current settings
    const settings = await sql`SELECT key, value FROM settings`;

    // Get channels
    const channels = await sql`SELECT channel_id, name FROM channels ORDER BY name`;

    // Get projects column info to verify schema
    const projectColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'projects'
      ORDER BY ordinal_position
    `;

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully",
      steps: results,
      tables: tables.map((t) => t.table_name),
      settings: settings.map((s) => ({ key: s.key, value: s.value ? "configured" : "empty" })),
      channels: channels.map((c) => c.name),
      projectColumns: projectColumns.map((c) => c.column_name),
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
