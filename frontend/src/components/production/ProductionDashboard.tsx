"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Activity, AlertCircle, CheckCircle2, Users, Gauge } from "lucide-react"

interface ProductionMetrics {
  _id: string
  productionStatus: {
    activeOrders: number
    completedOrders: number
    delayedOrders: number
    efficiency: number
  }
  workforceStatus: {
    totalPresent: number
    onLeave: number
    utilizationRate: number
    departments: any[]
  }
  equipmentStatus: {
    operational: number
    maintenance: number
    breakdown: number
    equipment: any[]
  }
  qualityMetrics: {
    passRate: number
    inspectionsPending: number
    issues: any[]
  }
  timestamp: string
  __v: number
}

interface ProductionInsights {
  scores: {
    efficiency: number
    quality: number
    workforce: number
    equipment: number
  }
  insights: string[]
  recommendations: string[]
}

interface ProductionDashboardProps {
  metrics: ProductionMetrics
  insights?: ProductionInsights
}

export function ProductionDashboard({ metrics, insights }: ProductionDashboardProps) {
  // Use insights scores if available, otherwise use metrics values
  const scores = insights?.scores ?? {
    efficiency: metrics.productionStatus.efficiency,
    quality: metrics.qualityMetrics.passRate,
    workforce: metrics.workforceStatus.utilizationRate,
    equipment: metrics.equipmentStatus.operational,
  }

  console.log("check insights", insights);

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{scores.efficiency}%</div>
              <Progress value={scores.efficiency} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{scores.quality}%</div>
              <Progress value={scores.quality} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workforce Score</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{scores.workforce}%</div>
              <Progress value={scores.workforce} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipment Score</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{scores.equipment}%</div>
              <Progress value={scores.equipment} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Status */}
      <Card>
        <CardHeader>
          <CardTitle>Production Status</CardTitle>
          <CardDescription>Current production metrics and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Active Orders</p>
              <p className="text-2xl font-bold">{metrics.productionStatus.activeOrders}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Completed Orders</p>
              <p className="text-2xl font-bold">{metrics.productionStatus.completedOrders}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Delayed Orders</p>
              <p className="text-2xl font-bold text-red-500">{metrics.productionStatus.delayedOrders}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workforce Status */}
      <Card>
        <CardHeader>
          <CardTitle>Workforce Status</CardTitle>
          <CardDescription>Current workforce attendance and utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Total Present</p>
              <p className="text-2xl font-bold">{metrics.workforceStatus.totalPresent}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">On Leave</p>
              <p className="text-2xl font-bold">{metrics.workforceStatus.onLeave}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Utilization Rate</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">{metrics.workforceStatus.utilizationRate}%</p>
                <Progress value={metrics.workforceStatus.utilizationRate} className="flex-1 h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      {insights && (insights.insights.length > 0 || insights.recommendations.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2">
          {insights.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Insights</CardTitle>
                <CardDescription>AI-generated analysis of production metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.insights.map((insight, index) => (
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

          {insights.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Suggested actions for improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.recommendations.map((recommendation, index) => (
                    <Alert key={index} variant="default">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Recommendation {index + 1}</AlertTitle>
                      <AlertDescription>{recommendation}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Last Updated */}
      <p className="text-sm text-muted-foreground text-right">
        Last updated: {new Date(metrics.timestamp).toLocaleString()}
      </p>
    </div>
  )
}

