"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/prisma/db";
import { OrderUpdateData } from "@/types/orders";
import { getAuthenticatedUser } from "@/config/useAuth";
import { cache } from "react";
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

    // Create order
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
            product: true,
            variant: true,
          },
        },
        shippingAddress: true,
      },
    });

    // Clear user's cart
    await db.cartItem.deleteMany({
      where: { userId: user.id },
    });

    revalidatePath("/orders");
    revalidatePath("/cart");

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

// export async function getOrderById(id: string) {
//   try {
//     const order = await db.order.findUnique({
//       where: { id },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//           },
//         },
//         items: {
//           include: {
//             product: {
//               select: {
//                 id: true,
//                 name: true,
//                 thumbnail: true,
//               },
//             },
//             variant: {
//               select: {
//                 id: true,
//                 name: true,
//               },
//             },
//           },
//         },
//         shippingAddress: true,
//         payments: true,
//       },
//     });

//     if (!order) {
//       return null;
//     }

//     return {
//       ...order,
//       subtotal: Number(order.subtotal),
//       taxAmount: Number(order.taxAmount),
//       deliveryFee: Number(order.deliveryFee),
//       discount: Number(order.discount),
//       total: Number(order.total),
//       items: order.items.map((item) => ({
//         ...item,
//         unitPrice: Number(item.unitPrice),
//         totalPrice: Number(item.totalPrice),
//       })),
//     };
//   } catch (error) {
//     console.error("Error fetching order:", error);
//     return null;
//   }
// }

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
