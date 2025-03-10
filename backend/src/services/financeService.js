const { FinancialMetrics } = require("../models/financialMetrics")
const { generateText } = require("ai")
const { openai } = require("@ai-sdk/openai")
const { redisService, CACHE_DURATIONS } = require("../config/redis")

class FinanceService {
  constructor() {
    this.cacheKeys = {
      CURRENT_METRICS: "finance:current_metrics",
      INSIGHTS: "finance:insights:",
      BUDGET: "finance:budget:",
      FORECAST: "finance:forecast:",
    }
  }

  async getFinancialMetrics() {
    try {
      // Try to get from cache first
      const cachedMetrics = await redisService.get(this.cacheKeys.CURRENT_METRICS)
      if (cachedMetrics) {
        console.log("Returning cached financial metrics")
        return cachedMetrics
      }

      // Get the most recent metrics from database
      const latestMetrics = await FinancialMetrics.findOne().sort({ timestamp: -1 })

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
      console.error("Error getting financial metrics:", error)
      throw error
    }
  }

  async updateFinancialMetrics(data) {
    try {
      // Create new metrics record
      const metrics = await FinancialMetrics.create({
        ...data,
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
      console.error("Error updating financial metrics:", error)
      throw error
    }
  }

  async getBudgetData() {
    try {
      const metrics = await this.getFinancialMetrics()
      return metrics.metrics.budget
    } catch (error) {
      console.error("Error getting budget data:", error)
      throw error
    }
  }

  async updateBudget(budgetData) {
    try {
      const latestMetrics = await FinancialMetrics.findOne().sort({ timestamp: -1 })

      if (!latestMetrics) {
        throw new Error("No financial metrics found to update budget")
      }

      latestMetrics.budget = budgetData
      await latestMetrics.save()

      // Clear cache
      await redisService.delete(this.cacheKeys.CURRENT_METRICS)
      await redisService.delete(this.cacheKeys.BUDGET + latestMetrics._id)

      return latestMetrics.budget
    } catch (error) {
      console.error("Error updating budget:", error)
      throw error
    }
  }

  async getFinancialReports(type, startDate, endDate) {
    try {
      // Convert string dates to Date objects
      const start = new Date(startDate)
      const end = new Date(endDate)

      // Validate dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid date format")
      }

      // Find metrics within date range
      const metrics = await FinancialMetrics.find({
        timestamp: {
          $gte: start,
          $lte: end,
        },
      }).sort({ timestamp: 1 })

      if (!metrics || metrics.length === 0) {
        return { message: "No data found for the specified date range" }
      }

      // Process data based on report type
      let reportData
      switch (type) {
        case "revenue":
          reportData = this._processRevenueReport(metrics)
          break
        case "expenses":
          reportData = this._processExpenseReport(metrics)
          break
        case "profit":
          reportData = this._processProfitReport(metrics)
          break
        case "budget":
          reportData = this._processBudgetReport(metrics)
          break
        case "comprehensive":
          reportData = this._processComprehensiveReport(metrics)
          break
        default:
          reportData = this._processComprehensiveReport(metrics)
      }

      return reportData
    } catch (error) {
      console.error("Error generating financial reports:", error)
      throw error
    }
  }

  async getFinancialForecast() {
    try {
      // Try to get from cache first
      const cachedForecast = await redisService.get(this.cacheKeys.FORECAST)
      if (cachedForecast) {
        console.log("Returning cached financial forecast")
        return cachedForecast
      }

      const latestMetrics = await FinancialMetrics.findOne().sort({ timestamp: -1 })

      if (!latestMetrics) {
        return this._getDefaultForecast()
      }

      // Generate AI-powered forecast if not already present
      if (!latestMetrics.forecast || !latestMetrics.forecast.insights || latestMetrics.forecast.insights.length === 0) {
        const forecast = await this._generateForecast(latestMetrics)

        // Update the metrics with the forecast
        latestMetrics.forecast = forecast
        await latestMetrics.save()
      }

      // Cache the forecast
      await redisService.set(this.cacheKeys.FORECAST, latestMetrics.forecast, CACHE_DURATIONS.AI_INSIGHTS)

      return latestMetrics.forecast
    } catch (error) {
      console.error("Error getting financial forecast:", error)
      throw error
    }
  }

  async _getInsights(metrics) {
    try {
      // Try to get cached insights first
      const cachedInsights = await redisService.get(this.cacheKeys.INSIGHTS + metrics._id)
      if (cachedInsights) {
        console.log("Returning cached financial insights")
        return cachedInsights
      }

      // Generate new insights
      const insights = await this._generateInsights(metrics)

      // Cache the insights
      await redisService.set(this.cacheKeys.INSIGHTS + metrics._id, insights, CACHE_DURATIONS.AI_INSIGHTS)

      return insights
    } catch (error) {
      console.error("Error getting insights:", error)
      return this._getDefaultInsights()
    }
  }

  async _generateInsights(metrics) {
    try {
      const { text: insightsText } = await generateText({
        model: openai("gpt-3.5-turbo"),
        messages: [
          {
            role: "system",
            content: `You are a financial analyst expert. Analyze the metrics and provide insights in this exact format:
            
            RECOMMENDATIONS:
            - [recommendation 1]
            - [recommendation 2]
            - [recommendation 3]
            
            OPPORTUNITIES:
            - [opportunity 1]
            - [opportunity 2]
            
            RISKS:
            - [risk 1]
            - [risk 2]`,
          },
          {
            role: "user",
            content: `Analyze these financial metrics and provide insights: ${JSON.stringify(metrics)}`,
          },
        ],
      })

      if (!insightsText) {
        return this._getDefaultInsights()
      }

      return this._parseInsights(insightsText)
    } catch (error) {
      console.error("Error generating insights:", error)
      return this._getDefaultInsights()
    }
  }

  async _generateForecast(metrics) {
    try {
      const { text: forecastText } = await generateText({
        model: openai("gpt-3.5-turbo"),
        messages: [
          {
            role: "system",
            content: `You are a financial forecasting expert. Based on the historical data, generate a 6-month forecast for revenue, expenses, and profit. Also provide 3-5 insights about the forecast. Format your response as JSON with the following structure:
            {
              "revenue": [{"month": "Jan", "actual": 100000, "forecast": 110000}, ...],
              "expenses": [{"month": "Jan", "actual": 80000, "forecast": 85000}, ...],
              "profit": [{"month": "Jan", "actual": 20000, "forecast": 25000}, ...],
              "insights": ["Insight 1", "Insight 2", "Insight 3"]
            }`,
          },
          {
            role: "user",
            content: `Generate a financial forecast based on these metrics: ${JSON.stringify(metrics)}`,
          },
        ],
      })

      if (!forecastText) {
        return this._getDefaultForecast()
      }

      try {
        // Parse the JSON response
        const forecast = JSON.parse(forecastText)
        return forecast
      } catch (parseError) {
        console.error("Error parsing forecast JSON:", parseError)
        return this._getDefaultForecast()
      }
    } catch (error) {
      console.error("Error generating forecast:", error)
      return this._getDefaultForecast()
    }
  }

  _parseInsights(text) {
    if (!text) {
      throw new Error("No insight text provided")
    }

    const recommendations = this._extractBulletPoints(text, "RECOMMENDATIONS")
    const opportunities = this._extractBulletPoints(text, "OPPORTUNITIES")
    const risks = this._extractBulletPoints(text, "RISKS")

    return {
      recommendations,
      opportunities,
      risks,
    }
  }

  _extractBulletPoints(text, section) {
    const sectionMatch = text.match(new RegExp(`${section}:\n([\\s\\S]*?)(?=\n\n|$)`))
    if (!sectionMatch) return []

    return sectionMatch[1]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("-"))
      .map((line) => line.substring(1).trim())
  }

  _processRevenueReport(metrics) {
    // Extract revenue data from metrics
    const revenueData = metrics.map((metric) => ({
      date: metric.timestamp,
      totalRevenue: metric.overview.totalRevenue,
      revenueGrowth: metric.overview.revenueGrowth,
      byProduct: metric.revenue.byProduct,
      byRegion: metric.revenue.byRegion,
    }))

    return {
      type: "revenue",
      data: revenueData,
    }
  }

  _processExpenseReport(metrics) {
    // Extract expense data from metrics
    const expenseData = metrics.map((metric) => ({
      date: metric.timestamp,
      totalExpenses: metric.overview.totalExpenses,
      expenseGrowth: metric.overview.expenseGrowth,
      byCategory: metric.expenses.byCategory,
    }))

    return {
      type: "expenses",
      data: expenseData,
    }
  }

  _processProfitReport(metrics) {
    // Extract profit data from metrics
    const profitData = metrics.map((metric) => ({
      date: metric.timestamp,
      netProfit: metric.overview.netProfit,
      profitMargin: metric.overview.profitMargin,
      totalRevenue: metric.overview.totalRevenue,
      totalExpenses: metric.overview.totalExpenses,
    }))

    return {
      type: "profit",
      data: profitData,
    }
  }

  _processBudgetReport(metrics) {
    // Extract budget data from metrics
    const budgetData = metrics.map((metric) => ({
      date: metric.timestamp,
      totalBudget: metric.budget.totalBudget,
      allocated: metric.budget.allocated,
      remaining: metric.budget.remaining,
      utilization: metric.overview.budgetUtilization,
      departments: metric.budget.departments,
    }))

    return {
      type: "budget",
      data: budgetData,
    }
  }

  _processComprehensiveReport(metrics) {
    // Combine all report types
    return {
      type: "comprehensive",
      revenue: this._processRevenueReport(metrics).data,
      expenses: this._processExpenseReport(metrics).data,
      profit: this._processProfitReport(metrics).data,
      budget: this._processBudgetReport(metrics).data,
    }
  }

  _getDefaultMetrics() {
    const currentYear = new Date().getFullYear()
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Generate monthly data with some random variation
    const generateMonthlyData = (baseAmount) => {
      return months.map((month, index) => ({
        month,
        amount: Math.round(baseAmount * (0.9 + Math.random() * 0.4)),
      }))
    }

    return {
      timestamp: new Date(),
      overview: {
        totalRevenue: 1200000,
        totalExpenses: 900000,
        netProfit: 300000,
        profitMargin: 25,
        revenueGrowth: 8,
        expenseGrowth: 5,
        budgetUtilization: 75,
      },
      revenue: {
        totalRevenue: 1200000,
        byProduct: [
          { name: "Product A", amount: 500000 },
          { name: "Product B", amount: 350000 },
          { name: "Product C", amount: 250000 },
          { name: "Product D", amount: 100000 },
        ],
        byRegion: [
          { region: "North America", amount: 600000 },
          { region: "Europe", amount: 350000 },
          { region: "Asia", amount: 200000 },
          { region: "Other", amount: 50000 },
        ],
        monthly: generateMonthlyData(100000),
      },
      expenses: {
        totalExpenses: 900000,
        byCategory: [
          { category: "Manufacturing", amount: 400000 },
          { category: "Operations", amount: 200000 },
          { category: "Marketing", amount: 150000 },
          { category: "R&D", amount: 100000 },
          { category: "Admin", amount: 50000 },
        ],
        monthly: generateMonthlyData(75000),
      },
      budget: {
        totalBudget: 1200000,
        allocated: 1000000,
        remaining: 200000,
        departments: [
          { name: "Engineering", allocated: 300000, spent: 225000, remaining: 75000 },
          { name: "Manufacturing", allocated: 400000, spent: 350000, remaining: 50000 },
          { name: "Marketing", allocated: 150000, spent: 120000, remaining: 30000 },
          { name: "Sales", allocated: 100000, spent: 90000, remaining: 10000 },
          { name: "R&D", allocated: 50000, spent: 40000, remaining: 10000 },
        ],
      },
      forecast: this._getDefaultForecast(),
    }
  }

  _getDefaultInsights() {
    return {
      recommendations: [
        "Increase investment in Product A which shows the highest revenue",
        "Reduce operational expenses to improve profit margin",
        "Reallocate budget from underperforming departments to high-growth areas",
      ],
      opportunities: [
        "Expand market presence in Asia which shows growth potential",
        "Develop new product lines based on Product A's success",
      ],
      risks: [
        "Budget overruns in Manufacturing department may impact overall financial health",
        "Increasing operational costs could reduce profit margins if not managed",
      ],
    }
  }

  _getDefaultForecast() {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Get next 6 months
    const nextMonths = []
    for (let i = 0; i < 6; i++) {
      const monthIndex = (currentMonth + i) % 12
      nextMonths.push(months[monthIndex])
    }

    // Generate forecast data
    const revenue = nextMonths.map((month, index) => {
      const baseAmount = 100000
      const actual = index < 2 ? baseAmount * (0.9 + Math.random() * 0.2) : undefined
      const forecast = baseAmount * (1 + index * 0.03) * (0.95 + Math.random() * 0.1)
      return { month, actual, forecast }
    })

    const expenses = nextMonths.map((month, index) => {
      const baseAmount = 75000
      const actual = index < 2 ? baseAmount * (0.9 + Math.random() * 0.2) : undefined
      const forecast = baseAmount * (1 + index * 0.02) * (0.95 + Math.random() * 0.1)
      return { month, actual, forecast }
    })

    const profit = nextMonths.map((month, index) => {
      const revForecast = revenue[index].forecast
      const expForecast = expenses[index].forecast
      const actual = index < 2 ? (revenue[index].actual || 0) - (expenses[index].actual || 0) : undefined
      const forecast = revForecast - expForecast
      return { month, actual, forecast }
    })

    return {
      revenue,
      expenses,
      profit,
      insights: [
        "Revenue is projected to grow steadily over the next 6 months",
        "Expenses are expected to increase at a slower rate than revenue",
        "Profit margins should improve as a result of revenue growth outpacing expenses",
        "Q3 is forecasted to be the strongest quarter for profitability",
      ],
    }
  }
}

module.exports = new FinanceService()

