"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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
    firstName: string;
    lastName: string;
  };
  isOptimistic?: boolean;
  tempId?: string;
}

interface UseChatSSEProps {
  conversationId: string;
  currentUserId: string;
}

export function useChatSSE({ conversationId, currentUserId }: UseChatSSEProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Connect to SSE stream
  const connect = useCallback(() => {
    if (!conversationId) return;

    try {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(
        `/api/chat/stream?conversationId=${conversationId}`
      );
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        console.log("SSE connected");
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "connected":
              setIsConnected(true);
              break;

            case "new_message":
              setMessages((prev) => {
                // Remove any optimistic message with the same content
                const filtered = prev.filter(
                  (msg) =>
                    !(
                      msg.isOptimistic &&
                      msg.content === data.message.content &&
                      msg.senderId === data.message.senderId
                    )
                );

                // Check if message already exists
                const exists = filtered.some(
                  (msg) => msg.id === data.message.id
                );
                if (exists) return prev;

                return [...filtered, data.message];
              });
              break;

            case "error":
              setError(data.error);
              break;

            case "heartbeat":
              // Keep connection alive
              break;
          }
        } catch (err) {
          console.error("Error parsing SSE message:", err);
        }
      };

      eventSource.onerror = (event) => {
        console.error("SSE error:", event);
        setIsConnected(false);

        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000
          );
          reconnectAttempts.current++;

          setError(
            `Connection lost. Reconnecting in ${delay / 1000}s... (${
              reconnectAttempts.current
            }/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setError("Connection failed. Please refresh the page.");
        }
      };
    } catch (err) {
      console.error("Failed to connect to SSE:", err);
      setError("Failed to connect to chat server");
    }
  }, [conversationId]);

  // Send message function
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !conversationId) return;

      const tempId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Add optimistic message
      const optimisticMessage: ChatMessage = {
        id: tempId,
        content: content.trim(),
        senderId: currentUserId,
        conversationId,
        createdAt: new Date().toISOString(),
        isRead: false,
        sender: {
          id: currentUserId,
          name: "You",
          firstName: "You",
          lastName: "",
        },
        isOptimistic: true,
        tempId,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ content: content.trim() }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        // The real message will come through SSE, so we don't need to handle the response here
      } catch (error) {
        console.error("Error sending message:", error);

        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));

        setError("Failed to send message. Please try again.");
      }
    },
    [conversationId, currentUserId]
  );

  // Connect on mount and when conversationId changes
  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    messages,
    setMessages,
    sendMessage,
    isConnected,
    error,
    setError,
    reconnect: connect,
  };
}
