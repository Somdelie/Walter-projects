"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Check, Loader2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageInput } from "@/components/FormInputs/ImageInput" // Assuming this path and component structure
import {
  createGalleryItem,
  updateGalleryItem,
  type GalleryItem,
  type GalleryFormInput,
} from "@/actions/gallery-actions"

interface GalleryFormProps {
  initialData?: GalleryItem | null
  onSuccess?: () => void
}

export function GalleryForm({ initialData, onSuccess }: GalleryFormProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "")

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<GalleryFormInput>()

  useEffect(() => {
    if (initialData) {
      setValue("title", initialData.title)
      setValue("description", initialData.description)
      setImageUrl(initialData.imageUrl)
    } else {
      reset()
      setImageUrl("")
    }
  }, [initialData, setValue, reset])

  const onSubmit = async (data: GalleryFormInput) => {
    if (!imageUrl) {
      toast.error("Please upload an image for the gallery item.")
      return
    }

    data.imageUrl = imageUrl
    setLoading(true)

    try {
      let result
      if (initialData) {
        result = await updateGalleryItem(initialData.id, data)
      } else {
        result = await createGalleryItem(data)
      }

      if (result.success) {
        toast.success(result.message)
        reset()
        setImageUrl("")
        setOpen(false)
        onSuccess?.()
      } else {
        toast.error(result.message || "Operation failed.")
      }
    } catch (error) {
      console.error("Error saving gallery item:", error)
      toast.error("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1 bg-blue-600 hover:bg-blue-700 text-white">
          <ImageIcon className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            {initialData ? "Edit Gallery Item" : "Add New Gallery Item"}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{initialData ? "Edit Gallery Item" : "Add New Gallery Item"}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-4">
            <div>
              <label
                htmlFor="title"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Title
              </label>
              <Input
                id="title"
                {...register("title", { required: "Title is required" })}
                className="mt-1"
                placeholder="Enter title"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Description (Optional)
              </label>
              <Textarea
                id="description"
                {...register("description")}
                className="mt-1"
                placeholder="Enter description"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gallery Image</label>
              <div className="flex flex-col space-y-3 px-4 items-center w-full border-2 border-dashed border-gray-300 rounded-lg p-4">
                {imageUrl && (
                  <div className="relative group w-full flex justify-center items-center">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt="Gallery image"
                      className="w-32 h-32 object-cover rounded-md border shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=128&width=128&text=Image+Error"
                      }}
                    />
                  </div>
                )}
                <ImageInput title="" imageUrl={imageUrl} setImageUrl={setImageUrl} endpoint="galleryImage" />
                <p className="text-xs text-muted-foreground text-center">
                  Upload a high quality image for your gallery item. JPG, PNG, and WebP formats supported (max 1MB).
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
                  {initialData ? "Update Gallery Item" : "Save Gallery Item"}
                </>
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
