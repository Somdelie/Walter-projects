"use server";

import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { broadcastToConversation } from "@/utils/message-bus";

export async function sendMessage(
  conversationId: string | null,
  content: string
) {
  const user = await getAuthenticatedUser();

  let finalConversationId = conversationId;

  // If no conversationId provided or doesn't exist, create a new one
  if (!conversationId) {
    const admin = await db.user.findFirst({
      where: {
        isAdmin: true,
      },
    });

    if (!admin) {
      throw new Error("No admin found to assign conversation to.");
    }

    const conversation = await db.conversation.create({
      data: {
        customerId: user.id,
        adminId: admin.id,
      },
    });

    finalConversationId = conversation.id;
  } else {
    // Validate if conversation exists
    const existing = await db.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!existing) {
      throw new Error("Conversation not found.");
    }
  }

  const message = await db.message.create({
    data: {
      conversationId: finalConversationId!,
      content,
      senderId: user.id,
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
  });

  if (!finalConversationId) {
    throw new Error("finalConversationId is null.");
  }

  // Broadcast with more complete message data
  broadcastToConversation(finalConversationId, {
    type: "new_message",
    data: {
      id: message.id,
      conversationId: finalConversationId,
      content,
      senderId: user.id,
      createdAt: message.createdAt.toISOString(),
      isRead: message.isRead,
      sender: message.sender,
    },
  });

  return {
    ...message,
    conversationId: finalConversationId,
    createdAt: message.createdAt.toISOString(),
  };
}
