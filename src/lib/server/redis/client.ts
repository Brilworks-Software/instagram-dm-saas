import Redis from 'ioredis';

// Redis client is attached to the `global` object in development to prevent
// exhausting your Redis connection limit.
const globalForRedis = global as unknown as { redis: Redis | null };

/**
 * Creates or returns an existing Redis connection.
 * Uses connection pooling in production and singleton pattern in development.
 */
function createRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL;

  // If no Redis URL is provided, return null (for local development without Redis)
  if (!redisUrl) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️  REDIS_URL is not set. BullMQ queues will not work in production.');
    }
    return null;
  }

  // Return existing connection if available
  if (globalForRedis.redis) {
    return globalForRedis.redis;
  }

  try {
    const redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      // Connection pool settings
      ...(process.env.NODE_ENV === 'production' && {
        keepAlive: 30000,
        connectTimeout: 10000,
      }),
    });

    // Store in global for development (Next.js hot reload)
    if (process.env.NODE_ENV !== 'production') {
      globalForRedis.redis = redis;
    }

    return redis;
  } catch (error) {
    console.error('❌ Failed to create Redis client:', error);
    return null;
  }
}

export const redis = createRedisClient();

/**
 * Gets a Redis connection for BullMQ.
 * Returns null if Redis is not configured (allows graceful degradation).
 */
export function getRedisConnection(): Redis | null {
  return redis;
}

/**
 * Closes the Redis connection (useful for cleanup in serverless environments).
 */
export async function closeRedisConnection(): Promise<void> {
  if (globalForRedis.redis) {
    await globalForRedis.redis.quit();
    globalForRedis.redis = null;
  }
}


