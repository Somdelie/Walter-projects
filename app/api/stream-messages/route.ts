// app/api/stream-messages/route.ts
import { NextResponse } from "next/server";

let clients: { send: (data: any) => void; close: () => void }[] = [];

export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const client = {
        send,
        close: () => controller.close(),
      };

      clients.push(client as any);

      request.signal.addEventListener("abort", () => {
        clients = clients.filter((c) => c !== client);
        client.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
