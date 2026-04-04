import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

// Build credentials only when both keys are provided; otherwise fall back to
// the default provider chain (e.g., EC2 instance profile) to avoid
// "Resolved credential object is not valid" errors in production.
const explicitCredentials =
  env.s3.accessKeyId && env.s3.secretAccessKey
    ? {
        accessKeyId: env.s3.accessKeyId,
        secretAccessKey: env.s3.secretAccessKey,
      }
    : undefined;

export const s3 = new S3Client({
  region: env.s3.region || "ap-south-1",
  credentials: explicitCredentials,
});
