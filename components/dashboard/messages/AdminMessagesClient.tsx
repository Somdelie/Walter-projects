"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Users, TrendingUp } from "lucide-react"
import { AdminConversationList } from "./AdminConversationList"
import { AdminChatBox } from "./AdminChatBox"

interface ConversationStats {
  totalConversations: number
  unreadConversations: number
  todayMessages: number
}

interface AdminMessagesClientProps {
  adminId: string
  initialStats: ConversationStats
}

export function AdminMessagesClient({ adminId, initialStats }: AdminMessagesClientProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [stats, setStats] = useState<ConversationStats>(initialStats)

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId)
  }

  const handleStatsUpdate = (newStats: ConversationStats) => {
    setStats(newStats)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Stats Header */}
      <div className=" bg-white border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConversations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.unreadConversations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Messages</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayMessages}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-96 border-r bg-white">
          <AdminConversationList
            adminId={adminId}
            selectedConversationId={selectedConversationId || undefined}
            onConversationSelect={handleConversationSelect}
            onStatsUpdate={handleStatsUpdate}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversationId ? (
            <AdminChatBox conversationId={selectedConversationId} currentUserId={adminId} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <Card className="p-8 text-center max-w-md">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a customer conversation from the sidebar to start responding</p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
