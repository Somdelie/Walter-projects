"use client"

import { sendMessage } from "@/actions/messages"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Mail, User, MessageCircle } from "lucide-react"
import type { ChatMessage, ConversationDetails } from "@/types/conversation"

async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  try {
    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error in getMessages:", error)
    throw error
  }
}

async function getConversationDetails(conversationId: string): Promise<ConversationDetails | null> {
  try {
    const response = await fetch(`/api/conversations/${conversationId}`, {
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to fetch conversation details")
    return response.json()
  } catch (error) {
    console.error("Error fetching conversation details:", error)
    return null
  }
}

interface AdminChatBoxProps {
  conversationId: string
  currentUserId: string
}

export function AdminChatBox({ conversationId, currentUserId }: AdminChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationDetails, setConversationDetails] = useState<ConversationDetails | null>(null)

  useEffect(() => {
    if (conversationId) {
      loadConversationDetails()
      fetchMessages()
    }
  }, [conversationId])

  const loadConversationDetails = async () => {
    const details = await getConversationDetails(conversationId)
    setConversationDetails(details)
  }

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      const existingMessages = await getMessages(conversationId)
      setMessages(existingMessages)
    } catch (error) {
      console.error("Failed to fetch messages:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch messages")
    } finally {
      setLoading(false)
    }
  }

  // Set up SSE for real-time messages
  useEffect(() => {
    if (!conversationId) return

    const eventSource = new EventSource(`/api/conversations/${conversationId}/stream`)

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.type === "new_message") {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === payload.data.id)
            if (exists) return prev
            return [...prev, payload.data]
          })
        }
      } catch (parseError) {
        console.error("Error parsing SSE message:", parseError)
      }
    }

    return () => {
      eventSource.close()
    }
  }, [conversationId])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    try {
      setLoading(true)
      setError(null)

      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        content: input.trim(),
        senderId: currentUserId,
        conversationId,
        createdAt: new Date().toISOString(),
        isRead: false,
        sender: {
          id: currentUserId,
          name: "You",
        },
        isOptimistic: true,
      }

      setMessages((prev) => [...prev, optimisticMessage])
      const messageContent = input.trim()
      setInput("")

      await sendMessage(conversationId, messageContent)

      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id))
    } catch (error) {
      console.error("Failed to send message:", error)
      setError(error instanceof Error ? error.message : "Failed to send message")
      setInput(input)
      setMessages((prev) => prev.filter((msg) => !msg.isOptimistic))
    } finally {
      setLoading(false)
    }
  }

  const customer = conversationDetails?.customer

  // Group messages by sender and time
  const groupedMessages = messages.reduce((groups: any[], message, index) => {
    const prevMessage = messages[index - 1]
    const isSameSender = prevMessage && prevMessage.senderId === message.senderId
    const timeDiff = prevMessage ? new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() : 0
    const isWithinTimeGroup = timeDiff < 5 * 60 * 1000 // 5 minutes

    if (!isSameSender || !isWithinTimeGroup) {
      groups.push({
        senderId: message.senderId,
        senderName: message.senderId === currentUserId ? "You" : message.sender.firstName || message.sender.name,
        messages: [message],
        timestamp: message.createdAt,
      })
    } else {
      groups[groups.length - 1].messages.push(message)
    }

    return groups
  }, [])

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header with Customer Info */}
      {customer && (
        <CardHeader className="border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={customer.image || "/placeholder.svg"} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {customer.firstName?.[0]}
                  {customer.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {customer.firstName} {customer.lastName}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{customer.email}</span>
                  </div>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <User className="w-3 h-3 mr-1" />
              Customer
            </Badge>
          </div>
        </CardHeader>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="text-red-700 text-sm">
            <strong>Error:</strong> {error}
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-2 h-auto p-1">
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {loading && messages.length === 0 ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No messages yet</p>
            <p className="text-sm">Start the conversation with your customer</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedMessages.map((group, groupIndex) => {
              const isSender = group.senderId === currentUserId
              return (
                <div key={groupIndex} className="space-y-2">
                  {/* Sender name and timestamp */}
                  <div className={`flex items-center ${isSender ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex items-center space-x-2 ${isSender ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      <span className="text-xs font-medium text-gray-700">{group.senderName}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(group.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Messages in group */}
                  <div className="space-y-1">
                    {group.messages.map((msg: ChatMessage, msgIndex: number) => (
                      <div key={msg.id || msgIndex} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
                            isSender
                              ? "bg-sky-500 text-white rounded-br-md"
                              : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
                          } ${msg.isOptimistic ? "opacity-60" : ""}`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      {/* Message Input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex space-x-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type your response..."
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim() || loading} className="px-6">
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
