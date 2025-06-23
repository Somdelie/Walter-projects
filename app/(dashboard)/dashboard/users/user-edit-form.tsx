"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { User } from "@prisma/client"
import { UserEditData } from "@/types/user"
import { updateUser } from "@/actions/users"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageInput } from "@/components/FormInputs/ImageInput"


interface UserEditFormProps {
  user: User
  onSuccess?: () => void
  trigger: React.ReactNode
}

export function UserEditForm({ user, onSuccess, trigger }: UserEditFormProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
   const [imageUrl, setImageUrl] = useState(user.image || "");
  const [formData, setFormData] = useState<UserEditData>({
    phone: user.phone,
    status: user.status,
    emailVerified: user.emailVerified,
    isAdmin: user.isAdmin,
    image: user.image || null,
    role: null, // Replace with a valid property or set to null if not applicable
  })

const handleImageChange = (url: string) => {
  setImageUrl(url);
  setFormData((prev) => ({
    ...prev,
    image: url,
  }));
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateUser(user.id, formData)

      toast.success("User updated successfully")
      setOpen(false)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast.error("Failed to update user")
      console.error("Error updating user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserEditData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information. Only admin-editable fields are shown.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ScrollArea className="max-h-[60vh] overflow-y-auto pr-4">

          <div className="grid gap-4">
            {/* User Info Display */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">User Information</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <strong>Name:</strong> {user.name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>ID:</strong> {user.id}
                </p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            {/* Image URL */}
            {/* <div className="space-y-2">
              <Label htmlFor="image">Profile Image URL</Label>
              <Input
                id="image"
                type="url"
                value={formData.image || ""}
                onChange={(e) => handleInputChange("image", e.target.value || null)}
                placeholder="Enter image URL"
              />
            </div> */}

            {/* Email Verified Date */}
            <div className="space-y-2">
              <Label>Email Verified Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.emailVerified && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.emailVerified ? format(formData.emailVerified, "PPP") : <span>Not verified</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.emailVerified || undefined}
                    onSelect={(date) => handleInputChange("emailVerified", date || null)}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInputChange("emailVerified", null)}
                      className="w-full"
                    >
                      Clear verification
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="status">Account Status</Label>
                <div className="text-sm text-muted-foreground">{formData.status ? "Active" : "Inactive"}</div>
              </div>
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) => handleInputChange("status", checked)}
              />
            </div>

            {/* Admin Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isAdmin">Admin Privileges</Label>
                <div className="text-sm text-muted-foreground">{formData.isAdmin ? "Admin user" : "Regular user"}</div>
              </div>
              <Switch
                id="isAdmin"
                checked={formData.isAdmin}
                onCheckedChange={(checked) => handleInputChange("isAdmin", checked)}
              />
            </div>
          </div>
            <div className="space-y-2">
                      <label className="text-sm font-medium">User Avatar</label>
                      <div className="flex flex-col space-y-3 px-4 items-center w-full border-2 border-dashed border-orange-300 rounded-lg p-4">
                        {imageUrl && (
                          <div className="relative group w-full flex justify-center items-center">
                            <img
                              src={imageUrl}
                              alt="Category image"
                              className="w-24 h-24 object-cover rounded-md border shadow-sm"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.jpg";
                              }}
                            />
                          </div>
                        )}
                        
                        <ImageInput
                          title=""
                          imageUrl={imageUrl}
                          setImageUrl={handleImageChange}
                          endpoint="categoryImage"
                        />
                        
                        <p className="text-xs text-muted-foreground text-center">
                          Upload a high quality image for your category. JPG, PNG, and WebP formats supported (max 1MB).
                        </p>
                      </div>
                    </div>
</ScrollArea>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
