"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Send, Search, Users, CheckCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
}

interface ChatDashboardProps {
  currentUserId: string
  isAdmin: boolean
}

const ChatDashboard = ({ currentUserId, isAdmin }: ChatDashboardProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [typingUsers, setTypingUsers] = useState<Map<string, { name: string; conversationId: string }>>(new Map())
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [admins, setAdmins] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesScrollRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesScrollRef.current) {
      const scrollContainer = messagesScrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth"
        })
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch current user info
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`/api/users/${currentUserId}`)
      const userData = await response.json()
      setCurrentUser(userData)
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/conversations?userId=${currentUserId}&isAdmin=${isAdmin}`)
      const data = await response.json()
      setConversations(data)
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
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  // Fetch admins for customer view
  const fetchAdmins = async () => {
    if (!isAdmin) {
      try {
        const response = await fetch("/api/users/admins")
        const data = await response.json()
        setAdmins(data)
      } catch (error) {
        console.error("Error fetching admins:", error)
      }
    }
  }

  // Fetch online users
  const fetchOnlineUsers = async () => {
    try {
      const response = await fetch("/api/chat/online-users")
      const data = await response.json()
      setOnlineUsers(new Set(data.onlineUsers))
    } catch (error) {
      console.error("Error fetching online users:", error)
    }
  }

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    async (isTyping: boolean) => {
      if (!selectedConversation || !currentUser) return

      try {
        await fetch("/api/chat/typing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: selectedConversation,
            userId: currentUserId,
            isTyping,
            userName: currentUser.name,
          }),
        })
      } catch (error) {
        console.error("Error sending typing indicator:", error)
      }
    },
    [selectedConversation, currentUserId, currentUser],
  )

  // Handle typing
  const handleTyping = () => {
    sendTypingIndicator(true)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false)
    }, 2000)
  }

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    // Stop typing indicator
    sendTypingIndicator(false)

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

  // Start new conversation (customer only)
  const startNewConversation = async (adminId: string) => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: currentUserId,
          adminId,
        }),
      })

      const conversation = await response.json()
      setConversations((prev) => [conversation, ...prev])
      setSelectedConversation(conversation.id)
      setMessages([])
    } catch (error) {
      console.error("Error starting conversation:", error)
    }
  }

  // Setup SSE connection for real-time updates
  useEffect(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const eventSource = new EventSource(`/api/chat/events?userId=${currentUserId}&isAdmin=${isAdmin}`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log("SSE connection opened")
      fetchOnlineUsers()
    }

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log("SSE message received:", data)

      switch (data.type) {
        case "new_message":
          if (data.conversationId === selectedConversation) {
            setMessages((prev) => {
              // Avoid duplicate messages
              const messageExists = prev.some((msg) => msg.id === data.message.id)
              if (messageExists) return prev
              return [...prev, data.message]
            })
          }
          // Refresh conversations to update last message and unread count
          fetchConversations()
          break

        case "typing":
          if (data.conversationId === selectedConversation && data.userId !== currentUserId) {
            setTypingUsers((prev) => {
              const newMap = new Map(prev)
              if (data.isTyping) {
                newMap.set(data.userId, { name: data.userName, conversationId: data.conversationId })
              } else {
                newMap.delete(data.userId)
              }
              return newMap
            })
          }
          break

        case "connected":
          fetchOnlineUsers()
          break

        case "ping":
          // Keep alive
          break

        default:
          console.log("Unknown SSE message type:", data.type)
      }
    }

    eventSource.onerror = (error) => {
      console.error("SSE error:", error)
      // Reconnect after a delay
      setTimeout(() => {
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log("Attempting to reconnect SSE...")
          // The useEffect will handle reconnection
        }
      }, 5000)
    }

    return () => {
      eventSource.close()
    }
  }, [currentUserId, isAdmin, selectedConversation])

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    fetchCurrentUser()
    fetchConversations()
    fetchAdmins()
    fetchOnlineUsers()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
      // Clear typing users when switching conversations
      setTypingUsers(new Map())
    }
  }, [selectedConversation])

  // Fixed filteredConversations with null checks
  const filteredConversations = conversations.filter((conv) => {
    // Check if customer and admin exist and have names
    if (!conv.customer?.name || !conv.admin?.name) {
      return false
    }
    
    return (
      conv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.admin.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    return date.toLocaleDateString()
  }

  // Get typing users for current conversation
  const currentTypingUsers = Array.from(typingUsers.values()).filter(
    (user) => user.conversationId === selectedConversation,
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {isAdmin ? "Support Dashboard" : "Customer Support"}
            </h2>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {conversations.length}
            </Badge>
          </div>

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

        {/* New Conversation (Customer only) */}
        {!isAdmin && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Start New Chat</h3>
            <div className="space-y-2">
              {admins.map((admin) => (
                <Button
                  key={admin.id}
                  variant="outline"
                  size="sm"
                  onClick={() => startNewConversation(admin.id)}
                  className="w-full justify-start"
                >
                  <Avatar className="w-6 h-6 mr-2">
                    <AvatarImage src={admin.image || "/placeholder.svg"} />
                    <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {admin.name}
                  <div
                    className={`ml-auto w-2 h-2 rounded-full ${
                      onlineUsers.has(admin.id) ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            <AnimatePresence>
              {filteredConversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                    selectedConversation === conversation.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={isAdmin ? conversation.customer?.image : conversation.admin?.image} />
                        <AvatarFallback>
                          {isAdmin ? conversation.customer?.name?.charAt(0) : conversation.admin?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          onlineUsers.has(isAdmin ? conversation.customer?.id || "" : conversation.admin?.id || "")
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {isAdmin ? conversation.customer?.name || "Unknown Customer" : conversation.admin?.name || "Unknown Admin"}
                        </p>
                        <div className="flex items-center space-x-1">
                          {conversation._count.messages > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation._count.messages}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">{formatTime(conversation.updatedAt)}</span>
                        </div>
                      </div>

                      {conversation.messages?.[0] && (
                        <p className="text-sm text-gray-600 truncate mt-1">{conversation.messages[0].content}</p>
                      )}

                      {/* Show typing indicator in conversation list */}
                      {typingUsers.has(isAdmin ? conversation.customer?.id || "" : conversation.admin?.id || "") && (
                        <p className="text-xs text-blue-600 italic mt-1">typing...</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
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
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={
                      conversations.find((c) => c.id === selectedConversation)?.[isAdmin ? "customer" : "admin"]?.image
                    }
                  />
                  <AvatarFallback>
                    {conversations
                      .find((c) => c.id === selectedConversation)
                      ?.[isAdmin ? "customer" : "admin"]?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {conversations.find((c) => c.id === selectedConversation)?.[isAdmin ? "customer" : "admin"]?.name || "Unknown User"}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        onlineUsers.has(
                          conversations.find((c) => c.id === selectedConversation)?.[isAdmin ? "customer" : "admin"]
                            ?.id || "",
                        )
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    <span>
                      {onlineUsers.has(
                        conversations.find((c) => c.id === selectedConversation)?.[isAdmin ? "customer" : "admin"]
                          ?.id || "",
                      )
                        ? "Online"
                        : "Offline"}
                    </span>
                    {currentTypingUsers.length > 0 && <span className="text-blue-600">• typing...</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={messagesScrollRef}>
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender.id === currentUserId ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender.id === currentUserId
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-200"
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
                            <CheckCheck className={`w-3 h-3 ${message.isRead ? "text-blue-200" : "text-blue-300"}`} />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                <AnimatePresence>
                  {currentTypingUsers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
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
                          <span className="text-xs text-gray-500">
                            {currentTypingUsers.map((user) => user.name).join(", ")} typing...
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value)
                    handleTyping()
                  }}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isAdmin ? "Select a conversation" : "Start a conversation"}
              </h3>
              <p className="text-gray-500">
                {isAdmin
                  ? "Choose a conversation from the sidebar to start chatting"
                  : "Select an admin to start getting help"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatDashboard