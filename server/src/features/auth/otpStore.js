import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getRedisClient } from "../../lib/redis.js";

const OTP_TTL_SECONDS = 5 * 60;

const keyFor = (purpose, email) => `otp:${purpose}:${email.toLowerCase()}`;

export const generateOTP = () => crypto.randomInt(100000, 999999).toString();
export const hashOTP = async (otp) => bcrypt.hash(otp, 10);
export const verifyOTPHash = async (otp, hash) => bcrypt.compare(otp, hash);

export const saveOtp = async ({ purpose, email, otpHash, payload }) => {
  const redis = getRedisClient();
  const key = keyFor(purpose, email);
  const value = JSON.stringify({
    otp_hash: otpHash,
    attempts: 0,
    payload: payload || null,
  });
  await redis.set(key, value, { EX: OTP_TTL_SECONDS });
  return { expiresIn: OTP_TTL_SECONDS };
};

export const getOtp = async ({ purpose, email }) => {
  const redis = getRedisClient();
  const key = keyFor(purpose, email);
  const raw = await redis.get(key);
  if (!raw) return null;
  return JSON.parse(raw);
};

export const incrementAttempts = async ({ purpose, email }) => {
  const redis = getRedisClient();
  const key = keyFor(purpose, email);
  const raw = await redis.get(key);
  if (!raw) return null;
  const data = JSON.parse(raw);
  data.attempts = (data.attempts || 0) + 1;
  const ttl = await redis.ttl(key);
  await redis.set(key, JSON.stringify(data), { EX: Math.max(ttl, 1) });
  return data.attempts;
};

export const clearOtp = async ({ purpose, email }) => {
  const redis = getRedisClient();
  const key = keyFor(purpose, email);
  await redis.del(key);
};

export const otpTTLSeconds = OTP_TTL_SECONDS;
