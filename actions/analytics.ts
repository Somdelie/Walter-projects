"use server";

import { db } from "@/prisma/db";
import { formatDistanceToNow } from "date-fns";

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  type: string;
  stockQuantity: number;
  lowStockAlert: number;
  alertTriggered: boolean;
  urgency: "critical" | "high" | "medium";
  categoryName?: string;
  thumbnail?: string;
  lastRestocked?: Date;
  averageSalesPerMonth?: number;
  estimatedRunoutDate?: Date;
}

export async function getRecentOrders() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      user: true, // Changed from 'customer' to 'user'
    },
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: `${order.user.firstName} ${order.user.lastName}`, // Updated field access
    status: order.status,
    deliveryMethod: order.deliveryMethod,
    total: order.total,
    createdAt: order.createdAt,
  }));
}

export async function getTopProducts() {
  // Since there's no 'sales' field, we'll calculate from OrderItems
  const topProducts = await db.product.findMany({
    include: {
      orderItems: {
        select: {
          quantity: true,
          totalPrice: true,
        },
      },
    },
  });

  // Calculate sales data and sort
  const productsWithSales = topProducts
    .map((product) => {
      const totalQuantitySold = product.orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const totalRevenue = product.orderItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );

      return {
        id: product.id,
        name: product.name,
        type: product.type,
        sales: totalQuantitySold,
        revenue: totalRevenue,
        stockQuantity: product.stockQuantity,
      };
    })
    .sort((a, b) => b.sales - a.sales) // Sort by sales descending
    .slice(0, 5); // Take top 5

  return productsWithSales;
}

export async function getLowStockProducts(threshold?: number) {
  // Use provided threshold, fallback to global setting, or default to 15
  let stockThreshold = threshold;

  if (!stockThreshold) {
    // Try to get from settings table
    const setting = await db.setting.findUnique({
      where: { key: "low_stock_threshold" },
    });
    stockThreshold = setting ? parseInt(setting.value) : 15;
  }

  // Get all products and filter based on their individual thresholds
  const products = await db.product.findMany({
    where: {
      stockQuantity: {
        gt: 0, // Only consider products with some stock tracking
      },
    },
    orderBy: {
      stockQuantity: "asc",
    },
  });

  // Filter products that are below their individual alert threshold or global threshold
  const lowStockProducts = products.filter((product) => {
    const alertThreshold = product.lowStockAlert ?? stockThreshold;
    return product.stockQuantity < alertThreshold;
  });

  return lowStockProducts.map((product) => ({
    id: product.id,
    name: product.name,
    type: product.type,
    stockQuantity: product.stockQuantity,
    lowStockAlert: product.lowStockAlert ?? stockThreshold,
    alertTriggered: true, // All products in this list have triggered alerts
    urgency:
      product.stockQuantity === 0
        ? "critical"
        : product.stockQuantity <= 5
        ? "high"
        : "medium",
  }));
}

// Helper function to estimate days until stockout
async function estimateDaysUntilStockout(
  currentStock: number,
  productId: string
): Promise<number | null> {
  try {
    // Get sales data from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = await db.orderItem.findMany({
      where: {
        productId: productId,
        order: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
          status: {
            in: ["DELIVERED", "DELIVERED"], // Only count completed orders
          },
        },
      },
      select: {
        quantity: true,
      },
    });

    if (recentSales.length === 0) {
      return null; // No sales data available
    }

    // Calculate total quantity sold in the last 30 days
    const totalSold = recentSales.reduce((sum, sale) => sum + sale.quantity, 0);

    // Calculate average daily sales
    const averageDailySales = totalSold / 30;

    if (averageDailySales <= 0) {
      return null; // No meaningful sales rate
    }

    // Estimate days until stockout
    const daysUntilStockout = Math.floor(currentStock / averageDailySales);

    return daysUntilStockout;
  } catch (error) {
    console.error("Error estimating days until stockout:", error);
    return null;
  }
}

// Enhanced Low Stock Alert Functions

// Enhanced version with more detailed information
export async function getLowStockProductsEnhanced(threshold?: number) {
  let stockThreshold = threshold;

  if (!stockThreshold) {
    const setting = await db.setting.findUnique({
      where: { key: "low_stock_threshold" },
    });
    stockThreshold = setting ? parseInt(setting.value) : 15;
  }

  // Get products with category information
  const products = await db.product.findMany({
    where: {
      trackStock: true, // Only products that track stock
      status: "ACTIVE", // Only active products
    },
    include: {
      category: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      stockQuantity: "asc",
    },
  });

  const lowStockProducts = products.filter((product) => {
    const alertThreshold = product.lowStockAlert ?? stockThreshold;
    return product.stockQuantity <= alertThreshold;
  });

  // Calculate days until stockout for each product
  const enhancedProducts = await Promise.all(
    lowStockProducts.map(async (product) => {
      const daysUntilStockout = await estimateDaysUntilStockout(
        product.stockQuantity,
        product.id
      );

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        type: product.type,
        stockQuantity: product.stockQuantity,
        lowStockAlert: product.lowStockAlert ?? stockThreshold,
        categoryName: product.category?.title,
        thumbnail: product.thumbnail,
        alertTriggered: true,
        urgency: getStockUrgency(
          product.stockQuantity,
          product.lowStockAlert ?? stockThreshold
        ),
        daysUntilStockout: daysUntilStockout,
      };
    })
  );

  return enhancedProducts;
}

// Helper function to determine urgency level
function getStockUrgency(
  currentStock: number,
  alertThreshold: number
): "critical" | "high" | "medium" {
  if (currentStock === 0) return "critical";
  if (currentStock <= Math.floor(alertThreshold * 0.3)) return "critical"; // 30% of threshold
  if (currentStock <= Math.floor(alertThreshold * 0.6)) return "high"; // 60% of threshold
  return "medium";
}

// Function to get low stock count for dashboard
export async function getLowStockCount(threshold?: number): Promise<number> {
  let stockThreshold = threshold;

  if (!stockThreshold) {
    const setting = await db.setting.findUnique({
      where: { key: "low_stock_threshold" },
    });
    stockThreshold = setting ? parseInt(setting.value) : 15;
  }

  const products = await db.product.findMany({
    where: {
      trackStock: true,
      status: "ACTIVE",
    },
    select: {
      stockQuantity: true,
      lowStockAlert: true,
    },
  });

  return products.filter((product) => {
    const alertThreshold = product.lowStockAlert ?? stockThreshold;
    return product.stockQuantity <= alertThreshold;
  }).length;
}

// Function to get out of stock products
export async function getOutOfStockProducts() {
  return await db.product.findMany({
    where: {
      stockQuantity: 0,
      trackStock: true,
      status: "ACTIVE",
    },
    include: {
      category: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

// Function to get products that need restocking soon (predictive)
export async function getProductsNeedingRestock(daysAhead: number = 30) {
  // This would require sales data to calculate average daily sales
  // For now, we'll use a simple approach based on current stock and alert threshold

  const products = await db.product.findMany({
    where: {
      trackStock: true,
      status: "ACTIVE",
      stockQuantity: {
        gt: 0, // Not yet out of stock
      },
    },
    include: {
      category: {
        select: {
          title: true,
        },
      },
    },
  });

  return products.filter((product) => {
    const alertThreshold = product.lowStockAlert ?? 15;
    // Simple heuristic: if current stock is less than 2x the alert threshold
    return product.stockQuantity <= alertThreshold * 2;
  });
}

// Function to update low stock alert threshold for a product
export async function updateLowStockAlert(
  productId: string,
  newThreshold: number
) {
  return await db.product.update({
    where: { id: productId },
    data: { lowStockAlert: newThreshold },
  });
}

// Function to bulk update low stock alerts by category or type
export async function bulkUpdateLowStockAlerts(
  filters: {
    categoryId?: string;
    type?: string;
  },
  newThreshold: number
) {
  const whereClause: any = {};

  if (filters.categoryId) whereClause.categoryId = filters.categoryId;
  if (filters.type) whereClause.type = filters.type;

  return await db.product.updateMany({
    where: whereClause,
    data: { lowStockAlert: newThreshold },
  });
}

export async function getDashboardOverview(lowStockThreshold?: number) {
  const [recentOrders, topProducts, lowStockProducts] = await Promise.all([
    getRecentOrders(),
    getTopProducts(),
    getLowStockProducts(lowStockThreshold),
  ]);

  return {
    recentOrders,
    topProducts,
    lowStockProducts,
  };
}
