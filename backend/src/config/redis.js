const Redis = require("ioredis");

// Cache durations in seconds
const CACHE_DURATIONS = {
  PRODUCTION_METRICS: 5 * 60,
  AI_INSIGHTS: 30 * 60,
  ENGINEERING_ANALYSIS: 60 * 60,
  CUSTOM_RESPONSES: 15 * 60,
};

// Redis configuration
const redisConfig = {
    host: process.env.REDIS_URL,
    port: 13432,
    password: process.env.REDIS_PASSWORD, // Ensure this is set in .env
    retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 3000)),
  };

class RedisService {
  constructor() {
    this.client = new Redis(process.env.REDIS_URL, redisConfig);
    this.cacheDurations = CACHE_DURATIONS;

    this.client.on("connect", () => console.log("Connected to Redis"));
    this.client.on("error", (error) => console.error("Redis connection error:", error));
    this.client.on("close", () => console.log("Redis connection closed"));
  }

  generateKey(namespace, identifier) {
    return `${namespace}:${identifier}`;
  }

  async get(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  }

  async set(key, data, duration) {
    try {
      await this.client.setex(key, duration, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Redis set error:", error);
      return false;
    }
  }

  async delete(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error("Redis delete error:", error);
      return false;
    }
  }

  async clearByPattern(pattern) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.error("Redis clear pattern error:", error);
      return false;
    }
  }

  async exists(key) {
    try {
      return await this.client.exists(key);
    } catch (error) {
      console.error("Redis exists error:", error);
      return false;
    }
  }

  async close() {
    try {
      await this.client.quit();
      console.log("Redis connection closed.");
    } catch (error) {
      console.error("Error closing Redis connection:", error);
    }
  }
}

// Create singleton instance
const redisService = new RedisService();

// Graceful shutdown
process.on("SIGINT", async () => {
  await redisService.close();
  process.exit(0);
});

module.exports = { redisService, CACHE_DURATIONS };
