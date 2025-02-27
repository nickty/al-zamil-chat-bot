"use client"

import { useState, useEffect, useCallback } from "react"
import { CustomResponseTable } from "../CustomResponseTable"
import { CustomResponseDialog } from "../CustomResponseDialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllCustomResponses } from "@/utils/api"
import { toast } from "sonner"

export interface CustomResponse {
  _id: string
  category: string
  keywords: string[]
  response: string
  attachments: Array<{
    filename: string
    originalName: string
    mimetype: string
    size: number
    storageUrl: string
  }>
  createdAt: string
}

export function AdminDashboard() {
  const [responses, setResponses] = useState<CustomResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedResponse, setSelectedResponse] = useState<CustomResponse | null>(null)

  const fetchResponses = useCallback(async () => {
    try {
      const data = await getAllCustomResponses()
      setResponses(data)
    } catch (error) {
      console.error("Error fetching responses:", error)
      toast.error("Failed to load custom responses")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResponses()
  }, [fetchResponses])

  const handleEdit = (response: CustomResponse) => {
    setSelectedResponse(response)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setSelectedResponse(null)
    setDialogOpen(true)
  }

  const handleDialogClose = (refresh?: boolean) => {
    setDialogOpen(false)
    setSelectedResponse(null)
    if (refresh) {
      fetchResponses()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Custom Responses Management</CardTitle>
              <CardDescription>Manage your custom responses and their attachments</CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Response
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CustomResponseTable responses={responses} loading={loading} onEdit={handleEdit} onRefresh={fetchResponses} />
        </CardContent>
      </Card>

      <CustomResponseDialog open={dialogOpen} onOpenChange={handleDialogClose} response={selectedResponse} />
    </div>
  )
}

