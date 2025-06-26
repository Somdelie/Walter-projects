import { NextResponse } from "next/server"
import { getOnlineUsers } from "@/lib/chat-events"

export async function GET() {
  try {
    const onlineUsers = getOnlineUsers()
    return NextResponse.json({ onlineUsers })
  } catch (error) {
    console.error("Error fetching online users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
