"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X } from "lucide-react"

interface Category {
  id: string
  title: string
  description?: string
}

interface ProductFiltersProps {
  categories: Category[]
  searchParams: {
    category?: string
    type?: string
    search?: string
    sort?: string
  }
  onFilterChange?: () => void
}

const PRODUCT_TYPES = [
  { value: "WINDOW", label: "Windows" },
  { value: "DOOR", label: "Doors" },
  { value: "PROFILE", label: "Profiles" },
  { value: "ACCESSORY", label: "Accessories" },
  { value: "GLASS", label: "Glass" },
  { value: "HARDWARE", label: "Hardware" },
]

export default function ProductFilters({ categories, searchParams, onFilterChange }: ProductFiltersProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.search || "")

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(urlSearchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    // Reset to first page when filtering
    params.delete("page")
    router.push(`/products?${params.toString()}`)
    onFilterChange?.()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter("search", searchTerm || null)
  }

  const clearSearch = () => {
    setSearchTerm("")
    updateFilter("search", null)
  }

  return (
    <div className="sticky top-4 space-y-4 lg:space-y-6">
      {/* Search */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 px-4 lg:px-6">
          <CardTitle className="text-base lg:text-lg">Search Products</CardTitle>
        </CardHeader>
        <CardContent className="px-4 lg:px-6">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 h-10 text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" className="w-full h-9" size="sm">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 px-4 lg:px-6">
          <CardTitle className="text-base lg:text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent className="px-4 lg:px-6 pb-4">
          <div className="space-y-3">
            {/* All Categories Option */}
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <Checkbox
                id="all-categories"
                checked={!searchParams.category}
                onCheckedChange={() => updateFilter("category", null)}
                className="h-4 w-4"
              />
              <Label htmlFor="all-categories" className="text-sm font-medium cursor-pointer">
                All Categories
              </Label>
            </div>

            {/* Scrollable Categories List */}
            <ScrollArea className="h-[200px] lg:h-[250px] pr-2">
              <div className="space-y-2">
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-2 py-1"
                  >
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={searchParams.category === category.id}
                      onCheckedChange={(checked) => updateFilter("category", checked ? category.id : null)}
                      className="h-4 w-4"
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="text-sm cursor-pointer hover:text-blue-600 transition-colors leading-relaxed flex-1"
                    >
                      {category.title}
                    </Label>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Product Types */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 px-4 lg:px-6">
          <CardTitle className="text-base lg:text-lg">Product Types</CardTitle>
        </CardHeader>
        <CardContent className="px-4 lg:px-6 pb-4">
          <div className="space-y-3">
            {/* All Types Option */}
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <Checkbox
                id="all-types"
                checked={!searchParams.type}
                onCheckedChange={() => updateFilter("type", null)}
                className="h-4 w-4"
              />
              <Label htmlFor="all-types" className="text-sm font-medium cursor-pointer">
                All Types
              </Label>
            </div>

            {/* Product Types List */}
            <div className="space-y-2">
              {PRODUCT_TYPES.map((type) => (
                <motion.div
                  key={type.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 py-1"
                >
                  <Checkbox
                    id={`type-${type.value}`}
                    checked={searchParams.type === type.value}
                    onCheckedChange={(checked) => updateFilter("type", checked ? type.value : null)}
                    className="h-4 w-4"
                  />
                  <Label
                    htmlFor={`type-${type.value}`}
                    className="text-sm cursor-pointer hover:text-blue-600 transition-colors leading-relaxed flex-1"
                  >
                    {type.label}
                  </Label>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters Summary */}
      {(searchParams.category || searchParams.type || searchParams.search) && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3 px-4 lg:px-6">
            <CardTitle className="text-base lg:text-lg">Active Filters</CardTitle>
          </CardHeader>
          <CardContent className="px-4 lg:px-6 pb-4">
            <div className="space-y-2">
              {searchParams.category && (
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="text-xs max-w-[180px] truncate">
                    {categories.find((c) => c.id === searchParams.category)?.title}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilter("category", null)}
                    className="h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {searchParams.type && (
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="text-xs max-w-[180px] truncate">
                    {PRODUCT_TYPES.find((t) => t.value === searchParams.type)?.label}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilter("type", null)}
                    className="h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {searchParams.search && (
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="text-xs max-w-[180px] truncate">
                    "{searchParams.search}"
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilter("search", null)}
                    className="h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
