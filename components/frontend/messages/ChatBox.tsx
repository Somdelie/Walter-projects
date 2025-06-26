"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Wifi, WifiOff, Users, RefreshCw } from "lucide-react"
import { useChatSSE } from "@/hooks/use-chat-sse"

interface ConversationDetails {
  id: string
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
}

interface SSEChatBoxProps {
  conversationId: string
  currentUserId: string
  conversationDetails?: ConversationDetails | null
}

export function SSEChatBox({ conversationId, currentUserId, conversationDetails }: SSEChatBoxProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, setMessages, sendMessage, isConnected, error, setError, reconnect } = useChatSSE({
    conversationId,
    currentUserId,
  })

  // Load initial messages from API
  useEffect(() => {
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

    if (conversationId) {
      loadInitialMessages()
    }
  }, [conversationId, setMessages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle sending messages
  const handleSend = () => {
    if (!input.trim() || !isConnected) return

    const messageContent = input.trim()
    setInput("")
    sendMessage(messageContent)
    inputRef.current?.focus()
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const otherParticipant =
    conversationDetails?.customer?.id === currentUserId ? conversationDetails?.admin : conversationDetails?.customer

  // Group messages by sender and time
  const groupedMessages = messages.reduce((groups: any[], message, index) => {
    const prevMessage = messages[index - 1]
    const isSameSender = prevMessage && prevMessage.senderId === message.senderId
    const timeDiff = prevMessage ? new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() : 0
    const isWithinTimeGroup = timeDiff < 5 * 60 * 1000 // 5 minutes

    if (!isSameSender || !isWithinTimeGroup) {
      groups.push({
        senderId: message.senderId,
        senderName: message.senderId === currentUserId ? "You" : message.sender.name,
        messages: [message],
        timestamp: message.createdAt,
      })
    } else {
      groups[groups.length - 1].messages.push(message)
    }

    return groups
  }, [])

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {otherParticipant && (
              <>
                <Avatar>
                  <AvatarImage src={otherParticipant.image || "/placeholder.svg"} />
                  <AvatarFallback>
                    {otherParticipant.firstName?.[0]}
                    {otherParticipant.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {otherParticipant.firstName} {otherParticipant.lastName}
                  </CardTitle>
                  <p className="text-sm text-gray-500">{otherParticipant.email}</p>
                </div>
              </>
            )}
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Wifi className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="destructive">
                <WifiOff className="w-3 h-3 mr-1" />
                Reconnecting...
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={reconnect}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

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

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Start the conversation</p>
            <p className="text-sm">Messages will appear here in real-time</p>
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
                    {group.messages.map((msg: any, msgIndex: number) => (
                      <div key={msg.id || msgIndex} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm transition-opacity ${
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

            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim() || !isConnected} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {!isConnected && (
          <p className="text-xs text-amber-600 mt-1 flex items-center">
            <WifiOff className="w-3 h-3 mr-1" />
            Reconnecting to chat server...
          </p>
        )}
      </div>
    </Card>
  )
}
