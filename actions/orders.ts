"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/prisma/db";
import type { OrderUpdateData } from "@/types/orders";
import { getAuthenticatedUser } from "@/config/useAuth";
import { cache } from "react";
import { Resend } from "resend";
import OrderConfirmationEmail from "@/components/email-templates/order-confirmation-email";
import AdminOrderNotificationEmail from "@/components/email-templates/admin-order-notification-email";

interface CreateOrderData {
  // Address info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  // Order details
  deliveryMethod: "DELIVERY" | "COLLECTION";
  paymentMethod:
    | "CASH_ON_DELIVERY"
    | "CASH_ON_COLLECTION"
    | "CARD_ONLINE"
    | "EFT"
    | "BANK_TRANSFER";
  notes?: string;
  saveAddress: boolean;

  // Items and pricing
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  total: number;
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Function to generate a professional tracking number
const generateTrackingNumber = (): string => {
  const prefix = "WP"; // WalterProjects prefix
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.random().toString(36).substring(2, 8).toUpperCase(); // Random alphanumeric
  return `${prefix}${timestamp}${random}`;
};

export async function createOrder(data: CreateOrderData) {
  try {
    const user = await getAuthenticatedUser();

    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate required fields
    if (
      !data.firstName ||
      !data.lastName ||
      !data.streetLine1 ||
      !data.city ||
      !data.state ||
      !data.postalCode
    ) {
      return { success: false, error: "Missing required address fields" };
    }

    // Generate order number
    const orderCount = await db.order.count();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, "0")}`;

    // Generate tracking number
    const trackingNumber = generateTrackingNumber();

    // Calculate fees
    const deliveryFee = data.deliveryMethod === "DELIVERY" ? 150 : 0;
    const taxAmount = 0; // Assuming tax is included
    const discount = 0;

    // Create shipping address with proper validation
    const shippingAddress = await db.address.create({
      data: {
        userId: user.id,
        type: "shipping",
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company || null,
        streetLine1: data.streetLine1,
        streetLine2: data.streetLine2 || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || "South Africa",
        phone: data.phone,
        isDefault: data.saveAddress || false,
      },
    });

    // Create order with tracking number
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: "PENDING",
        paymentMethod: data.paymentMethod,
        paymentStatus: "PENDING",
        deliveryMethod: data.deliveryMethod,
        subtotal: data.subtotal,
        taxAmount,
        deliveryFee,
        discount,
        total: data.total,
        trackingNumber, // Add tracking number here
        shippingAddressId: shippingAddress.id,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                thumbnail: true,
              },
            },
            variant: {
              select: {
                name: true,
              },
            },
          },
        },
        shippingAddress: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Prepare email data
    const emailItems = order.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      variant: item.variant?.name,
      thumbnail: item.product.thumbnail ?? undefined,
    }));

    const orderTrackingUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.id}`;
    const orderManagementUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/orders/${order.id}`;

    // Send emails concurrently
    try {
      await Promise.allSettled([
        // Send customer confirmation email
        resend.emails.send({
          from: "WalterProjects <admin@cautiousndlovu.co.za>",
          to: data.email,
          subject: `Order Confirmation - ${orderNumber}`,
          react: OrderConfirmationEmail({
            customerName: data.firstName,
            orderNumber: order.orderNumber,
            trackingNumber: order.trackingNumber!,
            orderDate: order.createdAt.toLocaleDateString("en-ZA"),
            items: emailItems,
            subtotal: order.subtotal,
            taxAmount: order.taxAmount,
            deliveryFee: order.deliveryFee,
            discount: order.discount,
            total: order.total,
            deliveryMethod: order.deliveryMethod,
            paymentMethod: order.paymentMethod,
            shippingAddress: order.shippingAddress
              ? {
                  firstName: order.shippingAddress.firstName,
                  lastName: order.shippingAddress.lastName,
                  streetLine1: order.shippingAddress.streetLine1,
                  streetLine2: order.shippingAddress.streetLine2 || "",
                  city: order.shippingAddress.city,
                  state: order.shippingAddress.state,
                  postalCode: order.shippingAddress.postalCode,
                  country: order.shippingAddress.country,
                }
              : undefined,
            orderTrackingUrl,
          }),
        }),

        // Send admin notification email
        resend.emails.send({
          from: "WalterProjects Orders <admin@cautiousndlovu.co.za>",
          to: "info@walterprojects.co.za",
          subject: `🚨 New Order Alert - ${orderNumber} from ${data.firstName} ${data.lastName}`,
          react: AdminOrderNotificationEmail({
            customerName: `${data.firstName} ${data.lastName}`,
            customerEmail: data.email,
            customerPhone: data.phone,
            orderNumber: order.orderNumber,
            trackingNumber: order.trackingNumber!,
            orderDate: order.createdAt.toLocaleDateString("en-ZA"),
            items: emailItems,
            subtotal: order.subtotal,
            taxAmount: order.taxAmount,
            deliveryFee: order.deliveryFee,
            discount: order.discount,
            total: order.total,
            deliveryMethod: order.deliveryMethod,
            paymentMethod: order.paymentMethod,
            shippingAddress: order.shippingAddress
              ? {
                  firstName: order.shippingAddress.firstName,
                  lastName: order.shippingAddress.lastName,
                  streetLine1: order.shippingAddress.streetLine1,
                  streetLine2: order.shippingAddress.streetLine2 || "",
                  city: order.shippingAddress.city,
                  state: order.shippingAddress.state,
                  postalCode: order.shippingAddress.postalCode,
                  country: order.shippingAddress.country,
                }
              : undefined,
            notes: data.notes,
            orderManagementUrl,
          }),
        }),
      ]);

      console.log(
        "Order confirmation and admin notification emails sent successfully"
      );
    } catch (emailError) {
      console.error("Failed to send order emails:", emailError);
      // Don't fail the order creation if email fails
    }

    // Clear user's cart
    await db.cartItem.deleteMany({
      where: { userId: user.id },
    });

    revalidatePath("/orders");
    revalidatePath("/cart");
    revalidatePath("/dashboard/orders");

    return { success: true, data: order };
  } catch (error) {
    console.error("Create order error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}

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
        user: {
          select: {
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

// Cache the order fetch for better performance
export const getOrderById = cache(async (orderId: string) => {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                thumbnail: true,
                sku: true,
              },
            },
            variant: {
              select: {
                name: true,
              },
            },
          },
        },
        shippingAddress: true,
        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    // Transform the data to match our interface
    return {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString() || null,
      actualDelivery: order.actualDelivery?.toISOString() || null,
      payments: order.payments?.map((payment) => ({
        ...payment,
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
});

// Cache the users map for better performance
export const getUsersMap = cache(async () => {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        image: true,
      },
    });

    // Convert to map for easy lookup
    const userMap: Record<string, any> = {};
    users.forEach((user) => {
      userMap[user.id] = user;
    });

    return userMap;
  } catch (error) {
    console.error("Error fetching users:", error);
    return {};
  }
});

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
