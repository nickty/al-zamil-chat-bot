"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EstimationDetailView } from "@/components/estimation/EstimationDetailView"
import { EstimationMaterialsView } from "@/components/estimation/EstimationMaterialsView"
import { EstimationLaborsView } from "@/components/estimation/EstimationLaborsView"
import { EstimationHistoryView } from "@/components/estimation/EstimationHistoryView"
import { EstimationDialog } from "@/components/estimation/EstimationDialog"
import { getEstimationById, updateEstimationStatus, type EstimationDetail } from "@/utils/api"
import {
  ArrowLeft,
  Edit,
  FileIcon as FilePdf,
  Printer,
  Clock,
  CheckCircle,
  Archive,
  Trash,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"

export default function EstimationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [estimation, setEstimation] = useState<EstimationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [action, setAction] = useState<{
    type: "approve" | "archive" | "delete" | "submit"
    title: string
    description: string
  } | null>(null)

  const id = params.id as string

  const fetchEstimation = async () => {
    try {
      setLoading(true)
      const data = await getEstimationById(id)
      setEstimation(data)
    } catch (error) {
      console.error("Error fetching estimation:", error)
      toast.error("Failed to load estimation details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchEstimation()
    }
  }, [id])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Draft
          </Badge>
        )
      case "pending_approval":
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Pending Approval
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Approved
          </Badge>
        )
      case "archived":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Archive className="h-3 w-3" /> Archived
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleAction = (actionType: "approve" | "archive" | "delete" | "submit") => {
    const actionMap = {
      approve: {
        title: "Approve Estimation",
        description:
          "This will mark the estimation as approved. Approved estimations cannot be edited but can still be viewed and printed. Are you sure you want to approve this estimation?",
      },
      archive: {
        title: "Archive Estimation",
        description:
          "This will move the estimation to the archive. Archived estimations can still be viewed but cannot be edited. Are you sure you want to archive this estimation?",
      },
      delete: {
        title: "Delete Estimation",
        description:
          "This will permanently delete the estimation and all associated data. This action cannot be undone. Are you sure you want to delete this estimation?",
      },
      submit: {
        title: "Submit for Approval",
        description:
          "This will submit the estimation for approval. The estimation cannot be edited while it is pending approval. Are you sure you want to submit this estimation?",
      },
    }

    setAction({
      type: actionType,
      title: actionMap[actionType].title,
      description: actionMap[actionType].description,
    })
    setActionDialogOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!action || !estimation) return

    try {
      let newStatus = ""
      switch (action.type) {
        case "approve":
          newStatus = "approved"
          break
        case "archive":
          newStatus = "archived"
          break
        case "submit":
          newStatus = "pending_approval"
          break
        case "delete":
          // Handle delete - we'll redirect after successful deletion
          await updateEstimationStatus(estimation._id, "deleted")
          toast.success("Estimation deleted successfully")
          router.push("/estimation")
          return
      }

      await updateEstimationStatus(estimation._id, newStatus)
      await fetchEstimation()
      toast.success(
        `Estimation ${action.type === "submit" ? "submitted for approval" : action.type + "d"} successfully`,
      )
    } catch (error) {
      console.error(`Error performing ${action.type} action:`, error)
      toast.error(`Failed to ${action.type} estimation`)
    } finally {
      setActionDialogOpen(false)
      setAction(null)
    }
  }

  const handleEdit = () => {
    setDialogOpen(true)
  }

  const handlePrint = () => {
    // Use window.print() to trigger the print dialog
    window.print()
  }

  const handleExportPdf = () => {
    toast("Generating PDF export...", {
      description: "Export Started",
    })
    // This would be implemented with a PDF generation library in a real app
    // For now, we'll just show a toast
    setTimeout(() => {
      toast.success("PDF has been downloaded", {
        description: "Export Complete",
      })
    }, 2000)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-[600px]">
          <p className="text-muted-foreground">Loading estimation details...</p>
        </div>
      </div>
    )
  }

  if (!estimation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-[600px]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Estimation not found</p>
            <Button onClick={() => router.push("/estimation")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Estimations
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isEditable = estimation.status === "draft"
  const isPending = estimation.status === "pending_approval"
  const isApproved = estimation.status === "approved"
  const isArchived = estimation.status === "archived"

  return (
    <div className="container mx-auto px-4 py-8 print:py-0">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Button variant="ghost" onClick={() => router.push("/estimation")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Estimations
        </Button>
        <div className="flex items-center gap-2">
          {/* Different actions based on status */}
          {isEditable && (
            <>
              <Button variant="outline" onClick={() => handleAction("submit")}>
                Submit for Approval
              </Button>
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Estimation
              </Button>
            </>
          )}

          {isPending && (
            <Button variant="success" onClick={() => handleAction("approve")}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}

          {!isArchived && (
            <Button variant="secondary" onClick={() => handleAction("archive")}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
          )}

          <Button variant="destructive" onClick={() => handleAction("delete")}>
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>

          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>

          <Button variant="outline" onClick={handleExportPdf}>
            <FilePdf className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between">
              <div>
                <CardTitle className="text-2xl">{estimation.title}</CardTitle>
                <CardDescription>{estimation.description}</CardDescription>
              </div>
              <div className="flex flex-col items-end justify-center">
                {getStatusBadge(estimation.status)}
                <p className="text-sm text-muted-foreground mt-2">Estimation #{estimation.estimationNumber}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">Client</p>
                <p>{estimation.client.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Created Date</p>
                <p>{new Date(estimation.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Amount</p>
                <p className="text-xl font-bold">${estimation.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="print:hidden" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="labor">Labor & Services</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <EstimationDetailView estimation={estimation} />
        </TabsContent>

        <TabsContent value="materials">
          <EstimationMaterialsView items={estimation.items.filter((item) => item.type === "material")} />
        </TabsContent>

        <TabsContent value="labor">
          <EstimationLaborsView
            items={estimation.items.filter((item) => item.type === "labor" || item.type === "service")}
          />
        </TabsContent>

        <TabsContent value="history">
          <EstimationHistoryView history={estimation.history} />
        </TabsContent>
      </Tabs>

      {/* Print view that always shows all sections */}
      <div className="hidden print:block space-y-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Overview</h2>
          <EstimationDetailView estimation={estimation} />
        </div>

        <Separator />

        <div>
          <h2 className="text-xl font-bold mb-4">Materials</h2>
          <EstimationMaterialsView items={estimation.items.filter((item) => item.type === "material")} />
        </div>

        <Separator />

        <div>
          <h2 className="text-xl font-bold mb-4">Labor & Services</h2>
          <EstimationLaborsView
            items={estimation.items.filter((item) => item.type === "labor" || item.type === "service")}
          />
        </div>
      </div>

      <EstimationDialog
        open={dialogOpen}
        onOpenChange={(refresh) => {
          setDialogOpen(false)
          if (refresh) fetchEstimation()
        }}
        estimationId={estimation._id}
      />

      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{action?.title}</AlertDialogTitle>
            <AlertDialogDescription>{action?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={action?.type === "delete" ? "bg-destructive text-destructive-foreground" : ""}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

