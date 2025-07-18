"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ImageIcon, Loader2, X } from "lucide-react"
import type { Product } from "@prisma/client"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormCard } from "../form-card"
import MultipleImageInput from "@/components/FormInputs/MultipleImageInput"
import { ImageInput } from "@/components/FormInputs/ImageInput"
import { useProductUpdate } from "@/hooks/useProductQueries"

export type ProductTypeOptions = {
  value: string
  label: string
  description?: string | null
}

interface DetailsTabProps {
  product: Product
  productTypeOptions: ProductTypeOptions[]
}

export function DetailsTab({ product, productTypeOptions }: DetailsTabProps) {
  // Enable built-in toasts by removing showToast: false
  const updateProductMutation = useProductUpdate(product.id)

  // Consolidated state
  const [formState, setFormState] = useState({
    productTypeId: product.productTypeId || "",
    weight: product.weight || 0,
    length: product.length || 0,
    width: product.width || 0,
    height: product.height || 0,
    thumbnail: product.thumbnail || "",
    imageUrls: product.imageUrls || [],
  })

  const [imageUrl, setImageUrl] = useState(product.thumbnail || "")
  const [imageUrls, setImageUrls] = useState(product.imageUrls || [])
  const [showPreview, setShowPreview] = useState(false)
  const [newUploadUrl, setNewUploadUrl] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  // Check if there's a new image different from the current thumbnail
  useEffect(() => {
    if (imageUrl && imageUrl !== product.thumbnail) {
      setShowPreview(true)
      if (imageUrl !== newUploadUrl) {
        setNewUploadUrl(imageUrl)
      }
    } else {
      setShowPreview(false)
    }
  }, [imageUrl, product.thumbnail, newUploadUrl])

  // Generic state update handler
  const updateField = (field: string, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  // Simplified update handlers - let React Query handle toasts
  const updateProductType = async () => {
    await updateProductMutation.mutateAsync({
      productTypeId: formState.productTypeId,
    })
  }

  const updateDimensions = async () => {
    await updateProductMutation.mutateAsync({
      weight: formState.weight,
      length: formState.length,
      width: formState.width,
      height: formState.height,
    })
  }

  const updateThumbnail = async () => {
    // No changes to make if the thumbnail hasn't changed
    if (imageUrl === product.thumbnail) {
      return
    }

    await updateProductMutation.mutateAsync({
      thumbnail: imageUrl,
    })
    // Reset preview state after successful update
    setShowPreview(false)
    setNewUploadUrl("")
  }

  const handleMultipleImageUpload = async () => {
    await updateProductMutation.mutateAsync({
      imageUrls: imageUrls,
    })
    // Reset preview state after successful update
    setShowPreview(false)
    setNewUploadUrl("")
  }

  // Cancel preview with file deletion
  const cancelImagePreview = async () => {
    setIsDeleting(true)
    try {
      setImageUrl(product.thumbnail || "")
      setShowPreview(false)
      setNewUploadUrl("")
    } catch (error) {
      console.error("Failed to cancel preview:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Custom handler for the image URL change
  const handleImageUrlChange = (url: string) => {
    console.log("New image URL received:", url)
    setImageUrl(url)
  }

  return (
    <div className="grid gap-6">
      {/* Product Type Card */}
      <FormCard
        title="Product Type"
        onSubmit={updateProductType}
        buttonText="Update Product Type"
        isLoading={updateProductMutation.isPending}
      >
        <div className="space-y-2">
          <Label htmlFor="productTypeId">Product Type</Label>
          <Select
            value={formState.productTypeId}
            onValueChange={(value) => updateField("productTypeId", value)}
            disabled={updateProductMutation.isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select product type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {productTypeOptions.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{type.label}</span>
                      {type.description && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {type.description.length > 30 ? `${type.description.substring(0, 30)}...` : type.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </FormCard>

      {/* Physical Attributes Card */}
      <FormCard
        title="Physical Attributes"
        onSubmit={updateDimensions}
        buttonText="Update Physical Attributes"
        isLoading={updateProductMutation.isPending}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.01"
              min="0"
              value={formState.weight || ""}
              onChange={(e) => updateField("weight", Number.parseFloat(e.target.value) || 0)}
              placeholder="e.g., 0.5"
              disabled={updateProductMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="length">Length (mm)</Label>
            <Input
              id="length"
              type="number"
              step="0.01"
              min="0"
              value={formState.length || ""}
              onChange={(e) => updateField("length", Number.parseFloat(e.target.value) || 0)}
              placeholder="e.g., 1200"
              disabled={updateProductMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="width">Width (mm)</Label>
            <Input
              id="width"
              type="number"
              step="0.01"
              min="0"
              value={formState.width || ""}
              onChange={(e) => updateField("width", Number.parseFloat(e.target.value) || 0)}
              placeholder="e.g., 800"
              disabled={updateProductMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (mm)</Label>
            <Input
              id="height"
              type="number"
              step="0.01"
              min="0"
              value={formState.height || ""}
              onChange={(e) => updateField("height", Number.parseFloat(e.target.value) || 0)}
              placeholder="e.g., 1000"
              disabled={updateProductMutation.isPending}
            />
          </div>
        </div>
      </FormCard>

      {/* Thumbnail Card */}
      <FormCard
        title="Item Thumbnail"
        onSubmit={updateThumbnail}
        buttonText="Update Thumbnail"
        isLoading={updateProductMutation.isPending}
      >
        <div className="grid md:flex gap-6 items-start">
          {/* Current thumbnail */}
          <div className="">
            <h3 className="text-sm font-medium mb-2">Current Thumbnail</h3>
            {product?.thumbnail ? (
              <div className="relative">
                <Image
                  width={100}
                  height={100}
                  src={product?.thumbnail || "/placeholder.svg"}
                  alt="Item thumbnail"
                  className="w-24 h-24 md:w-56 md:h-56 object-cover rounded border shadow-sm"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.jpg"
                    console.error("Failed to load thumbnail image")
                  }}
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 flex flex-col items-center justify-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <ImageIcon className="h-10 w-10 text-primary" />
                </div>
                <p className="text-base font-medium text-center mb-1">Upload an image</p>
              </div>
            )}
          </div>
          {/* Upload + Preview section */}
          <div className="">
            <h3 className="text-sm font-medium mb-2">Upload New Image</h3>
            {/* Image uploader */}
            <ImageInput title="" imageUrl={imageUrl} setImageUrl={handleImageUrlChange} endpoint="itemImage" />
            {/* Preview appears below the uploader */}
            {showPreview && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-amber-600">Preview - Thumbnail will change to:</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelImagePreview}
                    className="h-6 w-6 p-0 rounded-full bg-primary text-white hover:opacity-80 hover:bg-primary ml-1"
                    disabled={updateProductMutation.isPending}
                  >
                    {isDeleting ? <Loader2 className="animate-spin h-4 w-4" /> : <X className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="border border-dashed border-amber-400 rounded p-2 bg-amber-50">
                  <Image
                    width={100}
                    height={100}
                    src={imageUrl || "/placeholder.svg"}
                    alt="New thumbnail preview"
                    className="w-20 h-20 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg"
                      console.error("Failed to load preview image")
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </FormCard>

      {/* Multiple Images Card */}
      <FormCard
        title="Current Product Images"
        onSubmit={handleMultipleImageUpload}
        buttonText="Update Additional Images"
        isLoading={updateProductMutation.isPending}
      >
        <MultipleImageInput
          title=""
          imageUrls={imageUrls}
          setImageUrls={setImageUrls}
          endpoint="itemImages"
          productId={product.id}
        />
      </FormCard>
    </div>
  )
}
