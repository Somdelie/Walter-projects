"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Check, Loader2, Star } from "lucide-react" // Added Loader2
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from "@/lib/formatPrice"
import type { Product } from "@prisma/client"
import { useCartSafe } from "@/contexts/cart-context"
import { toast } from "sonner"
import { useWishlistSafe } from "@/contexts/wishlist-context"

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

interface ReviewData {
  id: string
  rating: number
  isApproved: boolean
}

interface ProductWithReviews extends ProductWithDetails {
  reviews?: ReviewData[]
}

interface ProductCardProps {
  product: ProductWithReviews
  viewMode: "grid" | "list"
  index: number
}

// Helper function to calculate rating statistics
function calculateRatingStats(reviews: ReviewData[] = []) {
  const approvedReviews = reviews.filter((review) => review.isApproved)

  if (approvedReviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: [0, 0, 0, 0, 0], // [1-star, 2-star, 3-star, 4-star, 5-star]
    }
  }

  const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalRating / approvedReviews.length

  // Calculate rating distribution
  const distribution = [0, 0, 0, 0, 0]
  approvedReviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating - 1]++
    }
  })

  return {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalReviews: approvedReviews.length,
    ratingDistribution: distribution,
  }
}

// Star Rating Component
function StarRating({
  rating,
  size = "sm",
  showRating = true,
  className = "",
}: {
  rating: number
  size?: "xs" | "sm" | "md" | "lg"
  showRating?: boolean
  className?: string
}) {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : star <= rating
                  ? "fill-yellow-200 text-yellow-400"
                  : "fill-gray-200 text-gray-300"
            }`}
          />
        ))}
      </div>
      {showRating && (
        <span className={`${textSizeClasses[size]} text-gray-600 font-medium ml-1`}>
          {rating > 0 ? rating.toFixed(1) : "No reviews"}
        </span>
      )}
    </div>
  )
}

export default function ProductCard({ product, viewMode, index }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const cart = useCartSafe()
  const wishlist = useWishlistSafe()

  // Remove the local isWishlisted state since we'll get it from context
  const isWishlisted = wishlist ? wishlist.isItemInWishlist(product.id) : false
  const isWishlistLoading = wishlist ? wishlist.isItemLoading(product.id) : false

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

    if (!wishlist) {
      toast.error("Wishlist not available. Please refresh the page.")
      return
    }

    if (isWishlisted) {
      await wishlist.removeItem(product.id)
    } else {
      await wishlist.addItem(product.id)
    }
  }

  const discountPercentage =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0

  const isOutOfStock = product.stockQuantity === 0
  const isInCart = cart ? cart.isItemInCart(product.id) : false
  const isItemLoading = cart ? cart.isItemLoading(product.id) : false

  const ratingStats = calculateRatingStats(product.reviews)

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
                    disabled={isWishlistLoading}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all duration-200"
                  >
                    {isWishlistLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                    ) : (
                      <Heart
                        className={`h-4 w-4 transition-colors ${
                          isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
                        }`}
                      />
                    )}
                  </motion.button>

                  {/* Discount Badge */}
                  {discountPercentage > 0 && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-red-500 text-white border-0">-{discountPercentage}%</Badge>
                    </div>
                  )}
                </div>

          
          
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Category */}
                    <Badge variant="outline" className="text-xs text-gray-600 w-fit">
                      {product?.category?.title}
                    </Badge>

                    {/* Product Name */}
                    <h3 className="font-semibold text-xl text-gray-900 line-clamp-2">{product.name}</h3>

                    {/* Rating */}
                    <div className="flex items-center justify-between">
                      <StarRating rating={ratingStats.averageRating} size="sm" />
                      {ratingStats.totalReviews > 0 && (
                        <span className="text-sm text-gray-500">
                          ({ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? "s" : ""})
                        </span>
                      )}
                    </div>

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
            <div className="p-4 pb-2 relative">
              <div className="absolute top-5 right-0">
              
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggleWishlist}
                  disabled={isWishlistLoading}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {isWishlistLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : (
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"
                      }`}
                    />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Product Name */}
            <div className="px-4 pb-3">
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 leading-tight truncate">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center justify-between mt-2">
                <StarRating rating={ratingStats.averageRating} size="xs" showRating={false} />
                <span className="text-xs text-gray-500">
                  {ratingStats.totalReviews > 0
                    ? `${ratingStats.averageRating} (${ratingStats.totalReviews})`
                    : "No reviews"}
                </span>
              </div>
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
                  isInCart ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
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
