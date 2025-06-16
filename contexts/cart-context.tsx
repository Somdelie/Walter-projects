"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { toast } from "sonner"
import { addToCart, getCartItems, removeFromCart, updateCartItemQuantity } from "@/actions/cart-actions"
import { AuthenticatedUser } from "@/config/useAuth"

export interface CartItem {
  id: string
  productId: string
  variantId?: string | null // Changed to accept null
  quantity: number
  product: {
    id: string
    name: string
    price: number
    thumbnail?: string
    slug: string
  }
  variant?: {
    id: string
    name: string
    price: number
  } | null // Changed to accept null
}

interface CartState {
  items: CartItem[]
  isLoading: boolean
  total: number
  itemCount: number
  isAuthenticated: boolean
  loadingItems: Set<string> // Track which items are being added
}

type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ITEMS"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_CART" }
  | { type: "SET_AUTHENTICATED"; payload: boolean }
  | { type: "SET_ITEM_LOADING"; payload: { productId: string; variantId?: string | null; loading: boolean } }

const initialState: CartState = {
  items: [],
  isLoading: false,
  total: 0,
  itemCount: 0,
  isAuthenticated: false,
  loadingItems: new Set(),
}

function calculateTotals(items: CartItem[]) {
  const total = items.reduce((sum, item) => {
    const price = item.variant?.price || item.product.price
    return sum + price * item.quantity
  }, 0)

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return { total, itemCount }
}

function getItemKey(productId: string, variantId?: string | null) {
  return `${productId}-${variantId || 'no-variant'}`
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    case "SET_AUTHENTICATED":
      return { ...state, isAuthenticated: action.payload }

    case "SET_ITEM_LOADING": {
      const itemKey = getItemKey(action.payload.productId, action.payload.variantId)
      const newLoadingItems = new Set(state.loadingItems)
      
      if (action.payload.loading) {
        newLoadingItems.add(itemKey)
      } else {
        newLoadingItems.delete(itemKey)
      }
      
      return { ...state, loadingItems: newLoadingItems }
    }

    case "SET_ITEMS": {
      const { total, itemCount } = calculateTotals(action.payload)
      return {
        ...state,
        items: action.payload,
        total,
        itemCount,
      }
    }

    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId && 
                  (item.variantId || null) === (action.payload.variantId || null)
      )

      let newItems: CartItem[]
      if (existingItemIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + action.payload.quantity } : item,
        )
      } else {
        newItems = [...state.items, action.payload]
      }

      const { total, itemCount } = calculateTotals(newItems)
      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      }
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items
        .map((item) => (item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item))
        .filter((item) => item.quantity > 0)

      const { total, itemCount } = calculateTotals(newItems)
      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload)
      const { total, itemCount } = calculateTotals(newItems)
      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      }
    }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
      }

    default:
      return state
  }
}

interface CartContextType extends CartState {
  addItem: (productId: string, quantity?: number, variantId?: string | null) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  removeItem: (id: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  isItemInCart: (productId: string, variantId?: string | null) => boolean
  isItemLoading: (productId: string, variantId?: string | null) => boolean
}

const CartContext = createContext<CartContextType | null>(null)

interface CartProviderProps {
  children: React.ReactNode
  user: AuthenticatedUser | null
}

export function CartProvider({ children, user }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, {
    ...initialState,
    isAuthenticated: !!user?.id,
  })

  // Load cart on mount and when authentication changes
  useEffect(() => {
    dispatch({ type: "SET_AUTHENTICATED", payload: !!user?.id })
    if (user?.id) {
      refreshCart()
    } else {
      // Clear cart if user is not authenticated
      dispatch({ type: "CLEAR_CART" })
    }
  }, [user?.id])

  const refreshCart = async () => {
    if (!user?.id) {
      dispatch({ type: "CLEAR_CART" })
      return
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      const result = await getCartItems()

      if (result.success) {
        // Transform the data to match our CartItem interface
        const transformedItems = (result.data || []).map(item => ({
          ...item,
          variantId: item.variantId || undefined, // Convert null to undefined
          variant: item.variant || undefined, // Convert null to undefined
          product: {
            ...item.product,
            thumbnail: item.product.thumbnail || undefined, // Convert null to undefined
          },
        }))
        dispatch({ type: "SET_ITEMS", payload: transformedItems })
      } else {
        console.error("Failed to load cart:", result.error)
      }
    } catch (error) {
      console.error("Failed to load cart:", error)
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const isItemInCart = (productId: string, variantId?: string | null): boolean => {
    return state.items.some(item => 
      item.productId === productId && 
      (item.variantId || null) === (variantId || null)
    )
  }

  const isItemLoading = (productId: string, variantId?: string | null): boolean => {
    const itemKey = getItemKey(productId, variantId)
    return state.loadingItems.has(itemKey)
  }

  const addItem = async (productId: string, quantity = 1, variantId?: string | null) => {
    if (!user?.id) {
      toast.error("Please sign in to add items to cart")
      return
    }

    try {
      dispatch({ type: "SET_ITEM_LOADING", payload: { productId, variantId, loading: true } })

      const result = await addToCart(productId, quantity, variantId || undefined)

      if (result.success && result.data) {
        // Transform the data to match our CartItem interface
        const transformedItem = {
          ...result.data,
          variantId: result.data.variantId || undefined,
          variant: result.data.variant || undefined,
          product: {
            ...result.data.product,
            thumbnail: result.data.product.thumbnail || undefined, // Convert null to undefined
          },
        }
        dispatch({ type: "ADD_ITEM", payload: transformedItem })
        toast.success("Added to cart!", {
          description: `${result.data.product.name} has been added to your cart.`,
        })
      } else {
        toast.error(result.error || "Failed to add to cart")
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error)
      toast.error("Failed to add to cart")
    } finally {
      dispatch({ type: "SET_ITEM_LOADING", payload: { productId, variantId, loading: false } })
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    if (!user?.id) {
      toast.error("Please sign in to update cart")
      return
    }

    try {
      const result = await updateCartItemQuantity(id, quantity)

      if (result.success) {
        dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
      } else {
        toast.error(result.error || "Failed to update quantity")
      }
    } catch (error) {
      console.error("Failed to update quantity:", error)
      toast.error("Failed to update quantity")
    }
  }

  const removeItem = async (id: string) => {
    if (!user?.id) {
      toast.error("Please sign in to remove items")
      return
    }

    try {
      const result = await removeFromCart(id)

      if (result.success) {
        dispatch({ type: "REMOVE_ITEM", payload: id })
        toast.success("Item removed from cart")
      } else {
        toast.error(result.error || "Failed to remove item")
      }
    } catch (error) {
      console.error("Failed to remove item:", error)
      toast.error("Failed to remove item")
    }
  }

  const clearCart = async () => {
    if (!user?.id) {
      toast.error("Please sign in to clear cart")
      return
    }

    try {
      // Note: This is calling the server action, not itself recursively
      const { clearCart: clearCartAction } = await import("@/actions/cart-actions")
      const result = await clearCartAction()

      if (result.success) {
        dispatch({ type: "CLEAR_CART" })
        toast.success("Cart cleared")
      } else {
        toast.error(result.error || "Failed to clear cart")
      }
    } catch (error) {
      console.error("Failed to clear cart:", error)
      toast.error("Failed to clear cart")
    }
  }

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
        isItemInCart,
        isItemLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

// Safe hook that returns null if not in provider (for optional usage)
export function useCartSafe() {
  const context = useContext(CartContext)
  return context
}