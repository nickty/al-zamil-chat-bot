import { Redis } from "ioredis"

// Redis configuration with fallback to localhost
const redisConfig = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
  retryStrategy: (times) => {
    // Retry connection up to 3 times
    if (times > 3) {
      return null
    }
    return Math.min(times * 100, 3000)
  },
  maxRetriesPerRequest: 3,
}

// Create Redis client
const redis = new Redis(redisConfig)

// Handle Redis connection events
redis.on("connect", () => {
  console.log("Connected to Redis")
})

redis.on("error", (error) => {
  console.error("Redis connection error:", error)
})

export { redis }

