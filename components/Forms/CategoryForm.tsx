"use client";

import { createCategory } from "@/actions/categories";
import TextInput from "@/components/FormInputs/TextInput";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { generateSlug } from "@/lib/generateSlug";
import { Check, LayoutGrid, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ImageInput } from "../FormInputs/ImageInput";

export type CategoryFormProps = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
};

export function CategoryForm() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormProps>();

  const handleImageChange = (url: string) => {
    setImageUrl(url);
  };

  const saveBrand = async (data: CategoryFormProps) => {
    data.slug = generateSlug(data.title);
    data.imageUrl = imageUrl; // Add the image URL to the form data
    
    try {
      setLoading(true);
      const res = await createCategory(data);
      if (res?.status === 200) {
        setLoading(false);
        toast.success(res?.message, {
          style: {
            background: "green",
            color: "#fff",
          },
        });
        // Reset form and image state
        reset();
        setImageUrl("");
        setOpen(false);
      } else {
        setLoading(false);
        toast.error(res?.message, {
          style: {
            background: "#EF4444",
            color: "#fff",
          },
        });
        return;
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error("Something went wrong");
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        
        <Button size="sm" className="h-8 gap-1 bg-orange-600 hover:bg-orange-700 text-white">
          <LayoutGrid className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add New Category
          </span>
        </Button>
       
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(saveBrand)} className="space-y-4">
          <TextInput
            label="Category Title"
            name="title"
            register={register}
            errors={errors}
               />
          
          {/* <TextInput
            label="Category Description"
            name="description"
            register={register}
            errors={errors}
          /> */}

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
                endpoint="categoryImage" // Adjust endpoint as needed
              />
              
              <p className="text-xs text-muted-foreground text-center">
                Upload a high quality image for your category. JPG, PNG, and WebP formats supported (max 1MB).
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Category
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}