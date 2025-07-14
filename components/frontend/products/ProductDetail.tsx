"use client"

import { useState } from "react"
import { ArrowLeft, Heart, ShoppingCart, Check, Loader2, Star, Share2, Truck, Shield, RotateCcw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatPrice } from "@/lib/formatPrice"
import { useCartSafe } from "@/contexts/cart-context"
import { useWishlistSafe } from "@/contexts/wishlist-context"
import { toast } from "sonner"
import ImageGallery from "./ImageGallery"
import ReviewsSection from "./ReviewsSection"
import ProductCard from "./ProductCard"
import { ProductType } from "@prisma/client"

interface ProductWithDetails {
  id: string
  name: string
  slug: string
  description: string | null
  shortDesc: string | null
  sku: string
  type?: string | null
  price: number
  comparePrice: number | null
  stockQuantity: number
  weight: number
  length: number
  width: number
  height: number
  thumbnail: string | null
  imageUrls: string[]
  isFeatured: boolean
  isOnSale: boolean
  metaTitle: string | null
  metaDesc: string | null
  category: {
    id: string
    title: string
  } | null
  brand: {
    id: string
    name: string
  } | null
  attributes: Array<{
    id: string
    attribute: {
      id: string
      name: string
      type: string
    }
    value: {
      id: string
      value: string
    }
    customValue: string | null
  }>
  reviews: Array<{
    id: string
    rating: number
    title: string | null
    comment: string | null
    isVerified: boolean
    isApproved: boolean
    createdAt: Date
    user: {
      name: string | null
      image: string | null
    }
  }>
  variants: Array<{
    id: string
    name: string
    sku: string
    price: number
    stockQuantity: number
    image: string | null
  }>
}

interface ProductDetailProps {
  product: ProductWithDetails
  relatedProducts: any[]
}

// Helper function to calculate rating statistics
function calculateRatingStats(reviews: any[] = []) {
  const approvedReviews = reviews.filter((review) => review.isApproved)

  if (approvedReviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: [0, 0, 0, 0, 0],
    }
  }

  const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalRating / approvedReviews.length

  const distribution = [0, 0, 0, 0, 0]
  approvedReviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating - 1]++
    }
  })

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: approvedReviews.length,
    ratingDistribution: distribution,
  }
}

// Star Rating Component
function StarRating({
  rating,
  size = "sm",
  showRating = true,
}: { rating: number; size?: "sm" | "md" | "lg"; showRating?: boolean }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  return (
    <div className="flex items-center gap-1">
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
        <span className="text-sm text-gray-600 font-medium ml-1">{rating > 0 ? rating.toFixed(1) : "No reviews"}</span>
      )}
    </div>
  )
}

export default function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || null)
  const [quantity, setQuantity] = useState(1)

  const cart = useCartSafe()
  const wishlist = useWishlistSafe()

  const isWishlisted = wishlist ? wishlist.isItemInWishlist(product.id) : false
  const isWishlistLoading = wishlist ? wishlist.isItemLoading(product.id) : false
  const isInCart = cart ? cart.isItemInCart(product.id) : false
  const isItemLoading = cart ? cart.isItemLoading(product.id) : false

  const ratingStats = calculateRatingStats(product.reviews)
  const discountPercentage =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0

  const isOutOfStock = product.stockQuantity === 0
  const currentPrice = selectedVariant ? selectedVariant.price : product.price
  const currentStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity

  const handleAddToCart = async () => {
    if (isOutOfStock || isInCart || !cart) return
    await cart.addItem(product.id, quantity)
  }

  const handleToggleWishlist = async () => {
    if (!wishlist) return
    if (isWishlisted) {
      await wishlist.removeItem(product.id)
    } else {
      await wishlist.addItem(product.id)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDesc || product.description || "",
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
        toast.success("Link copied to clipboard!")
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link href="/products" className="hover:text-gray-900 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Products
        </Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/products?category=${product.category.id}`} className="hover:text-gray-900">
              {product.category.title}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <ImageGallery
            images={
              product.imageUrls.length > 0
                ? product.imageUrls
                : [product.thumbnail || "/placeholder.svg?height=600&width=600"]
            }
            productName={product.name}
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                {product.category && (
                  <Badge variant="outline" className="text-xs">
                    {product.category.title}
                  </Badge>
                )}
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              </div>
              <Button variant="ghost" size="sm" onClick={handleShare} className="flex-shrink-0">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <StarRating rating={ratingStats.averageRating} size="md" />
              {ratingStats.totalReviews > 0 && (
                <Link href="#reviews" className="text-sm text-blue-600 hover:underline">
                  ({ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? "s" : ""})
                </Link>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(currentPrice)}</span>
              {product.comparePrice && product.comparePrice > currentPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">{formatPrice(product.comparePrice)}</span>
                  <Badge className="bg-red-500 text-white">-{discountPercentage}%</Badge>
                </>
              )}
            </div>

            {/* Short Description */}
            {product.shortDesc && <p className="text-gray-600 text-lg leading-relaxed">{product.shortDesc}</p>}
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Variants</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <Button
                    key={variant.id}
                    variant={selectedVariant?.id === variant.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVariant(variant)}
                    className="text-sm"
                  >
                    {variant.name} - {formatPrice(variant.price)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock}
                >
                  +
                </Button>
              </div>
              <span className="text-sm text-gray-600">{currentStock} available</span>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={isItemLoading || isOutOfStock || isInCart}
                className={`flex-1 ${isInCart ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
              >
                {isItemLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
              <Button variant="outline" onClick={handleToggleWishlist} disabled={isWishlistLoading} className="px-4">
                {isWishlistLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                )}
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 py-6 border-t border-b">
            <div className="text-center">
              <Truck className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Free Delivery</p>
              <p className="text-xs text-gray-600">Orders over R500</p>
            </div>
            <div className="text-center">
              <Shield className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">Quality Guarantee</p>
              <p className="text-xs text-gray-600">Premium materials</p>
            </div>
            <div className="text-center">
              <RotateCcw className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <p className="text-sm font-medium">Easy Returns</p>
              <p className="text-xs text-gray-600">30-day policy</p>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Product Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">SKU:</span>
                <span className="font-medium">{product.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{product.type?.replace("_", " ")}</span>
              </div>
              {product.brand && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Brand:</span>
                  <span className="font-medium">{product.brand.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Weight:</span>
                <span className="font-medium">{product.weight}kg</span>
              </div>
              {product.length > 0 && (
                <div className="flex justify-between col-span-2">
                  <span className="text-gray-600">Dimensions:</span>
                  <span className="font-medium">
                    {product.length} × {product.width} × {product.height} mm
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="description" className="mb-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({ratingStats.totalReviews})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {product.description ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No detailed description available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Product Type:</span>
                      <span className="font-medium">{product.type?.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SKU:</span>
                      <span className="font-medium">{product.sku}</span>
                    </div>
                    {product.brand && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Brand:</span>
                        <span className="font-medium">{product.brand.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium">{product.weight} kg</span>
                    </div>
                  </div>
                </div>

                {product.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Dimensions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Length:</span>
                        <span className="font-medium">{product.length} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Width:</span>
                        <span className="font-medium">{product.width} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Height:</span>
                        <span className="font-medium">{product.height} mm</span>
                      </div>
                    </div>
                  </div>
                )}

                {product.attributes.length > 0 && (
                  <div className="space-y-4 md:col-span-2">
                    <h4 className="font-semibold text-gray-900">Additional Attributes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {product.attributes.map((attr) => (
                        <div key={attr.id} className="flex justify-between">
                          <span className="text-gray-600">{attr.attribute.name}:</span>
                          <span className="font-medium">{attr.customValue || attr.value.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <ReviewsSection product={product} ratingStats={ratingStats} />
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct, index) => (
              <ProductCard
                key={relatedProduct.id}
                product={{
                  ...relatedProduct,
                  category: relatedProduct.category
                    ? {
                        id: relatedProduct.category.id,
                        title: relatedProduct.category.title,
                      }
                    : null,
                }}
                viewMode="grid"
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
