import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { getAuthenticatedUser } from "@/config/useAuth";

// GET - Fetch messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    const conversationId = params.id;

    // Verify user has access to this conversation
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ customerId: user.id }, { adminId: user.id }],
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const messages = await db.message.findMany({
      where: {
        conversationId,
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
      orderBy: {
        createdAt: "asc",
      },
    });

    const transformedMessages = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      conversationId: msg.conversationId,
      createdAt: msg.createdAt.toISOString(),
      isRead: msg.isRead,
      sender: msg.sender,
    }));

    return NextResponse.json(transformedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    const conversationId = params.id;
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Message content required" },
        { status: 400 }
      );
    }

    // Verify user has access to this conversation
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ customerId: user.id }, { adminId: user.id }],
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create the message
    const message = await db.message.create({
      data: {
        content: content.trim(),
        senderId: user.id,
        conversationId,
        isRead: false,
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

    // Update conversation's updatedAt
    await db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    const transformedMessage = {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      conversationId: message.conversationId,
      createdAt: message.createdAt.toISOString(),
      isRead: message.isRead,
      sender: message.sender,
    };

    return NextResponse.json(transformedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
