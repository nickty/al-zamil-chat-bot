import { openai } from "@ai-sdk/openai"
import { Redis } from "ioredis"

// Initialize Redis client for caching
const redis = new Redis(process.env.REDIS_URL)

// Cache duration in seconds (1 hour)
const CACHE_DURATION = 3600

// Configuration object for OpenAI-related settings
export const openaiConfig = {
  defaultModel: "gpt-3.5-turbo", // Using the more affordable model
  maxRetries: 3,
  timeout: 30000,
  validateEnvironment: () => {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is missing")
    }
    return true
  },
}

// Helper function to get cached response
export async function getCachedResponse(key) {
  try {
    const cached = await redis.get(key)
    return cached ? JSON.parse(cached) : null
  } catch (error) {
    console.error("Cache error:", error)
    return null
  }
}

// Helper function to cache response
export async function cacheResponse(key, value, duration = CACHE_DURATION) {
  try {
    await redis.setex(key, duration, JSON.stringify(value))
  } catch (error) {
    console.error("Cache error:", error)
  }
}

// Initialize configuration validation
openaiConfig.validateEnvironment()

// Export the configured openai instance
export { openai }

