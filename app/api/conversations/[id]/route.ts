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
    const conversationId = (await params).id
    const user = await getAuthenticatedUser()

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
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
