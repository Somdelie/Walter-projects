import { categoryAPI } from "@/services/categoryAPI";
import {
  CategoryCreateData,
  CategoryFormData,
  CategoryMutationData,
} from "@/types/category";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys for caching
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters: any) => [...categoryKeys.lists(), { filters }] as const,
  filteredList: (dateFilter: any, searchQuery: string) =>
    [...categoryKeys.lists(), { dateFilter, searchQuery }] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

interface CreateCategoryOptions {
  onSuccess?: () => void;
}

// Get all categories with regular query
export function useCategories() {
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => categoryAPI.getAllCategories(),
  });

  return {
    categories,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Get categories with suspense
export function useCategoriesSuspense() {
  const { data: categories = [], refetch } = useSuspenseQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => categoryAPI.getAllCategories(),
  });

  return {
    categories,
    refetch,
  };
}

// Get single category by ID or slug
export function useCategory(identifier: string, enabled = true) {
  const {
    data: category,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: categoryKeys.detail(identifier),
    queryFn: () => categoryAPI.getById(identifier),
    enabled: enabled && !!identifier,
    // Prevent automatic refetching that could cause 404s during slug updates
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  return {
    category,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Get single category with suspense
export function useCategorySuspense(id: string) {
  const { data: category, refetch } = useSuspenseQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryAPI.getById(id),
  });

  return {
    category,
    refetch,
  };
}

// Create category mutation
export function useCreateCategory(options: CreateCategoryOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryCreateData) => categoryAPI.create(data),
    onSuccess: () => {
      toast.success("Category added successfully", {
        description: "The category has been added to your catalog.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
      });

      // Call custom onSuccess handler if provided
      if (options.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        style: {
          backgroundColor: "red",
          color: "white",
        },
      });
    },
  });
}

// Delete category mutation
export function useCategoryDelete(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => categoryAPI.delete(categoryId),
    onSuccess: () => {
      toast.success("Category deleted successfully", {
        description: "The category has been removed from your catalog.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      });

      // Invalidate specific category queries
      if (id) {
        queryClient.invalidateQueries({
          queryKey: categoryKeys.detail(id),
        });
      }

      // Always invalidate the lists
      queryClient.invalidateQueries({
        queryKey: categoryKeys.lists(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        style: {
          backgroundColor: "red",
          color: "white",
        },
      });
    },
  });
}

// Update category mutation with better slug change handling
export function useCategoryUpdate(
  id: string,
  options?: { showToast?: boolean; successMessage?: string }
) {
  const queryClient = useQueryClient();
  const showToast = options?.showToast ?? true;
  const successMessage = options?.successMessage;

  return useMutation({
    mutationFn: (data: CategoryMutationData) => {
      return categoryAPI.update(id, data);
    },
    onMutate: async (newData: CategoryMutationData) => {
      await queryClient.cancelQueries({ queryKey: categoryKeys.detail(id) });
      const previousCategory = queryClient.getQueryData(
        categoryKeys.detail(id)
      );
      const old = queryClient.getQueryData<{ slug?: string }>(
        categoryKeys.detail(id)
      );

      // Optimistically update to the new value
      queryClient.setQueryData(categoryKeys.detail(id), (old: any) => ({
        ...old,
        ...newData,
        updatedAt: new Date(),
      }));

      // If slug is changing, also update the cache for the new slug
      if (newData.slug && old && old.slug !== newData.slug) {
        queryClient.setQueryData(
          categoryKeys.detail(newData.slug),
          (old: any) => ({
            ...old,
            ...newData,
            updatedAt: new Date(),
          })
        );
      }

      return { previousCategory };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(
        categoryKeys.detail(id),
        context?.previousCategory
      );

      // Also clear the new slug cache if it was set
      if (newData.slug) {
        queryClient.removeQueries({
          queryKey: categoryKeys.detail(newData.slug),
        });
      }

      if (showToast) {
        toast.error("Update failed", {
          description:
            err instanceof Error ? err.message : "Something went wrong",
          style: {
            backgroundColor: "red",
            color: "white",
          },
        });
      }
    },
    onSuccess: (updatedCategory, variables) => {
      if (showToast) {
        toast.success(successMessage || "Category updated successfully", {
          description: "The category has been updated in your catalog.",
          style: {
            backgroundColor: "green",
            color: "#fff",
          },
        });
      }

      // If slug changed, update cache keys
      if (variables.slug && updatedCategory?.slug) {
        // Set data for new slug
        queryClient.setQueryData(
          categoryKeys.detail(updatedCategory.slug),
          updatedCategory
        );
        // Remove old slug cache if different
        if (updatedCategory.slug !== id) {
          queryClient.removeQueries({ queryKey: categoryKeys.detail(id) });
        }
      }
    },
    onSettled: (updatedCategory, error, variables) => {
      // Only invalidate if no slug change or if there was an error
      if (!variables.slug || error) {
        queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) });
      }

      // Always invalidate lists
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });

      // If slug changed and no error, invalidate the new slug
      if (variables.slug && !error && updatedCategory) {
        queryClient.invalidateQueries({
          queryKey: categoryKeys.detail(updatedCategory.slug),
        });
      }
    },
  });
}
