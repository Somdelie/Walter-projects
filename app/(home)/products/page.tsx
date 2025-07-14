import { Suspense } from "react"
import { getAllProducts } from "@/actions/product"
import type { Metadata } from "next"
import { getCategories } from "@/actions/categories"
import ProductsLoading from "@/components/frontend/products/ProductsLoading"
import ProductsListing from "@/components/frontend/products/ProductsListing"
import { getProductTypes } from "@/actions/productTypes"

export const metadata: Metadata = {
  title: "Premium Aluminum Products | Windows, Doors & More",
  description:
    "Discover our extensive range of high-quality aluminum windows, doors, profiles, and accessories. Perfect for residential and commercial projects.",
  keywords: "aluminum windows, aluminum doors, profiles, hardware, glass, accessories",
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    type?: string
    search?: string
    sort?: string
    page?: string
  }>
}) {
  const { category, type, search, sort, page } = await searchParams

  const productTypesData = await getProductTypes()
  const productTypes = productTypesData.data || []

  // Fetch data server-side
  const [productsResult, categoriesResult] = await Promise.all([getAllProducts(), getCategories()])

  const categories = (categoriesResult.data || []).map((category) => ({
    ...category,
    description: category.description ?? undefined,
  }))

  // Map products with proper category structure
  const products = (productsResult.data || []).map((product) => {
    const productCategory = categories.find((cat) => cat.id === product.categoryId)
    return {
      ...product,
      category: productCategory
        ? {
            id: productCategory.id,
            title: productCategory.title,
          }
        : null,
    }
  })

  // Helper function to get all subcategory IDs for a given category
  const getSubcategoryIds = (categoryId: string): string[] => {
    const subcategories = categories.filter((cat) => cat.parentId === categoryId)
    let allIds = [categoryId] // Include the parent category itself
    for (const subcategory of subcategories) {
      allIds = [...allIds, ...getSubcategoryIds(subcategory.id)]
    }
    return allIds
  }

  // Filter products based on search params
  let filteredProducts = products.filter((product) => product.status === "ACTIVE")

  if (category) {
    // Get all category IDs (parent + all subcategories)
    const categoryIds = getSubcategoryIds(category)
    filteredProducts = filteredProducts.filter((product) => categoryIds.includes(product.categoryId))
  }

  if (type) {
    // Updated to use productTypeId instead of type
    filteredProducts = filteredProducts.filter((product) => product.productTypeId === type)
  }

  if (search) {
    const searchTerm = search.toLowerCase().trim()
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.shortDesc?.toLowerCase().includes(searchTerm),
    )
  }

  // Sort products
  const sortBy = sort || "name-asc"
  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "featured":
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
      default:
        return a.name.localeCompare(b.name)
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<ProductsLoading />}>
          <ProductsListing
            productTypes={productTypes}
            products={filteredProducts}
            categories={categories}
            searchParams={{
              category,
              type,
              search,
              sort,
              page,
            }}
            totalProducts={products.length}
          />
        </Suspense>
      </div>
    </div>
  )
}
