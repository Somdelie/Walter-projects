import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const isAdmin = searchParams.get("isAdmin") === "true";

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    let conversations;

    if (isAdmin) {
      // Admin sees all conversations
      conversations = await db.conversation.findMany({
        include: {
          customer: {
            select: { id: true, name: true, image: true, email: true },
          },
          admin: {
            select: { id: true, name: true, image: true },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: {
                select: { id: true, name: true, image: true },
              },
            },
          },
          _count: {
            select: {
              messages: {
                where: { isRead: false, senderId: { not: userId } },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    } else {
      // Customer sees only their conversations
      conversations = await db.conversation.findMany({
        where: { customerId: userId },
        include: {
          customer: {
            select: { id: true, name: true, image: true, email: true },
          },
          admin: {
            select: { id: true, name: true, image: true },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: {
                select: { id: true, name: true, image: true },
              },
            },
          },
          _count: {
            select: {
              messages: {
                where: { isRead: false, senderId: { not: userId } },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customerId, adminId } = await request.json();

    if (!customerId || !adminId) {
      return NextResponse.json(
        { error: "Customer ID and Admin ID required" },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const existingConversation = await db.conversation.findFirst({
      where: {
        customerId,
        adminId,
      },
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create new conversation
    const conversation = await db.conversation.create({
      data: {
        customerId,
        adminId,
      },
      include: {
        customer: {
          select: { id: true, name: true, image: true, email: true },
        },
        admin: {
          select: { id: true, name: true, image: true },
        },
      },
    });
    revalidatePath("/chats");
    revalidatePath("/dashboard/reports/messages");
    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
