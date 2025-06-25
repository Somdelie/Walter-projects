"use client"

import { useState, useEffect } from "react"
import { getAdminConversations, markConversationAsRead, getConversationStats } from "@/actions/admin-conversations"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { MessageCircle, Search, Phone, Mail, Calendar } from "lucide-react"

interface AdminConversation {
  id: string
  customer: {
    id: string
    name: string
    firstName: string
    lastName: string
    email: string
    phone: string
    image: string | null
    createdAt: string
  }
  lastMessage: {
    id: string
    content: string
    createdAt: string
    sender: {
      id: string
      name: string
      firstName: string
      lastName: string
    }
  } | null
  unreadCount: number
  updatedAt: string
}

interface ConversationStats {
  totalConversations: number
  unreadConversations: number
  todayMessages: number
}

interface AdminConversationListProps {
  adminId: string
  selectedConversationId?: string
  onConversationSelect: (conversationId: string) => void
  onStatsUpdate: (stats: ConversationStats) => void
}

export function AdminConversationList({
  adminId,
  selectedConversationId,
  onConversationSelect,
  onStatsUpdate,
}: AdminConversationListProps) {
  const [conversations, setConversations] = useState<AdminConversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<AdminConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    // Filter conversations based on search term
    if (searchTerm.trim() === "") {
      setFilteredConversations(conversations)
    } else {
      const filtered = conversations.filter(
        (conv) =>
          conv.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.customer.phone.includes(searchTerm) ||
          conv.lastMessage?.content.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredConversations(filtered)
    }
  }, [conversations, searchTerm])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await getAdminConversations()
      setConversations(data)

      // Update stats when conversations are loaded
      const stats = await getConversationStats()
      onStatsUpdate(stats)
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleConversationSelect = async (conversationId: string) => {
    onConversationSelect(conversationId)

    // Mark conversation as read
    try {
      await markConversationAsRead(conversationId)

      // Update local state to reflect read status
      setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv)))

      // Update stats after marking as read
      const stats = await getConversationStats()
      onStatsUpdate(stats)
    } catch (error) {
      console.error("Failed to mark conversation as read:", error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const formatCustomerSince = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString([], { year: "numeric", month: "short" })
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
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Customer Messages</h2>
            <p className="text-sm text-gray-600">
              {conversations.length} conversations • {conversations.reduce((acc, conv) => acc + conv.unreadCount, 0)}{" "}
              unread
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search customers or messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
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
                <p className="text-lg font-medium mb-2">No customer messages</p>
                <p className="text-sm">Customer conversations will appear here</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => {
              const isSelected = selectedConversationId === conversation.id
              const customer = conversation.customer

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
                        <AvatarImage src={customer.image || "/placeholder.svg"} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {customer.firstName[0]}
                          {customer.lastName[0]}
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
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessage
                            ? formatTime(conversation.lastMessage.createdAt)
                            : formatTime(conversation.updatedAt)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 mb-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Since {formatCustomerSince(customer.createdAt)}</span>
                        </div>
                      </div>

                      {conversation.lastMessage && (
                        <p
                          className={`text-sm truncate ${
                            conversation.unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-600"
                          }`}
                        >
                          {conversation.lastMessage.sender.id === customer.id ? "" : "You: "}
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
