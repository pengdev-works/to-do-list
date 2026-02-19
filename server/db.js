// server/db.js
import "dotenv/config";
import pkg from "pg";

const { Pool } = pkg;

// ✅ Use ONLY DATABASE_URL (best for Neon + Render)
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL.trim(),
  ssl: { rejectUnauthorized: false }, // required for Neon
});
