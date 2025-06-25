export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  image: string | null;
  email?: string;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
}

export interface Conversation {
  id: string;
  customer: User;
  admin: User;
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}

export interface ConversationDetails {
  id: string;
  customer: User;
  admin: User;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
  };
  isOptimistic?: boolean;
}
