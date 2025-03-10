"use client"

import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { EstimationItem } from "@/utils/api"

interface EstimationItemFormProps {
  item: EstimationItem
  onChange: (updatedItem: EstimationItem) => void
}

export function EstimationItemForm({ item, onChange }: EstimationItemFormProps) {
  // When quantity or unit price changes, update the total price
  useEffect(() => {
    const totalPrice = item.quantity * item.unitPrice
    if (totalPrice !== item.totalPrice) {
      onChange({
        ...item,
        totalPrice,
      })
    }
  }, [item.quantity, item.unitPrice, item.totalPrice, onChange, item])

  const handleInputChange = (field: keyof EstimationItem, value: string | number) => {
    onChange({
      ...item,
      [field]: value,
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`name-${item._id}`}>Name</Label>
          <Input
            id={`name-${item._id}`}
            value={item.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder={`Enter ${item.type} name`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`description-${item._id}`}>Description</Label>
          <Textarea
            id={`description-${item._id}`}
            value={item.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Enter a description"
            rows={2}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`quantity-${item._id}`}>Quantity</Label>
          <Input
            id={`quantity-${item._id}`}
            type="number"
            min="0"
            step="1"
            value={item.quantity}
            onChange={(e) => handleInputChange("quantity", Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`unit-${item._id}`}>Unit</Label>
          <Select value={item.unit} onValueChange={(value) => handleInputChange("unit", value)}>
            <SelectTrigger id={`unit-${item._id}`}>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {item.type === "material" ? (
                <>
                  <SelectItem value="ea">Each</SelectItem>
                  <SelectItem value="kg">Kilogram</SelectItem>
                  <SelectItem value="m">Meter</SelectItem>
                  <SelectItem value="m2">Square Meter</SelectItem>
                  <SelectItem value="L">Liter</SelectItem>
                  <SelectItem value="set">Set</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="hr">Hour</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="job">Job</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`unitPrice-${item._id}`}>Unit Price ($)</Label>
          <Input
            id={`unitPrice-${item._id}`}
            type="number"
            min="0"
            step="0.01"
            value={item.unitPrice}
            onChange={(e) => handleInputChange("unitPrice", Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`totalPrice-${item._id}`}>Total Price ($)</Label>
          <Input
            id={`totalPrice-${item._id}`}
            type="number"
            value={item.totalPrice.toFixed(2)}
            disabled
            className="bg-muted"
          />
        </div>
      </div>
    </div>
  )
}

