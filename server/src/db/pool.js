import pg from "pg";
import { env } from "../config/env.js";

export const pool = new pg.Pool({
  user: env.db.user,
  host: env.db.host,
  database: env.db.name,
  password: env.db.password,
  port: env.db.port,
});

const connectWithRetry = async (attempt = 1) => {
  try {
    await pool.connect();
    console.log("✅ Connected to PostgreSQL");
  } catch (err) {
    const delay = Math.min(1000 * attempt, 5000);
    console.error(`❌ DB connection error (attempt ${attempt}). Retrying in ${delay}ms`, err.code || err.message);
    setTimeout(() => connectWithRetry(attempt + 1), delay);
  }
};

connectWithRetry();

export const query = (text, params) => pool.query(text, params);

export default pool;
