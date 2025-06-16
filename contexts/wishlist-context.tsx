"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { toast } from "sonner"
import { addToWishlist, getWishlistItems, removeFromWishlist, clearWishlist } from "@/actions/wishlist-actions"
import type { AuthenticatedUser } from "@/config/useAuth"

export interface WishlistItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    price: number
    thumbnail?: string
    slug: string
    comparePrice?: number | null
    isOnSale?: boolean
    stockQuantity: number
    status: string
  }
  createdAt: Date
}

interface WishlistState {
  items: WishlistItem[]
  isLoading: boolean
  itemCount: number
  isAuthenticated: boolean
  loadingItems: Set<string> // Track which items are being added/removed
}

type WishlistAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ITEMS"; payload: WishlistItem[] }
  | { type: "ADD_ITEM"; payload: WishlistItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_WISHLIST" }
  | { type: "SET_AUTHENTICATED"; payload: boolean }
  | { type: "SET_ITEM_LOADING"; payload: { productId: string; loading: boolean } }

const initialState: WishlistState = {
  items: [],
  isLoading: false,
  itemCount: 0,
  isAuthenticated: false,
  loadingItems: new Set(),
}

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    case "SET_AUTHENTICATED":
      return { ...state, isAuthenticated: action.payload }

    case "SET_ITEM_LOADING": {
      const newLoadingItems = new Set(state.loadingItems)

      if (action.payload.loading) {
        newLoadingItems.add(action.payload.productId)
      } else {
        newLoadingItems.delete(action.payload.productId)
      }

      return { ...state, loadingItems: newLoadingItems }
    }

    case "SET_ITEMS": {
      return {
        ...state,
        items: action.payload,
        itemCount: action.payload.length,
      }
    }

    case "ADD_ITEM": {
      const newItems = [...state.items, action.payload]
      return {
        ...state,
        items: newItems,
        itemCount: newItems.length,
      }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.productId !== action.payload)
      return {
        ...state,
        items: newItems,
        itemCount: newItems.length,
      }
    }

    case "CLEAR_WISHLIST":
      return {
        ...state,
        items: [],
        itemCount: 0,
      }

    default:
      return state
  }
}

interface WishlistContextType extends WishlistState {
  addItem: (productId: string) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  clearWishlist: () => Promise<void>
  refreshWishlist: () => Promise<void>
  isItemInWishlist: (productId: string) => boolean
  isItemLoading: (productId: string) => boolean
}

const WishlistContext = createContext<WishlistContextType | null>(null)

interface WishlistProviderProps {
  children: React.ReactNode
  user: AuthenticatedUser | null
}

export function WishlistProvider({ children, user }: WishlistProviderProps) {
  const [state, dispatch] = useReducer(wishlistReducer, {
    ...initialState,
    isAuthenticated: !!user?.id,
  })

  // Load wishlist on mount and when authentication changes
  useEffect(() => {
    dispatch({ type: "SET_AUTHENTICATED", payload: !!user?.id })
    if (user?.id) {
      refreshWishlist()
    } else {
      // Clear wishlist if user is not authenticated
      dispatch({ type: "CLEAR_WISHLIST" })
    }
  }, [user?.id])

  const refreshWishlist = async () => {
    if (!user?.id) {
      dispatch({ type: "CLEAR_WISHLIST" })
      return
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      const result = await getWishlistItems()

      if (result.success) {
        // Transform the data to match our WishlistItem interface
        const transformedItems = (result.data || []).map((item) => ({
          ...item,
          product: {
            ...item.product,
            thumbnail: item.product.thumbnail || undefined,
          },
        }))
        dispatch({ type: "SET_ITEMS", payload: transformedItems })
      } else {
        console.error("Failed to load wishlist:", result.error)
      }
    } catch (error) {
      console.error("Failed to load wishlist:", error)
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const isItemInWishlist = (productId: string): boolean => {
    return state.items.some((item) => item.productId === productId)
  }

  const isItemLoading = (productId: string): boolean => {
    return state.loadingItems.has(productId)
  }

  const addItem = async (productId: string) => {
    if (!user?.id) {
      toast.error("Please sign in to add items to wishlist")
      return
    }

    if (isItemInWishlist(productId)) {
      toast.error("Item is already in your wishlist")
      return
    }

    try {
      dispatch({ type: "SET_ITEM_LOADING", payload: { productId, loading: true } })

      const result = await addToWishlist(productId)

      if (result.success && result.data) {
        // Transform the data to match our WishlistItem interface
        const transformedItem = {
          ...result.data,
          product: {
            ...result.data.product,
            thumbnail: result.data.product.thumbnail || undefined,
          },
        }
        dispatch({ type: "ADD_ITEM", payload: transformedItem })
        toast.success("Added to wishlist!", {
          description: `${result.data.product.name} has been added to your wishlist.`,
        })
      } else {
        toast.error(result.error || "Failed to add to wishlist")
      }
    } catch (error) {
      console.error("Failed to add item to wishlist:", error)
      toast.error("Failed to add to wishlist")
    } finally {
      dispatch({ type: "SET_ITEM_LOADING", payload: { productId, loading: false } })
    }
  }

  const removeItem = async (productId: string) => {
    if (!user?.id) {
      toast.error("Please sign in to remove items")
      return
    }

    try {
      dispatch({ type: "SET_ITEM_LOADING", payload: { productId, loading: true } })

      const result = await removeFromWishlist(productId)

      if (result.success) {
        dispatch({ type: "REMOVE_ITEM", payload: productId })
        toast.success("Item removed from wishlist")
      } else {
        toast.error(result.error || "Failed to remove item")
      }
    } catch (error) {
      console.error("Failed to remove item:", error)
      toast.error("Failed to remove item")
    } finally {
      dispatch({ type: "SET_ITEM_LOADING", payload: { productId, loading: false } })
    }
  }

  const clearWishlistAction = async () => {
    if (!user?.id) {
      toast.error("Please sign in to clear wishlist")
      return
    }

    try {
      const result = await clearWishlist()

      if (result.success) {
        dispatch({ type: "CLEAR_WISHLIST" })
        toast.success("Wishlist cleared")
      } else {
        toast.error(result.error || "Failed to clear wishlist")
      }
    } catch (error) {
      console.error("Failed to clear wishlist:", error)
      toast.error("Failed to clear wishlist")
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        clearWishlist: clearWishlistAction,
        refreshWishlist,
        isItemInWishlist,
        isItemLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}

// Safe hook that returns null if not in provider (for optional usage)
export function useWishlistSafe() {
  const context = useContext(WishlistContext)
  return context
}
