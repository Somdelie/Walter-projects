"use server"

import { cache } from "react"
import { revalidatePath } from "next/cache"
import { db } from "@/prisma/db"

// Define the type for a gallery item based on your Prisma schema
export type GalleryItem = {
  id: string
  title: string
  description: string | null
  imageUrl: string
  createdAt: Date
  updatedAt: Date | null
}

// Type for creating/updating gallery items
export type GalleryFormInput = {
  title: string
  description?: string | null
  imageUrl: string
}

// Get all gallery items (for admin view)
export const getAllGalleryItems = cache(
  async (): Promise<{ success: boolean; data: GalleryItem[] | null; message?: string }> => {
    try {
      const items = await db.gallery.findMany({
        orderBy: { createdAt: "desc" },
      })
      return { success: true, data: items }
    } catch (error) {
      console.error("Error fetching gallery items:", error)
      return { success: false, data: null, message: "Failed to fetch gallery items." }
    }
  },
)

// Create a new gallery item
export async function createGalleryItem(data: GalleryFormInput) {
  try {

    // check existing items for the same title
    const existingItem = await db.gallery.findFirst({
      where: { title: data.title },
    })
    if (existingItem) {
      return { success: false, message: "Gallery item with this title already exists." }
    }
    const newItem = await db.gallery.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
      },
    })
    revalidatePath("/admin/gallery")
    return { success: true, message: "Gallery item created successfully!", data: newItem }
  } catch (error) {
    console.error("Error creating gallery item:", error)
    return { success: false, message: "Failed to create gallery item." }
  }
}

// Update an existing gallery item
export async function updateGalleryItem(id: string, data: GalleryFormInput) {
  try {
    const updatedItem = await db.gallery.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        updatedAt: new Date(),
      },
    })
    revalidatePath("/admin/gallery")
    return { success: true, message: "Gallery item updated successfully!", data: updatedItem }
  } catch (error) {
    console.error("Error updating gallery item:", error)
    return { success: false, message: "Failed to update gallery item." }
  }
}

// Delete a gallery item
export async function deleteGalleryItem(id: string) {
  try {
    await db.gallery.delete({
      where: { id },
    })
    revalidatePath("/admin/gallery")
    return { success: true, message: "Gallery item deleted successfully!" }
  } catch (error) {
    console.error("Error deleting gallery item:", error)
    return { success: false, message: "Failed to delete gallery item." }
  }
}
