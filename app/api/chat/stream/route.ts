import type { NextRequest } from "next/server";
import { db } from "@/prisma/db";
import { getAuthenticatedUser } from "@/config/useAuth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return new Response("Conversation ID required", { status: 400 });
    }

    // Verify user has access to this conversation
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ customerId: user.id }, { adminId: user.id }],
      },
    });

    if (!conversation) {
      return new Response("Unauthorized", { status: 403 });
    }

    const encoder = new TextEncoder();
    let lastMessageTime = new Date();

    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "connected",
              conversationId,
              timestamp: new Date().toISOString(),
            })}\n\n`
          )
        );

        // Poll for new messages
        const pollMessages = async () => {
          try {
            const newMessages = await db.message.findMany({
              where: {
                conversationId,
                createdAt: {
                  gt: lastMessageTime,
                },
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

            if (newMessages.length > 0) {
              // Update last message time
              lastMessageTime = newMessages[newMessages.length - 1].createdAt;

              // Send new messages
              for (const message of newMessages) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "new_message",
                      message: {
                        id: message.id,
                        content: message.content,
                        senderId: message.senderId,
                        conversationId: message.conversationId,
                        createdAt: message.createdAt.toISOString(),
                        sender: message.sender,
                      },
                    })}\n\n`
                  )
                );
              }
            }

            // Send heartbeat
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "heartbeat",
                  timestamp: new Date().toISOString(),
                })}\n\n`
              )
            );
          } catch (error) {
            console.error("Error polling messages:", error);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  error: "Failed to fetch messages",
                })}\n\n`
              )
            );
          }
        };

        // Initial poll
        pollMessages();

        // Set up polling interval
        const interval = setInterval(pollMessages, 2000); // Poll every 2 seconds

        // Cleanup on close
        request.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  } catch (error) {
    console.error("SSE stream error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
