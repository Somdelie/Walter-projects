"use server";

import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

export async function getCartItems() {
  try {
    const user = await getAuthenticatedUser();

    const cartItems = await db.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            thumbnail: true,
            slug: true,
          },
        },
        variant: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: cartItems };
  } catch (error) {
    console.error("Get cart items error:", error);
    return { success: false, error: "Failed to load cart items" };
  }
}

export async function addToCart(
  productId: string,
  quantity = 1,
  variantId?: string
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    if (!productId) {
      throw new Error("Product ID is required");
    }

    // Check if product exists and get stock info
    const product = await db.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        thumbnail: true,
        slug: true,
        stockQuantity: true,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Check stock
    if (product.stockQuantity < quantity) {
      throw new Error("Insufficient stock");
    }

    // Check if item already exists in cart
    // Handle the case where variantId might be undefined/null
    const whereClause = variantId
      ? {
          userId_productId_variantId: {
            userId: user.id,
            productId,
            variantId,
          },
        }
      : {
          AND: [{ userId: user.id }, { productId }, { variantId: null }],
        };

    const existingItem = await db.cartItem.findFirst({
      where: whereClause,
    });

    let cartItem;
    if (existingItem) {
      // Update quantity
      cartItem = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              thumbnail: true,
              slug: true,
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });
    } else {
      // Create new cart item
      cartItem = await db.cartItem.create({
        data: {
          userId: user.id,
          productId,
          variantId: variantId || null,
          quantity,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              thumbnail: true,
              slug: true,
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });
    }

    revalidatePath("/cart");
    return { success: true, data: cartItem };
  } catch (error) {
    console.error("Add to cart error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to add item to cart",
    };
  }
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    if (!itemId || quantity < 0) {
      throw new Error("Invalid data");
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      await db.cartItem.delete({
        where: {
          id: itemId,
          userId: user.id,
        },
      });
    } else {
      // Update quantity
      await db.cartItem.update({
        where: {
          id: itemId,
          userId: user.id,
        },
        data: { quantity },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Update cart item error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update item quantity",
    };
  }
}

export async function removeFromCart(itemId: string) {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    if (!itemId) {
      throw new Error("Item ID is required");
    }

    await db.cartItem.delete({
      where: {
        id: itemId,
        userId: user.id,
      },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Remove from cart error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to remove item from cart",
    };
  }
}

export async function clearCart() {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    await db.cartItem.deleteMany({
      where: { userId: user.id },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Clear cart error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clear cart",
    };
  }
}

export async function getCartCount() {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      return { success: true, data: 0 };
    }

    const cartItems = await db.cartItem.findMany({
      where: { userId: user.id },
      select: { quantity: true },
    });

    const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return { success: true, data: totalCount };
  } catch (error) {
    console.error("Get cart count error:", error);
    return { success: false, error: "Failed to get cart count" };
  }
}

export async function getCartTotal() {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      return { success: true, data: 0 };
    }

    const cartItems = await db.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: { price: true },
        },
        variant: {
          select: { price: true },
        },
      },
    });

    const total = cartItems.reduce((sum, item) => {
      const productPrice = item.product.price || 0;
      const variantPrice = item.variant?.price || 0;
      return sum + (productPrice + variantPrice) * item.quantity;
    }, 0);

    return { success: true, data: total };
  } catch (error) {
    console.error("Get cart total error:", error);
    return { success: false, error: "Failed to get cart total" };
  }
}
