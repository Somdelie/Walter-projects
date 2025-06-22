import {
  createCategory,
  deleteCategoryById,
  getCategories,
  getCategoryById,
  updateCategoryById,
} from "@/actions/categories";
import type {
  CategoryCreateData,
  CategoryMutationData,
} from "@/types/category";

// Centralized API object for all category-related server actions
export const categoryAPI = {
  // Fetch all categories
  getAllCategories: async () => {
    const response = await getCategories();
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  // Get single category by ID or slug
  getById: async (id: string) => {
    const category = await getCategoryById(id);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  },

  // Create a new category
  create: async (data: CategoryCreateData) => {
    const response = await createCategory(data);
    if (response?.status === 200) {
      return response.data;
    } else {
      throw new Error(response?.message || "Failed to create category");
    }
  },

  // Update an existing category
  update: async (id: string, data: CategoryMutationData) => {
    const response = await updateCategoryById(id, data);
    if (!response.success) {
      throw new Error(response.error || "Failed to update category");
    }
    return response.data;
  },

  // Delete a category
  delete: async (id: string) => {
    const response = await deleteCategoryById(id);
    // Check for success field instead of status
    if (!response.success) {
      throw new Error(response.error || "Failed to delete category");
    }
    return response.data;
  },
};
