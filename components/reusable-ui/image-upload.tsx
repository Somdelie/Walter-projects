"use client"
import { FormLabel } from "@/components/ui/form"
import { UploadCloud } from "lucide-react"
import type React from "react"
import { useState, useRef } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

type ImageInputProps = {
  title?: string
  imageUrl: string
  setImageUrl: (url: string) => void
  endpoint?: string // Kept for compatibility, not directly used for R2 upload
}

export function ImageInput({
  title,
  imageUrl,
  setImageUrl,
  endpoint, // Not used but kept for compatibility
}: ImageInputProps) {
  const showPlaceholder = !imageUrl || imageUrl === "/placeholder.jpg"
  const [uploadInProgress, setUploadInProgress] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection and upload to Vercel Blob via API route
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please upload an image file",
      })
      return
    }
    if (file.size > 1024 * 1024) {
      // 1MB limit
      toast.error("File too large", {
        description: "Image must be less than 1MB",
      })
      return
    }

    setUploadInProgress(true)
    const toastId = toast.loading("Uploading image...")

    try {
      // Directly POST the file to your API route
      // The API route will then use @vercel/blob to upload it
      const uploadResponse = await fetch(`/api/upload?filename=${file.name}`, {
        method: "POST",
        headers: {
          // Do NOT set Content-Type: 'multipart/form-data' here.
          // The browser will automatically set it correctly when you pass a File/Blob as body.
          "Content-Type": file.type, // Set the actual content type of the file
        },
        body: file, // Send the file directly as the request body
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || "Failed to upload image")
      }

      const { url } = await uploadResponse.json()
      setImageUrl(url)
      toast.dismiss(toastId)
      toast.success("Upload successful", {
        description: "Your image has been uploaded to Vercel Blob",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast.dismiss(toastId)
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setUploadInProgress(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col space-y-3 w-full">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        title="Upload an image file"
      />

      {/* Only show title if provided */}
      {title && <FormLabel className="text-base font-medium">{title}</FormLabel>}

      {/* Custom upload button with same styling */}
      <div
        className="border-dashed border-2 border-primary/30 rounded p-4 py-2 flex flex-col items-center justify-center w-full hover:bg-gray-200 transition duration-200 ease-in-out"
        onClick={triggerFileInput}
      >
        <div className="flex items-center justify-center shadow">
          <UploadCloud
            className={`h-full w-10 p-2 text-white ${uploadInProgress ? "bg-yellow-600" : "bg-green-700"} rounded-l`}
          />
          <Button
            className="bg-primary rounded-none rounded-r hover:opacity-95 transition duration-200 ease-in-out border-primary"
            disabled={uploadInProgress}
            type="button"
          >
            {uploadInProgress ? "Uploading..." : "Select Image"}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground text-center mt-2">
          {uploadInProgress ? "Uploading..." : showPlaceholder ? "Click to upload" : "Change image (max 1MB)"}
        </div>
      </div>
    </div>
  )
}
