const express = require("express")
const { authMiddleware, adminMiddleware } = require("../middleware/auth")
const financeService = require("../services/financeService")
const createCacheMiddleware = require("../middleware/cache")
const { CACHE_DURATIONS } = require("../config/redis")

const router = express.Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

// Get financial metrics - cached for regular users
router.get("/metrics", createCacheMiddleware("finance", CACHE_DURATIONS.PRODUCTION_METRICS), async (req, res, next) => {
  try {
    const metrics = await financeService.getFinancialMetrics()
    res.json(metrics)
  } catch (error) {
    next(error)
  }
})

// Update financial metrics - admin only
router.post("/metrics", adminMiddleware, async (req, res, next) => {
  try {
    const metrics = await financeService.updateFinancialMetrics(req.body)
    res.json(metrics)
  } catch (error) {
    next(error)
  }
})

// Get budget data
router.get(
  "/budget",
  createCacheMiddleware("finance_budget", CACHE_DURATIONS.PRODUCTION_METRICS),
  async (req, res, next) => {
    try {
      const budget = await financeService.getBudgetData()
      res.json(budget)
    } catch (error) {
      next(error)
    }
  },
)

// Update budget - admin only
router.post("/budget", adminMiddleware, async (req, res, next) => {
  try {
    const budget = await financeService.updateBudget(req.body)
    res.json(budget)
  } catch (error) {
    next(error)
  }
})

// Get financial reports
router.get("/reports", async (req, res, next) => {
  try {
    const { type, startDate, endDate } = req.query
    const reports = await financeService.getFinancialReports(type, startDate, endDate)
    res.json(reports)
  } catch (error) {
    next(error)
  }
})

// Get financial forecasts
router.get(
  "/forecast",
  createCacheMiddleware("finance_forecast", CACHE_DURATIONS.PRODUCTION_METRICS),
  async (req, res, next) => {
    try {
      const forecast = await financeService.getFinancialForecast()
      res.json(forecast)
    } catch (error) {
      next(error)
    }
  },
)

module.exports = router

