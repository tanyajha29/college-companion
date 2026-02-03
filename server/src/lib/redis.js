import { createClient } from "redis";
import { env } from "../config/env.js";

let redisClient;

export const getRedisClient = () => {
  if (redisClient) return redisClient;
  redisClient = createClient({ url: env.redis.url });
  redisClient.on("error", (err) => console.error("❌ Redis error", err));
  redisClient.connect().then(() => console.log("✅ Redis connected"));
  return redisClient;
};
