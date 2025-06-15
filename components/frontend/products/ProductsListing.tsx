"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ProductCard from "./ProductCard"
import ProductFilters from "./ProductFilters"
import ProductSort from "./ProductSort"
import { Grid, List, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {searchParams.search ? `Search Results for "${searchParams.search}"` : "All Products"}
          </h2>
          <p className="text-gray-600">
            Showing {products.length} of {totalProducts} products
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="px-3"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Filter Toggle */}
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>

          {/* Sort */}
          <ProductSort currentSort={searchParams.sort} />
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-2"
        >
          <span className="text-sm font-medium text-gray-700">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter?.key}
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-200"
              onClick={() => clearFilter(filter?.key)}
            >
              {filter?.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
            Clear all
          </Button>
        </motion.div>
      )}

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-64 flex-shrink-0`}>
          <ProductFilters
            categories={categories}
            searchParams={searchParams}
            onFilterChange={() => setShowFilters(false)}
          />
        </div>

        {/* Products Grid/List */}
        <div className="flex-1">
          {products.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Filter className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <Button onClick={clearAllFilters} variant="outline">
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
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr"
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
