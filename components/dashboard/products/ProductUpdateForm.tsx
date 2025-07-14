"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Product } from "@prisma/client"
import { FileText, Package, Tag } from "lucide-react"
import { BasicInfoTab } from "./tabs/basic-info-tab"
import { InventoryTab } from "./tabs/inventory-tab"
import { DetailsTab } from "./tabs/details-tab"

interface ProductWithDetails extends Product {
  category: {
    id: string
    title: string
  }
  productType?: {
    id: string
    name: string
    slug: string
  } | null
}

export type CategoryOptions = {
  value: string
  label: string
}

export type ProductTypeOptions = {
  value: string
  label: string
  description?: string | null
}

interface ProductUpdateFormProps {
  product: ProductWithDetails
  categoryOptions: CategoryOptions[]
  productTypeOptions: ProductTypeOptions[]
}

export function ProductUpdateForm({ product, categoryOptions, productTypeOptions }: ProductUpdateFormProps) {
  const [activeTab, setActiveTab] = useState("basic-info")

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic-info" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Basic Information
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory & Pricing
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Product Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info" className="mt-6">
          <BasicInfoTab product={product} categoryOptions={categoryOptions} />
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <InventoryTab product={product} />
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          <DetailsTab product={product} productTypeOptions={productTypeOptions} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
