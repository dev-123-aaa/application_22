import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set.");
  console.error("Please add it to your .env.local file or set it in your environment.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrate() {
  console.log("Starting database migration...\n");

  try {
    // Create settings table
    console.log("Creating settings table...");
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log("✓ Settings table created");

    // Migrate webhook settings
    console.log("Setting up webhook settings...");

    // Check if old webhook_url exists and migrate it
    const existingWebhook = await sql`
      SELECT value FROM settings WHERE key = 'webhook_url'
    `;

    if (existingWebhook.length > 0) {
      // Migrate old webhook_url to webhook_script
      await sql`
        INSERT INTO settings (key, value)
        VALUES ('webhook_script', ${existingWebhook[0].value})
        ON CONFLICT (key) DO UPDATE SET value = ${existingWebhook[0].value}
      `;
      // Optionally remove the old key
      await sql`DELETE FROM settings WHERE key = 'webhook_url'`;
      console.log("✓ Migrated webhook_url to webhook_script");
    } else {
      // Insert default script webhook
      await sql`
        INSERT INTO settings (key, value)
        VALUES ('webhook_script', '')
        ON CONFLICT (key) DO NOTHING
      `;
    }

    // Insert video and thumbnail webhook defaults
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
    console.log("✓ Webhook settings configured");

    // Create channels table
    console.log("Creating channels table...");
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
    console.log("✓ Channels table created");

    // Seed default channels
    console.log("Seeding default channels...");
    await sql`
      INSERT INTO channels (channel_id, name, slug, color) VALUES
        ('cartoonolgy', 'Cartoonolgy', 'cartoonolgy', '#FFD700'),
        ('ricktopus', 'Ricktopus', 'ricktopus', '#FF6B00'),
        ('red-umbrella', 'Red Umbrella', 'red-umbrella', '#E61919'),
        ('hidden-hokage', 'Hidden Hokage', 'hidden-hokage', '#FF8C00'),
        ('beyond-ultra', 'Beyond Ultra', 'beyond-ultra', '#9B59B6')
      ON CONFLICT (channel_id) DO NOTHING
    `;
    console.log("✓ Default channels seeded");

    // Create projects table
    console.log("Creating projects table...");
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
        channel_id VARCHAR(255) REFERENCES channels(channel_id),
        script_approved BOOLEAN DEFAULT FALSE,
        video_status VARCHAR(255),
        video_drive_folder TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log("✓ Projects table created");

    // Add channel_id column to projects if it doesn't exist (for existing databases)
    console.log("Ensuring channel_id column exists in projects...");
    await sql`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS channel_id VARCHAR(255) REFERENCES channels(channel_id)
    `;
    console.log("✓ channel_id column ensured");

    // Add video generation columns for existing databases
    console.log("Ensuring video generation columns exist in projects...");
    await sql`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS script_approved BOOLEAN DEFAULT FALSE
    `;
    await sql`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS video_status VARCHAR(255)
    `;
    await sql`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS video_drive_folder TEXT
    `;
    console.log("✓ Video generation columns ensured");

    // Create updated_at trigger function
    console.log("Creating updated_at trigger function...");
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    console.log("✓ Trigger function created");

    // Create trigger for projects table
    console.log("Creating trigger for projects table...");
    await sql`
      DROP TRIGGER IF EXISTS update_projects_updated_at ON projects
    `;
    await sql`
      CREATE TRIGGER update_projects_updated_at
        BEFORE UPDATE ON projects
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;
    console.log("✓ Projects trigger created");

    // Create trigger for settings table
    console.log("Creating trigger for settings table...");
    await sql`
      DROP TRIGGER IF EXISTS update_settings_updated_at ON settings
    `;
    await sql`
      CREATE TRIGGER update_settings_updated_at
        BEFORE UPDATE ON settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;
    console.log("✓ Settings trigger created");

    // Create trigger for channels table
    console.log("Creating trigger for channels table...");
    await sql`
      DROP TRIGGER IF EXISTS update_channels_updated_at ON channels
    `;
    await sql`
      CREATE TRIGGER update_channels_updated_at
        BEFORE UPDATE ON channels
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;
    console.log("✓ Channels trigger created");

    console.log("\n✅ Migration completed successfully!");

    // Verify tables
    console.log("\nVerifying tables...");
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('settings', 'projects', 'channels')
    `;
    console.log("Tables found:", tables.map((t) => t.table_name).join(", "));

    // Show settings
    const settings = await sql`SELECT * FROM settings`;
    console.log("\nCurrent settings:");
    settings.forEach((s) => {
      console.log(`  ${s.key}: ${s.value}`);
    });

    // Show channels
    const channels = await sql`SELECT channel_id, name, color FROM channels ORDER BY name`;
    console.log("\nCurrent channels:");
    channels.forEach((c) => {
      console.log(`  ${c.name} (${c.channel_id}) - ${c.color}`);
    });

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
