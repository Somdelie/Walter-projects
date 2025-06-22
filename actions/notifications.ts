"use server";

import { db } from "@/prisma/db";

export interface OrderNotification {
  id: string;
  type: "new_order";
  title: string;
  message: string;
  orderNumber: string;
  customerName: string;
  total: number;
  createdAt: Date;
  isRead: boolean;
}

export async function getNewOrderNotifications(): Promise<OrderNotification[]> {
  try {
    const newOrders = await db.order.findMany({
      where: {
        isNewOrder: true,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // Limit to 10 most recent
    });

    return newOrders.map((order) => ({
      id: order.id,
      type: "new_order" as const,
      title: "New Order Received",
      message: `Order #${order.orderNumber} from ${order.user.name}`,
      orderNumber: order.orderNumber,
      customerName: order.user.name,
      total: order.total,
      createdAt: order.createdAt,
      isRead: false,
    }));
  } catch (error) {
    console.error("Error fetching new order notifications:", error);
    return [];
  }
}

export async function markOrderAsRead(orderId: string) {
  try {
    await db.order.update({
      where: { id: orderId },
      data: { isNewOrder: false },
    });
  } catch (error) {
    console.error("Error marking order as read:", error);
  }
}
