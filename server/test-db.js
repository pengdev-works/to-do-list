import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

// Load .env
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is missing!");
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString.trim(),
  ssl: { rejectUnauthorized: false },
});

pool.connect()
  .then(client => {
    console.log("✅ Successfully connected to Neon!");
    client.release();
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  });
pool.query("SELECT NOW()")
  .then(res => {
    console.log("✅ Neon DB responded:", res.rows[0]);
    pool.end();
  })
  .catch(err => {
    console.error("❌ DB connection error:", err);
    pool.end();
  });
