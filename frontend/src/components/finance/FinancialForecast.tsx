"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "@/components/ui/chart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react"

interface FinancialForecastProps {
  data: {
    revenue: Array<{
      month: string
      actual: number
      forecast: number
    }>
    expenses: Array<{
      month: string
      actual: number
      forecast: number
    }>
    profit: Array<{
      month: string
      actual: number
      forecast: number
    }>
    insights: string[]
  }
}

export function FinancialForecast({ data }: FinancialForecastProps) {
  const { revenue, expenses, profit, insights } = data

  // Calculate growth rates
  const calculateGrowthRate = (data: any[]) => {
    const forecastData = data.filter((item) => item.forecast !== undefined)
    if (forecastData.length < 2) return 0

    const firstValue = forecastData[0].forecast
    const lastValue = forecastData[forecastData.length - 1].forecast

    return ((lastValue - firstValue) / firstValue) * 100
  }

  const revenueGrowth = calculateGrowthRate(revenue)
  const expenseGrowth = calculateGrowthRate(expenses)
  const profitGrowth = calculateGrowthRate(profit)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Forecast</CardTitle>
            {revenueGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueGrowth >= 0 ? "+" : ""}
              {revenueGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Projected growth over next 6 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Forecast</CardTitle>
            {expenseGrowth <= 0 ? (
              <TrendingDown className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expenseGrowth >= 0 ? "+" : ""}
              {expenseGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Projected change over next 6 months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Forecast</CardTitle>
            {profitGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profitGrowth >= 0 ? "+" : ""}
              {profitGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Projected growth over next 6 months</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecast</CardTitle>
          <CardDescription>Actual vs forecasted revenue for the next 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, ""]} />
                <Legend />
                <Line type="monotone" dataKey="actual" name="Actual Revenue" stroke="#8884d8" strokeWidth={2} />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="Forecasted Revenue"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Forecast</CardTitle>
          <CardDescription>Actual vs forecasted expenses for the next 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={expenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, ""]} />
                <Legend />
                <Line type="monotone" dataKey="actual" name="Actual Expenses" stroke="#ff7300" strokeWidth={2} />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="Forecasted Expenses"
                  stroke="#ff0000"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profit Forecast</CardTitle>
          <CardDescription>Actual vs forecasted profit for the next 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profit}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, ""]} />
                <Legend />
                <Line type="monotone" dataKey="actual" name="Actual Profit" stroke="#0088FE" strokeWidth={2} />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="Forecasted Profit"
                  stroke="#00C49F"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {insights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Forecast Insights</CardTitle>
            <CardDescription>AI-generated insights based on financial forecasts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <Alert key={index}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Insight {index + 1}</AlertTitle>
                  <AlertDescription>{insight}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

