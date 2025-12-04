import { neon } from "@neondatabase/serverless";

// Create connection on first use (lazy initialization for serverless)
function createSqlClient() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
      "Please add it to your .env.local file or Vercel environment variables."
    );
  }
  return neon(DATABASE_URL);
}

// Getter function - call this to get the sql tagged template function
export function getDb() {
  return createSqlClient();
}
