"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Product, ProductStatus } from "@prisma/client"
import { FormCard } from "../form-card"
import { toast } from "sonner"
import { useProductUpdate } from "@/hooks/useProductQueries"

interface InventoryTabProps {
  product: Product
}

export function InventoryTab({ product }: InventoryTabProps) {
  // Use React Query mutation
  const updateProductMutation = useProductUpdate(product.id)

  // Consolidated state
  const [formState, setFormState] = useState({
    price: product.price || 0,
    comparePrice: product.comparePrice || 0,
    costPrice: product.costPrice || 0,
    stockQuantity: product.stockQuantity || 0,
    lowStockAlert: product.lowStockAlert || 10,
    trackStock: product.trackStock || true,
    status: product.status || "ACTIVE",
  })

  // Update form state when product changes (from optimistic updates)
  useEffect(() => {
    setFormState({
      price: product.price || 0,
      comparePrice: product.comparePrice || 0,
      costPrice: product.costPrice || 0,
      stockQuantity: product.stockQuantity || 0,
      lowStockAlert: product.lowStockAlert || 10,
      trackStock: product.trackStock || true,
      status: product.status || "ACTIVE",
    })
  }, [product])

  // Generic state update handler
  const updateField = (field: string, value: string | number | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  // Update handlers using React Query
  const updatePricing = async () => {
    if (formState.price <= 0) {
      toast.error("Price must be greater than 0")
      return
    }
    await updateProductMutation.mutateAsync({
      price: formState.price,
      comparePrice: formState.comparePrice || 0,
      costPrice: formState.costPrice || 0,
    })
  }

  const updateInventory = async () => {
    if (formState.stockQuantity < 0) {
      toast.error("Stock quantity cannot be negative")
      return
    }
    await updateProductMutation.mutateAsync({
      stockQuantity: formState.stockQuantity,
      lowStockAlert: formState.lowStockAlert,
      trackStock: formState.trackStock,
    })
  }

  const updateStatus = async () => {
    await updateProductMutation.mutateAsync({
      status: formState.status as ProductStatus,
    })
  }

  return (
    <div className="grid gap-6">
      {/* Pricing Card */}
      <FormCard
        title="Product Pricing"
        onSubmit={updatePricing}
        buttonText="Update Pricing"
        isLoading={updateProductMutation.isPending}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="price">Selling Price (R)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formState.price}
              onChange={(e) => updateField("price", Number.parseFloat(e.target.value) || 0)}
              disabled={updateProductMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comparePrice">Compare Price (R)</Label>
            <Input
              id="comparePrice"
              type="number"
              step="0.01"
              min="0"
              value={formState.comparePrice}
              onChange={(e) => updateField("comparePrice", Number.parseFloat(e.target.value) || 0)}
              placeholder="Original price for sales"
              disabled={updateProductMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="costPrice">Cost Price (R)</Label>
            <Input
              id="costPrice"
              type="number"
              step="0.01"
              min="0"
              value={formState.costPrice}
              onChange={(e) => updateField("costPrice", Number.parseFloat(e.target.value) || 0)}
              placeholder="Your cost"
              disabled={updateProductMutation.isPending}
            />
          </div>
        </div>
      </FormCard>

      {/* Inventory Card */}
      <FormCard
        title="Inventory Management"
        onSubmit={updateInventory}
        buttonText="Update Inventory"
        isLoading={updateProductMutation.isPending}
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                value={formState.stockQuantity}
                onChange={(e) => updateField("stockQuantity", Number.parseInt(e.target.value) || 0)}
                disabled={updateProductMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStockAlert">Low Stock Alert</Label>
              <Input
                id="lowStockAlert"
                type="number"
                min="0"
                value={formState.lowStockAlert}
                onChange={(e) => updateField("lowStockAlert", Number.parseInt(e.target.value) || 0)}
                placeholder="Alert when stock is below this number"
                disabled={updateProductMutation.isPending}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="trackStock"
              checked={formState.trackStock}
              onCheckedChange={(checked) => updateField("trackStock", checked)}
              disabled={updateProductMutation.isPending}
            />
            <Label htmlFor="trackStock">Track Stock Quantity</Label>
          </div>
        </div>
      </FormCard>

      {/* Product Status Card */}
      <FormCard
        title="Product Status"
        onSubmit={updateStatus}
        buttonText="Update Status"
        isLoading={updateProductMutation.isPending}
      >
        <div className="space-y-2">
          <Label htmlFor="status">Product Status</Label>
          <Select
            value={formState.status}
            onValueChange={(value) => updateField("status", value)}
            disabled={updateProductMutation.isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select product status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status Options</SelectLabel>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </FormCard>
    </div>
  )
}
