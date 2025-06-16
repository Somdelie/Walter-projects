import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Package,
  Download,
  ShoppingBag,
  ShoppingCart,
  Users,
  Star,
  TrendingUp,
  DollarSign,
  Eye,
} from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { User } from '@prisma/client';
import { Order } from "@/types/orders";

// Sample data that matches your schema structure
const recentOrders = [
  {
    id: "ord_001",
    orderNumber: "ORD-2024-001",
    customer: "John Smith",
    email: "john.smith@example.com",
    status: "DELIVERED",
    total: 1250.00,
    deliveryMethod: "DELIVERY",
    createdAt: "2 hours ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "ord_002",
    orderNumber: "ORD-2024-002",
    customer: "Sarah Johnson",
    email: "sarah.j@example.com",
    status: "PROCESSING",
    total: 890.50,
    deliveryMethod: "COLLECTION",
    createdAt: "4 hours ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "ord_003",
    orderNumber: "ORD-2024-003",
    customer: "Michael Chen",
    email: "m.chen@example.com",
    status: "CONFIRMED",
    total: 2150.00,
    deliveryMethod: "DELIVERY",
    createdAt: "6 hours ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

const topProducts = [
  {
    id: "prod_001",
    name: "Premium Aluminum Window - 1200x1000mm",
    type: "WINDOW",
    sales: 145,
    revenue: 87500.00,
    stockQuantity: 23,
    thumbnail: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "prod_002",
    name: "Double Glazed Sliding Door",
    type: "DOOR",
    sales: 89,
    revenue: 125300.00,
    stockQuantity: 12,
    thumbnail: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "prod_003",
    name: "UPVC Window Profile - Standard",
    type: "PROFILE",
    sales: 234,
    revenue: 45600.00,
    stockQuantity: 156,
    thumbnail: "/placeholder.svg?height=40&width=40",
  },
];

const lowStockProducts = [
  {
    name: "Door Handle - Premium Chrome",
    type: "HARDWARE",
    stockQuantity: 5,
    lowStockAlert: 10,
  },
  {
    name: "Window Seal - Rubber Black",
    type: "ACCESSORY",
    stockQuantity: 3,
    lowStockAlert: 15,
  },
  {
    name: "Tempered Glass 6mm",
    type: "GLASS",
    stockQuantity: 8,
    lowStockAlert: 20,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "PROCESSING":
      return "bg-blue-100 text-blue-800";
    case "CONFIRMED":
      return "bg-yellow-100 text-yellow-800";
    case "SHIPPED":
      return "bg-purple-100 text-purple-800";
    case "PENDING":
      return "bg-gray-100 text-gray-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getProductTypeIcon = (type: string) => {
  switch (type) {
    case "WINDOW":
      return "🪟";
    case "DOOR":
      return "🚪";
    case "PROFILE":
      return "📐";
    case "HARDWARE":
      return "🔩";
    case "GLASS":
      return "🔍";
    case "ACCESSORY":
      return "🔧";
    default:
      return "📦";
  }
};

// Helper function to calculate percentage change
const calculatePercentageChange = (current: number, previous: number): string => {
  if (previous === 0) return "+0%";
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
};

// Helper function to calculate total revenue from orders
const calculateTotalRevenue = (orders: Order[]): number => {
  if (!orders || orders.length === 0) return 0;
  return orders.reduce((total, order) => {
    return total + (order.total || 0);
  }, 0);
};

export default function DashboardMain({ 
  users, 
  orders, 
  analytics 
}: { 
  users: User[], 
  orders: Order[] | Order | null | undefined, 
  analytics?: any 
}) {
  // Ensure orders is always treated as an array
  const ordersArray = Array.isArray(orders) ? orders : [];
  
  // Calculate current metrics
  const totalRevenue = analytics?.totalRevenue || calculateTotalRevenue(ordersArray);
  const totalOrders = ordersArray.length;
  const totalCustomers = users.length;

  // Calculate previous period metrics (you might need to adjust this based on your analytics data structure)
  const previousRevenue = analytics?.previousRevenue || 0;
  const previousOrders = analytics?.previousOrders || 0;
  const previousCustomers = analytics?.previousCustomers || 0;

  const bigCards = [
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      change: calculatePercentageChange(totalRevenue, previousRevenue),
      trend: totalRevenue >= previousRevenue ? "up" : "down",
      icon: DollarSign,
      description: "vs last month",
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString('en-ZA'),
      change: calculatePercentageChange(totalOrders, previousOrders),
      trend: totalOrders >= previousOrders ? "up" : "down",
      icon: ShoppingBag,
      description: "vs last month",
    },
    {
      title: "Total Customers",
      value: totalCustomers.toLocaleString('en-ZA'),
      change: calculatePercentageChange(totalCustomers, previousCustomers),
      trend: totalCustomers >= previousCustomers ? "up" : "down",
      icon: Users,
      description: "registered users",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="space-y-4 md:space-y-2">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Welcome back! Here's your business overview.
            </p>
          </div>
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            <Select defaultValue="7d">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full md:w-auto">
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export Report</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4">
          {bigCards.map((card, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{card.value}</div>
                <div className="flex items-center text-xs md:text-sm text-muted-foreground mt-1">
                  <span className={`flex items-center ${card.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {card.trend === "up" ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                    {card.change}
                  </span>
                  <span className="ml-2 hidden sm:inline">{card.description}</span>
                </div>
              </CardContent>
              <div className="absolute right-0 bottom-0 opacity-5">
                <card.icon className="h-16 w-16 md:h-24 md:w-24 text-primary" />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Recent Orders */}
          <Card className="lg:col-span-8">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mobile view - Card layout */}
              <div className="block md:hidden space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm whitespace-nowrap">{order.orderNumber}</div>
                      <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={order.avatar}
                          alt={order.customer}
                        />
                        <AvatarFallback>
                          {order.customer
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {order.customer}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span>{order.deliveryMethod === "DELIVERY" ? "🚚" : "📦"}</span>
                        <span>{order.deliveryMethod}</span>
                      </div>
                      <div className="font-medium">
                        R {order.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.createdAt}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop view - Table layout */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Method</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right hidden xl:table-cell">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-medium text-sm whitespace-nowrap">{order.orderNumber}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="font-medium text-sm">
                                {order.customer}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {order.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-sm whitespace-nowrap">
                            {order.deliveryMethod === "DELIVERY" ? "🚚 Delivery" : "📦 Collection"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap text-orange-700">
                          {formatPrice(order.total)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground hidden xl:table-cell whitespace-nowrap">
                          {order.createdAt}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performing products this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 md:space-y-6">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 flex-shrink-0">
                      <span className="text-lg">{getProductTypeIcon(product.type)}</span>
                    </div>
                    <div className="ml-4 space-y-1 flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{product.sales} sales</span>
                        <span>•</span>
                        <span>{product.stockQuantity} in stock</span>
                      </div>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      <div className="font-medium text-sm">
                        R {product.revenue.toLocaleString('en-ZA')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {product.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-4 w-4 text-amber-500" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Products that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {lowStockProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.type}</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className="text-sm font-medium text-amber-600">
                      {product.stockQuantity} left
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Alert at {product.lowStockAlert}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}