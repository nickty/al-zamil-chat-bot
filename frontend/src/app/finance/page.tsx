"use client"

import { useState, useEffect, useCallback } from "react"
import { getFinancialMetrics } from "@/utils/api"
import { FinanceDashboard } from "@/components/finance/FinanceDashboard"
import { FinanceForm } from "@/components/finance/FinanceForm"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RefreshCcw, Plus } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FinancePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const fetchMetrics = useCallback(async () => {
    try {
      setRefreshing(true)
      const response = await getFinancialMetrics()
      setData(response)
    } catch (error) {
      console.error("Error fetching financial metrics:", error)
      toast.error("Failed to fetch financial metrics")
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
    // Refresh metrics every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchMetrics])

  const handleFormSuccess = () => {
    setFormOpen(false)
    fetchMetrics()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading financial metrics...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Financial Management</h1>
          <p className="text-muted-foreground">Track and analyze financial performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Update Financials
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update Financial Data</DialogTitle>
              </DialogHeader>
              <FinanceForm currentData={data?.metrics} onSuccess={handleFormSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <FinanceDashboard data={data} activeTab="overview" />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <FinanceDashboard data={data} activeTab="revenue" />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <FinanceDashboard data={data} activeTab="expenses" />
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <FinanceDashboard data={data} activeTab="budget" />
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <FinanceDashboard data={data} activeTab="forecast" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

