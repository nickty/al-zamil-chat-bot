"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomResponseTable } from "../CustomResponseTable"
import { CustomResponseDialog } from "../CustomResponseDialog"
import { UserManagement } from "./UserManagement"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllCustomResponses } from "@/utils/api"
import { toast } from "sonner"

// Update the CustomResponse interface to include userId as an alternative to createdBy
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
  createdBy?: {
    _id: string
    name?: string
    email: string
  }
  userId?: string | { _id: string; name?: string; email?: string }
  createdAt: string
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("responses")
  const [responses, setResponses] = useState<CustomResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedResponse, setSelectedResponse] = useState<CustomResponse | null>(null)

  // Add a console.log in the fetchResponses function to debug the response data
  const fetchResponses = async () => {
    try {
      const data = await getAllCustomResponses()
      console.log("Custom responses data:", data)
      setResponses(data)
    } catch (error) {
      console.error("Error fetching responses:", error)
      toast.error("Failed to load custom responses")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResponses()
  }, [])

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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your system settings and users</p>
          </div>
          <TabsList>
            <TabsTrigger value="responses">Custom Responses</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="responses">
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
              <CustomResponseTable
                responses={responses}
                loading={loading}
                onEdit={handleEdit}
                onRefresh={fetchResponses}
              />
            </CardContent>
          </Card>

          <CustomResponseDialog open={dialogOpen} onOpenChange={handleDialogClose} response={selectedResponse} />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}

