"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

interface EstimationDashboardProps {
  data: {
    statusDistribution: {
      draft: number
      pending_approval: number
      approved: number
      archived: number
    }
    monthlyTotals: Array<{
      month: string
      total: number
    }>
    typeDistribution: {
      materials: number
      labor: number
      services: number
    }
    topClients: Array<{
      client: string
      count: number
      value: number
    }>
  }
}

export function EstimationDashboard({ data }: EstimationDashboardProps) {
  // Prepare data for pie chart
  const statusData = [
    { name: "Draft", value: data.statusDistribution.draft },
    { name: "Pending", value: data.statusDistribution.pending_approval },
    { name: "Approved", value: data.statusDistribution.approved },
    { name: "Archived", value: data.statusDistribution.archived },
  ].filter((item) => item.value > 0)

  const typeData = [
    { name: "Materials", value: data.typeDistribution.materials },
    { name: "Labor", value: data.typeDistribution.labor },
    { name: "Services", value: data.typeDistribution.services },
  ].filter((item) => item.value > 0)

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Monthly Estimation Value</CardTitle>
          <CardDescription>Total estimation value by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyTotals}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Total"]} />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estimation Status</CardTitle>
          <CardDescription>Distribution by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Item Type Distribution</CardTitle>
          <CardDescription>Distribution by item type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Top Clients</CardTitle>
          <CardDescription>Clients by estimation value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data.topClients} margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="client" />
                <Tooltip
                  formatter={(value, name) => [
                    name === "value" ? `$${value}` : value,
                    name === "value" ? "Total Value" : "Estimations",
                  ]}
                />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Total Value" />
                <Bar dataKey="count" fill="#82ca9d" name="Number of Estimations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

