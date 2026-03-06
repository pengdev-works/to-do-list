import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL.trim(),
    ssl: { rejectUnauthorized: false },
});

async function alter() {
    try {
        await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        await pool.query('ALTER TABLE list ALTER COLUMN id SET DEFAULT uuid_generate_v4();');
        await pool.query('ALTER TABLE items ALTER COLUMN id SET DEFAULT uuid_generate_v4();');
        console.log("SUCCESS");
    } catch (e) { console.error(e); }
    finally { pool.end(); }
}
alter();
