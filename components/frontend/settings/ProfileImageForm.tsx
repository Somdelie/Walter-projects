"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Loader2, Camera, Upload } from "lucide-react"
import { updateProfileImage } from "@/actions/user-settings"
import { getInitials } from "@/lib/generateInitials"
import { ImageInput } from "@/components/FormInputs/ImageInput"
import { useForm, FormProvider } from "react-hook-form"


interface ProfileImageFormProps {
  user: {
    name: string | null | undefined
    image: string | null | undefined
  }
}

export function ProfileImageForm({ user }: ProfileImageFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")

  
const methods = useForm()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    try {
      // If we have an uploaded image URL, add it to the form data
      if (imageUrl) {
        formData.set('imageUrl', imageUrl)
      }

      const result = await updateProfileImage(formData)

      if (result.success) {
        toast.success(result.message || "Profile image updated successfully")
        setPreviewUrl(null)
        setImageUrl("")
      } else {
        toast.error(result.error || "Failed to update profile image")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    if (url) {
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  // Handle ImageInput URL changes
  const handleImageInputChange = (url: string) => {
    setImageUrl(url)
    setPreviewUrl(url)
  }

  // Handle case where name might be null/undefined
  const userName = user.name || "User"
  const userImage = user.image || null

  // Determine which image to show in avatar
  const displayImage = previewUrl || imageUrl || userImage || ""

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Profile Picture
        </CardTitle>
        <CardDescription>Update your profile picture</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 ring-2 ring-border transition-all duration-200 hover:ring-primary">
              <AvatarImage src={displayImage} alt={userName} />
              <AvatarFallback className="text-lg">{getInitials(userName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-medium">{userName}</h4>
              <p className="text-sm text-muted-foreground">Upload a new profile picture or provide an image URL</p>
            </div>
          </div>

          <FormProvider {...methods}> <form action={handleSubmit} className="space-y-4">
            {/* Your custom ImageInput component */}
            <div className="space-y-2">
              <ImageInput
                title="Upload Image"
                imageUrl={imageUrl}
                setImageUrl={handleImageInputChange}
              />
            </div>

            {/* Alternative: Manual URL input */}
            {/* <div className="space-y-2">
              <Label htmlFor="imageUrl">Or enter Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                onChange={handleImageUrlChange}
                className="transition-all duration-200 focus:scale-[1.02]"
              />
              <p className="text-xs text-muted-foreground">Provide a direct link to your profile image</p>
            </div> */}

            <Button type="submit" disabled={isLoading} className="w-full md:w-auto group">
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              )}
              {isLoading ? "Updating..." : "Update Picture"}
            </Button>
          </form></FormProvider>

         
        </div>
      </CardContent>
    </Card>
  )
}