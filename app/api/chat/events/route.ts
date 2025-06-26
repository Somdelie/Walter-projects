import type { NextRequest } from "next/server"

// Store active connections with user info
const connections = new Map<string, { controller: ReadableStreamDefaultController; isAdmin: boolean }>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const isAdmin = searchParams.get("isAdmin") === "true"

  if (!userId) {
    return new Response("User ID required", { status: 400 })
  }

  const stream = new ReadableStream({
    start(controller) {
      connections.set(userId, { controller, isAdmin })

      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: "connected", userId })}\n\n`)

      // Keep connection alive
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ type: "ping" })}\n\n`)
        } catch (error) {
          clearInterval(keepAlive)
          connections.delete(userId)
        }
      }, 30000)

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive)
        connections.delete(userId)
        try {
          controller.close()
        } catch (error) {
          // Connection already closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

// Helper function to broadcast messages to specific users
export function broadcastToUser(userId: string, data: any) {
  const connection = connections.get(userId)
  if (connection) {
    try {
      connection.controller.enqueue(`data: ${JSON.stringify(data)}\n\n`)
    } catch (error) {
      connections.delete(userId)
    }
  }
}

// Helper function to broadcast to all users in a conversation
export function broadcastToConversation(conversationId: string, senderId: string, data: any) {
  connections.forEach((connection, userId) => {
    if (userId !== senderId) {
      try {
        connection.controller.enqueue(`data: ${JSON.stringify({ ...data, conversationId })}\n\n`)
      } catch (error) {
        connections.delete(userId)
      }
    }
  })
}

// Helper function to get online users
export function getOnlineUsers(): string[] {
  return Array.from(connections.keys())
}
