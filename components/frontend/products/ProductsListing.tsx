"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ProductCard from "./ProductCard"
import ProductFilters from "./ProductFilters"
import ProductSort from "./ProductSort"
import { Grid, List, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { Product } from "@prisma/client"

interface ProductWithDetails extends Product {
  category: {
    id: string
    title: string
  } | null  // Allow null for products without categories
  brand?: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  title: string
  description?: string
}

interface ProductsListingProps {
  products: ProductWithDetails[]
  categories: Category[]
  searchParams: {
    category?: string
    type?: string
    search?: string
    sort?: string
    page?: string
  }
  totalProducts: number
}

export default function ProductsListing({ products, categories, searchParams, totalProducts }: ProductsListingProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeFilters = [
    searchParams.category && {
      key: "category",
      value: searchParams.category,
      label: categories.find((c) => c.id === searchParams.category)?.title || "Category",
    },
    searchParams.type && { key: "type", value: searchParams.type, label: searchParams.type.replace("_", " ") },
    searchParams.search && { key: "search", value: searchParams.search, label: `"${searchParams.search}"` },
  ].filter((filter): filter is { key: string; value: string; label: string } => Boolean(filter && typeof filter !== "string"))

  const clearFilter = (filterKey: string) => {
    const url = new URL(window.location.href)
    url.searchParams.delete(filterKey)
    window.history.pushState({}, "", url.toString())
    window.location.reload()
  }

  const clearAllFilters = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete("category")
    url.searchParams.delete("type")
    url.searchParams.delete("search")
    window.history.pushState({}, "", url.toString())
    window.location.reload()
  }

  if (!mounted) {
    return <div className="animate-pulse">Loading...</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Results Header */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            {searchParams.search ? `Search Results` : "All Products"}
          </h2>
          {searchParams.search && (
            <p className="text-sm text-gray-600 break-words">
              for "{searchParams.search}"
            </p>
          )}
          <p className="text-sm sm:text-base text-gray-600">
            Showing {products.length} of {totalProducts} products
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="px-2 sm:px-3"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="px-2 sm:px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Filter Sheet */}
          <div className="lg:hidden">
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 sm:w-96">
                <SheetHeader>
                  <SheetTitle>Filter Products</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <ProductFilters
                    categories={categories}
                    searchParams={searchParams}
                    onFilterChange={() => setShowFilters(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Sort - Make responsive */}
          <div className="min-w-0 flex-shrink">
            <ProductSort currentSort={searchParams.sort} />
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <span className="text-sm font-medium text-gray-700">Active filters:</span>
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <Badge
                key={filter?.key}
                variant="secondary"
                className="flex items-center gap-1 cursor-pointer hover:bg-gray-200 text-xs sm:text-sm max-w-[200px]"
                onClick={() => clearFilter(filter?.key)}
              >
                <span className="truncate">{filter?.label}</span>
                <X className="h-3 w-3 flex-shrink-0" />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-auto py-1">
              Clear all
            </Button>
          </div>
        </motion.div>
      )}

      <div className="flex gap-4 lg:gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <ProductFilters
            categories={categories}
            searchParams={searchParams}
            onFilterChange={() => setShowFilters(false)}
          />
        </div>

        {/* Products Grid/List */}
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 sm:py-16">
              <div className="max-w-md mx-auto px-4">
                <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Filter className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <Button onClick={clearAllFilters} variant="outline" size="sm">
                  Clear all filters
                </Button>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr"
                    : "space-y-4"
                }
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className={viewMode === "grid" ? "h-full" : ""}
                  >
                    <ProductCard product={product} viewMode={viewMode} index={index} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}