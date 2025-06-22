"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { ConfirmationDialog } from "../ui/data-table";
import { useCategoryDelete } from "@/hooks/useCategoryQueries";
import { useFileDelete } from "@/hooks/useFileDelete";
import { CategoryProps } from "@/types/category";
import { toast } from "sonner";
import { EditCategoryForm } from "../Forms/CategoryEditForm";

type ActionColumnProps = {
  row: any; // Keep as any for now to debug
  model: any;
  editEndpoint: string;
  id?: string;
  onRefetch?: () => void;
};

export default function ActionColumn({
  row,
  onRefetch,
}: ActionColumnProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    title: string;
    imageUrl?: string;
  } | null>(null);

  const deleteCategoryMutation = useCategoryDelete();
  const { deleteFile } = useFileDelete();

  // Function to extract category data from different possible structures
  const getCategoryData = (rowData: any): CategoryProps | null => {
    console.log("Raw row data:", rowData);
    console.log("Row data type:", typeof rowData);
    console.log("Row data keys:", rowData ? Object.keys(rowData) : "No keys");

    // If rowData is the category itself
    if (rowData && rowData.id && rowData.title) {
      return rowData as CategoryProps;
    }

    // If rowData has an 'original' property (common in react-table)
    if (rowData && rowData.original) {
      console.log("Found original property:", rowData.original);
      return rowData.original as CategoryProps;
    }

    // If rowData has a 'getValue' function (react-table v8)
    if (rowData && typeof rowData.getValue === 'function') {
      try {
        const originalData = rowData.original;
        console.log("React-table v8 original:", originalData);
        return originalData as CategoryProps;
      } catch (error) {
        console.error("Error getting value from react-table:", error);
      }
    }

    console.error("Could not extract category data from:", rowData);
    return null;
  };

  const handleDeleteClick = () => {
    const categoryData = getCategoryData(row);
    
    console.log("Extracted category data:", categoryData);
    
    if (!categoryData || !categoryData.id) {
      console.error("Category is missing or has no ID:", categoryData);
      toast.error("Error: Category data is missing or invalid");
      return;
    }

    toast(`Preparing to delete category: ${categoryData.title}`, {
      duration: 3000,
      description: "This action cannot be undone.",
    });
    
    setCategoryToDelete({
      id: categoryData.id,
      title: categoryData.title,
      imageUrl: categoryData.imageUrl ?? undefined,
    });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete?.id) {
      toast.error("Error: No category selected for deletion");
      return;
    }

    try {
      // Delete associated image file if it exists
      if (categoryToDelete.imageUrl) {
        try {
          await deleteFile(categoryToDelete.imageUrl);
        } catch (error) {
          console.error("Error deleting category image:", error);
        }
      }

      // Delete the category
      await deleteCategoryMutation.mutateAsync(categoryToDelete.id);
      
      // Close dialog and reset state
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      
      // Call refetch if provided
      if (onRefetch) {
        onRefetch();
      }
      
      toast.success(`Category "${categoryToDelete.title}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category. Please try again.");
    }
  };

  // Get category data for edit form
  const categoryData = getCategoryData(row);

  // Debug logging
  React.useEffect(() => {
    console.log("ActionColumn mounted with row:", row);
  }, [row]);
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Edit Category Option */}
          {categoryData && (
            <DropdownMenuItem asChild>
              <EditCategoryForm 
                category={categoryData}
                onSuccess={onRefetch}
                trigger={
                  <div className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-accent">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Category
                  </div>
                }
              />
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem
            onClick={handleDeleteClick}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Category
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setCategoryToDelete(null);
          }
        }}
        title="Delete Category"
        description={
          categoryToDelete ? (
            <>
              Are you sure you want to delete{" "}
              <strong className="text-primary">{categoryToDelete.title}</strong> from your catalog?
              <br />
              This action cannot be undone.
            </>
          ) : (
            "Are you sure you want to delete this category?"
          )
        }
        onConfirm={handleConfirmDelete}
        isConfirming={deleteCategoryMutation.isPending}
        confirmLabel="Delete Category"
        variant="destructive"
      />
    </>
  );
}