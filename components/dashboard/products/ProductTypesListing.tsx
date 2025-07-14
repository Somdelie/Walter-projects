"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ProductTypeDialog } from "./product-type-dialog"
import { Trash2, Edit, Package } from "lucide-react"
import { useState } from "react"
import { deleteProductType } from "@/actions/productTypes"
import { toast } from "sonner"

interface ProductType {
  id: string
  name: string
  slug: string
  description?: string | null
  isActive: boolean
  sortOrder: number
  _count: {
    products: number
  }
}

interface ProductTypesListingProps {
  types: { data: ProductType[]; error: string | null }
  onRefresh?: () => void
}

export default function ProductTypesListing({ types, onRefresh }: ProductTypesListingProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)

    try {
      const result = await deleteProductType(id)

      if (result.success) {
        toast.success(`Product type deleted successfully`)
        onRefresh?.()
      } else {
        toast.error(result.error || "Failed to delete product type")
      }
    } catch (error) {
      toast.error("An unexpected error occurred while deleting the product type")
      console.error("Error deleting product type:", error)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Product Types</CardTitle>
        <ProductTypeDialog onSuccess={onRefresh} />
      </CardHeader>

      <ScrollArea className="p-4 max-h-[70vh] overflow-y-auto">
        {types.error ? (
          <p className="text-red-500">{types.error}</p>
        ) : types.data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No product types found</p>
            <p className="text-sm">Create your first product type to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {types.data.map((type) => (
              <div
                key={type.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{type.name}</h3>
                    <Badge variant={type.isActive ? "default" : "secondary"}>
                      {type.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {type._count.products} products
                    </Badge>
                  </div>
                  {/* <p className="text-sm text-gray-600 mb-1">
                    Slug: <code className="bg-gray-100 px-1 rounded">{type.slug}</code>
                  </p> */}
                  {type.description && <p className="text-sm text-gray-500">{type.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">Sort order: {type.sortOrder}</p>
                </div>

                <div className="flex items-center gap-2">
                  <ProductTypeDialog
                    productType={type}
                    onSuccess={onRefresh}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    }
                  />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={type._count.products > 0 || deletingId === type.id}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product Type</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{type.name}"? This action cannot be undone.
                          {type._count.products > 0 && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <strong>Warning:</strong> This product type is used by {type._count.products} product(s).
                              You must reassign or remove those products first.
                            </div>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(type.id)}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={type._count.products > 0}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  )
}
