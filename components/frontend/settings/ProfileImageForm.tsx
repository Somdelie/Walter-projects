"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { toast } from "sonner"
import { Loader2, Camera, Upload } from "lucide-react"
import { updateImage } from "@/actions/user-settings"
import { getInitials } from "@/lib/generateInitials"
import { ImageInput } from "@/components/FormInputs/ImageInput"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

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

  const onClientSubmit = async () => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      if (imageUrl) formData.set("imageUrl", imageUrl)

      const result = await updateImage(formData)

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

  const handleImageInputChange = (url: string) => {
    setImageUrl(url)
    setPreviewUrl(url)
  }

  const userName = user.name || "User"
  const userImage = user.image || null
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
        <div className="flex flex-col sm:flex-row items-center justify-between space-x-4 md:space-x-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 ring-2 ring-border transition-all duration-200 hover:ring-primary">
              <AvatarImage src={displayImage} alt={userName} />
              <AvatarFallback className="text-lg">{getInitials(userName)}</AvatarFallback>
            </Avatar>
          </div>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onClientSubmit)} className="space-y-4 w-full">
              <div className="space-y-2">
                <ImageInput
                  title="Upload Image"
                  imageUrl={imageUrl}
                  setImageUrl={handleImageInputChange}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full md:w-auto group">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                )}
                {isLoading ? "Updating..." : "Update Picture"}
              </Button>
            </form>
          </FormProvider>
        </div>
      </CardContent>
    </Card>
  )
}
