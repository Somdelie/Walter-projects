"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Save, User } from "lucide-react"
import { updatePersonalInfo } from "@/actions/user-settings"

interface PersonalInfoFormProps {
  user: {
    firstName: string
    lastName: string
    phone: string | null
  }
}

export function PersonalInfoForm({ user }: PersonalInfoFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    try {
      const result = await updatePersonalInfo(formData)

      if (result.success) {
        toast.success("Personal information updated successfully")
      } else {
        toast.error(result.error || "Failed to update personal information")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Information
        </CardTitle>
        <CardDescription>Update your personal details and contact information</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={user.firstName}
                required
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={user.lastName}
                required
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={user.phone || ""}
              className="transition-all duration-200 focus:scale-[1.02]"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full md:w-auto group">
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            )}
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
