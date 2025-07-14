"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

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

export async function createProductType(data: ProductTypeFormData) {
  try {
    // Validate the data
    const validatedData = productTypeSchema.parse(data)

    // Check if slug already exists
    const existingSlug = await db.productTypeRef.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingSlug) {
      return { success: false, error: "A product type with this slug already exists" }
    }

    // Check if name already exists
    const existingName = await db.productTypeRef.findUnique({
      where: { name: validatedData.name },
    })

    if (existingName) {
      return { success: false, error: "A product type with this name already exists" }
    }

    // Create the product type
    const productType = await db.productTypeRef.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        isActive: validatedData.isActive,
        sortOrder: validatedData.sortOrder,
      },
    })

    // Revalidate the page to show updated data
    revalidatePath("/admin/product-types")
    revalidatePath("/admin/products")

    return { success: true, data: productType }
  } catch (error) {
    console.error("Error creating product type:", error)

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }

    return { success: false, error: "Failed to create product type" }
  }
}

export async function updateProductType(id: string, data: ProductTypeFormData) {
  try {
    // Validate the data
    const validatedData = productTypeSchema.parse(data)

    // Check if the product type exists
    const existingProductType = await db.productTypeRef.findUnique({
      where: { id },
    })

    if (!existingProductType) {
      return { success: false, error: "Product type not found" }
    }

    // Check if name already exists (excluding current record)
    const existingName = await db.productTypeRef.findFirst({
      where: {
        name: validatedData.name,
        id: { not: id },
      },
    })

    if (existingName) {
      return { success: false, error: "A product type with this name already exists" }
    }

    // Update the product type (slug cannot be changed)
    const productType = await db.productTypeRef.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        isActive: validatedData.isActive,
        sortOrder: validatedData.sortOrder,
      },
    })

    // Revalidate the page to show updated data
    revalidatePath("/admin/product-types")
    revalidatePath("/admin/products")

    return { success: true, data: productType }
  } catch (error) {
    console.error("Error updating product type:", error)

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }

    return { success: false, error: "Failed to update product type" }
  }
}

export async function deleteProductType(id: string) {
  try {
    // Check if the product type exists
    const existingProductType = await db.productTypeRef.findUnique({
      where: { id },
    })

    if (!existingProductType) {
      return { success: false, error: "Product type not found" }
    }

    // Check if any products are using this product type
    const productsUsingType = await db.product.count({
      where: { productTypeId: id },
    })

    if (productsUsingType > 0) {
      return {
        data: null,
        success: false,
        error: `Cannot delete product type. ${productsUsingType} product(s) are using this type.`,
      }
    }

    // Delete the product type
    await db.productTypeRef.delete({
      where: { id },
    })

    // Revalidate the page to show updated data
    revalidatePath("/admin/product-types")
    revalidatePath("/admin/products")

    return { success: true }
  } catch (error) {
    console.error("Error deleting product type:", error)
    return { success: false, error: "Failed to delete product type" }
  }
}

export async function getProductTypes() {
  try {
    const productTypes = await db.productTypeRef.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    return { data: productTypes, error: null }
  } catch (error) {
    console.error("Error fetching product types:", error)
    return { data: [], error: "Failed to fetch product types" }
  }
}
