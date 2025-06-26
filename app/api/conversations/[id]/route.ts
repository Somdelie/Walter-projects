import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, image: true, email: true },
        },
        admin: {
          select: { id: true, name: true, image: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            sender: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete all messages in the conversation first
    await db.message.deleteMany({
      where: { conversationId: id },
    });

    // Then delete the conversation
    await db.conversation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
