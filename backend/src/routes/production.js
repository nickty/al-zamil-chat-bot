const express = require("express")
const { authMiddleware } = require("../middleware/auth")
const productionService = require("../services/productionService")

const router = express.Router()

router.use(authMiddleware)

router.get("/metrics", async (req, res, next) => {
  try {
    const metrics = await productionService.getCurrentMetrics()
    res.json(metrics)
  } catch (error) {
    next(error)
  }
})

router.post("/metrics", async (req, res, next) => {
  try {
    const metrics = await productionService.updateMetrics(req.body)
    res.json(metrics)
  } catch (error) {
    next(error)
  }
})

router.get("/analytics", async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    const analytics = await productionService.getProductionAnalytics(start, end)
    res.json(analytics)
  } catch (error) {
    next(error)
  }
})

module.exports = router

