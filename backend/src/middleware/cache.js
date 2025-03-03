const { redisService } = require("../config/redis")

/**
 * Creates a caching middleware
 * @param {string} keyPrefix - Prefix for the cache key
 * @param {number} duration - Cache duration in seconds
 */
function createCacheMiddleware(keyPrefix, duration) {
  return async function cacheMiddleware(req, res, next) {
    try {
      // Skip caching for non-GET requests
      if (req.method !== "GET") {
        return next()
      }

      // Generate cache key based on URL and query parameters
      const cacheKey = `${keyPrefix}:${req.originalUrl}`

      // Try to get from cache
      const cachedData = await redisService.get(cacheKey)
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`)
        return res.json(cachedData)
      }

      // Store original send function
      const originalSend = res.json

      // Override send function to cache response
      res.json = function (data) {
        // Cache the response
        redisService.set(cacheKey, data, duration).catch((error) => console.error("Cache set error:", error))

        // Call original send
        return originalSend.call(this, data)
      }

      next()
    } catch (error) {
      console.error("Cache middleware error:", error)
      next()
    }
  }
}

module.exports = createCacheMiddleware

