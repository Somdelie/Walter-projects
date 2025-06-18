"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/prisma/db";
import { OrderUpdateData } from "@/types/orders";
import { getAuthenticatedUser } from "@/config/useAuth";

export async function getAllOrders() {
  try {
    const ordersFromDb = await db.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                thumbnail: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        shippingAddress: {
          select: {
            streetLine1: true,
            city: true,
            state: true,
            postalCode: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    const orders = ordersFromDb.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      deliveryFee: Number(order.deliveryFee),
      discount: Number(order.discount),
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    }));

    return {
      data: orders,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      data: [],
      error: "Failed to fetch orders",
    };
  }
}

export async function getUserOrders() {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      return {
        data: [],
        error: "Unauthorized",
      };
    }

    const ordersFromDb = await db.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                thumbnail: true,
                slug: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        shippingAddress: {
          select: {
            streetLine1: true,
            streetLine2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    const orders = ordersFromDb.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      deliveryFee: Number(order.deliveryFee),
      discount: Number(order.discount),
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      payments: order.payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    }));

    return {
      data: orders,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return {
      data: [],
      error: "Failed to fetch orders",
    };
  }
}

export async function getOrderById(id: string) {
  try {
    const order = await db.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                thumbnail: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        shippingAddress: true,
        payments: true,
      },
    });

    if (!order) {
      return null;
    }

    return {
      ...order,
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      deliveryFee: Number(order.deliveryFee),
      discount: Number(order.discount),
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

export async function updateOrder(id: string, data: OrderUpdateData) {
  try {
    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid order ID" };
    }

    if (!data || typeof data !== "object") {
      return { success: false, error: "Invalid update data" };
    }

    // Build the update data object with proper typing
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Add valid fields from the input data
    const validFields: (keyof OrderUpdateData)[] = [
      "status",
      "internalNotes",
      "trackingNumber",
      "estimatedDelivery",
      "deliveryNotes",
    ];

    validFields.forEach((field) => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    const order = await db.order.update({
      where: { id },
      data: updateData,
    });

    revalidatePath(`/dashboard/orders/${id}`);
    revalidatePath("/dashboard/orders");

    return { success: true, data: order };
  } catch (error) {
    console.error("Error updating order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update order",
    };
  }
}
