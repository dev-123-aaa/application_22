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

    // Insert default webhook URL
    console.log("Inserting default webhook URL...");
    await sql`
      INSERT INTO settings (key, value)
      VALUES ('webhook_url', 'https://apkmap.app.n8n.cloud/webhook-test/961b7f38-73c4-4503-be2e-7333190dafa2')
      ON CONFLICT (key) DO NOTHING
    `;
    console.log("✓ Default webhook URL inserted");

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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log("✓ Projects table created");

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

    console.log("\n✅ Migration completed successfully!");

    // Verify tables
    console.log("\nVerifying tables...");
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('settings', 'projects')
    `;
    console.log("Tables found:", tables.map((t) => t.table_name).join(", "));

    // Show settings
    const settings = await sql`SELECT * FROM settings`;
    console.log("\nCurrent settings:");
    settings.forEach((s) => {
      console.log(`  ${s.key}: ${s.value}`);
    });

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
