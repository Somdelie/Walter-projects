"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { ConfirmationDialog } from "../ui/data-table"
import { EditCategoryForm } from "../Forms/CategoryEditForm"
import { deleteCategoryById } from "@/actions/categories"
import { deleteUser } from "@/actions/users"
import { UserEditForm } from "@/app/(dashboard)/dashboard/users/user-edit-form"

type ModelType = "user" | "category" | "role"

type ActionColumnProps = {
  row: any
  model: ModelType
  id?: string
  onRefetch?: () => void
}

export function ActionColumn({ row, model, id, onRefetch }: ActionColumnProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const data = row.original
  const displayName = model === "category" ? data.title : data.name

  const handleDelete = async () => {
    setIsDeleting(true)
    if (!id) {
      toast.error("Invalid ID provided for deletion");
      setIsDeleting(false);
      return;
    }

    try {
      if (model === "category") {
      const res =  await deleteCategoryById(id)
        if (!res.success) {
          setIsDeleting(false)
          toast.error(res.error || "Failed to delete category")
        }
      } else if (model === "user") {
        await deleteUser(id)
      }

      toast.success(`${model === "category" ? "Category" : "User"} deleted successfully`)
      setDeleteDialogOpen(false)
      setIsDeleting(false)
      // if (onRefetch) onRefetch()
    } catch (error) {
      toast.error(`Failed to delete ${model}`)
      console.error(`Delete ${model} error:`, error)
    }
  }

  const renderEditForm = () => {
    if (model === "category") {
      return (
        <DropdownMenuItem asChild>
          <EditCategoryForm
            category={data}
            onSuccess={onRefetch}
            trigger={
              <div className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-accent">
                <Edit className="h-4 w-4 mr-2" />
                Edit Category
              </div>
            }
          />
        </DropdownMenuItem>
      )
    }

    if (model === "user") {
      return (
        <DropdownMenuItem asChild>
          <UserEditForm
            user={data}
            onSuccess={onRefetch}
            trigger={
              <div className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-accent">
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </div>
            }
          />
        </DropdownMenuItem>
      )
    }

    return null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {renderEditForm()}

          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete {model === "category" ? "Category" : "User"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Delete ${model === "category" ? "Category" : "User"}`}
        description={
          <>
            Are you sure you want to delete{" "}
            <strong className="text-primary">{displayName}</strong>?<br />
            This action cannot be undone.
          </>
        }
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        confirmLabel={`Delete ${model === "category" ? "Category" : "User"}`}
        variant="destructive"
      />
    </>
  )
}
