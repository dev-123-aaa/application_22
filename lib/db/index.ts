import { neon, NeonQueryFunction } from "@neondatabase/serverless";

// Lazy initialization to avoid build-time errors
let _sql: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (_sql) return _sql;

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
      "Please add it to your .env.local file or Vercel environment variables."
    );
  }

  _sql = neon(DATABASE_URL);
  return _sql;
}

// Export a proxy that lazily initializes the connection
export const sql = new Proxy({} as NeonQueryFunction<false, false>, {
  apply(_target, _thisArg, args) {
    return getSql()(args[0] as TemplateStringsArray, ...args.slice(1));
  },
  get(_target, prop) {
    return Reflect.get(getSql(), prop);
  },
});
