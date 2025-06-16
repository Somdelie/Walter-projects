"use server";

import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

export async function getWishlistItems() {
  try {
    const user = await getAuthenticatedUser();

    const wishlistItems = await db.wishlistItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            thumbnail: true,
            slug: true,
            comparePrice: true,
            isOnSale: true,
            stockQuantity: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: wishlistItems };
  } catch (error) {
    console.error("Get wishlist items error:", error);
    return { success: false, error: "Failed to load wishlist items" };
  }
}

export async function addToWishlist(productId: string) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    if (!productId) {
      throw new Error("Product ID is required");
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        thumbnail: true,
        slug: true,
        comparePrice: true,
        isOnSale: true,
        stockQuantity: true,
        status: true,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Check if item already exists in wishlist
    const existingItem = await db.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existingItem) {
      throw new Error("Item already in wishlist");
    }

    // Create new wishlist item
    const wishlistItem = await db.wishlistItem.create({
      data: {
        userId: user.id,
        productId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            thumbnail: true,
            slug: true,
            comparePrice: true,
            isOnSale: true,
            stockQuantity: true,
            status: true,
          },
        },
      },
    });

    revalidatePath("/wishlist");
    return { success: true, data: wishlistItem };
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to add item to wishlist",
    };
  }
}

export async function removeFromWishlist(productId: string) {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    if (!productId) {
      throw new Error("Product ID is required");
    }

    await db.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    revalidatePath("/wishlist");
    return { success: true };
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to remove item from wishlist",
    };
  }
}

export async function clearWishlist() {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    await db.wishlistItem.deleteMany({
      where: { userId: user.id },
    });

    revalidatePath("/wishlist");
    return { success: true };
  } catch (error) {
    console.error("Clear wishlist error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to clear wishlist",
    };
  }
}

export async function getWishlistCount() {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      return { success: true, data: 0 };
    }

    const count = await db.wishlistItem.count({
      where: { userId: user.id },
    });

    return { success: true, data: count };
  } catch (error) {
    console.error("Get wishlist count error:", error);
    return { success: false, error: "Failed to get wishlist count" };
  }
}

export async function isInWishlist(productId: string) {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      return { success: true, data: false };
    }

    const item = await db.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    return { success: true, data: !!item };
  } catch (error) {
    console.error("Check wishlist error:", error);
    return { success: false, error: "Failed to check wishlist" };
  }
}
