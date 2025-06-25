import { getAuthenticatedUser } from "@/config/useAuth"
import { db } from "@/prisma/db"
import { WebSocketChatBox } from "@/components/websocket-chat-box"
import { redirect } from "next/navigation"

interface ChatPageProps {
  params: Promise<{ id: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  try {
    const { id: conversationId } = await params
    const user = await getAuthenticatedUser()

    // Verify user has access to this conversation
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ customerId: user.id }, { adminId: user.id }],
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!conversation) {
      redirect("/chat")
    }

    return (
      <div className="h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto h-full p-4">
          <WebSocketChatBox
            conversationId={conversationId}
            currentUserId={user.id}
            conversationDetails={{
              ...conversation,
              createdAt: conversation.createdAt.toISOString(),
              updatedAt: conversation.updatedAt.toISOString(),
            }}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Chat page error:", error)
    redirect("/login")
  }
}
