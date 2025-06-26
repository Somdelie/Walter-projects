"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, ImageIcon, ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

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

interface ProjectDetailClientProps {
  project: Project
}

const ProjectDetailClient = ({ project }: ProjectDetailClientProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const allImages = [...(project.thumbnail ? [project.thumbnail] : []), ...project.imageUrls]

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setSelectedImageIndex(null)
  }

  const nextImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % allImages.length)
    }
  }

  const prevImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(selectedImageIndex === 0 ? allImages.length - 1 : selectedImageIndex - 1)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date))
  }

  return (
    <div className="max-w-[95%] mx-auto py-4">
      {/* Back Button */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-4">
        <Link href="/projects">
          <Button variant="ghost" className="pl-0 hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </motion.div>

      {/* Project Header with Thumbnail */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Thumbnail - Left side on desktop */}
          {project.thumbnail && (
            <div className="lg:col-span-1">
              <Card className="overflow-hidden shadow-sm">
                <div className="relative group cursor-pointer" onClick={() => openLightbox(0)}>
                  <div className="aspect-[4/3] bg-gray-100">
                    <img
                      src={project.thumbnail || "/placeholder.svg"}
                      alt={project.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ZoomIn className="w-5 h-5 text-gray-700" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Project Info - Right side on desktop */}
          <div className={`${project.thumbnail ? "lg:col-span-2" : "lg:col-span-3"} flex flex-col justify-center`}>
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{project.name}</h1>
                {project.description && <p className="text-lg text-gray-600 leading-relaxed">{project.description}</p>}
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="flex items-center px-3 py-1.5">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {allImages.length} {allImages.length === 1 ? "image" : "images"}
                </Badge>
                <Badge variant="outline" className="flex items-center px-3 py-1.5">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(project.createdAt)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Image Gallery */}
      {project.imageUrls.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Project Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {project.imageUrls.map((imageUrl, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  className="group cursor-pointer"
                  onClick={() => openLightbox(project.thumbnail ? index + 1 : index)}
                >
                  <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="relative">
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt={`${project.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ZoomIn className="w-4 h-4 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {allImages.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 border-t">
          <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images available</h3>
          <p className="text-gray-500 text-sm">This project doesn't have any images yet.</p>
        </motion.div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={allImages[selectedImageIndex] || "/placeholder.svg"}
                  alt={`${project.name} - Image ${selectedImageIndex + 1}`}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white border-0 rounded-full w-10 h-10 p-0"
                  onClick={closeLightbox}
                >
                  <X className="w-5 h-5" />
                </Button>

                {/* Navigation Buttons */}
                {allImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white border-0 rounded-full w-10 h-10 p-0"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white border-0 rounded-full w-10 h-10 p-0"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </>
                )}
              </div>

              {/* Image Counter */}
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                {selectedImageIndex + 1} of {allImages.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProjectDetailClient
