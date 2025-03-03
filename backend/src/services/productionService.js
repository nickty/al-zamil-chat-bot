const { ProductionMetrics } = require("../models/productionMetrics")
const { generateText } = require("ai")
const { openai } = require("@ai-sdk/openai")
const { redisService, CACHE_DURATIONS } = require("../config/redis")

class ProductionService {
  constructor() {
    this.cacheKeys = {
      CURRENT_METRICS: "production:current_metrics",
      INSIGHTS: "production:insights:",
      ANALYTICS: "production:analytics:",
    }
  }

  async getCurrentMetrics() {
    try {
      // Try to get from cache first
      const cachedMetrics = await redisService.get(this.cacheKeys.CURRENT_METRICS)
      if (cachedMetrics) {
        console.log("Returning cached production metrics")
        return cachedMetrics
      }

      // Get the most recent metrics from database
      const latestMetrics = await ProductionMetrics.findOne().sort({ timestamp: -1 })

      if (!latestMetrics) {
        // Return default metrics with insights
        const defaultMetrics = this._getDefaultMetrics()
        const insights = await this._generateInsights(defaultMetrics)
        const result = { metrics: defaultMetrics, insights }

        // Cache default metrics
        await redisService.set(this.cacheKeys.CURRENT_METRICS, result, CACHE_DURATIONS.PRODUCTION_METRICS)

        return result
      }

      // Generate or get cached insights
      const insights = await this._getInsights(latestMetrics)
      const result = { metrics: latestMetrics, insights }

      // Cache the complete result
      await redisService.set(this.cacheKeys.CURRENT_METRICS, result, CACHE_DURATIONS.PRODUCTION_METRICS)

      return result
    } catch (error) {
      console.error("Error getting current metrics:", error)
      throw error
    }
  }

  async updateMetrics(newMetrics) {
    try {
      // Validate totals add up to 100%
      this._validatePercentages(newMetrics)

      // Create new metrics record
      const metrics = await ProductionMetrics.create({
        ...newMetrics,
        timestamp: new Date(),
      })

      // Generate insights
      const insights = await this._generateInsights(metrics)
      const result = { metrics, insights }

      // Update cache with new metrics
      await redisService.set(this.cacheKeys.CURRENT_METRICS, result, CACHE_DURATIONS.PRODUCTION_METRICS)

      // Cache insights separately
      await redisService.set(this.cacheKeys.INSIGHTS + metrics._id, insights, CACHE_DURATIONS.AI_INSIGHTS)

      return result
    } catch (error) {
      console.error("Error updating metrics:", error)
      throw error
    }
  }

  async getProductionAnalytics(startDate, endDate) {
    try {
      // Generate cache key based on date range
      const cacheKey = `${this.cacheKeys.ANALYTICS}${startDate.getTime()}-${endDate.getTime()}`

      // Try to get from cache
      const cachedAnalytics = await redisService.get(cacheKey)
      if (cachedAnalytics) {
        console.log("Returning cached analytics")
        return cachedAnalytics
      }

      const metrics = await ProductionMetrics.find({
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ timestamp: 1 })

      const analysis = await this._analyzeMetrics(metrics)
      const result = { metrics, analysis }

      // Cache analytics
      await redisService.set(cacheKey, result, CACHE_DURATIONS.PRODUCTION_METRICS)

      return result
    } catch (error) {
      console.error("Error getting analytics:", error)
      throw error
    }
  }

  async _getInsights(metrics) {
    try {
      // Try to get cached insights first
      const cachedInsights = await redisService.get(this.cacheKeys.INSIGHTS + metrics._id)
      if (cachedInsights) {
        console.log("Returning cached insights")
        return cachedInsights
      }

      // Generate new insights
      const insights = await this._generateInsights(metrics)

      // Cache the insights
      await redisService.set(this.cacheKeys.INSIGHTS + metrics._id, insights, CACHE_DURATIONS.AI_INSIGHTS)

      return insights
    } catch (error) {
      console.error("Error getting insights:", error)
      return this._getDefaultInsights(metrics)
    }
  }

  async _generateInsights(metrics) {
    try {
      const { text: insightsText } = await generateText({
        model: openai("gpt-3.5-turbo"),
        messages: [
          {
            role: "system",
            content: `You are a production optimization expert. Analyze the metrics and provide insights in this exact format:
            EFFICIENCY_SCORE: [number between 0-100]
            QUALITY_SCORE: [number between 0-100]
            WORKFORCE_SCORE: [number between 0-100]
            EQUIPMENT_SCORE: [number between 0-100]
            
            INSIGHTS:
            - [insight 1]
            - [insight 2]
            - [insight 3]
            
            RECOMMENDATIONS:
            - [recommendation 1]
            - [recommendation 2]
            - [recommendation 3]`,
          },
          {
            role: "user",
            content: `Analyze these production metrics and provide insights: ${JSON.stringify(metrics)}`,
          },
        ],
      })

      if (!insightsText) {
        return this._getDefaultInsights(metrics)
      }

      return this._parseInsights(insightsText)
    } catch (error) {
      console.error("Error generating insights:", error)
      return this._getDefaultInsights(metrics)
    }
  }

  _getDefaultInsights(metrics) {
    return {
      scores: {
        efficiency: metrics.productionStatus.efficiency || 0,
        quality: metrics.qualityMetrics.passRate || 0,
        workforce: metrics.workforceStatus.utilizationRate || 0,
        equipment: metrics.equipmentStatus.operational || 0,
      },
      insights: [],
      recommendations: [],
    }
  }

  _validatePercentages(metrics) {
    // Equipment status percentages should add up to 100
    const equipmentTotal =
      metrics.equipmentStatus.operational + metrics.equipmentStatus.maintenance + metrics.equipmentStatus.breakdown

    if (Math.round(equipmentTotal) !== 100) {
      throw new Error("Equipment status percentages must add up to 100%")
    }

    // Validate individual percentages are between 0 and 100
    const percentageFields = [
      metrics.workforceStatus.utilizationRate,
      metrics.qualityMetrics.passRate,
      ...metrics.workforceStatus.departments.map((d) => d.utilization),
      ...metrics.equipmentStatus.equipment.map((e) => e.utilization),
    ]

    for (const value of percentageFields) {
      if (value < 0 || value > 100) {
        throw new Error("Percentage values must be between 0 and 100")
      }
    }
  }

  _parseInsights(text) {
    if (!text) {
      throw new Error("No insight text provided")
    }

    const insights = {
      scores: {
        efficiency: this._extractScore(text, "EFFICIENCY_SCORE"),
        quality: this._extractScore(text, "QUALITY_SCORE"),
        workforce: this._extractScore(text, "WORKFORCE_SCORE"),
        equipment: this._extractScore(text, "EQUIPMENT_SCORE"),
      },
      insights: this._extractBulletPoints(text, "INSIGHTS"),
      recommendations: this._extractBulletPoints(text, "RECOMMENDATIONS"),
    }

    return insights
  }

  _extractScore(text, scoreType) {
    const match = text.match(new RegExp(`${scoreType}:\\s*(\\d+)`))
    return match ? Number.parseInt(match[1], 10) : 0
  }

  _extractBulletPoints(text, section) {
    const sectionMatch = text.match(new RegExp(`${section}:\\n([\\s\\S]*?)(?=\\n\\n|$)`))
    if (!sectionMatch) return []

    return sectionMatch[1]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-"))
      .map((line) => line.substring(1).trim())
  }

  _getDefaultMetrics() {
    return {
      productionStatus: {
        activeOrders: 0,
        completedOrders: 0,
        delayedOrders: 0,
        efficiency: 0,
      },
      workforceStatus: {
        totalPresent: 0,
        onLeave: 0,
        utilizationRate: 0,
        departments: [],
      },
      equipmentStatus: {
        operational: 100,
        maintenance: 0,
        breakdown: 0,
        equipment: [],
      },
      qualityMetrics: {
        passRate: 0,
        inspectionsPending: 0,
        issues: [],
      },
    }
  }
}

module.exports = new ProductionService()

