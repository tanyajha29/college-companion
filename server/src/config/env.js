import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const parseOrigins = (value) =>
  (value || "http://localhost:5173")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET,
  clientOrigin: parseOrigins(process.env.CLIENT_ORIGIN),
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST || "db",
    name: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 5432),
  },
  redis: {
    url: process.env.REDIS_URL || "redis://redis:6379",
  },
  email: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || "no-reply@college-companion.local",
  },
  s3: {
    region: process.env.AWS_REGION || "ap-south-1",
    bucket: process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  ollama: {
    url: process.env.OLLAMA_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "llama3.1:8b",
  },
};
