"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { updateProductionMetrics } from "@/utils/api"

const departmentSchema = z.object({
  name: z.string(),
  present: z.number().min(0),
  total: z.number().min(0),
})

const equipmentSchema = z.object({
  name: z.string(),
  status: z.enum(["operational", "maintenance", "breakdown"]),
  utilization: z.number().min(0).max(100),
  lastMaintenance: z.string(),
  nextMaintenance: z.string(),
})

const formSchema = z.object({
  productionStatus: z.object({
    activeOrders: z.number().min(0),
    completedOrders: z.number().min(0),
    delayedOrders: z.number().min(0),
    efficiency: z.number().min(0).max(100),
  }),
  workforceStatus: z.object({
    totalPresent: z.number().min(0),
    onLeave: z.number().min(0),
    utilizationRate: z.number().min(0).max(100),
    departments: z.array(departmentSchema),
  }),
  equipmentStatus: z.object({
    operational: z.number().min(0).max(100),
    maintenance: z.number().min(0).max(100),
    breakdown: z.number().min(0).max(100),
    equipment: z.array(equipmentSchema),
  }),
  qualityMetrics: z.object({
    passRate: z.number().min(0).max(100),
    inspectionsPending: z.number().min(0),
  }),
})

// Define the type for metrics
interface ProductionMetrics {
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
    departments: Array<{
      name: string
      present: number
      total: number
    }>
  }
  equipmentStatus: {
    operational: number
    maintenance: number
    breakdown: number
    equipment: Array<{
      name: string
      status: "operational" | "maintenance" | "breakdown"
      utilization: number
      lastMaintenance: string
      nextMaintenance: string
    }>
  }
  qualityMetrics: {
    passRate: number
    inspectionsPending: number
  }
}

// Default values for metrics
const defaultMetrics: ProductionMetrics = {
  productionStatus: {
    activeOrders: 0,
    completedOrders: 0,
    delayedOrders: 0,
    efficiency: 0,
  },
  workforceStatus: {
    totalPresent: 0,
    onLeave: 0,
    utilizationRate: 0,
    departments: [],
  },
  equipmentStatus: {
    operational: 0,
    maintenance: 0,
    breakdown: 0,
    equipment: [],
  },
  qualityMetrics: {
    passRate: 0,
    inspectionsPending: 0,
  },
}

interface ProductionFormProps {
  currentMetrics?: Partial<ProductionMetrics>
  onSuccess: () => void
}

export function ProductionForm({ currentMetrics = defaultMetrics, onSuccess }: ProductionFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productionStatus: {
        activeOrders: currentMetrics.productionStatus?.activeOrders ?? 0,
        completedOrders: currentMetrics.productionStatus?.completedOrders ?? 0,
        delayedOrders: currentMetrics.productionStatus?.delayedOrders ?? 0,
        efficiency: currentMetrics.productionStatus?.efficiency ?? 0,
      },
      workforceStatus: {
        totalPresent: currentMetrics.workforceStatus?.totalPresent ?? 0,
        onLeave: currentMetrics.workforceStatus?.onLeave ?? 0,
        utilizationRate: currentMetrics.workforceStatus?.utilizationRate ?? 0,
        departments: currentMetrics.workforceStatus?.departments ?? [],
      },
      equipmentStatus: {
        operational: currentMetrics.equipmentStatus?.operational ?? 0,
        maintenance: currentMetrics.equipmentStatus?.maintenance ?? 0,
        breakdown: currentMetrics.equipmentStatus?.breakdown ?? 0,
        equipment: currentMetrics.equipmentStatus?.equipment ?? [],
      },
      qualityMetrics: {
        passRate: currentMetrics.qualityMetrics?.passRate ?? 0,
        inspectionsPending: currentMetrics.qualityMetrics?.inspectionsPending ?? 0,
      },
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      await updateProductionMetrics(values)
      toast.success("Production metrics updated successfully")
      onSuccess()
    } catch (error) {
      console.error("Error updating metrics:", error)
      toast.error("Failed to update production metrics")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Production Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="productionStatus.activeOrders"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Active Orders</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productionStatus.completedOrders"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completed Orders</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productionStatus.delayedOrders"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delayed Orders</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productionStatus.efficiency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Efficiency (%)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Workforce Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="workforceStatus.totalPresent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Present</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workforceStatus.onLeave"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>On Leave</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workforceStatus.utilizationRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Utilization Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Equipment Status</h3>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="equipmentStatus.operational"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operational (%)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="equipmentStatus.maintenance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance (%)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="equipmentStatus.breakdown"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Breakdown (%)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Quality Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="qualityMetrics.passRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pass Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="qualityMetrics.inspectionsPending"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspections Pending</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Metrics"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

