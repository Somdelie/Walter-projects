"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Upload, ImageIcon } from "lucide-react"
import { ImageInput } from "@/components/FormInputs/ImageInput"
import ProjectMultipleImageInput from "@/components/FormInputs/ProjectMultipleImageInput"
import { createProject, updateProject } from "@/actions/project-actions"
import { toast } from "sonner"

interface Project {
  id: string
  name: string
  slug: string
  thumbnail?: string | null
  imageUrls: string[]
  description?: string | null
  createdAt: Date
  updatedAt?: Date | null
}

interface ProjectFormProps {
  project?: Project
}

// Separate submit button component to use useFormStatus
function SubmitButton({ project }: { project?: Project }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="flex-1 sm:flex-none">
      {pending ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          {project ? "Updating..." : "Creating..."}
        </>
      ) : (
        <>
          <Upload className="w-4 h-4 mr-2" />
          {project ? "Update Project" : "Create Project"}
        </>
      )}
    </Button>
  )
}

const ProjectForm = ({ project }: ProjectFormProps) => {
  const [error, setError] = useState("")
  const [imageUrl, setImageUrl] = useState(project?.thumbnail || "")
  const [imageUrls, setImageUrls] = useState<string[]>(project?.imageUrls || [])
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setError("")

    try {
      // Add thumbnail image to form data
      if (imageUrl) {
        formData.append("thumbnail", imageUrl)
      }

      // Add additional images to form data
      imageUrls.forEach((url) => {
        formData.append("imageUrls", url)
      })

      let result
      if (project) {
        result = await updateProject(project.id, formData)
      } else {
        result = await createProject(formData)
      }

      if (result.error) {
        setError(result.error)
      } else {
        toast.success("Project has been added successfully💐")
        router.push("/dashboard/blogs")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    }
  }

  const handleImageChange = (url: string) => {
    setImageUrl(url)
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          {project ? "Edit Project" : "Create New Project"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input id="name" name="name" defaultValue={project?.name} placeholder="Enter project name" required />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={project?.description || ""}
              placeholder="Describe your project..."
              rows={4}
              required
            />
          </div>

          {/* Thumbnail Image */}
          <div className="space-y-4">
            <Label>Project Thumbnail</Label>
            <div className="flex flex-col space-y-3 px-4 items-center w-full border-2 border-dashed border-blue-300 rounded-lg p-6">
              {imageUrl && (
                <div className="relative group w-full flex justify-center items-center">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt="Project thumbnail"
                    className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                </div>
              )}

              <ImageInput title="" imageUrl={imageUrl} setImageUrl={handleImageChange} endpoint="projectImage" />
              <p className="text-xs text-muted-foreground text-center">
                Upload a high quality thumbnail image for your project. JPG, PNG, and WebP formats supported (max 1MB).
              </p>
            </div>
          </div>

          {/* Additional Images */}
          <div className="space-y-4">
            <Label>Additional Project Images</Label>
            <ProjectMultipleImageInput
              title=""
              imageUrls={imageUrls}
              setImageUrls={setImageUrls}
              endpoint="projectImages"
              projectId={project?.id || "new-project"}
            />
            <p className="text-xs text-muted-foreground">
              Upload additional images to showcase your project from different angles. Up to 10 images allowed.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <SubmitButton project={project} />
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default ProjectForm
