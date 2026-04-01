import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const host = (process.env.DB_HOST || "").toLowerCase();
const isLocal = ["localhost", "127.0.0.1", "db"].includes(host);
const looksLikeRds = host.includes("rds.amazonaws.com");
const isProduction = (process.env.NODE_ENV || "").toLowerCase() === "production";

const pool = new pg.Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: isLocal ? false : (looksLikeRds || isProduction ? { rejectUnauthorized: false } : false),
});

async function applyMigration() {
  try {
    const migrationsDir = path.join(__dirname, 'src', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const sqlFile = path.join(migrationsDir, file);
      const sql = fs.readFileSync(sqlFile, 'utf-8');
      console.log(`Applying migration: ${file}`);
      await pool.query(sql);
    }

    console.log('✅ All migrations applied successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyMigration();
