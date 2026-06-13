import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function loadUserData(pin: string) {
  const data = await redis.get(`user:${pin}`);
  return data ?? null;
}

export async function saveUserData(pin: string, data: unknown) {
  await redis.set(`user:${pin}`, data);
}
