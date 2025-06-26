import { type NextRequest, NextResponse } from "next/server"
import { broadcastToConversation } from "@/lib/chat-events"

export async function POST(request: NextRequest) {
  try {
    const { conversationId, userId, isTyping, userName } = await request.json()

    if (!conversationId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Broadcast typing status to other users in the conversation
    broadcastToConversation(conversationId, userId, {
      type: "typing",
      isTyping,
      userId,
      userName,
      conversationId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error broadcasting typing status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
