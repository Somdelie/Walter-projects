"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Plus, Search, Mail } from "lucide-react"
import { CreateConversationDialog } from "./create-conversation-dialog"
import { ConnectionStatus } from "../connection-status"
import { WebSocketChatBox } from "../websocket-chat-box"

interface Conversation {
  id: string
  createdAt: string // Add this line
  customer: {
    id: string
    name: string
    firstName: string
    lastName: string
    email: string
    image: string | null
  }
  admin: {
    id: string
    name: string
    firstName: string
    lastName: string
    email: string
    image: string | null
  }
  lastMessage: {
    id: string
    content: string
    createdAt: string
    sender: {
      id: string
      name: string
    }
  } | null
  unreadCount: number
  updatedAt: string
}

interface ChatDashboardProps {
  currentUserId: string
  isAdmin: boolean
}

export function ChatDashboard({ currentUserId, isAdmin }: ChatDashboardProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/conversations", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId)
  }

  const handleNewConversation = async (participantId?: string) => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ participantId }),
      })

      if (response.ok) {
        const newConversation = await response.json()
        setConversations((prev) => [newConversation, ...prev])
        setSelectedConversationId(newConversation.id)
        setShowCreateDialog(false)
      }
    } catch (error) {
      console.error("Failed to create conversation:", error)
    }
  }

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.customer.id === currentUserId ? conv.admin : conv.customer
    const searchLower = searchTerm.toLowerCase()

    return (
      otherParticipant.firstName.toLowerCase().includes(searchLower) ||
      otherParticipant.lastName.toLowerCase().includes(searchLower) ||
      otherParticipant.email.toLowerCase().includes(searchLower) ||
      conv.lastMessage?.content.toLowerCase().includes(searchLower)
    )
  })

  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId)

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-96 border-r bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-600">
                {conversations.length} conversations • {conversations.reduce((acc, conv) => acc + conv.unreadCount, 0)}{" "}
                unread
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <ConnectionStatus />
              <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
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
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? (
                <>
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No conversations found</p>
                  <p className="text-sm">Try adjusting your search terms</p>
                </>
              ) : (
                <>
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No conversations yet</p>
                  <p className="text-sm mb-4">Start a new conversation to get started</p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Start New Conversation
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => {
                const isSelected = selectedConversationId === conversation.id
                const otherParticipant =
                  conversation.customer.id === currentUserId ? conversation.admin : conversation.customer

                return (
                  <Card
                    key={conversation.id}
                    className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                      isSelected ? "bg-blue-50 border-blue-200 shadow-sm" : ""
                    } ${conversation.unreadCount > 0 ? "border-l-4 border-l-blue-500" : ""}`}
                    onClick={() => handleConversationSelect(conversation.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={otherParticipant.image || "/placeholder.svg"} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {otherParticipant.firstName[0]}
                            {otherParticipant.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">
                              {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {otherParticipant.firstName} {otherParticipant.lastName}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {conversation.lastMessage
                              ? formatTime(conversation.lastMessage.createdAt)
                              : formatTime(conversation.updatedAt)}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 mb-2">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 truncate">{otherParticipant.email}</span>
                        </div>

                        {conversation.lastMessage && (
                          <p
                            className={`text-sm truncate ${
                              conversation.unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-600"
                            }`}
                          >
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

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId && selectedConversation ? (
          <WebSocketChatBox
            conversationId={selectedConversationId}
            currentUserId={currentUserId}
            conversationDetails={selectedConversation}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <Card className="p-8 text-center max-w-md">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500 mb-4">Choose a conversation from the sidebar to start chatting</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Start New Conversation
              </Button>
            </Card>
          </div>
        )}
      </div>

      {/* Create Conversation Dialog */}
      <CreateConversationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateConversation={handleNewConversation}
        isAdmin={isAdmin}
      />
    </div>
  )
}
