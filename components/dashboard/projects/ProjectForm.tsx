"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Plus, X, Upload, ImageIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createProject, updateProject } from "@/actions/project-actions"
import toast from "react-hot-toast"

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

const ProjectForm = ({ project }: ProjectFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [imageUrls, setImageUrls] = useState<string[]>(project?.imageUrls || [])
  const [newImageUrl, setNewImageUrl] = useState("")
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setError("")

    try {
      // Add image URLs to form data
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
        // router.push("/admin/projects")
        toast.success('Project has been added successfully')
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addImageUrl = () => {
    if (newImageUrl.trim() && !imageUrls.includes(newImageUrl.trim())) {
      setImageUrls([...imageUrls, newImageUrl.trim()])
      setNewImageUrl("")
    }
  }

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
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

          {/* Thumbnail */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail Image URL</Label>
            <Input
              id="thumbnail"
              name="thumbnail"
              type="url"
              defaultValue={project?.thumbnail || ""}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-sm text-gray-500">Optional: Add a main thumbnail image for your project</p>
          </div>

          {/* Additional Images */}
          <div className="space-y-4">
            <Label>Additional Images</Label>

            {/* Add new image URL */}
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
              <Button type="button" onClick={addImageUrl} disabled={!newImageUrl.trim()} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Display added images */}
            <AnimatePresence>
              {imageUrls.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Added Images ({imageUrls.length})</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {imageUrls.map((url, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                              target.nextElementSibling?.classList.remove("hidden")
                            }}
                          />
                          <div className="hidden w-full h-full md:flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 flex-1 truncate">{url}</p>
                        <Button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none">
              {isSubmitting ? (
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
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default ProjectForm
