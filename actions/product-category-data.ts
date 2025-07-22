"use server";

import { db } from "@/prisma/db";
import { Prisma } from "@prisma/client";

export async function getProductTypeRefs() {
  try {
    const productTypes = await db.productTypeRef.findMany({
      where: {
        isActive: true, // Only fetch active product types
      },
      orderBy: {
        sortOrder: "asc", // Order them by a defined sort order
      },
    });
    return { data: productTypes, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors
      console.error("Prisma error fetching product types:", error.message);
      return { data: null, error: `Database error: ${error.message}` };
    }
    console.error("Failed to fetch product types:", error);
    return {
      data: null,
      error: "An unexpected error occurred while fetching product types.",
    };
  }
}
