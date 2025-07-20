"use client"

import { useState } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteGalleryItem, type GalleryItem } from "@/actions/gallery-actions"
import { GalleryForm } from "./gallery-form" // Import the form component

interface GalleryListProps {
  items: GalleryItem[]
}

export function GalleryList({ items }: GalleryListProps) {
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)

  const handleDelete = async (id: string) => {
    const result = await deleteGalleryItem(id)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message || "Failed to delete item.")
    }
  }

  const handleEditSuccess = () => {
    setEditingItem(null) // Close the edit dialog
    // The revalidatePath in the action will refresh the list
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-fadeInUp">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No gallery items found. Add one above!
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Image
                    src={item.imageUrl || "/placeholder.svg?height=60&width=60&text=No+Image"}
                    alt={item.title}
                    width={60}
                    height={60}
                    className="rounded-md object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell className="text-sm text-gray-600 truncate max-w-xs">
                  {item.description || "No description"}
                </TableCell>
                <TableCell>{format(new Date(item.createdAt), "MMM dd, yyyy")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <GalleryForm initialData={item} onSuccess={handleEditSuccess} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the gallery item &quot;
                            {item.title}&quot;.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
