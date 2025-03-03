const { ProductionMetrics } = require("../models/productionMetrics")
const { generateText } = require("ai")
const { openai } = require("@ai-sdk/openai")

class ProductionService {
  async getCurrentMetrics() {
    try {
      // Get the most recent metrics
      const latestMetrics = await ProductionMetrics.findOne().sort({ timestamp: -1 })

      if (!latestMetrics) {
        // Return default metrics with insights
        const defaultMetrics = this._getDefaultMetrics()
        const insights = await this._generateInsights(defaultMetrics)
        return {
          metrics: defaultMetrics,
          insights,
        }
      }

      // Generate insights for existing metrics
      const insights = await this._generateInsights(latestMetrics)

      return {
        metrics: latestMetrics,
        insights,
      }
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

      // Generate insights based on new metrics
      const insights = await this._generateInsights(metrics)

      return {
        metrics,
        insights,
      }
    } catch (error) {
      console.error("Error updating metrics:", error)
      throw error
    }
  }

  async getProductionAnalytics(startDate, endDate) {
    try {
      const metrics = await ProductionMetrics.find({
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ timestamp: 1 })

      const analysis = await this._analyzeMetrics(metrics)

      return {
        metrics,
        analysis,
      }
    } catch (error) {
      console.error("Error getting analytics:", error)
      throw error
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

      // If AI fails to generate insights, provide default scores based on metrics
      if (!insightsText) {
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

      return this._parseInsights(insightsText)
    } catch (error) {
      console.error("Error generating insights:", error)
      // Return default insights based on metrics if AI generation fails
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

