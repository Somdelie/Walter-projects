"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { toast } from "sonner"
import { Loader2, AlertTriangle, Trash2 } from "lucide-react"
import { deleteAccount } from "@/actions/user-settings"

export function DangerZone() {
  const [isLoading, setIsLoading] = useState(false)
  const [confirmation, setConfirmation] = useState("")

  async function handleDeleteAccount() {
    if (confirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("confirmation", confirmation)

      const result = await deleteAccount(formData)

      if (result.success) {
        toast.success(result.message || "Account deleted successfully")
        // Redirect to home or login page
        window.location.href = "/"
      } else {
        toast.error(result.error || "Failed to delete account")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400 border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>Irreversible and destructive actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <h4 className="font-medium text-destructive mb-2">Delete Account</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. This will permanently deactivate your account and
              remove your access to all services.
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="group">
                  <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      This action cannot be undone. This will permanently deactivate your account and remove your access
                      to all services.
                    </p>
                    <p className="font-medium">
                      Please type <span className="font-mono bg-muted px-1 rounded">DELETE</span> to confirm.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2">
                  <Label htmlFor="deleteConfirmation">Type DELETE to confirm</Label>
                  <Input
                    id="deleteConfirmation"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    placeholder="DELETE"
                    className="font-mono"
                  />
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmation("")}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isLoading || confirmation !== "DELETE"}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    {isLoading ? "Deleting..." : "Delete Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
