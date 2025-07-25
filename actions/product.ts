"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "@/prisma/db"

export async function getAllProducts() {
  try {
    const productsFromDb = await db.product.findMany({
      include: {
        category: true,
        brand: true,
        // Include the ProductType relationship
        productType: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: true,
        attributes: true,
        cartItems: {
          include: {
            product: true,
            variant: true,
          },
        },
        orderItems: {
          include: {
            product: true,
            variant: true,
          },
        },
        wishlistItems: {
          include: {
            product: true,
          },
        },
        reviews: true,
      },
      orderBy: [{ name: "asc" }],
    })

    const products = productsFromDb.map((product) => ({
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice,
      costPrice: product.costPrice,
      weight: product.weight ? Number(product.weight) : 0,
      length: product.length ? Number(product.length) : 0,
      width: product.width ? Number(product.width) : 0,
      height: product.height ? Number(product.height) : 0,
    }))

    return {
      data: products,
      error: null,
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    return {
      data: [],
      error: "Failed to fetch products",
    }
  }
}

export async function getFeaturedProducts() {
  try {
    const products = await db.product.findMany({
      where: {
        isFeatured: true,
        status: "ACTIVE",
      },
      include: {
        reviews: {
          orderBy: {
            createdAt: "desc",
          },
          take: 3,
        },
        category: {
          select: {
            id: true,
            title: true,
          },
        },
        productType: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      take: 8,
    })

    return { data: products }
  } catch (error) {
    return { data: [] }
  }
}

export async function createProduct(data: any) {
  try {
    const product = await db.product.create({
      data: {
        name: data.name,
        slug: data.slug || "",
        description: data.description,
        shortDesc: data.shortDesc,
        sku: data.sku || "",
        // Use productTypeId instead of type
        productTypeId: data.productTypeId,
        price: data.price,
        comparePrice: data.comparePrice,
        costPrice: data.costPrice,
        stockQuantity: data.stockQuantity || 0,
        lowStockAlert: data.lowStockAlert || 10,
        trackStock: data.trackStock ?? true,
        weight: data.weight || 0,
        length: data.length || 0,
        width: data.width || 0,
        height: data.height || 0,
        categoryId: data.categoryId,
        brandId: data.brandId,
        thumbnail: data.thumbnail || "",
        imageUrls: data.imageUrls || [],
        isFeatured: data.isFeatured || false,
        isOnSale: data.isOnSale || false,
      },
    })

    revalidatePath("/dashboard/products")
    return {
      status: 200,
      message: "Product created successfully",
      data: product,
    }
  } catch (error: any) {
    console.error("Error creating product:", error)
    if (error.code === "P2002") {
      return {
        status: 400,
        message: "A product with this SKU or slug already exists",
        data: null,
      }
    }
    return {
      status: 500,
      message: "Failed to create product",
      data: null,
    }
  }
}

export async function deleteProduct(id: string) {
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
        cartItems: true,
      },
    })

    if (!product) {
      return {
        status: 404,
        message: "Product not found",
        data: null,
      }
    }

    if (product.orderItems.length > 0) {
      return {
        status: 400,
        message: "Product cannot be deleted as it has orders associated with it",
        data: null,
      }
    }

    await db.cartItem.deleteMany({
      where: { productId: id },
    })

    const deletedProduct = await db.product.delete({
      where: { id },
    })

    revalidatePath("/dashboard/products")
    return {
      status: 200,
      message: "Product deleted successfully",
      data: deletedProduct,
    }
  } catch (error) {
    console.error("Error deleting product:", error)
    return {
      status: 500,
      message: "Failed to delete product",
      data: null,
    }
  }
}

export async function getProductById(identifier: string) {
  try {
    // Try to find by slug first, then by ID
    let product = await db.product.findUnique({
      where: { slug: identifier },
      include: {
        category: {
          select: {
            id: true,
            title: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        productType: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        variants: {
          orderBy: {
            createdAt: "asc",
          },
        },
        attributes: {
          include: {
            attribute: true,
            value: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          where: {
            isApproved: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    // If not found by slug, try by ID
    if (!product) {
      product = await db.product.findUnique({
        where: { id: identifier },
        include: {
          category: {
            select: {
              id: true,
              title: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
          productType: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
            },
          },
          variants: {
            orderBy: {
              createdAt: "asc",
            },
          },
          attributes: {
            include: {
              attribute: true,
              value: true,
            },
          },
          reviews: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
            where: {
              isApproved: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      })

      // If found by ID but accessed by old slug, redirect to current slug
      if (product && product.slug && product.slug !== identifier) {
        redirect(`/dashboard/products/${product.slug}`)
      }
    }

    return product
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

export async function updateProductImages(productId: string, imageUrls: string[], thumbnail?: string) {
  try {
    // Validate inputs
    if (!productId || typeof productId !== "string") {
      throw new Error("Invalid product ID")
    }
    if (!Array.isArray(imageUrls)) {
      throw new Error("imageUrls must be an array")
    }

    const product = await db.product.update({
      where: { id: productId },
      data: {
        imageUrls: imageUrls,
        thumbnail: thumbnail || (imageUrls.length > 0 ? imageUrls[0] : null),
        updatedAt: new Date(),
      },
    })

    revalidatePath(`/dashboard/products/${productId}`)
    return { success: true, data: product }
  } catch (error) {
    console.error("Error updating product images:", error)
    return { success: false, error: "Failed to update images" }
  }
}

export async function updateProduct(productId: string, data: any) {
  try {
    // Validate inputs
    if (!productId || typeof productId !== "string") {
      return { success: false, error: "Invalid product ID" }
    }
    if (!data || typeof data !== "object") {
      return {
        success: false,
        error: "Invalid update data - must be an object",
      }
    }

    // Remove any invalid keys and ensure data is properly structured
    const validData = Object.keys(data).reduce((acc, key) => {
      // Updated valid fields to include productTypeId instead of type
      const validFields = [
        "name",
        "slug",
        "description",
        "shortDesc",
        "sku",
        "productTypeId", // Changed from "type"
        "status",
        "price",
        "comparePrice",
        "costPrice",
        "stockQuantity",
        "lowStockAlert",
        "trackStock",
        "weight",
        "length",
        "width",
        "height",
        "thumbnail",
        "imageUrls",
        "metaTitle",
        "metaDesc",
        "isFeatured",
        "isOnSale",
        "categoryId",
        "brandId",
      ]

      if (validFields.includes(key) && data[key] !== undefined) {
        acc[key] = data[key]
      }
      return acc
    }, {} as any)

    // Add updatedAt timestamp
    validData.updatedAt = new Date()

    console.log("Updating product with data:", validData)

    const product = await db.product.update({
      where: { id: productId },
      data: validData,
    })

    revalidatePath(`/dashboard/products/${product.slug}`)
    revalidatePath("/dashboard/products")

    return { success: true, data: product }
  } catch (error) {
    console.error("Error updating product:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update product",
    }
  }
}
