"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { MessageCircle } from "lucide-react"
import { ConversationList } from "@/components/frontend/messages/ConversationList"
import { ChatBox } from "@/components/frontend/messages/ChatBox"

interface MessagesComponentProps {
  currentUserId: string
}

export function MessagesComponent({ currentUserId }: MessagesComponentProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId)
  }

  return (
    <div className="h-screen flex">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r bg-white">
        <ConversationList
          currentUserId={currentUserId}
          selectedConversationId={selectedConversationId || undefined}
          onConversationSelect={handleConversationSelect}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <ChatBox initialConversationId={selectedConversationId} currentUserId={currentUserId}/>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <Card className="p-8 text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}