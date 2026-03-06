import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL.trim(),
  ssl: { rejectUnauthorized: false },
});

async function check() {
  try {
    const listSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'list';
    `);
    console.log("LIST TABLE:", listSchema.rows);

    const usersSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users';
    `);
    console.log("USERS TABLE:", usersSchema.rows);
  } catch(e) { console.error(e); }
  finally { pool.end(); }
}
check();
