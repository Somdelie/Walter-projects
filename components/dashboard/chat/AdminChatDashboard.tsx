"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  Send,
  Search,
  CheckCheck,
  AlertCircle,
  Settings,
  MoreVertical,
  Archive,
  Star,
  Filter,
  Menu,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface User {
  id: string
  name: string
  image?: string
  email?: string
  isAdmin?: boolean
  status?: boolean
}

interface Message {
  id: string
  content: string
  createdAt: string
  isRead: boolean
  sender: User
}

interface Conversation {
  id: string
  customer: User
  admin: User
  messages: Message[]
  _count: {
    messages: number
  }
  updatedAt: string
  createdAt: string
}

interface AdminChatDashboardProps {
  currentUserId: string
}

const AdminChatDashboard = ({ currentUserId }: AdminChatDashboardProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    active: 0,
    resolved: 0,
  })

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesScrollRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesScrollRef.current) {
      const scrollContainer = messagesScrollRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth",
        })
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch conversations with admin-specific filtering
  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/conversations?userId=${currentUserId}&isAdmin=true`)
      const data = await response.json()
      setConversations(data)

      // Calculate stats
      const unreadCount = data.filter((conv: Conversation) => conv._count.messages > 0).length
      const activeCount = data.filter((conv: Conversation) => {
        const lastMessage = conv.messages[0]
        if (!lastMessage) return false
        const hoursSinceLastMessage =
          (new Date().getTime() - new Date(lastMessage.createdAt).getTime()) / (1000 * 60 * 60)
        return hoursSinceLastMessage < 24
      }).length

      setStats({
        total: data.length,
        unread: unreadCount,
        active: activeCount,
        resolved: data.length - activeCount,
      })
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      const data = await response.json()
      setMessages(data)

      // Mark messages as read
      await fetch("/api/messages/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, userId: currentUserId }),
      })

      // Refresh conversations to update unread count
      fetchConversations()
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
          conversationId: selectedConversation,
          senderId: currentUserId,
        }),
      })

      const message = await response.json()
      setMessages((prev) => [...prev, message])
      setNewMessage("")

      // Refresh conversations to update last message
      fetchConversations()
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  // Setup SSE connection for real-time updates
  useEffect(() => {
    const eventSource = new EventSource(`/api/chat/events?userId=${currentUserId}`)

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "new_message") {
        if (data.conversationId === selectedConversation) {
          setMessages((prev) => [...prev, data.message])
        }
        // Refresh conversations for new message indicator
        fetchConversations()
      } else if (data.type === "typing") {
        setIsTyping(data.isTyping)
      }
    }

    return () => eventSource.close()
  }, [currentUserId, selectedConversation])

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  // Filter conversations based on active tab
  const getFilteredConversations = () => {
    let filtered = conversations

    switch (activeTab) {
      case "unread":
        filtered = conversations.filter((conv) => conv._count.messages > 0)
        break
      case "active":
        filtered = conversations.filter((conv) => {
          const lastMessage = conv.messages[0]
          if (!lastMessage) return false
          const hoursSinceLastMessage =
            (new Date().getTime() - new Date(lastMessage.createdAt).getTime()) / (1000 * 60 * 60)
          return hoursSinceLastMessage < 24
        })
        break
      case "resolved":
        filtered = conversations.filter((conv) => {
          const lastMessage = conv.messages[0]
          if (!lastMessage) return true
          const hoursSinceLastMessage =
            (new Date().getTime() - new Date(lastMessage.createdAt).getTime()) / (1000 * 60 * 60)
          return hoursSinceLastMessage >= 24
        })
        break
      default:
        filtered = conversations
    }

    return filtered.filter(
      (conv) =>
        conv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.customer.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    }
    return date.toLocaleDateString()
  }

  const getConversationStatus = (conversation: Conversation) => {
    if (conversation._count.messages > 0) return "unread"

    const lastMessage = conversation.messages[0]
    if (!lastMessage) return "new"

    const hoursSinceLastMessage = (new Date().getTime() - new Date(lastMessage.createdAt).getTime()) / (1000 * 60 * 60)
    return hoursSinceLastMessage < 24 ? "active" : "resolved"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-md"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Admin Sidebar */}
      <div
        className={`
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        fixed lg:relative inset-y-0 left-0 z-40 w-80 lg:w-96 xl:w-[400px]
        bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
      `}
      >
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        {/* Admin Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
              <p className="text-sm text-gray-500">Customer Support Center</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Card className="p-2 lg:p-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-base lg:text-lg font-semibold">{stats.total}</p>
                </div>
              </div>
            </Card>
            <Card className="p-2 lg:p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-xs text-gray-500">Unread</p>
                  <p className="text-base lg:text-lg font-semibold">{stats.unread}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversation Tabs */}
        <div className="border-b border-gray-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 rounded-none h-10 lg:h-12">
              <TabsTrigger value="all" className="text-xs px-1">
                <span className="hidden sm:inline">All</span>
                <span className="sm:hidden">A</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {stats.total}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs px-1">
                <span className="hidden sm:inline">Unread</span>
                <span className="sm:hidden">U</span>
                {stats.unread > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {stats.unread}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs px-1">
                <span className="hidden sm:inline">Active</span>
                <span className="sm:hidden">Ac</span>
                <Badge variant="default" className="ml-1 text-xs">
                  {stats.active}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="resolved" className="text-xs px-1">
                <span className="hidden sm:inline">Resolved</span>
                <span className="sm:hidden">R</span>
                <Badge variant="outline" className="ml-1 text-xs">
                  {stats.resolved}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            <AnimatePresence>
              {getFilteredConversations().map((conversation) => {
                const status = getConversationStatus(conversation)
                return (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-4 lg:p-3 rounded-lg cursor-pointer transition-all mb-2 border ${
                      selectedConversation === conversation.id
                        ? "bg-blue-50 border-blue-200 shadow-sm"
                        : "hover:bg-gray-50 border-transparent"
                    }`}
                    onClick={() => {
                      setSelectedConversation(conversation.id)
                      setIsMobileMenuOpen(false) // Close mobile menu when selecting conversation
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conversation.customer.image || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                            {conversation.customer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            onlineUsers.has(conversation.customer.id) ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                        {status === "unread" && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 truncate">{conversation.customer.name}</p>
                            <p className="text-xs text-gray-500 truncate">{conversation.customer.email}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <span className="text-xs text-gray-500">{formatTime(conversation.updatedAt)}</span>
                            {conversation._count.messages > 0 && (
                              <Badge variant="destructive" className="text-xs h-5">
                                {conversation._count.messages}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          {conversation.messages[0] && (
                            <p className="text-sm text-gray-600 truncate flex-1">{conversation.messages[0].content}</p>
                          )}
                          <Badge
                            variant={status === "unread" ? "destructive" : status === "active" ? "default" : "outline"}
                            className="text-xs ml-2"
                          >
                            {status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={
                        conversations.find((c) => c.id === selectedConversation)?.customer?.image || "/placeholder.svg"
                      }
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                      {conversations.find((c) => c.id === selectedConversation)?.customer?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {conversations.find((c) => c.id === selectedConversation)?.customer?.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          onlineUsers.has(conversations.find((c) => c.id === selectedConversation)?.customer?.id || "")
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span>
                        {onlineUsers.has(conversations.find((c) => c.id === selectedConversation)?.customer?.id || "")
                          ? "Online"
                          : "Offline"}
                      </span>
                      <span>•</span>
                      <span>
                        Customer since{" "}
                        {new Date(
                          conversations.find((c) => c.id === selectedConversation)?.createdAt || "",
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Star className="w-4 h-4 mr-2" />
                      Mark as Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="w-4 h-4 mr-2" />
                      Archive Conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-gray-50" ref={messagesScrollRef}>
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender.id === currentUserId ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
                        {message.sender.id !== currentUserId && (
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={message.sender.image || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">{message.sender.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            message.sender.id === currentUserId
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-gray-200 shadow-sm"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div
                            className={`flex items-center justify-between mt-1 text-xs ${
                              message.sender.id === currentUserId ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            <span>{formatTime(message.createdAt)}</span>
                            {message.sender.id === currentUserId && (
                              <CheckCheck
                                className={`w-3 h-3 ml-2 ${message.isRead ? "text-blue-200" : "text-blue-300"}`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-end space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage
                            src={
                              conversations.find((c) => c.id === selectedConversation)?.customer?.image ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                          />
                          <AvatarFallback className="text-xs">
                            {conversations.find((c) => c.id === selectedConversation)?.customer?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-3 lg:p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your response..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 text-base lg:text-sm" // Prevent zoom on iOS
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()} size="sm" className="px-3">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Support Dashboard</h3>
              <p className="text-gray-500 mb-4">Select a conversation to start helping customers</p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>Unread</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Active</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <span>Resolved</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminChatDashboard
