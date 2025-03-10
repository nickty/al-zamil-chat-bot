"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EstimationItem } from "@/utils/api"

interface EstimationLaborsViewProps {
  items: EstimationItem[]
}

export function EstimationLaborsView({ items }: EstimationLaborsViewProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">No labor or service items added to this estimation</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const laborItems = items.filter((item) => item.type === "labor")
  const serviceItems = items.filter((item) => item.type === "service")

  const laborTotal = laborItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const serviceTotal = serviceItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const totalAmount = laborTotal + serviceTotal

  return (
    <div className="space-y-6">
      {laborItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Labor</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {laborItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description || "-"}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${item.totalPrice.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-bold">
                    Total Labor
                  </TableCell>
                  <TableCell className="text-right font-bold">${laborTotal.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {serviceItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description || "-"}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${item.totalPrice.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-bold">
                    Total Services
                  </TableCell>
                  <TableCell className="text-right font-bold">${serviceTotal.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <span className="font-bold">Total Labor & Services</span>
            <span className="font-bold text-lg">${totalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

