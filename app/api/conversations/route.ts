import { NextResponse } from "next/server"
import { db } from "@/prisma/db"
import { getAuthenticatedUser } from "@/config/useAuth"

// GET - Fetch user's conversations
export async function GET() {
  try {
    const user = await getAuthenticatedUser()

    const conversations = await db.conversation.findMany({
      where: {
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
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
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
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: {
                  not: user.id,
                },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    const transformedConversations = conversations.map((conv) => ({
      id: conv.id,
      customer: conv.customer,
      admin: conv.admin,
      lastMessage: conv.messages[0]
        ? {
            id: conv.messages[0].id,
            content: conv.messages[0].content,
            createdAt: conv.messages[0].createdAt.toISOString(),
            sender: conv.messages[0].sender,
          }
        : null,
      unreadCount: conv._count.messages,
      updatedAt: conv.updatedAt.toISOString(),
    }))

    return NextResponse.json(transformedConversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create new conversation
export async function POST(request: Request) {
  try {
    console.log("POST /api/conversations called") // Debug log

    const user = await getAuthenticatedUser()
    const body = await request.json()
    const { participantId } = body

    console.log("User:", user.id, "isAdmin:", user.isAdmin) // Debug log
    console.log("ParticipantId:", participantId) // Debug log

    let conversation

    if (user.isAdmin) {
      // Admin creating conversation
      if (participantId) {
        // Check if conversation already exists
        const existing = await db.conversation.findFirst({
          where: {
            OR: [
              { customerId: participantId, adminId: user.id },
              { customerId: user.id, adminId: participantId },
            ],
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

        if (existing) {
          console.log("Found existing conversation:", existing.id)
          return NextResponse.json(existing)
        }

        // Get participant details
        const participant = await db.user.findUnique({
          where: { id: participantId },
        })

        if (!participant) {
          return NextResponse.json({ error: "Participant not found" }, { status: 404 })
        }

        // Create new conversation with specific participant
        conversation = await db.conversation.create({
          data: {
            customerId: participant.isAdmin ? user.id : participantId,
            adminId: participant.isAdmin ? participantId : user.id,
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
      } else {
        // Admin creating general conversation - find a customer
        const customer = await db.user.findFirst({
          where: {
            isAdmin: false,
            id: {
              not: user.id,
            },
          },
        })

        if (!customer) {
          return NextResponse.json({ error: "No customers available" }, { status: 404 })
        }

        // Check if conversation already exists with this customer
        const existing = await db.conversation.findFirst({
          where: {
            customerId: customer.id,
            adminId: user.id,
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

        if (existing) {
          return NextResponse.json(existing)
        }

        conversation = await db.conversation.create({
          data: {
            customerId: customer.id,
            adminId: user.id,
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
      }
    } else {
      // Customer creating conversation with admin
      const admin = await db.user.findFirst({
        where: {
          isAdmin: true,
        },
      })

      if (!admin) {
        return NextResponse.json({ error: "No admin available" }, { status: 404 })
      }

      // Check if conversation already exists
      const existing = await db.conversation.findFirst({
        where: {
          customerId: user.id,
          adminId: admin.id,
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

      if (existing) {
        console.log("Found existing customer conversation:", existing.id)
        return NextResponse.json(existing)
      }

      conversation = await db.conversation.create({
        data: {
          customerId: user.id,
          adminId: admin.id,
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
    }

    console.log("Created/found conversation:", conversation.id)
    return NextResponse.json(conversation)
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
