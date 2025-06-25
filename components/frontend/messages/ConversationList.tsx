"use client"

import { useState, useEffect } from "react"
import { getUserConversations, createNewConversation, markConversationAsRead } from "@/actions/conversations"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Plus } from "lucide-react"
import type { Conversation } from "@/types/conversation"

interface ConversationListProps {
  currentUserId: string
  selectedConversationId?: string
  onConversationSelect: (conversationId: string) => void
}

export function ConversationList({
  currentUserId,
  selectedConversationId,
  onConversationSelect,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await getUserConversations()
      setConversations(data)
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = async () => {
    try {
      setCreating(true)
      const newConversation = await createNewConversation()
      await loadConversations() // Refresh the list
      onConversationSelect(newConversation.id)
    } catch (error) {
      console.error("Failed to create conversation:", error)
    } finally {
      setCreating(false)
    }
  }

  const handleConversationSelect = async (conversationId: string) => {
    onConversationSelect(conversationId)

    // Mark conversation as read
    try {
      await markConversationAsRead(conversationId)

      // Update local state to reflect read status
      setConversations((prev) => 
        prev.map((conv) => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 } 
            : conv
        )
      )
    } catch (error) {
      console.error("Failed to mark conversation as read:", error)
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.customer.id === currentUserId ? conversation.admin : conversation.customer
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      // Less than a week
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Messages</h2>
          <Button onClick={handleCreateNew} disabled={creating} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No conversations yet</p>
            <p className="text-sm">Start a new conversation to get started</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation)
              const isSelected = selectedConversationId === conversation.id

              return (
                <Card
                  key={conversation.id}
                  className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                    isSelected ? "bg-blue-50 border-blue-200" : ""
                  }`}
                  onClick={() => handleConversationSelect(conversation.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={otherParticipant.image || "/placeholder.svg"} />
                      <AvatarFallback>
                        {otherParticipant.firstName[0]}
                        {otherParticipant.lastName[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate">
                          {otherParticipant.firstName} {otherParticipant.lastName}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {conversation.lastMessage
                              ? formatTime(conversation.lastMessage.createdAt)
                              : formatTime(conversation.updatedAt)}
                          </span>
                        </div>
                      </div>

                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastMessage.sender.id === currentUserId ? "You: " : ""}
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}