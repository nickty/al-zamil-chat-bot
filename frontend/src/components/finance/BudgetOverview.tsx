"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface BudgetOverviewProps {
  data: {
    totalBudget: number
    allocated: number
    remaining: number
    departments: Array<{
      name: string
      allocated: number
      spent: number
      remaining: number
    }>
  }
}

export function BudgetOverview({ data }: BudgetOverviewProps) {
  const { totalBudget, allocated, remaining, departments } = data

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${allocated.toLocaleString()}</div>
            <Progress value={(allocated / totalBudget) * 100} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {((allocated / totalBudget) * 100).toFixed(1)}% of total budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${remaining.toLocaleString()}</div>
            <Progress value={(remaining / totalBudget) * 100} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {((remaining / totalBudget) * 100).toFixed(1)}% of total budget
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Departmental Budget</CardTitle>
          <CardDescription>Budget allocation and utilization by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {departments.map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{dept.name}</span>
                  <div className="text-sm">
                    <span className="font-medium">${dept.spent.toLocaleString()}</span>
                    <span className="text-muted-foreground"> / ${dept.allocated.toLocaleString()}</span>
                  </div>
                </div>
                <Progress value={(dept.spent / dept.allocated) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{((dept.spent / dept.allocated) * 100).toFixed(1)}% used</span>
                  <span>${dept.remaining.toLocaleString()} remaining</span>
                </div>
                {dept.spent > dept.allocated && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Budget Exceeded</AlertTitle>
                    <AlertDescription>
                      This department has exceeded its allocated budget by $
                      {(dept.spent - dept.allocated).toLocaleString()}
                    </AlertDescription>
                  </Alert>
                )}
                {dept.spent <= dept.allocated && dept.spent / dept.allocated > 0.9 && (
                  <Alert variant="default" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Budget Alert</AlertTitle>
                    <AlertDescription>
                      This department has used {((dept.spent / dept.allocated) * 100).toFixed(1)}% of its budget
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

