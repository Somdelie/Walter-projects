import type { NextRequest } from "next/server";
import {
  addConnection,
  removeConnection,
  sendKeepAlive,
} from "@/lib/chat-events";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const isAdmin = searchParams.get("isAdmin") === "true";

  if (!userId) {
    return new Response("User ID required", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      addConnection(userId, controller, isAdmin);

      // Send initial connection message
      controller.enqueue(
        `data: ${JSON.stringify({ type: "connected", userId })}\n\n`
      );

      // Keep connection alive
      const keepAlive = setInterval(() => {
        try {
          sendKeepAlive(userId);
        } catch (error) {
          clearInterval(keepAlive);
          removeConnection(userId);
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        removeConnection(userId);
        try {
          controller.close();
        } catch (error) {
          // Connection already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
