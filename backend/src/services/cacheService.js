const Redis = require("ioredis")

const redis = new Redis(process.env.REDIS_URL)

function setCache(key, value, expiration = 3600) {
  return redis.setex(key, expiration, value)
}

function getCache(key) {
  return redis.get(key)
}

module.exports = { setCache, getCache }

