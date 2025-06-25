// utils/message-bus.ts
interface Client {
  send: (data: any) => void;
  conversationId: string;
}

// Store connected clients
const clients = new Set<Client>();

export function registerClient(client: Client) {
  clients.add(client);
  console.log(
    `Client registered for conversation ${client.conversationId}. Total clients: ${clients.size}`
  );
}

export function unregisterClient(client: Client) {
  clients.delete(client);
  console.log(
    `Client unregistered for conversation ${client.conversationId}. Total clients: ${clients.size}`
  );
}

export function broadcastToConversation(conversationId: string, data: any) {
  console.log(`Broadcasting to conversation ${conversationId}:`, data);

  const conversationClients = Array.from(clients).filter(
    (client) => client.conversationId === conversationId
  );

  console.log(
    `Found ${conversationClients.length} clients for conversation ${conversationId}`
  );

  conversationClients.forEach((client) => {
    try {
      client.send(data);
    } catch (error) {
      console.error("Error sending to client:", error);
      // Remove failed client
      clients.delete(client);
    }
  });
}

// Optional: Broadcast to all clients
export function broadcastToAll(data: any) {
  clients.forEach((client) => {
    try {
      client.send(data);
    } catch (error) {
      console.error("Error sending to client:", error);
      clients.delete(client);
    }
  });
}

// Optional: Get client count for debugging
export function getClientCount() {
  return clients.size;
}

export function getClientsForConversation(conversationId: string) {
  return Array.from(clients).filter(
    (client) => client.conversationId === conversationId
  ).length;
}
