import { Suspense } from "react"
import { getAllProducts } from "@/actions/product"
import type { Metadata } from "next"
import { getCategories } from "@/actions/categories"
import ProductsLoading from "@/components/frontend/products/ProductsLoading"
import ProductsListing from "@/components/frontend/products/ProductsListing"

export const metadata: Metadata = {
  title: "Premium Aluminum Products | Windows, Doors & More",
  description:
    "Discover our extensive range of high-quality aluminum windows, doors, profiles, and accessories. Perfect for residential and commercial projects.",
  keywords: "aluminum windows, aluminum doors, profiles, hardware, glass, accessories",
}

export default async function ProductsPage({
  searchParams
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
      category: productCategory ? {
        id: productCategory.id,
        title: productCategory.title
      } : null,
    }
  })

  // Filter products based on search params
  let filteredProducts = products.filter((product) => product.status === "ACTIVE")

  if (category) {
    filteredProducts = filteredProducts.filter((product) => product.categoryId === category)
  }

  if (type) {
    filteredProducts = filteredProducts.filter((product) => product.type === type)
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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Premium Aluminum Products</h1>
            <p className="text-xl text-slate-200 mb-8">
              Discover our extensive range of high-quality aluminum windows, doors, profiles, and accessories. Perfect
              for residential and commercial projects.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Expert Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<ProductsLoading />}>
          <ProductsListing
            products={filteredProducts}
            categories={categories}
            searchParams={{
              category,
              type,
              search,
              sort,
              page
            }}
            totalProducts={products.length}
          />
        </Suspense>
      </div>
    </div>
  )
}