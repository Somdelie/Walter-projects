"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog" // Import DialogTitle
import type { GalleryItem } from "@/actions/gallery-actions"

interface GalleryCardProps {
  item: GalleryItem
}

export function GalleryCard({ item }: GalleryCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer">
          <div className="relative w-full h-60">
            <Image
              src={item.imageUrl || "/placeholder.svg"}
              alt={item.title}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 hover:scale-105"
              priority // Prioritize loading for initial view
            />
          </div>
          <CardHeader className="p-4">
            <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
            {item.description && (
              <CardDescription className="text-sm text-gray-600 line-clamp-2">{item.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-4 pt-0">{/* You can add more details or actions here */}</CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-lg">
        {/* Added DialogTitle for accessibility */}
        <DialogTitle className="sr-only">{item.title}</DialogTitle>
        <div className="relative w-full h-[calc(100vh-8rem)] max-h-[600px]">
          <Image
            src={item.imageUrl || "/placeholder.svg"}
            alt={item.title}
            layout="fill"
            objectFit="contain" // Use 'contain' to ensure the whole image is visible
            className="bg-black/70" // Add a black background for contrast
          />
        </div>
        <div className="p-4 bg-white border-t">
          <h3 className="text-xl font-bold">{item.title}</h3>
          {item.description && <p className="text-gray-600 text-sm mt-1">{item.description}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
