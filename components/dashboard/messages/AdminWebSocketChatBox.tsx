"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Mail, User, MessageCircle, Clock, CheckCheck } from "lucide-react"
import { useChatSocket } from "@/hooks/use-chat-socket"
import type { ChatMessage, ConversationDetails } from "@/types/conversation"

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

interface AdminWebSocketChatBoxProps {
  conversationId: string
  currentUserId: string
}

export function AdminWebSocketChatBox({ conversationId, currentUserId }: AdminWebSocketChatBoxProps) {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [conversationDetails, setConversationDetails] = useState<ConversationDetails | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, setMessages, sendMessage, startTyping, stopTyping, typingUsers, isConnected, error, setError } =
    useChatSocket({ conversationId, currentUserId })

  useEffect(() => {
    if (conversationId) {
      loadConversationDetails()
      loadInitialMessages()
    }
  }, [conversationId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadConversationDetails = async () => {
    const details = await getConversationDetails(conversationId)
    setConversationDetails(details)
  }

  const loadInitialMessages = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      if (response.ok) {
        const initialMessages = await response.json()
        setMessages(initialMessages)
      }
    } catch (error) {
      console.error("Failed to load initial messages:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)

    if (value.trim()) {
      startTyping()
    } else {
      stopTyping()
    }
  }

  const handleSend = () => {
    if (!input.trim() || loading || !isConnected) return

    setLoading(true)
    const messageContent = input.trim()
    setInput("")
    stopTyping()

    sendMessage(messageContent)
    setLoading(false)

    // Focus back to input
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
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
                  {isConnected ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Online
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                      Connecting...
                    </Badge>
                  )}
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
          <div className="flex items-center justify-between">
            <div className="text-red-700 text-sm">
              <strong>Error:</strong> {error}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="h-auto p-1 text-red-700 hover:text-red-900"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {messages.length === 0 ? (
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
                      <span className="text-xs text-gray-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(group.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Messages in group */}
                  <div className="space-y-1">
                    {group.messages.map((msg: ChatMessage, msgIndex: number) => (
                      <div key={msg.id || msgIndex} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm relative ${
                            isSender
                              ? "bg-sky-500 text-white rounded-br-md"
                              : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
                          } ${msg.isOptimistic ? "opacity-60" : ""}`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                          {/* Message status indicators for admin messages */}
                          {isSender && !msg.isOptimistic && (
                            <div className="flex items-center justify-end mt-1">
                              <CheckCheck className="w-3 h-3 text-white/70" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Typing indicators */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">Customer is typing...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>

      {/* Message Input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex space-x-3">
          <Input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={isConnected ? "Type your response..." : "Connecting..."}
            disabled={loading || !isConnected}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim() || loading || !isConnected} className="px-6">
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>

        {!isConnected && <p className="text-xs text-amber-600 mt-1">Reconnecting to chat server...</p>}
      </div>
    </div>
  )
}
