"use server"

import { getAuthenticatedUser } from "@/config/useAuth"
import { db } from "@/prisma/db"

export async function getAdminConversations() {
  const user = await getAuthenticatedUser()

  // Verify user is admin
  if (!user.isAdmin) {
    throw new Error("Access denied. Admin privileges required.")
  }

  const conversations = await db.conversation.findMany({
    where: {
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
          phone: true,
          image: true,
          createdAt: true,
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
                not: user.id, // Messages not sent by admin (i.e., from customer)
              },
            },
          },
        },
      },
    },
    orderBy: [
      {
        messages: {
          _count: "desc", // Conversations with unread messages first
        },
      },
      {
        updatedAt: "desc",
      },
    ],
  })

  return conversations.map((conv) => ({
    id: conv.id,
    customer: {
      ...conv.customer,
      createdAt: conv.customer.createdAt.toISOString(),
    },
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
}

export async function markConversationAsRead(conversationId: string) {
  const user = await getAuthenticatedUser()

  if (!user.isAdmin) {
    throw new Error("Access denied. Admin privileges required.")
  }

  // Mark all messages in this conversation as read (except those sent by the admin)
  await db.message.updateMany({
    where: {
      conversationId,
      senderId: {
        not: user.id,
      },
      isRead: false,
    },
    data: {
      isRead: true,
    },
  })
}

export async function getConversationStats() {
  const user = await getAuthenticatedUser()

  if (!user.isAdmin) {
    throw new Error("Access denied. Admin privileges required.")
  }

  const [totalConversations, unreadConversations, todayMessages] = await Promise.all([
    db.conversation.count({
      where: {
        adminId: user.id,
      },
    }),
    db.conversation.count({
      where: {
        adminId: user.id,
        messages: {
          some: {
            isRead: false,
            senderId: {
              not: user.id,
            },
          },
        },
      },
    }),
    db.message.count({
      where: {
        conversation: {
          adminId: user.id,
        },
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ])

  return {
    totalConversations,
    unreadConversations,
    todayMessages,
  }
}
