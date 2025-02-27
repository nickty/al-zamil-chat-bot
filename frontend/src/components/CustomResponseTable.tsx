"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
import { Edit, MoreVertical, Trash, FileText } from "lucide-react"
import type { CustomResponse } from "./admin/AdminDashboard"
import { deleteCustomResponse } from "@/utils/api"
import { toast } from "sonner"

interface CustomResponseTableProps {
  responses: CustomResponse[]
  loading: boolean
  onEdit: (response: CustomResponse) => void
  onRefresh: () => void
}

export function CustomResponseTable({ responses, loading, onEdit, onRefresh }: CustomResponseTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedResponse, setSelectedResponse] = useState<CustomResponse | null>(null)

  const handleDelete = async () => {
    if (!selectedResponse) return

    try {
      await deleteCustomResponse(selectedResponse._id)
      toast.success("Response deleted successfully")
      onRefresh()
    } catch (error) {
      console.error("Error deleting response:", error)
      toast.error("Failed to delete response")
    } finally {
      setDeleteDialogOpen(false)
      setSelectedResponse(null)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading...</div>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Keywords</TableHead>
              <TableHead>Response</TableHead>
              <TableHead>Attachments</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((response) => (
              <TableRow key={response._id}>
                <TableCell>{response.category}</TableCell>
                <TableCell>{response.keywords.join(", ")}</TableCell>
                <TableCell className="max-w-[300px] truncate">{response.response}</TableCell>
                <TableCell>
                  {response.attachments.length > 0 ? (
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {response.attachments.length}
                    </span>
                  ) : (
                    "None"
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(response)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setSelectedResponse(response)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
              This will permanently delete the custom response and all its attachments. This action cannot be undone.
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

