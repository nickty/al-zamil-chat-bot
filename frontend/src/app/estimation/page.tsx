"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { Plus, FileSpreadsheet, BarChart, RefreshCw, Calendar } from "lucide-react"
import { toast } from "sonner"
import { EstimationList } from "@/components/estimation/EstimationList"
import { EstimationDialog } from "@/components/estimation/EstimationDialog"
import { EstimationDashboard } from "@/components/estimation/EstimationDashboard"
import { getAllEstimations, getEstimationDashboard, type EstimationSummary } from "@/utils/api"

export default function EstimationPage() {
  const [activeTab, setActiveTab] = useState("active")
  const [estimations, setEstimations] = useState<EstimationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEstimation, setSelectedEstimation] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)

  const router = useRouter()

  const fetchEstimations = async () => {
    try {
      setRefreshing(true)
      const data = await getAllEstimations()
      setEstimations(data)
    } catch (error) {
      console.error("Error fetching estimations:", error)
      toast.error("Failed to load estimations")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchDashboard = async () => {
    try {
      const data = await getEstimationDashboard()
      setDashboardData(data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  useEffect(() => {
    fetchEstimations()
    fetchDashboard()
  }, [])

  const handleCreate = () => {
    setSelectedEstimation(null)
    setDialogOpen(true)
  }

  const handleEdit = (id: string) => {
    setSelectedEstimation(id)
    setDialogOpen(true)
  }

  const handleDialogClose = (refresh?: boolean) => {
    setDialogOpen(false)
    if (refresh) {
      fetchEstimations()
      fetchDashboard()
    }
  }

  const handleView = (id: string) => {
    router.push(`/estimation/${id}`)
  }

  const filteredEstimations = estimations.filter((est) => {
    if (activeTab === "active") return est.status !== "archived"
    if (activeTab === "archived") return est.status === "archived"
    if (activeTab === "draft") return est.status === "draft"
    if (activeTab === "pending") return est.status === "pending_approval"
    if (activeTab === "approved") return est.status === "approved"
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Estimation Management</h1>
            <p className="text-muted-foreground">Create and manage cost estimations for projects and equipment</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchEstimations()
                fetchDashboard()
              }}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Estimation
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Active
            </TabsTrigger>
            <TabsTrigger value="draft" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Drafts
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Pending Approval
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Archived
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          {dashboardData ? (
            <EstimationDashboard data={dashboardData} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-center items-center h-[400px]">
                  <p className="text-muted-foreground">Loading dashboard data...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Active Estimations</CardTitle>
              <CardDescription>Manage your current estimation projects</CardDescription>
            </CardHeader>
            <CardContent>
              <EstimationList
                estimations={filteredEstimations}
                loading={loading}
                onEdit={handleEdit}
                onView={handleView}
                onRefresh={fetchEstimations}
                showViewButton
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="draft" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Draft Estimations</CardTitle>
              <CardDescription>Manage your draft estimation projects</CardDescription>
            </CardHeader>
            <CardContent>
              <EstimationList
                estimations={filteredEstimations}
                loading={loading}
                onEdit={handleEdit}
                onView={handleView}
                onRefresh={fetchEstimations}
                showViewButton
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approval</CardTitle>
              <CardDescription>Estimations waiting for approval</CardDescription>
            </CardHeader>
            <CardContent>
              <EstimationList
                estimations={filteredEstimations}
                loading={loading}
                onEdit={handleEdit}
                onView={handleView}
                onRefresh={fetchEstimations}
                showViewButton
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Approved Estimations</CardTitle>
              <CardDescription>Finalized and approved estimations</CardDescription>
            </CardHeader>
            <CardContent>
              <EstimationList
                estimations={filteredEstimations}
                loading={loading}
                onEdit={handleEdit}
                onView={handleView}
                onRefresh={fetchEstimations}
                showViewButton
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Archived Estimations</CardTitle>
              <CardDescription>Past and archived estimation projects</CardDescription>
            </CardHeader>
            <CardContent>
              <EstimationList
                estimations={filteredEstimations}
                loading={loading}
                onEdit={handleEdit}
                onView={handleView}
                onRefresh={fetchEstimations}
                showViewButton
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EstimationDialog open={dialogOpen} onOpenChange={handleDialogClose} estimationId={selectedEstimation} />
    </div>
  )
}

