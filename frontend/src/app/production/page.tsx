"use client"

import { useState, useEffect, useCallback } from "react"
import { getProductionMetrics } from "@/utils/api"
import { ProductionDashboard } from "@/components/production/ProductionDashboard"
import { ProductionForm } from "@/components/production/ProductionForm"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RefreshCcw, Plus } from "lucide-react"
import { toast } from "sonner"

// Define interfaces for the data structure
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

interface ProductionData {
  metrics: ProductionMetrics
  insights?: ProductionInsights
}

export default function ProductionPage() {
  const [data, setData] = useState<ProductionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  const fetchMetrics = useCallback(async () => {
    try {
      setRefreshing(true)
      const response = await getProductionMetrics()
      setData(response) // Now response already has the correct structure
    } catch (error) {
      console.error("Error fetching metrics:", error)
      toast.error("Failed to fetch production metrics")
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
        <div className="text-center">Loading production metrics...</div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Production Intelligence</h1>
          <p className="text-muted-foreground">Real-time monitoring and analytics</p>
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
                Update Metrics
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update Production Metrics</DialogTitle>
              </DialogHeader>
              <ProductionForm currentMetrics={data.metrics} onSuccess={handleFormSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ProductionDashboard metrics={data.metrics} insights={data.insights} />
    </div>
  )
}

