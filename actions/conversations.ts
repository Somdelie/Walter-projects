"use server";

import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";

export async function getOrCreateConversation() {
  const user = await getAuthenticatedUser();

  // Find an admin to assign the conversation to
  const admin = await db.user.findFirst({
    where: {
      isAdmin: true,
    },
  });

  if (!admin) {
    throw new Error("No admin found");
  }

  // Check for existing conversation
  const existing = await db.conversation.findFirst({
    where: {
      customerId: user.id,
      adminId: admin.id,
    },
  });

  if (existing) {
    return existing.id;
  }

  // If not found, create a new one
  const conversation = await db.conversation.create({
    data: {
      customerId: user.id,
      adminId: admin.id,
    },
  });

  return conversation.id;
}

export async function getUserConversations() {
  const user = await getAuthenticatedUser();

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
          image: true,
        },
      },
      admin: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
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
  });

  return conversations.map((conv) => ({
    id: conv.id,
    customer: {
      ...conv.customer,
      image: conv.customer.image,
    },
    admin: {
      ...conv.admin,
      image: conv.admin.image,
    },
    lastMessage: conv.messages[0]
      ? {
          id: conv.messages[0].id,
          content: conv.messages[0].content,
          createdAt: conv.messages[0].createdAt.toISOString(), // Convert Date to string
          sender: conv.messages[0].sender,
        }
      : null,
    unreadCount: conv._count.messages,
    updatedAt: conv.updatedAt.toISOString(),
  }));
}

export async function createNewConversation(adminId?: string) {
  const user = await getAuthenticatedUser();

  let targetAdminId = adminId;

  if (!targetAdminId) {
    const admin = await db.user.findFirst({
      where: {
        isAdmin: true,
      },
    });

    if (!admin) {
      throw new Error("No admin found");
    }

    targetAdminId = admin.id;
  }

  const conversation = await db.conversation.create({
    data: {
      customerId: user.id,
      adminId: targetAdminId,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          image: true,
        },
      },
      admin: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          image: true,
        },
      },
    },
  });

  return conversation;
}

// Add this new function for marking conversations as read
export async function markConversationAsRead(conversationId: string) {
  const user = await getAuthenticatedUser();

  // Mark all messages in this conversation as read (except those sent by the current user)
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
  });
}
