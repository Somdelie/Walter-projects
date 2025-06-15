"use server";
import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";

export async function getAllBrands() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return { data: [], error: "Unauthorized" };
    }

    const brands = await db.brand.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return { data: brands, error: null };
  } catch (error) {
    console.error("Error fetching brands:", error);
    return { data: [], error: "Failed to fetch brands" };
  }
}
