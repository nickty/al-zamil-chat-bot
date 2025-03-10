"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EstimationDetail } from "@/utils/api"

interface EstimationDetailViewProps {
  estimation: EstimationDetail
}

export function EstimationDetailView({ estimation }: EstimationDetailViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">Title</h3>
              <p>{estimation.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Estimation Number</h3>
              <p>{estimation.estimationNumber}</p>
            </div>
            <div className="col-span-2">
              <h3 className="text-sm font-medium">Description</h3>
              <p>{estimation.description || "No description provided"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">Client Name</h3>
              <p>{estimation.client.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Contact Person</h3>
              <p>{estimation.client.contactPerson || "Not specified"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Email</h3>
              <p>{estimation.client.email || "Not specified"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Phone</h3>
              <p>{estimation.client.phone || "Not specified"}</p>
            </div>
            <div className="col-span-2">
              <h3 className="text-sm font-medium">Address</h3>
              <p>{estimation.client.address || "Not specified"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium">Material Cost</h3>
              <p className="text-lg">
                $
                {estimation.items
                  .filter((item) => item.type === "material")
                  .reduce((sum, item) => sum + item.totalPrice, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Labor Cost</h3>
              <p className="text-lg">
                $
                {estimation.items
                  .filter((item) => item.type === "labor")
                  .reduce((sum, item) => sum + item.totalPrice, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Service Cost</h3>
              <p className="text-lg">
                $
                {estimation.items
                  .filter((item) => item.type === "service")
                  .reduce((sum, item) => sum + item.totalPrice, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div className="col-span-3">
              <h3 className="text-sm font-medium">Total Estimation Amount</h3>
              <p className="text-xl font-bold">${estimation.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

