// Store active connections with user info
const connections = new Map<
  string,
  { controller: ReadableStreamDefaultController; isAdmin: boolean }
>();

// Helper function to add a connection
export function addConnection(
  userId: string,
  controller: ReadableStreamDefaultController,
  isAdmin: boolean
) {
  connections.set(userId, { controller, isAdmin });
}

// Helper function to remove a connection
export function removeConnection(userId: string) {
  connections.delete(userId);
}

// Helper function to broadcast messages to specific users
export function broadcastToUser(userId: string, data: any) {
  const connection = connections.get(userId);
  if (connection) {
    try {
      connection.controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      connections.delete(userId);
    }
  }
}

// Helper function to broadcast to all users in a conversation
export function broadcastToConversation(
  conversationId: string,
  senderId: string,
  data: any
) {
  connections.forEach((connection, userId) => {
    if (userId !== senderId) {
      try {
        connection.controller.enqueue(
          `data: ${JSON.stringify({ ...data, conversationId })}\n\n`
        );
      } catch (error) {
        connections.delete(userId);
      }
    }
  });
}

// Helper function to get online users
export function getOnlineUsers(): string[] {
  return Array.from(connections.keys());
}

// Helper function to send keep alive ping
export function sendKeepAlive(userId: string) {
  const connection = connections.get(userId);
  if (connection) {
    try {
      connection.controller.enqueue(
        `data: ${JSON.stringify({ type: "ping" })}\n\n`
      );
    } catch (error) {
      connections.delete(userId);
    }
  }
}
