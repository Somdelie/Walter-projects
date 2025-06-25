"use client"

import { sendMessage } from "@/actions/messages"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import type { ChatMessage, ConversationDetails } from "@/types/conversation"

async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const response = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

async function getConversationDetails(conversationId: string): Promise<ConversationDetails | null> {
  try {
    const response = await fetch(`/api/conversations/${conversationId}`, { credentials: "include" })
    if (!response.ok) throw new Error("Failed to fetch conversation details")
    return response.json()
  } catch (error) {
    console.error("Error fetching conversation details:", error)
    return null
  }
}

interface ChatBoxProps {
  initialConversationId: string | null
  currentUserId: string
}

export function ChatBox({ initialConversationId, currentUserId }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationDetails, setConversationDetails] = useState<ConversationDetails | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setConversationId(initialConversationId)
    if (initialConversationId) loadConversationDetails(initialConversationId)
  }, [initialConversationId])

  const loadConversationDetails = async (convId: string) => {
    const details = await getConversationDetails(convId)
    setConversationDetails(details)
  }

  useEffect(() => {
    if (!conversationId) return
    const fetchExistingMessages = async () => {
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
    fetchExistingMessages()
  }, [conversationId])

  useEffect(() => {
    if (!conversationId) return
    const eventSource = new EventSource(`/api/conversations/${conversationId}/stream`)
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.type === "new_message") {
          setMessages((prev) => {
            const exists = prev.some(
              (msg) => msg.id === payload.data.id || (msg.content === payload.data.content && msg.senderId === payload.data.senderId)
            )
            if (exists) return prev
            return [...prev, payload.data]
          })
        }
      } catch (parseError) {
        console.error("Error parsing SSE message:", parseError)
      }
    }
    eventSource.onerror = (error) => console.error("SSE error:", error)
    return () => eventSource.close()
  }, [conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading || !currentUserId) return
    try {
      setLoading(true)
      setError(null)
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        content: input.trim(),
        senderId: currentUserId,
        conversationId: conversationId || "pending",
        createdAt: new Date().toISOString(),
        isRead: false,
        sender: { id: currentUserId, name: "You" },
        isOptimistic: true,
      }
      setMessages((prev) => [...prev, optimisticMessage])
      setInput("")
      const message = await sendMessage(conversationId, optimisticMessage.content)
      if (!conversationId) setConversationId(message.conversationId)
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

  const getOtherParticipant = () => {
    if (!conversationDetails || !currentUserId) return null
    return conversationDetails.customer?.id === currentUserId ? conversationDetails.admin : conversationDetails.customer
  }

  const otherParticipant = getOtherParticipant()

  const groupedMessages =
    currentUserId && messages.length > 0
      ? messages.reduce((groups: any[], message, index) => {
          const prev = messages[index - 1]
          const isSameSender = prev && prev.senderId === message.senderId
          const timeDiff = prev ? new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime() : 0
          const isWithinTimeGroup = timeDiff < 5 * 60 * 1000
          if (!isSameSender || !isWithinTimeGroup) {
            groups.push({
              senderId: message.senderId,
              senderName: message.sender.name,
              messages: [message],
              timestamp: message.createdAt,
            })
          } else {
            groups[groups.length - 1].messages.push(message)
          }
          return groups
        }, [])
      : []

  return (
    <div className="h-full flex flex-col">
      {otherParticipant && (
        <CardHeader className="border-b bg-white">
          <div className="flex items-center space-x-3">
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
          </div>
        </CardHeader>
      )}

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

      <CardContent className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading && messages.length === 0 ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
        ) : (
          <div className="space-y-6">
            {groupedMessages.map((group, groupIndex) => {
              const isSender = group.senderId === currentUserId
              return (
                <div key={groupIndex} className="space-y-2">
                  <div className={`flex items-center ${isSender ? "justify-end" : "justify-start"}`}>
                    <div className={`flex items-center space-x-2 ${isSender ? "flex-row-reverse space-x-reverse" : ""}`}>
                      <span className="text-xs font-medium text-gray-700">{isSender ? "You" : group.senderName}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(group.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {group.messages.map((msg: ChatMessage, msgIndex: number) => (
                      <div key={msgIndex} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
                            isSender
                              ? "bg-sky-500 text-white rounded-br-md"
                              : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
                          }`}
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

      <div className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim() || loading} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}