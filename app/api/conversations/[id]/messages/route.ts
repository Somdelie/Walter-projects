import { NextResponse } from "next/server"
import { db } from "@/prisma/db"
import { getAuthenticatedUser } from "@/config/useAuth"

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  },
) {
  try {
    console.log("API: Starting message fetch request")

    const conversationId = (await params).id
    console.log(`API: Conversation ID: ${conversationId}`)

    // Check if user is authenticated
    let user
    try {
      user = await getAuthenticatedUser()
      console.log(`API: Authenticated user: ${user.id}`)
    } catch (authError) {
      console.error("API: Authentication failed:", authError)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify user has access to this conversation
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ customerId: user.id }, { adminId: user.id }],
      },
    })

    if (!conversation) {
      console.log(`API: Conversation not found or access denied for user ${user.id}`)
      return NextResponse.json({ error: "Conversation not found or access denied" }, { status: 404 })
    }

    console.log(`API: Found conversation, fetching messages...`)

    // Fetch messages for this conversation
    const messages = await db.message.findMany({
      where: {
        conversationId: conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    console.log(`API: Found ${messages.length} messages`)

    // Transform messages to include sender info
    const transformedMessages = messages.map((message) => ({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      conversationId: message.conversationId,
      createdAt: message.createdAt.toISOString(),
      isRead: message.isRead,
      sender: message.sender,
    }))

    console.log(`API: Returning ${transformedMessages.length} transformed messages`)
    return NextResponse.json(transformedMessages)
  } catch (error) {
    console.error("API: Error fetching messages:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
