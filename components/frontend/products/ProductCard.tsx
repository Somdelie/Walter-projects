"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Check, Loader2 } from "lucide-react" // Added Loader2
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from "@/lib/formatPrice"
import type { Product } from "@prisma/client"
import { useCartSafe } from "@/contexts/cart-context"
import { toast } from "sonner"

interface ProductWithDetails extends Product {
  category: {
    id: string
    title: string
  } | null
  brand?: {
    id: string
    name: string
  }
}

interface ProductCardProps {
  product: ProductWithDetails
  viewMode: "grid" | "list"
  index: number
}

export default function ProductCard({ product, viewMode, index }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageError, setImageError] = useState(false)
  const cart = useCartSafe()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock || isInCart) return

    if (!cart) {
      toast.error("Cart not available. Please refresh the page.")
      return
    }

    await cart.addItem(product.id, 1)
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsWishlisted(!isWishlisted)
    // TODO: Implement wishlist API calls
  }

  const discountPercentage =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0

  const isOutOfStock = product.stockQuantity === 0
  const isInCart = cart ? cart.isItemInCart(product.id) : false
  const isItemLoading = cart ? cart.isItemLoading(product.id) : false

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -2 }}
        className="w-full"
      >
        <Link href={`/products/${product.slug}`}>
          <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border border-gray-100">
            <CardContent className="p-0">
              <div className="flex">
                {/* Image Section */}
                <div className="relative w-64 h-48 flex-shrink-0 overflow-hidden bg-gray-50">
                  <Image
                    src={
                      imageError
                        ? "/placeholder.svg?height=192&width=256"
                        : product.thumbnail || "/placeholder.svg?height=192&width=256"
                    }
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={() => setImageError(true)}
                  />

                  {/* Wishlist Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleToggleWishlist}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all duration-200"
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
                      }`}
                    />
                  </motion.button>

                  {/* Discount Badge */}
                  {discountPercentage > 0 && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-red-500 text-white border-0">-{discountPercentage}%</Badge>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Category */}
                    <Badge variant="outline" className="text-xs text-gray-600 w-fit">
                      {product?.category?.title}
                    </Badge>

                    {/* Product Name */}
                    <h3 className="font-semibold text-xl text-gray-900 line-clamp-2">{product.name}</h3>

                    {/* Key Features */}
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">{product.type.replace("_", " ")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SKU:</span>
                        <span className="font-medium">{product.sku}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stock:</span>
                        <span className={`font-medium ${isOutOfStock ? "text-red-500" : "text-green-600"}`}>
                          {isOutOfStock ? "Out of Stock" : `${product.stockQuantity} Available`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-lg text-gray-500 line-through">{formatPrice(product.comparePrice)}</span>
                      )}
                    </div>

                    <Button
                      onClick={handleAddToCart}
                      disabled={isItemLoading || isOutOfStock || isInCart}
                      className={`w-full font-medium ${
                        isInCart 
                          ? "bg-green-500 hover:bg-green-600 text-white" 
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      {isItemLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isInCart ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          In Cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    )
  }

  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="w-full h-full"
    >
      <Link href={`/products/${product.slug}`}>
        <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border border-gray-100 h-full">
          <CardContent className="p-0 h-full grid grid-cols-1">
            {/* Header with Category */}
            <div className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs text-gray-600">
                  {product?.category?.title}
                </Badge>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleWishlist}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Heart
                    className={`h-4 w-4 transition-colors ${
                      isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"
                    }`}
                  />
                </motion.button>
              </div>
            </div>

            {/* Product Name */}
            <div className="px-4 pb-3">
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 leading-tight truncate">
                {product.name}
              </h3>
            </div>

            {/* Image Container */}
            <div className="relative flex-1 mb-4 overflow-hidden rounded w-full h-48">
              <Image
                src={
                  imageError
                    ? "/placeholder.svg?height=200&width=300"
                    : product.thumbnail || "/placeholder.svg?height=200&width=300"
                }
                alt={product.name}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-500"
                onError={() => setImageError(true)}
              />

              {/* Discount Badge */}
              {discountPercentage > 0 && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-red-500 text-white border-0 text-xs">-{discountPercentage}%</Badge>
                </div>
              )}

              {/* Out of Stock Overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge className="bg-white text-gray-900 border-0">Out of Stock</Badge>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="px-4 pb-4 space-y-3">
              {/* Key Specs */}
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium">{product.type.replace("_", " ")}</span>
                </div>
                {product.brand && (
                  <div className="flex justify-between">
                    <span>Brand:</span>
                    <span className="font-medium">{product.brand.name}</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-sm text-gray-500 line-through">{formatPrice(product.comparePrice)}</span>
                )}
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={isItemLoading || isOutOfStock || isInCart}
                className={`w-full font-medium ${
                  isInCart 
                    ? "bg-green-500 hover:bg-green-600 text-white" 
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {isItemLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isInCart ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    In Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}