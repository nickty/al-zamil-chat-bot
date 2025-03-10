"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { updateFinancialMetrics } from "@/utils/api"

const formSchema = z.object({
  overview: z.object({
    totalRevenue: z.number().min(0),
    totalExpenses: z.number().min(0),
    netProfit: z.number(),
    profitMargin: z.number(),
    revenueGrowth: z.number(),
    expenseGrowth: z.number(),
    budgetUtilization: z.number().min(0).max(100),
  }),
  revenue: z.object({
    totalRevenue: z.number().min(0),
    byProduct: z.array(
      z.object({
        name: z.string(),
        amount: z.number().min(0),
      }),
    ),
    byRegion: z.array(
      z.object({
        region: z.string(),
        amount: z.number().min(0),
      }),
    ),
    monthly: z.array(
      z.object({
        month: z.string(),
        amount: z.number().min(0),
      }),
    ),
  }),
  expenses: z.object({
    totalExpenses: z.number().min(0),
    byCategory: z.array(
      z.object({
        category: z.string(),
        amount: z.number().min(0),
      }),
    ),
    monthly: z.array(
      z.object({
        month: z.string(),
        amount: z.number().min(0),
      }),
    ),
  }),
  budget: z.object({
    totalBudget: z.number().min(0),
    allocated: z.number().min(0),
    remaining: z.number().min(0),
    departments: z.array(
      z.object({
        name: z.string(),
        allocated: z.number().min(0),
        spent: z.number().min(0),
        remaining: z.number().min(0),
      }),
    ),
  }),
})

interface FinanceFormProps {
  currentData?: any
  onSuccess: () => void
}

export function FinanceForm({ currentData, onSuccess }: FinanceFormProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Set default values from current data or use empty defaults
  const defaultValues = currentData || {
    overview: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      profitMargin: 0,
      revenueGrowth: 0,
      expenseGrowth: 0,
      budgetUtilization: 0,
    },
    revenue: {
      totalRevenue: 0,
      byProduct: [],
      byRegion: [],
      monthly: [],
    },
    expenses: {
      totalExpenses: 0,
      byCategory: [],
      monthly: [],
    },
    budget: {
      totalBudget: 0,
      allocated: 0,
      remaining: 0,
      departments: [],
    },
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      await updateFinancialMetrics(values)
      toast.success("Financial data updated successfully")
      onSuccess()
    } catch (error) {
      console.error("Error updating financial data:", error)
      toast.error("Failed to update financial data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="overview.totalRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Revenue</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="overview.totalExpenses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Expenses</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="overview.netProfit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Net Profit</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="overview.profitMargin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profit Margin (%)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="overview.revenueGrowth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenue Growth (%)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="overview.expenseGrowth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Growth (%)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="overview.budgetUtilization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Utilization (%)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <FormField
              control={form.control}
              name="revenue.totalRevenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Revenue</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-4" />
            <h3 className="text-lg font-medium">Monthly Revenue</h3>
            <p className="text-sm text-muted-foreground mb-4">Enter monthly revenue data for the current year</p>

            {/* This would ideally be a dynamic form array, but for simplicity we'll use a fixed structure */}
            <div className="grid grid-cols-2 gap-4">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                (month, index) => (
                  <FormField
                    key={month}
                    control={form.control}
                    name={`revenue.monthly.${index}.amount` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{month}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ),
              )}
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <FormField
              control={form.control}
              name="expenses.totalExpenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Expenses</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-4" />
            <h3 className="text-lg font-medium">Expenses by Category</h3>
            <p className="text-sm text-muted-foreground mb-4">Enter expense data for major categories</p>

            {/* This would ideally be a dynamic form array, but for simplicity we'll use a fixed structure */}
            <div className="grid grid-cols-2 gap-4">
              {["Manufacturing", "Operations", "Marketing", "R&D", "Admin", "Salaries"].map((category, index) => (
                <FormField
                  key={category}
                  control={form.control}
                  name={`expenses.byCategory.${index}.amount` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{category}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="budget.totalBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Budget</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget.allocated"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allocated</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget.remaining"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remaining</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />
            <h3 className="text-lg font-medium">Departmental Budgets</h3>
            <p className="text-sm text-muted-foreground mb-4">Enter budget data for each department</p>

            {/* This would ideally be a dynamic form array, but for simplicity we'll use a fixed structure */}
            {["Engineering", "Manufacturing", "Marketing", "Sales", "R&D"].map((dept, index) => (
              <div key={dept} className="grid grid-cols-3 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name={`budget.departments.${index}.allocated` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dept} - Allocated</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`budget.departments.${index}.spent` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dept} - Spent</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`budget.departments.${index}.remaining` as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dept} - Remaining</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Financial Data"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

