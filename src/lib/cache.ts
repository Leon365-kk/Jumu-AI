import { createClient } from 'redis';

// Simple in-memory cache fallback if Redis is not configured
const memoryCache = new Map<string, { value: any; expiresAt: number }>();

let redisClient: ReturnType<typeof createClient> | null = null;
let redisConnected = false;

const REDIS_URL = process.env.REDIS_URL || process.env.REDISCLOUD_URL;

async function getRedisClient() {
  if (!REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    redisClient = createClient({ url: REDIS_URL });
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
      redisConnected = false;
    });
    await redisClient.connect();
    redisConnected = true;
  }

  return redisConnected ? redisClient : null;
}

export async function get(key: string): Promise<any | null> {
  try {
    const client = await getRedisClient();
    if (client) {
      const data = await client.get(key);
      return data ? JSON.parse(data.toString()) : null;
    }

    // Fallback to memory cache
    const cached = memoryCache.get(key);
    if (cached) {
      if (Date.now() > cached.expiresAt) {
        memoryCache.delete(key);
        return null;
      }
      return cached.value;
    }
  } catch (error) {
    console.error('Cache get error:', error);
  }
  return null;
}

export async function set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
  try {
    const client = await getRedisClient();
    if (client) {
      await client.setEx(key, ttlSeconds, JSON.stringify(value));
      return;
    }

    // Fallback to memory cache
    memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function del(key: string): Promise<void> {
  try {
    const client = await getRedisClient();
    if (client) {
      await client.del(key);
      return;
    }

    memoryCache.delete(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const client = await getRedisClient();
    if (client) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return;
    }

    // Fallback: delete all matching keys from memory cache
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
  } catch (error) {
    console.error('Cache invalidate pattern error:', error);
  }
}
