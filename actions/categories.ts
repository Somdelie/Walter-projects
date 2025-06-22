// actions/categories.ts
"use server";

import { CategoryCreateData, CategoryMutationData } from "@/types/category";
import { generateSlug } from "@/lib/generateSlug";
import { revalidatePath } from "next/cache";
import { db } from "@/prisma/db";

// Get all categories with their relationships
export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: {
            Product: true,
          },
        },
      },
      orderBy: [{ title: "asc" }],
    });

    return {
      data: categories,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      data: [],
      error: "Failed to fetch categories",
    };
  }
}

// Get single category by ID
export async function getCategoryById(id: string) {
  try {
    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            Product: true,
          },
        },
      },
    });

    return {
      data: category,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    return {
      data: null,
      error: "Failed to fetch category",
    };
  }
}

// Create new category
//create a new category
export async function createCategory(data: CategoryCreateData) {
  try {
    // Check if the brand already exists
    const existingCategory = await db.category.findFirst({
      where: {
        slug: data.slug,
      },
    });
    if (existingCategory) {
      return {
        status: 400,
        message: "Category already exists",
        data: null,
        error: "",
      };
    }
    const category = await db.category.create({
      data,
    });
    revalidatePath("/dashboard/products/categories");
    return {
      status: 200,
      message: "Category created successfully",
      data: category,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Update category
export async function updateCategoryById(
  id: string,
  data: CategoryMutationData
) {
  try {
    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return {
        data: null,
        error: "Category not found",
      };
    }

    // Generate slug if title changed
    const slug =
      data.title !== existingCategory.title
        ? generateSlug(data.title)
        : existingCategory.slug;

    // Check if new slug conflicts with another category
    if (slug !== existingCategory.slug) {
      const slugConflict = await db.category.findUnique({
        where: { slug },
      });

      if (slugConflict) {
        return {
          data: null,
          error: "A category with this name already exists",
        };
      }
    }

    const category = await db.category.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        description: data.description || null,
        imageUrl: data.imageUrl || existingCategory.imageUrl,
      },
      include: {
        _count: {
          select: {
            Product: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/products/categories");
    return {
      data: category,
      success: true,
      status: 200,
      error: null,
    };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      data: null,
      error: "Failed to update category",
    };
  }
}

// Delete category
export async function deleteCategoryById(id: string) {
  console.log("Deleting category with ID:", id);
  try {
    // Check if category has products
    const category = await db.category.findUnique({
      where: { id },
      include: {
        Product: true,
      },
    });

    if (!category) {
      console.log("Category not found:", id);
      return {
        success: false,
        error: "Category not found",
      };
    }

    if (category.Product.length > 0) {
      return {
        success: false,
        error: `Cannot delete category. It has ${category.Product.length} products assigned to it.`,
        status: 405,
      };
    }

    await db.category.delete({
      where: { id },
    });

    revalidatePath("/dashboard/products/categories");
    return {
      success: true,
      status: 200,
      message: "Category deleted successfully",
      data: null,
      error: null,
    };
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error: "Failed to delete category",
    };
  }
}

// Delete multiple categories
export async function deleteManyCategories(ids: string[]) {
  try {
    // Check if any categories have products
    const categories = await db.category.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        _count: {
          select: {
            Product: true,
          },
        },
      },
    });

    const categoriesWithProducts = categories.filter(
      (cat) => cat._count.Product > 0
    );

    if (categoriesWithProducts.length > 0) {
      return {
        success: false,
        error: `Cannot delete ${categoriesWithProducts.length} categories as they have products assigned.`,
      };
    }

    const result = await db.category.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    revalidatePath("/dashboard/products/categories");
    return {
      success: true,
      error: null,
      deletedCount: result.count,
    };
  } catch (error) {
    console.error("Error deleting categories:", error);
    return {
      success: false,
      error: "Failed to delete categories",
    };
  }
}
