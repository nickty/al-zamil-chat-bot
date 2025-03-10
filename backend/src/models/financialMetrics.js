const mongoose = require("mongoose")

// Schema for monthly data
const monthlyDataSchema = new mongoose.Schema({
  month: { type: String, required: true },
  amount: { type: Number, required: true },
  actual: { type: Number },
  forecast: { type: Number },
})

// Schema for product revenue
const productRevenueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
})

// Schema for regional revenue
const regionalRevenueSchema = new mongoose.Schema({
  region: { type: String, required: true },
  amount: { type: Number, required: true },
})

// Schema for expense categories
const expenseCategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  amount: { type: Number, required: true },
})

// Schema for department budgets
const departmentBudgetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  allocated: { type: Number, required: true },
  spent: { type: Number, required: true },
  remaining: { type: Number, required: true },
})

// Main financial metrics schema
const financialMetricsSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  overview: {
    totalRevenue: { type: Number, required: true },
    totalExpenses: { type: Number, required: true },
    netProfit: { type: Number, required: true },
    profitMargin: { type: Number, required: true },
    revenueGrowth: { type: Number, required: true },
    expenseGrowth: { type: Number, required: true },
    budgetUtilization: { type: Number, required: true },
  },
  revenue: {
    totalRevenue: { type: Number, required: true },
    byProduct: [productRevenueSchema],
    byRegion: [regionalRevenueSchema],
    monthly: [monthlyDataSchema],
  },
  expenses: {
    totalExpenses: { type: Number, required: true },
    byCategory: [expenseCategorySchema],
    monthly: [monthlyDataSchema],
  },
  budget: {
    totalBudget: { type: Number, required: true },
    allocated: { type: Number, required: true },
    remaining: { type: Number, required: true },
    departments: [departmentBudgetSchema],
  },
  forecast: {
    revenue: [monthlyDataSchema],
    expenses: [monthlyDataSchema],
    profit: [monthlyDataSchema],
    insights: [String],
  },
})

const FinancialMetrics = mongoose.model("FinancialMetrics", financialMetricsSchema)

module.exports = { FinancialMetrics }

