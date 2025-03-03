const express = require("express")
const { authMiddleware } = require("../middleware/auth")
const createCacheMiddleware = require("../middleware/cache")
const productionService = require("../services/productionService")
const { CACHE_DURATIONS } = require("../config/redis")

const router = express.Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

// Apply cache middleware to GET routes
router.get(
  "/metrics",
  createCacheMiddleware("production", CACHE_DURATIONS.PRODUCTION_METRICS),
  async (req, res, next) => {
    try {
      const metrics = await productionService.getCurrentMetrics()
      res.json(metrics)
    } catch (error) {
      next(error)
    }
  },
)

router.get(
  "/analytics",
  createCacheMiddleware("analytics", CACHE_DURATIONS.PRODUCTION_METRICS),
  async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const end = endDate ? new Date(endDate) : new Date()

      const analytics = await productionService.getProductionAnalytics(start, end)
      res.json(analytics)
    } catch (error) {
      next(error)
    }
  },
)

// POST route - updates cache after successful update
router.post("/metrics", async (req, res, next) => {
  try {
    const metrics = await productionService.updateMetrics(req.body)
    res.json(metrics)
  } catch (error) {
    next(error)
  }
})

module.exports = router

