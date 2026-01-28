import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

console.log("Attempting to connect to database:", process.env.DB_NAME);

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ DB connection error", err));

export const query = (text, params) => pool.query(text, params);  // 👈 added
export default pool;
