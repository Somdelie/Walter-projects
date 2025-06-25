import type { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { registerClient, unregisterClient } from "@/utils/message-bus";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const conversationId = (await params).id;
    console.log(`SSE: Setting up stream for conversation ${conversationId}`);

    // Verify authentication
    const user = await getAuthenticatedUser();

    // Verify user has access to this conversation
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ customerId: user.id }, { adminId: user.id }],
      },
    });

    if (!conversation) {
      return new Response("Conversation not found", { status: 404 });
    }

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        console.log(`SSE: Stream started for conversation ${conversationId}`);

        const client = {
          conversationId,
          send: (data: any) => {
            try {
              const message = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(new TextEncoder().encode(message));
            } catch (error) {
              console.error("SSE: Error sending data:", error);
            }
          },
        };

        registerClient(client);

        // Send initial connection message
        client.send({ type: "connected", conversationId });

        // Handle client disconnect
        request.signal.addEventListener("abort", () => {
          console.log(
            `SSE: Client disconnected from conversation ${conversationId}`
          );
          unregisterClient(client);
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
    console.error("SSE: Error setting up stream:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
