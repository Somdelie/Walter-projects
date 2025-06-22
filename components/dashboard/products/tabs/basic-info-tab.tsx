"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Product } from "@prisma/client"
import { FormCard } from "../form-card"
import { toast } from "sonner"
import { useProductUpdate } from "@/hooks/useProductQueries"
import Image from "next/image"
import { ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/formatPrice"

interface ProductWithDetails extends Product {
  category: {
    id: string
    title: string
  }
}

interface BasicInfoTabProps {
  product: ProductWithDetails
  categoryOptions: Array<{ value: string; label: string }>
}

export function BasicInfoTab({ product, categoryOptions }: BasicInfoTabProps) {
  const router = useRouter()
  // Use React Query mutation
  const updateProductMutation = useProductUpdate(product.id)

  // Consolidated state
  const [formState, setFormState] = useState({
    name: product.name || "",
    slug: product.slug || "",
    sku: product.sku || "",
    description: product.description || "",
    shortDesc: product.shortDesc || "",
    categoryId: product.categoryId || "",
    isFeatured: product.isFeatured || false,
    isOnSale: product.isOnSale || false,
    metaTitle: product.metaTitle || "",
    metaDesc: product.metaDesc || "",
  })

  // Track the original slug to detect changes
  const [originalSlug] = useState(product.slug)

  // Update form state when product changes (from optimistic updates)
  useEffect(() => {
    setFormState({
      name: product.name || "",
      slug: product.slug || "",
      sku: product.sku || "",
      description: product.description || "",
      shortDesc: product.shortDesc || "",
      categoryId: product.categoryId || "",
      isFeatured: product.isFeatured || false,
      isOnSale: product.isOnSale || false,
      metaTitle: product.metaTitle || "",
      metaDesc: product.metaDesc || "",
    })
  }, [product])

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
  }

  // Update slug when name changes
  useEffect(() => {
    if (formState.name) {
      const newSlug = generateSlug(formState.name)
      setFormState((prev) => ({
        ...prev,
        slug: newSlug,
      }))
    }
  }, [formState.name])

  // Generic state update handler
  const updateField = (field: string, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  // Update handlers using React Query
  const updateNameSlug = async () => {
    if (!formState.name) {
      toast.error("Name cannot be empty")
      return
    }

    const slugWillChange = formState.slug !== originalSlug

    try {
      await updateProductMutation.mutateAsync({
        name: formState.name,
        slug: formState.slug,
      })

      // If slug changed, redirect immediately to new URL
      if (slugWillChange) {
        toast.success("Product updated! Redirecting...", {
          duration: 1500,
          position: "top-right",
        })
        // Immediate redirect using replace to avoid browser history issues
        router.replace(`/dashboard/products/${formState.slug}`)
      }
    } catch (error) {
      throw error
    }
  }

  const updateSKU = async () => {
    if (!formState.sku) {
      toast.error("SKU cannot be empty")
      return
    }
    await updateProductMutation.mutateAsync({
      sku: formState.sku,
    })
  }

  const updateDescription = async () => {
    await updateProductMutation.mutateAsync({
      description: formState.description,
      shortDesc: formState.shortDesc,
    })
  }

  const updateStatus = async () => {
    await updateProductMutation.mutateAsync({
      isFeatured: formState.isFeatured,
      isOnSale: formState.isOnSale,
    })
  }

  const updateCategory = async () => {
    if (!formState.categoryId) {
      toast.error("Category cannot be empty")
      return
    }
    await updateProductMutation.mutateAsync({
      categoryId: formState.categoryId,
    })
  }

  const updateSEO = async () => {
    await updateProductMutation.mutateAsync({
      metaTitle: formState.metaTitle,
      metaDesc: formState.metaDesc,
    })
  }

  // Check if slug will change
  const slugWillChange = formState.slug !== originalSlug && formState.name !== product.name

  return (
    <div className="grid gap-6">
      {/* Product Overview Card with Thumbnail */}
      <Card>
        <CardHeader>
          <CardTitle>Product Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Thumbnail Display */}
            <div className="flex-shrink-0">
              {product?.thumbnail ? (
                <div className="relative">
                  <Image
                    width={120}
                    height={120}
                    src={product.thumbnail || "/placeholder.svg"}
                    alt={`${product.name} thumbnail`}
                    className="w-24 h-24 md:w-30 md:h-30 object-cover rounded-lg border shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=120&width=120"
                    }}
                  />
                  {/* Status badges */}
                  <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                    {product.isFeatured && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Featured
                      </span>
                    )}
                    {product.isOnSale && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">On Sale</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 md:w-30 md:h-30 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                  <ImageIcon className="h-8 w-8 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500 text-center">No Image</span>
                </div>
              )}
            </div>

            {/* Product Summary */}
            <div className="flex-1 min-w-0">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name || "Untitled Product"}</h3>
                  <p className="text-sm text-gray-500">SKU: {product.sku || "Not set"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Category:</span>
                    <span className="ml-2 text-gray-600">{product.category?.title || "No category"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : product.status === "INACTIVE"
                            ? "bg-gray-100 text-gray-800"
                            : product.status === "OUT_OF_STOCK"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {product.status?.replace("_", " ") || "ACTIVE"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Price:</span>
                    <span className="ml-2 text-sky-800 font-semibold">{formatPrice(
                      product.price || 0
                    )}</span>
                  </div>
                  <div>
                    {
                      product.stockQuantity === 0 ? (
                        <span className="font-medium text-red-600">Out of Stock</span>
                      ) : (
                        <span className="font-medium text-green-600">In Stock</span>
                      )
                    }
                    <span className="ml-2 text-gray-600">{product.stockQuantity} units</span>
                  </div>
                </div>

                {product.shortDesc && (
                  <div>
                    <p className="text-sm text-gray-600 line-clamp-2">{product.shortDesc}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Name and Slug Card */}
      <FormCard
        title="Product Identity"
        onSubmit={updateNameSlug}
        buttonText="Update Name and Slug"
        isLoading={updateProductMutation.isPending}
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formState.name}
                onChange={(e) => updateField("name", e.target.value)}
                disabled={updateProductMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (Auto-generated)</Label>
              <Input id="slug" value={formState.slug} disabled className="bg-muted" />
            </div>
          </div>

          {/* URL Change Warning */}
          {slugWillChange && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">URL will change</h3>
                  <div className="mt-1 text-sm text-amber-700">
                    <p>Changing the product name will update the URL from:</p>
                    <p className="font-mono text-xs bg-white px-2 py-1 rounded mt-1 break-all">
                      /dashboard/products/{originalSlug}
                    </p>
                    <p className="mt-1">to:</p>
                    <p className="font-mono text-xs bg-white px-2 py-1 rounded mt-1 break-all">
                      /dashboard/products/{formState.slug}
                    </p>
                    <p className="mt-2">You'll be automatically redirected to the new URL after updating.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </FormCard>

      {/* SKU Card */}
      <FormCard
        title="Product Code"
        onSubmit={updateSKU}
        buttonText="Update SKU"
        isLoading={updateProductMutation.isPending}
      >
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={formState.sku}
            onChange={(e) => updateField("sku", e.target.value)}
            disabled={updateProductMutation.isPending}
          />
        </div>
      </FormCard>

      {/* Description Card */}
      <FormCard
        title="Product Description"
        onSubmit={updateDescription}
        buttonText="Update Description"
        isLoading={updateProductMutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shortDesc">Short Description</Label>
            <Input
              id="shortDesc"
              value={formState.shortDesc}
              onChange={(e) => updateField("shortDesc", e.target.value)}
              placeholder="Brief product description"
              disabled={updateProductMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              rows={4}
              className="resize-none"
              placeholder="Enter detailed product description"
              value={formState.description}
              onChange={(e) => updateField("description", e.target.value)}
              disabled={updateProductMutation.isPending}
            />
          </div>
        </div>
      </FormCard>

      {/* Status Card */}
      <FormCard
        title="Product Status"
        onSubmit={updateStatus}
        buttonText="Update Status"
        isLoading={updateProductMutation.isPending}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="isFeatured"
              checked={formState.isFeatured}
              onCheckedChange={(checked) => updateField("isFeatured", checked)}
              disabled={updateProductMutation.isPending}
            />
            <Label htmlFor="isFeatured">Featured Product</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isOnSale"
              checked={formState.isOnSale}
              onCheckedChange={(checked) => updateField("isOnSale", checked)}
              disabled={updateProductMutation.isPending}
            />
            <Label htmlFor="isOnSale">On Sale</Label>
          </div>
        </div>
      </FormCard>

      {/* Category Card */}
      <FormCard
        title="Product Category"
        onSubmit={updateCategory}
        buttonText="Update Category"
        isLoading={updateProductMutation.isPending}
      >
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formState.categoryId}
            onValueChange={(value) => updateField("categoryId", value)}
            disabled={updateProductMutation.isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categories</SelectLabel>
                {categoryOptions.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </FormCard>

      {/* SEO Card */}
      <FormCard
        title="SEO Information"
        onSubmit={updateSEO}
        buttonText="Update SEO"
        isLoading={updateProductMutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              value={formState.metaTitle}
              onChange={(e) => updateField("metaTitle", e.target.value)}
              placeholder="SEO title for search engines"
              disabled={updateProductMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDesc">Meta Description</Label>
            <Textarea
              id="metaDesc"
              rows={3}
              className="resize-none"
              placeholder="SEO description for search engines"
              value={formState.metaDesc}
              onChange={(e) => updateField("metaDesc", e.target.value)}
              disabled={updateProductMutation.isPending}
            />
          </div>
        </div>
      </FormCard>
    </div>
  )
}
