"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "./use-socket";
import type { ChatMessage } from "@/types/conversation";

interface UseChatSocketProps {
  conversationId: string | null;
  currentUserId: string;
}

interface TypingUser {
  userId: string;
  isTyping: boolean;
}

export function useChatSocket({
  conversationId,
  currentUserId,
}: UseChatSocketProps) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Join conversation when socket connects and conversationId is available
  useEffect(() => {
    if (!socket || !isConnected || !conversationId) return;

    socket.emit("join_conversation", {
      conversationId,
      userId: currentUserId,
    });

    // Listen for confirmation
    socket.on("joined_conversation", (data) => {
      console.log("Successfully joined conversation:", data.conversationId);
      setError(null);
    });

    // Listen for new messages
    socket.on("new_message", (data) => {
      const { message, tempId } = data;

      setMessages((prev) => {
        // Remove optimistic message if it exists
        const withoutOptimistic = tempId
          ? prev.filter((msg) => msg.id !== tempId)
          : prev;

        // Check if message already exists
        const exists = withoutOptimistic.some((msg) => msg.id === message.id);
        if (exists) return prev;

        return [...withoutOptimistic, message];
      });
    });

    // Listen for typing indicators
    socket.on("user_typing", (data) => {
      const { userId, isTyping } = data;

      setTypingUsers((prev) => {
        const filtered = prev.filter((user) => user.userId !== userId);
        if (isTyping) {
          return [...filtered, { userId, isTyping }];
        }
        return filtered;
      });
    });

    // Listen for message errors
    socket.on("message_error", (data) => {
      const { error, tempId } = data;
      setError(error);

      // Remove failed optimistic message
      if (tempId) {
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      }
    });

    // Listen for user join/leave events
    socket.on("user_joined", (data) => {
      console.log("User joined:", data.userId);
    });

    socket.on("user_left", (data) => {
      console.log("User left:", data.userId);
      // Remove typing indicator for left user
      setTypingUsers((prev) =>
        prev.filter((user) => user.userId !== data.userId)
      );
    });

    return () => {
      socket.off("joined_conversation");
      socket.off("new_message");
      socket.off("user_typing");
      socket.off("message_error");
      socket.off("user_joined");
      socket.off("user_left");
    };
  }, [socket, isConnected, conversationId, currentUserId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !isConnected || !conversationId) {
        setError("Not connected to chat server");
        return null;
      }

      const tempId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Add optimistic message
      const optimisticMessage: ChatMessage = {
        id: tempId,
        conversationId,
        content,
        senderId: currentUserId,
        createdAt: new Date().toISOString(),
        isRead: false,
        sender: {
          id: currentUserId,
          name: "You",
        },
        isOptimistic: true,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      // Send to server
      socket.emit("send_message", {
        conversationId,
        content,
        senderId: currentUserId,
        tempId,
      });

      return tempId;
    },
    [socket, isConnected, conversationId, currentUserId]
  );

  const startTyping = useCallback(() => {
    if (!socket || !isConnected || !conversationId) return;

    socket.emit("typing_start", { conversationId });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", { conversationId });
    }, 3000);
  }, [socket, isConnected, conversationId]);

  const stopTyping = useCallback(() => {
    if (!socket || !isConnected || !conversationId) return;

    socket.emit("typing_stop", { conversationId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [socket, isConnected, conversationId]);

  const markMessagesAsRead = useCallback(
    (messageIds: string[]) => {
      if (!socket || !isConnected || !conversationId) return;

      socket.emit("mark_messages_read", {
        conversationId,
        messageIds,
      });
    },
    [socket, isConnected, conversationId]
  );

  return {
    messages,
    setMessages,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    typingUsers: typingUsers.filter((user) => user.isTyping),
    isConnected,
    error,
    setError,
  };
}
