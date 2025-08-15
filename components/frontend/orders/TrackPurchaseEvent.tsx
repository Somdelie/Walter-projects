"use client";

import { useEffect } from "react";

// Declare global gtag function
declare global {
  interface Window {
    gtag: (
      command: "event",
      action: string,
      params: {
        send_to: string;
        value?: number;
        currency?: string;
        transaction_id?: string;
      }
    ) => void;
  }
}

// Define the Order interface
interface Order {
  id: string;
  status: string;
  total: number;  // Changed from totalAmount to total
}

export default function TrackPurchaseEvent({ order }: { order: Order }) {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.gtag &&
      order.status === "DELIVERED" // or whatever event you want to track
    ) {
      window.gtag("event", "conversion", {
        send_to: "AW-17483333566", // replace with your actual Google Ads conversion label
        value: order.total || 0,  // Changed from totalAmount to total
        currency: "USD", // change to your currency if needed
        transaction_id: order.id,
      });
      console.log("Google Ads conversion event sent for order:", order.id);
    }
  }, [order]);

  return null;
}