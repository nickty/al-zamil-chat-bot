"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash, ArrowDown, ArrowUp } from "lucide-react"
import { EstimationItemForm } from "@/components/estimation/EstimationItemForm"
import { ClientSelector } from "@/components/estimation/ClientSelector"
import { createEstimation, updateEstimation, getEstimationById, type EstimationItem } from "@/utils/api"
import { toast } from "sonner"

interface EstimationDialogProps {
  open: boolean
  onOpenChange: (refresh?: boolean) => void
  estimationId: string | null
}

export function EstimationDialog({ open, onOpenChange, estimationId }: EstimationDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [clientId, setClientId] = useState("")
  const [selectedTab, setSelectedTab] = useState("info")
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [items, setItems] = useState<EstimationItem[]>([])

  useEffect(() => {
    const fetchEstimation = async () => {
      if (!estimationId || !open) return

      try {
        setLoading(true)
        const data = await getEstimationById(estimationId)
        setTitle(data.title)
        setDescription(data.description)
        setClientId(data.client._id)
        setItems(data.items)
      } catch (error) {
        console.error("Error fetching estimation:", error)
        toast.error("Failed to load estimation details")
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      if (estimationId) {
        fetchEstimation()
      } else {
        // Reset form for new estimation
        setTitle("")
        setDescription("")
        setClientId("")
        setItems([])
        setSelectedTab("info")
      }
    }
  }, [estimationId, open])

  const handleAddItem = (type: "material" | "labor" | "service") => {
    const newItem: EstimationItem = {
      _id: `temp-${Date.now()}`,
      name: "",
      description: "",
      quantity: 1,
      unit: type === "material" ? "ea" : "hr",
      unitPrice: 0,
      totalPrice: 0,
      type,
    }

    setItems([...items, newItem])
  }

  const handleUpdateItem = (updatedItem: EstimationItem) => {
    setItems(items.map((item) => (item._id === updatedItem._id ? updatedItem : item)))
  }

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((item) => item._id !== itemId))
  }

  const handleMoveItem = (itemId: string, direction: "up" | "down") => {
    const index = items.findIndex((item) => item._id === itemId)
    if ((direction === "up" && index === 0) || (direction === "down" && index === items.length - 1)) {
      return
    }

    const newItems = [...items]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp

    setItems(newItems)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Validation
      if (!title.trim()) {
        toast.error("Title is required")
        setSelectedTab("info")
        return
      }

      if (!clientId) {
        toast.error("Client is required")
        setSelectedTab("info")
        return
      }

      // Validate items
      if (items.length === 0) {
        toast.error("Please add at least one item")
        setSelectedTab("items")
        return
      }

      for (const item of items) {
        if (!item.name.trim()) {
          toast.error("Item name is required for all items")
          setSelectedTab("items")
          return
        }

        if (item.quantity <= 0) {
          toast.error(`Invalid quantity for item: ${item.name}`)
          setSelectedTab("items")
          return
        }

        if (item.unitPrice < 0) {
          toast.error(`Invalid unit price for item: ${item.name}`)
          setSelectedTab("items")
          return
        }
      }

      const formData = {
        title,
        description,
        clientId,
        items: items.map((item) => ({
          ...item,
          // Remove temporary IDs for new items
          _id: item._id.startsWith("temp-") ? undefined : item._id,
        })),
        status: "draft",
      }

      if (estimationId) {
        await updateEstimation(estimationId, formData)
        toast.success("Estimation updated successfully")
      } else {
        await createEstimation(formData)
        toast.success("Estimation created successfully")
      }

      onOpenChange(true)
    } catch (error) {
      console.error("Error saving estimation:", error)
      toast.error("Failed to save estimation")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate totals
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const materialTotal = items.filter((item) => item.type === "material").reduce((sum, item) => sum + item.totalPrice, 0)
  const laborTotal = items.filter((item) => item.type === "labor").reduce((sum, item) => sum + item.totalPrice, 0)
  const serviceTotal = items.filter((item) => item.type === "service").reduce((sum, item) => sum + item.totalPrice, 0)

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{estimationId ? "Edit Estimation" : "Create New Estimation"}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">Loading estimation data...</p>
          </div>
        ) : (
          <Tabs defaultValue="info" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="items">Items & Pricing</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Estimation Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Heat Exchanger Fabrication"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter a detailed description of this estimation"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <ClientSelector selectedClientId={clientId} onSelect={setClientId} />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => onOpenChange()}>
                    Cancel
                  </Button>
                  <Button onClick={() => setSelectedTab("items")}>Next: Add Items</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="items">
              <div className="space-y-6">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleAddItem("material")}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Material
                  </Button>
                  <Button variant="outline" onClick={() => handleAddItem("labor")} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Labor
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAddItem("service")}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Service
                  </Button>
                </div>

                {items.length === 0 ? (
                  <div className="flex justify-center items-center h-40 border rounded-md">
                    <p className="text-muted-foreground">No items added yet. Use the buttons above to add items.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <Card key={item._id}>
                        <CardHeader className="py-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base capitalize">
                              {item.type} {index + 1}
                            </CardTitle>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleMoveItem(item._id, "up")}
                                disabled={index === 0}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleMoveItem(item._id, "down")}
                                disabled={index === items.length - 1}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(item._id)}
                                className="text-destructive"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <EstimationItemForm item={item} onChange={handleUpdateItem} />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="flex justify-between gap-2 mt-6">
                  <Button variant="outline" onClick={() => setSelectedTab("info")}>
                    Back: Information
                  </Button>
                  <Button onClick={() => setSelectedTab("summary")}>Next: Summary</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="summary">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Estimation Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium">Estimation Details</h3>
                          <p className="text-sm text-muted-foreground">Title: {title}</p>
                          <p className="text-sm text-muted-foreground">Description: {description}</p>
                        </div>
                        <div>
                          <h3 className="font-medium">Client Details</h3>
                          <p className="text-sm text-muted-foreground">
                            {clientId ? "Client selected" : "No client selected"}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-medium mb-2">Items Summary</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Materials ({items.filter((i) => i.type === "material").length} items)</span>
                            <span>${materialTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Labor ({items.filter((i) => i.type === "labor").length} items)</span>
                            <span>${laborTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Services ({items.filter((i) => i.type === "service").length} items)</span>
                            <span>${serviceTotal.toFixed(2)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>${totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between gap-2 mt-6">
                  <Button variant="outline" onClick={() => setSelectedTab("items")}>
                    Back: Items
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange()}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : estimationId ? "Update Estimation" : "Create Estimation"}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

