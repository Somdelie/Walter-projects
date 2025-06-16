"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, ShoppingCart, ArrowLeft, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/formatPrice"
import { useWishlist } from "@/contexts/wishlist-context"
import { useCart } from "@/contexts/cart-context"

export default function WishlistPage() {
  const { items, itemCount, removeItem, clearWishlist, isLoading, isItemLoading } = useWishlist()
  const { addItem: addToCart, isItemInCart, isItemLoading: isCartLoading } = useCart()
  const [movingToCart, setMovingToCart] = useState<Set<string>>(new Set())
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const handleMoveToCart = async (productId: string) => {
    setMovingToCart((prev) => new Set(prev).add(productId))

    try {
      await addToCart(productId, 1)
      await removeItem(productId)
    } catch (error) {
      console.error("Failed to move item to cart:", error)
    } finally {
      setMovingToCart((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  const handleRemoveItem = async (productId: string) => {
    await removeItem(productId)
  }

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => new Set(prev).add(productId))
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h1>
            <p className="text-gray-600 mb-8">Save items you love for later</p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/products">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className=" px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-1">
                {itemCount} {itemCount === 1 ? "item" : "items"} saved for later
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/products">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {/* Wishlist Items */}
          <div className="lg:col-span-3 xl:col-span-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2">
              {items.map((item, index) => {
                const isItemBeingRemoved = isItemLoading(item.productId)
                const isMovingItem = movingToCart.has(item.productId)
                const isInCart = isItemInCart(item.productId)
                const isAddingToCart = isCartLoading(item.productId)
                const hasImageError = imageErrors.has(item.productId)
                const isOutOfStock = item.product.stockQuantity === 0

                const discountPercentage =
                  item.product.comparePrice && item.product.comparePrice > item.product.price
                    ? Math.round(((item.product.comparePrice - item.product.price) / item.product.comparePrice) * 100)
                    : 0

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="w-full h-full"
                  >
                    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border border-gray-100 h-full">
                      <CardContent className="p-0 h-full grid grid-cols-1">
                        {/* Header with Remove Button */}
                        <div className="p-4 pb-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs text-gray-600">
                              Saved Item
                            </Badge>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemoveItem(item.productId)}
                              disabled={isItemBeingRemoved}
                              className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                            >
                              {isItemBeingRemoved ? (
                                <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                              ) : (
                                <Heart className="h-4 w-4 fill-red-500 text-red-500 hover:text-red-600" />
                              )}
                            </motion.button>
                          </div>
                        </div>

                        {/* Product Name */}
                        <div className="px-4 pb-3">
                          <Link href={`/products/${item.product.slug}`}>
                            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 leading-tight hover:text-teal-600 transition-colors whitespace-nowrap truncate">
                              {item.product.name}
                            </h3>
                          </Link>
                        </div>

                        {/* Image Container */}
                        <div className="relative flex-1 mb-4 overflow-hidden rounded w-full h-48">
                          <Link href={`/products/${item.product.slug}`}>
                            <Image
                              src={
                                hasImageError
                                  ? "/placeholder.svg?height=200&width=300"
                                  : item.product.thumbnail || "/placeholder.svg?height=200&width=300"
                              }
                              alt={item.product.name}
                              fill
                              className="object-contain group-hover:scale-105 transition-transform duration-500"
                              onError={() => handleImageError(item.productId)}
                            />
                          </Link>

                          {/* Sale Badge */}
                          {item.product.isOnSale && discountPercentage > 0 && (
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
                              <span>Status:</span>
                              <span className={`font-medium ${isOutOfStock ? "text-red-500" : "text-green-600"}`}>
                                {isOutOfStock ? "Out of Stock" : `${item.product.stockQuantity} Available`}
                              </span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="flex items-baseline gap-2 pt-2">
                            <span className="text-xl font-bold text-gray-900">{formatPrice(item.product.price)}</span>
                            {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(item.product.comparePrice)}
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="space-y-2">
                            {isOutOfStock ? (
                              <Button disabled className="w-full">
                                Out of Stock
                              </Button>
                            ) : isInCart ? (
                              <Button variant="outline" className="w-full" asChild>
                                <Link href="/cart">
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  View in Cart
                                </Link>
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleMoveToCart(item.productId)}
                                disabled={isMovingItem || isAddingToCart}
                                className="w-full bg-teal-600 hover:bg-teal-700 font-medium"
                              >
                                {isMovingItem || isAddingToCart ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                )}
                                {isMovingItem ? "Moving..." : "Move to Cart"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Clear Wishlist Button */}
            <div className="mt-8 pt-4 border-t">
              <Button
                variant="outline"
                onClick={clearWishlist}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Wishlist
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Wishlist Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Total Items</span>
                    <span>{itemCount}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Available Items</span>
                    <span>{items.filter((item) => item.product.stockQuantity > 0).length}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-primary hover:bg-orange-700" asChild>
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                </div>

                {/* Info */}
                <div className="mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600 space-y-2">
                    <p className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      Items saved for later
                    </p>
                    <p className="text-xs">Items in your wishlist are not reserved and may go out of stock.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
