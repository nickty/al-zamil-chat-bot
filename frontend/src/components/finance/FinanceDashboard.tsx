"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react"
import { RevenueChart } from "./RevenueChart"
import { ExpenseChart } from "./ExpenseChart"
import { BudgetOverview } from "./BudgetOverview"
import { FinancialForecast } from "./FinancialForecast"

interface FinanceDashboardProps {
  data: any
  activeTab: string
}

export function FinanceDashboard({ data, activeTab }: FinanceDashboardProps) {
  if (!data || !data.metrics) {
    return <div className="text-center py-4">No financial data available</div>
  }

  const { metrics, insights } = data
  const { overview, revenue, expenses, budget, forecast } = metrics

  // Render different content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview()
      case "revenue":
        return renderRevenue()
      case "expenses":
        return renderExpenses()
      case "budget":
        return renderBudget()
      case "forecast":
        return renderForecast()
      default:
        return renderOverview()
    }
  }

  const renderOverview = () => (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className={`h-4 w-4 ${overview.revenueGrowth >= 0 ? "text-green-500" : "text-red-500"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {overview.revenueGrowth >= 0 ? "+" : ""}
              {overview.revenueGrowth}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className={`h-4 w-4 ${overview.expenseGrowth <= 0 ? "text-green-500" : "text-red-500"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {overview.expenseGrowth >= 0 ? "+" : ""}
              {overview.expenseGrowth}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className={`h-4 w-4 ${overview.netProfit >= 0 ? "text-green-500" : "text-red-500"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.netProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{overview.profitMargin}% profit margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.budgetUtilization}%</div>
            <Progress value={overview.budgetUtilization} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart data={revenue.monthly} />
        <ExpenseChart data={expenses.byCategory} />
      </div>

      {insights && insights.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Insights</CardTitle>
            <CardDescription>AI-generated financial recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.recommendations.map((recommendation: string, index: number) => (
                <Alert key={index}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Recommendation {index + 1}</AlertTitle>
                  <AlertDescription>{recommendation}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )

  const renderRevenue = () => (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Revenue Analysis</CardTitle>
          <CardDescription>Detailed breakdown of revenue streams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <RevenueChart data={revenue.monthly} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenue.byProduct.map((item: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                  <Progress value={(item.amount / revenue.totalRevenue) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {((item.amount / revenue.totalRevenue) * 100).toFixed(1)}% of total revenue
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenue.byRegion.map((item: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.region}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                  <Progress value={(item.amount / revenue.totalRevenue) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {((item.amount / revenue.totalRevenue) * 100).toFixed(1)}% of total revenue
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )

  const renderExpenses = () => (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Expense Analysis</CardTitle>
          <CardDescription>Detailed breakdown of expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ExpenseChart data={expenses.byCategory} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenses.byCategory.slice(0, 5).map((item: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.category}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                  <Progress value={(item.amount / expenses.totalExpenses) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {((item.amount / expenses.totalExpenses) * 100).toFixed(1)}% of total expenses
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Expense Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenses.monthly.slice(-6).map((item: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.month}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                  <Progress
                    value={(item.amount / Math.max(...expenses.monthly.map((m: any) => m.amount))) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )

  const renderBudget = () => <BudgetOverview data={budget} />

  const renderForecast = () => <FinancialForecast data={forecast} />

  return (
    <div className="space-y-6">
      {renderTabContent()}

      {/* Last Updated */}
      <p className="text-sm text-muted-foreground text-right">
        Last updated: {new Date(metrics.timestamp).toLocaleString()}
      </p>
    </div>
  )
}

