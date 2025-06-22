"use client";

import { updateCategoryById } from "@/actions/categories";
import TextInput from "@/components/FormInputs/TextInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCategoryUpdate } from "@/hooks/useCategoryQueries";
import { generateSlug } from "@/lib/generateSlug";
import { CategoryProps } from "@/types/category";
import { Check, Edit, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ImageInput } from "../FormInputs/ImageInput";

export type CategoryEditFormProps = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
};

type EditCategoryFormComponentProps = {
  category: CategoryProps;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
};

export function EditCategoryForm({ 
  category, 
  onSuccess,
  trigger 
}: EditCategoryFormComponentProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(category.imageUrl || "");
  
  const updateMutation = useCategoryUpdate(category.id, {
    showToast: false, // We'll handle our own toasts
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CategoryEditFormProps>({
    defaultValues: {
      id: category.id,
      title: category.title,
      slug: category.slug,
      imageUrl: category.imageUrl || "",
    },
  });

  // Update form when category prop changes
  useEffect(() => {
    setValue("title", category.title);
    setValue("slug", category.slug || "");
    setValue("imageUrl", category.imageUrl || "");
    setImageUrl(category.imageUrl || "");
  }, [category, setValue]);

  const handleImageChange = (url: string) => {
    setImageUrl(url);
    setValue("imageUrl", url, { shouldDirty: true });
  };

  const handleEditCategory = async (data: CategoryEditFormProps) => {
    try {
      setLoading(true);
      
      // Generate new slug if title changed
      const newSlug = data.title !== category.title ? generateSlug(data.title) : category.slug;
      
      const updateData = {
        title: data.title,
        slug: newSlug,
        imageUrl: imageUrl,
      };

      await updateMutation.mutateAsync(updateData);
      
      toast.success("Category updated successfully", {
        description: "The category has been updated in your catalog.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      });

      setOpen(false);
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category", {
        description: error instanceof Error ? error.message : "Something went wrong",
        style: {
          backgroundColor: "red",
          color: "white",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form to original values when closing
      reset({
        id: category.id,
        title: category.title,
        slug: category.slug,
        imageUrl: category.imageUrl || "",
      });
      setImageUrl(category.imageUrl || "");
    }
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="h-8 px-2">
      <Edit className="h-4 w-4" />
      <span className="sr-only">Edit category</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleEditCategory)} className="space-y-4">
          <TextInput
            label="Category Title"
            name="title"
            register={register}
            errors={errors}
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Category Image</label>
            <div className="flex flex-col space-y-3 px-4 items-center w-full border-2 border-dashed border-orange-300 rounded-lg p-4">
              {imageUrl && (
                <div className="relative group w-full flex justify-center items-center">
                  <img
                    src={imageUrl}
                    alt="Category image"
                    className="w-24 h-24 object-cover rounded-md border shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg";
                    }}
                  />
                </div>
              )}
              
              <ImageInput
                title=""
                imageUrl={imageUrl}
                setImageUrl={handleImageChange}
                endpoint="categoryImage"
              />
              
              <p className="text-xs text-muted-foreground text-center">
                Upload a high quality image for your category. JPG, PNG, and WebP formats supported (max 1MB).
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={loading || !isDirty}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Update Category
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}