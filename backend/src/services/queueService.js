const Redis = require("ioredis")

const redis = new Redis(process.env.REDIS_URL)

function enqueueMessage(userId, message) {
  return redis.lpush(`chat:${userId}`, message)
}

function dequeueMessage(userId) {
  return redis.rpop(`chat:${userId}`)
}

module.exports = { enqueueMessage, dequeueMessage }

