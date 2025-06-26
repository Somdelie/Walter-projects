"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadButton } from "@/lib/uploadthing"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"

type ProjectImageInputProps = {
  title: string
  imageUrls: string[]
  setImageUrls: (urls: string[]) => void
  endpoint: any
  projectId?: string
}

export default function ProjectMultipleImageInput({
  title,
  imageUrls,
  setImageUrls,
  endpoint,
  projectId,
}: ProjectImageInputProps) {
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)
  const MAX_IMAGES = 10 // More images allowed for projects
  const remainingSlots = MAX_IMAGES - imageUrls.length

  // Function to extract file key from URL
  const getFileKeyFromUrl = (url: string) => {
    try {
      // Extract the file key from the uploadthing URL format
      const urlParts = url.split("/")
      return urlParts[urlParts.length - 1]
    } catch (error) {
      console.error("Failed to extract file key:", error)
      return null
    }
  }

  // Function to delete an image
  const handleDeleteImage = async (imageUrl: string, index: number) => {
    try {
      setDeletingIndex(index)

      // Extract the file key from the URL
      const fileKey = getFileKeyFromUrl(imageUrl)

      if (!fileKey) {
        toast.error("Could not identify file key for deletion")
        return
      }

      // Call the API to delete the file from uploadthing
      const response = await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileKey }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete file")
      }

      // Remove the image from the state
      const updatedUrls = imageUrls.filter((_, i) => i !== index)
      setImageUrls(updatedUrls)

      toast.success("Image deleted successfully")
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error("Failed to delete image")
    } finally {
      setDeletingIndex(null)
    }
  }

  // Get remaining message text
  const getRemainingMessage = () => {
    if (remainingSlots === 0) {
      return "Max images reached"
    } else if (remainingSlots === 1) {
      return "Add 1 more image"
    } else {
      return `Add up to ${remainingSlots} more images`
    }
  }

  return (
    <Card className="overflow-hidden">
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "" : "pt-6"}>
        <div className="grid gap-4">
          {imageUrls.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {imageUrls.map((imageUrl: string, i: number) => {
                return (
                  <div
                    key={i}
                    className="relative aspect-square rounded-lg overflow-hidden border shadow-sm group bg-gray-100"
                  >
                    <Image
                      alt={`Project image ${i + 1}`}
                      className="object-cover transition-transform group-hover:scale-105"
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      src={imageUrl || "/placeholder.svg"}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />

                    {/* Delete button overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="icon"
                        type="button"
                        onClick={() => handleDeleteImage(imageUrl, i)}
                        className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-all transform hover:scale-110 shadow-lg"
                        disabled={deletingIndex === i}
                        aria-label="Delete image"
                      >
                        {deletingIndex === i ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Image number indicator */}
                    <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      {i + 1}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center h-44 border-dashed border-2 border-gray-300 rounded-lg bg-gray-50">
              <div className="text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No project images yet</h3>
                <p className="text-sm text-gray-500">Upload images to showcase your project</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex">
              <div className="">
                <Upload className="h-full w-full bg-blue-600 text-white rounded-l p-2" />
              </div>
              {remainingSlots <= 0 ? (
                <Button disabled className="bg-gray-400 text-white rounded-r rounded-none p-2">
                  Max images reached
                </Button>
              ) : (
                <UploadButton
                  className="ut-button:bg-transparent ut-button:text-white bg-blue-600 rounded-r hover:bg-blue-700 transition duration-200 ease-in-out ut-allowed-content:hidden border-blue-600"
                  endpoint={endpoint}
                  onClientUploadComplete={(res) => {
                    // Add new images to existing ones, up to MAX_IMAGES
                    const newUrls = res.map((item) => item.url)
                    const combinedUrls = [...imageUrls, ...newUrls].slice(0, MAX_IMAGES)
                    setImageUrls(combinedUrls)
                    toast.success(`${newUrls.length} image(s) uploaded successfully`)
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Upload error: ${error.message}`)
                  }}
                />
              )}
            </div>
            {/* Display message about remaining image slots */}
            {imageUrls.length > 0 && <p className="text-sm text-gray-500 mt-1">{getRemainingMessage()}</p>}
          </div>

          {/* Image count display */}
          {imageUrls.length > 0 && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {imageUrls.length} of {MAX_IMAGES} images uploaded
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
