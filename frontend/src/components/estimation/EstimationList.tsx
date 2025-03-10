"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Edit, MoreVertical, Eye, Trash, BarChart, Clock, CheckCircle, Archive } from "lucide-react"
import { updateEstimationStatus, type EstimationSummary } from "@/utils/api"
import { toast } from "sonner"

interface EstimationListProps {
  estimations: EstimationSummary[]
  loading: boolean
  onEdit: (id: string) => void
  onView: (id: string) => void
  onRefresh: () => void
  showViewButton?: boolean
}

export function EstimationList({
  estimations,
  loading,
  onEdit,
  onView,
  onRefresh,
  showViewButton = false,
}: EstimationListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEstimation, setSelectedEstimation] = useState<EstimationSummary | null>(null)

  const handleDelete = async () => {
    if (!selectedEstimation) return

    try {
      await updateEstimationStatus(selectedEstimation._id, "deleted")
      toast.success("Estimation deleted successfully")
      onRefresh()
    } catch (error) {
      console.error("Error deleting estimation:", error)
      toast.error("Failed to delete estimation")
    } finally {
      setDeleteDialogOpen(false)
      setSelectedEstimation(null)
    }
  }

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
            <BarChart className="h-3 w-3" /> Pending Approval
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

  if (loading) {
    return <div className="text-center py-4">Loading...</div>
  }

  if (estimations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No estimations found</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estimation #</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {estimations.map((estimation) => (
              <TableRow key={estimation._id}>
                <TableCell>{estimation.estimationNumber}</TableCell>
                <TableCell>{estimation.title}</TableCell>
                <TableCell>{estimation.client?.name || "N/A"}</TableCell>
                <TableCell>{new Date(estimation.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>${estimation.totalAmount.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(estimation.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {showViewButton && (
                      <Button variant="ghost" size="icon" onClick={() => onView(estimation._id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {estimation.status === "draft" && (
                      <Button variant="ghost" size="icon" onClick={() => onEdit(estimation._id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(estimation._id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {estimation.status === "draft" && (
                          <DropdownMenuItem onClick={() => onEdit(estimation._id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedEstimation(estimation)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the estimation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

