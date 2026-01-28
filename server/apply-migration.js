import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new pg.Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function applyMigration() {
  try {
    const sqlFile = path.join(__dirname, 'src', 'migrations', '002_create_pending_verifications.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    console.log('Applying migration: 002_create_pending_verifications.sql');
    await pool.query(sql);
    console.log('✅ Migration applied successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

applyMigration();
