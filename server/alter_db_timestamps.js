import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL.trim(),
    ssl: { rejectUnauthorized: false },
});

async function alter() {
    try {
        await pool.query('ALTER TABLE list ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;');
        await pool.query('ALTER TABLE items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;');
        console.log("SUCCESS ADDED CREATED_AT");
    } catch (e) { console.error(e); }
    finally { pool.end(); }
}
alter();
