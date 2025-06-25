"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Crown, Mail } from "lucide-react"

interface CreateConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateConversation: (participantId?: string) => void
  isAdmin: boolean
}

export function CreateConversationDialog({
  open,
  onOpenChange,
  onCreateConversation,
  isAdmin,
}: CreateConversationDialogProps) {
  const [users, setUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && isAdmin) {
      loadUsers()
    }
  }, [open, isAdmin])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    )
  })

  const handleCreateConversation = (participantId?: string) => {
    onCreateConversation(participantId)
    setSearchTerm("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
          <DialogDescription>
            {isAdmin
              ? "Select a user to start a conversation with, or create a general conversation."
              : "Create a new conversation with support."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isAdmin ? (
            <div className="text-center py-4">
              <Button onClick={() => handleCreateConversation()} className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Start Conversation with Support
              </Button>
            </div>
          ) : (
            <>
              {/* Quick Actions */}
              <div className="space-y-2">
                <Button variant="outline" onClick={() => handleCreateConversation()} className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Create General Conversation
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Users List */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 p-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    {searchTerm ? "No users found" : "No users available"}
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleCreateConversation(user.id)}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.image || "/placeholder.svg"} />
                        <AvatarFallback>
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900 truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.isAdmin && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              <Crown className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
