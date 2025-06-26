"use client";

import { useState, useEffect } from "react";

export function useConnectionStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [transport] = useState("SSE"); // Server-Sent Events

  useEffect(() => {
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check initial connection status
    setIsConnected(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isConnected, transport };
}
