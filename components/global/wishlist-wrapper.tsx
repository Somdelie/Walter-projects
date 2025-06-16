"use client"

import type React from "react"
import { Badge } from "@/components/ui/badge"
import { useWishlistSafe } from "@/contexts/wishlist-context"

interface WishlistWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function WishlistWrapper({ children, fallback = null }: WishlistWrapperProps) {
  const wishlist = useWishlistSafe()

  if (!wishlist) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface WishlistBadgeProps {
  className?: string
}

export function WishlistBadge({ className }: WishlistBadgeProps) {
  const wishlist = useWishlistSafe()

  if (!wishlist || wishlist.itemCount === 0) {
    return null
  }

  return (
    <Badge
      className={`absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-600 ${className}`}
    >
      {wishlist.itemCount}
    </Badge>
  )
}
