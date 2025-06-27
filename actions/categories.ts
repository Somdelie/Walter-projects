"use server";

import type {
  CategoryCreateData,
  CategoryMutationData,
} from "@/types/category";
import { generateSlug } from "@/lib/generateSlug";
import { revalidatePath } from "next/cache";
import { db } from "@/prisma/db";

// Get all categories with their relationships including subcategories
export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      include: {
        parent: true,
        subcategories: {
          include: {
            _count: {
              select: {
                Product: true,
              },
            },
          },
        },
        _count: {
          select: {
            Product: true,
            subcategories: true,
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

// Get parent categories only (for dropdown selection)
export async function getParentCategories() {
  try {
    const categories = await db.category.findMany({
      where: {
        parentId: null, // Only get parent categories
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      orderBy: [{ title: "asc" }],
    });

    return {
      data: categories,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching parent categories:", error);
    return {
      data: [],
      error: "Failed to fetch parent categories",
    };
  }
}

// Get single category by ID
export async function getCategoryById(id: string) {
  try {
    const category = await db.category.findUnique({
      where: { id },
      include: {
        parent: true,
        subcategories: {
          include: {
            _count: {
              select: {
                Product: true,
              },
            },
          },
        },
        _count: {
          select: {
            Product: true,
            subcategories: true,
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
export async function createCategory(
  data: CategoryCreateData & { parentId?: string }
) {
  try {
    // Check if the category already exists
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

    // If parentId is provided, verify the parent exists
    if (data.parentId) {
      const parentCategory = await db.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parentCategory) {
        return {
          status: 400,
          message: "Parent category not found",
          data: null,
          error: "",
        };
      }
    }

    const category = await db.category.create({
      data: {
        title: data.title,
        slug: data.slug,
        imageUrl: data.imageUrl,
        description: data.description,
        parentId: data.parentId || null,
      },
      include: {
        parent: true,
        _count: {
          select: {
            Product: true,
            subcategories: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/products/categories");
    return {
      status: 200,
      message: "Category created successfully",
      data: category,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: "Failed to create category",
      data: null,
      error: error,
    };
  }
}

// Update category
export async function updateCategoryById(
  id: string,
  data: CategoryMutationData & { parentId?: string }
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

    // Prevent circular reference (category can't be its own parent or child)
    if (data.parentId === id) {
      return {
        data: null,
        error: "Category cannot be its own parent",
      };
    }

    // Check if the new parent would create a circular reference
    if (data.parentId) {
      const parentCategory = await db.category.findUnique({
        where: { id: data.parentId },
        include: {
          parent: true,
        },
      });

      if (!parentCategory) {
        return {
          data: null,
          error: "Parent category not found",
        };
      }

      // Check if the parent is actually a child of this category
      let currentParent = parentCategory.parent;
      while (currentParent) {
        if (currentParent.id === id) {
          return {
            data: null,
            error: "Cannot create circular reference in category hierarchy",
          };
        }
        const nextParent = await db.category.findUnique({
          where: { id: currentParent.id },
          include: { parent: true },
        });
        currentParent = nextParent?.parent || null;
      }
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
        parentId: data.parentId || null,
      },
      include: {
        parent: true,
        subcategories: true,
        _count: {
          select: {
            Product: true,
            subcategories: true,
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
    // Check if category has products or subcategories
    const category = await db.category.findUnique({
      where: { id },
      include: {
        Product: true,
        subcategories: true,
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

    if (category.subcategories.length > 0) {
      return {
        success: false,
        error: `Cannot delete category. It has ${category.subcategories.length} subcategories. Please delete or reassign subcategories first.`,
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
    // Check if any categories have products or subcategories
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
            subcategories: true,
          },
        },
      },
    });

    const categoriesWithProducts = categories.filter(
      (cat) => cat._count.Product > 0
    );

    const categoriesWithSubcategories = categories.filter(
      (cat) => cat._count.subcategories > 0
    );

    if (categoriesWithProducts.length > 0) {
      return {
        success: false,
        error: `Cannot delete ${categoriesWithProducts.length} categories as they have products assigned.`,
      };
    }

    if (categoriesWithSubcategories.length > 0) {
      return {
        success: false,
        error: `Cannot delete ${categoriesWithSubcategories.length} categories as they have subcategories.`,
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

// Get categories formatted for product selection (hierarchical display)
export async function getCategoriesForProductSelection() {
  try {
    const categories = await db.category.findMany({
      include: {
        parent: true,
        subcategories: {
          orderBy: { title: "asc" },
        },
      },
      orderBy: [{ title: "asc" }],
    });

    // Format categories for dropdown display
    const formattedCategories = categories.map((category) => ({
      id: category.id,
      title: category.title,
      slug: category.slug,
      parentId: category.parentId,
      isSubcategory: !!category.parentId,
      displayName: category.parentId
        ? `${category.parent?.title} → ${category.title}`
        : category.title,
      level: category.parentId ? 1 : 0,
    }));

    // Sort to show parent categories first, then their subcategories
    const sortedCategories = formattedCategories.sort((a, b) => {
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      return a.displayName.localeCompare(b.displayName);
    });

    return {
      data: sortedCategories,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching categories for product selection:", error);
    return {
      data: [],
      error: "Failed to fetch categories",
    };
  }
}
