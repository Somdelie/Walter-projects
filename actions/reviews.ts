"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/prisma/db";
import { getAuthenticatedUser } from "@/config/useAuth";

export async function createReview(data: {
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
}) {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      return {
        success: false,
        error: "You must be logged in to submit a review",
      };
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      return {
        success: false,
        error: "Rating must be between 1 and 5 stars",
      };
    }

    // Check if user already reviewed this product
    const existingReview = await db.review.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: data.productId,
        },
      },
    });

    if (existingReview) {
      return {
        success: false,
        error: "You have already reviewed this product",
      };
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    // Check if user has purchased this product (for verified reviews)
    const hasPurchased = await db.orderItem.findFirst({
      where: {
        productId: data.productId,
        order: {
          userId: user.id,
          status: "DELIVERED",
        },
      },
    });

    // Create the review
    const review = await db.review.create({
      data: {
        userId: user.id,
        productId: data.productId,
        rating: data.rating,
        title: data.title?.trim() || null,
        comment: data.comment?.trim() || null,
        isVerified: !!hasPurchased,
        isApproved: true, // Auto-approve for now, you can change this to false for manual approval
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    revalidatePath(`/products/${product.slug}`);

    return {
      success: true,
      data: review,
      message: "Review submitted successfully!",
    };
  } catch (error) {
    console.error("Error creating review:", error);
    return {
      success: false,
      error: "Failed to submit review. Please try again.",
    };
  }
}

export async function updateReview(
  reviewId: string,
  data: {
    rating: number;
    title?: string;
    comment?: string;
  }
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      return {
        success: false,
        error: "You must be logged in to update a review",
      };
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      return {
        success: false,
        error: "Rating must be between 1 and 5 stars",
      };
    }

    // Check if review exists and belongs to user
    const existingReview = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        product: true,
      },
    });

    if (!existingReview) {
      return {
        success: false,
        error: "Review not found",
      };
    }

    if (existingReview.userId !== user.id) {
      return {
        success: false,
        error: "You can only update your own reviews",
      };
    }

    // Update the review
    const updatedReview = await db.review.update({
      where: { id: reviewId },
      data: {
        rating: data.rating,
        title: data.title?.trim() || null,
        comment: data.comment?.trim() || null,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    revalidatePath(`/products/${existingReview.product.slug}`);

    return {
      success: true,
      data: updatedReview,
      message: "Review updated successfully!",
    };
  } catch (error) {
    console.error("Error updating review:", error);
    return {
      success: false,
      error: "Failed to update review. Please try again.",
    };
  }
}

export async function deleteReview(reviewId: string) {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      return {
        success: false,
        error: "You must be logged in to delete a review",
      };
    }

    // Check if review exists and belongs to user
    const existingReview = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        product: true,
      },
    });

    if (!existingReview) {
      return {
        success: false,
        error: "Review not found",
      };
    }

    if (existingReview.userId !== user.id) {
      return {
        success: false,
        error: "You can only delete your own reviews",
      };
    }

    // Delete the review
    await db.review.delete({
      where: { id: reviewId },
    });

    revalidatePath(`/products/${existingReview.product.slug}`);

    return {
      success: true,
      message: "Review deleted successfully!",
    };
  } catch (error) {
    console.error("Error deleting review:", error);
    return {
      success: false,
      error: "Failed to delete review. Please try again.",
    };
  }
}

export async function getUserReview(productId: string) {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      return { data: null };
    }

    const review = await db.review.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return {
      success: true,
      data: review,
    };
  } catch (error) {
    console.error("Error fetching user review:", error);
    return { data: null };
  }
}

export async function toggleReviewHelpful(reviewId: string) {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      return {
        success: false,
        error: "You must be logged in to mark reviews as helpful",
      };
    }

    // For now, just return success - you can implement a ReviewHelpful table later
    return {
      success: true,
      message: "Thank you for your feedback!",
    };
  } catch (error) {
    console.error("Error toggling review helpful:", error);
    return {
      success: false,
      error: "Failed to update. Please try again.",
    };
  }
}
