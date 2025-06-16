"use client"

import type React from "react"


import { Badge } from "@/components/ui/badge"
import { useCartSafe } from "@/contexts/cart-context"

interface CartWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function CartWrapper({ children, fallback = null }: CartWrapperProps) {
  const cart = useCartSafe()

  if (!cart) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface CartBadgeProps {
  className?: string
}

export function CartBadge({ className }: CartBadgeProps) {
  const cart = useCartSafe()

  if (!cart || cart.itemCount === 0) {
    return null
  }

  return (
    <Badge
      className={`absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-blue-600 ${className}`}
    >
      {cart.itemCount}
    </Badge>
  )
}
