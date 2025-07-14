"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Edit, Loader2 } from "lucide-react"
import { createProductType, updateProductType } from "@/actions/productTypes"
import { toast } from "sonner"

const productTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0, "Sort order must be 0 or greater").default(0),
})

type ProductTypeFormData = z.infer<typeof productTypeSchema>

interface ProductType {
  id: string
  name: string
  slug: string
  description?: string | null
  isActive: boolean
  sortOrder: number
}

interface ProductTypeDialogProps {
  productType?: ProductType
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function ProductTypeDialog({ productType, onSuccess, trigger }: ProductTypeDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!productType

  const form = useForm<ProductTypeFormData>({
    resolver: zodResolver(productTypeSchema),
    defaultValues: {
      name: productType?.name || "",
      slug: productType?.slug || "",
      description: productType?.description || "",
      isActive: productType?.isActive ?? true,
      sortOrder: productType?.sortOrder || 0,
    },
  })

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    if (!isEditing) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
      form.setValue("slug", slug)
    }
  }

  const onSubmit = async (data: ProductTypeFormData) => {
    setIsSubmitting(true)

    try {
      let result

      if (isEditing) {
        result = await updateProductType(productType.id, data)
      } else {
        result = await createProductType(data)
      }

      if (result.success) {
        toast.success(isEditing ? "Product type updated successfully" : "Product type created successfully")
        setOpen(false)
        form.reset()
        onSuccess?.()
      } else {
        toast.error(result.error || "An error occurred")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error("Error submitting product type form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const defaultTrigger = (
    <Button variant={isEditing ? "ghost" : "default"} size={isEditing ? "sm" : "default"}>
      {isEditing ? (
        <>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </>
      ) : (
        <>
          <Plus className="h-4 w-4 mr-2" />
          Add New Type
        </>
      )}
    </Button>
  )



  
// Balustrades
// Facade
// Shutters
// Blinds
// Awnings
// Gates
// Fencing


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product Type" : "Add New Product Type"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the product type information below."
              : "Create a new product type that can be assigned to products."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Window, Door, Profile"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handleNameChange(e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormDescription>The display name for this product type</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., window, door, profile" {...field} disabled={isEditing} />
                  </FormControl>
                  <FormDescription>
                    URL-friendly identifier (auto-generated from name)
                    {isEditing && " - Cannot be changed when editing"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description for this product type"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional description to help identify this product type</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between space-x-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>Whether this product type is available for use</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>Lower numbers appear first in lists</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Create"} Product Type
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
