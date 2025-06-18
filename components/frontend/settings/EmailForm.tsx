"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Mail, Shield, AlertTriangle } from "lucide-react"
import { updateEmail } from "@/actions/user-settings"
import { signOut } from "next-auth/react"

interface EmailFormProps {
  user: {
    email: string | null | undefined
    isVerfied: boolean
  }
}

export function EmailForm({ user }: EmailFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const onClientSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const result = await updateEmail(formData)

      if (result.success) {
        toast.success(result.message || "Email updated successfully, You will be signed out for security.")
        setTimeout(() => signOut({ callbackUrl: "/" }), 1500) // Delay for toast
      } else {
        toast.error(result.error || "Failed to update email")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle case where email might be null/undefined
  const userEmail = user.email || ""

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Address
        </CardTitle>
        <CardDescription>Manage your email address and verification status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={user.isVerfied ? "default" : "destructive"} className="flex items-center gap-1">
              {user.isVerfied ? <Shield className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {user.isVerfied ? "Verified" : "Unverified"}
            </Badge>
            {!user.isVerfied && <p className="text-sm text-muted-foreground">Please verify your email address</p>}
          </div>

          <form onSubmit={onClientSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={userEmail}
                required
                className="transition-all duration-200 focus:scale-[1.02]"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full md:w-auto group">
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              )}
              {isLoading ? "Updating..." : "Update Email"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
